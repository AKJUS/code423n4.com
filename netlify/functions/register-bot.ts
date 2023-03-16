import { createPullRequest } from "octokit-plugin-create-pull-request";
import { File } from "octokit-plugin-create-pull-request/dist-types/types";
const sharp = require("sharp");
import { Octokit } from "@octokit/core";
import dedent from "dedent";
import { readFileSync } from "fs";

import { moralisAppId, moralisServerUrl, token } from "../_config";
import { UserFileData } from "../../types/user";
import { sendConfirmationEmail, getUserTeams } from "../util/user-utils";
import { checkAuth } from "../util/auth-utils";
import { isDangerousHandle } from "../util/validation-utils";
import Moralis from "moralis-v1";

const OctokitClient = Octokit.plugin(createPullRequest);
const octokit = new OctokitClient({ auth: token });

exports.handler = async (event) => {
  // only allow POST
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: "Method not allowed",
        }),
        headers: { Allow: "POST" },
      };
    }

    // check that application was submitted within the application window
    const now = Date.now();
    // @todo: replace with correct start and end times
    const start = new Date("2022-01-17T00:00:00.000Z").getTime();
    const end = new Date("2022-01-17T00:00:00.000Z").getTime();

    if (now < start || now > end) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Bot applications are only accepted within the bot registration window.",
        }),
      };
    }

    const data = JSON.parse(event.body);
    const { botName, image, owner, description, submission } = data;
    const username = event.headers["c4-user"];

    // ensure we have the data we need
    if (!botName) {
      return {
        statusCode: 422,
        body: JSON.stringify({
          error: "Bot name is required.",
        }),
      };
    }

    if (botName.length > 25) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Bot name's length is limited to 25 characters.",
        }),
      };
    }

    if (!owner) {
      return {
        statusCode: 422,
        body: JSON.stringify({
          error: "Bot must have an owner.",
        }),
      };
    }

    if (isDangerousHandle(botName)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Bot name can only use alphanumeric characters [a-zA-Z0-9], underscores (_), and hyphens (-).",
        }),
      };
    }

    if (owner !== username) {
      // owner must be the current user or a team the user is on
      const teamNames = await getUserTeams(username);
      if (!teamNames.includes(owner)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error:
              "You can only register a bot to your user account or your team's account.",
          }),
        };
      }
    }

    // make sure bot name is not already taken
    try {
      const existingUser: UserFileData = JSON.parse(
        readFileSync(`./_data/handles/${botName}.json`).toString()
      );
      if (existingUser) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `${botName} is already a registered username`,
          }),
        };
      }
    } catch (error) {
      // do nothing - if this error is caught, then the bot name is valid
    }

    if (!(await checkAuth(event))) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Unauthorized",
        }),
      };
    }

    const formattedBotData: UserFileData = {
      handle: botName,
    };

    let avatarFilename = "";
    let base64Avatar = "";
    if (image) {
      const decodedImage = Buffer.from(image, "base64");
      const { data, info } = await sharp(decodedImage)
        .resize({ width: 512 })
        .toBuffer({ resolveWithObject: true });
      base64Avatar = data.toString("base64");
      avatarFilename = `${botName}.${info.format}`;
      formattedBotData.image = `./avatars/${botName}.${info.format}`;
    }

    const files: { [path: string]: string | File } = {
      [`_data/handles/${botName}.json`]: JSON.stringify(
        formattedBotData,
        null,
        2
      ),
    };
    if (image) {
      files[`_data/handles/avatars/${avatarFilename}`] = {
        content: base64Avatar,
        encoding: "base64",
      };
    }

    await Moralis.start({
      serverUrl: moralisServerUrl,
      appId: moralisAppId,
      masterKey: process.env.MORALIS_MASTER_KEY,
    });

    const userQuery = new Moralis.Query("_User");
    userQuery.equalTo("username", username);
    userQuery.select("gitHubUsername");
    userQuery.select("email");
    const user = await userQuery.find({ useMasterKey: true });
    const gitHubUsername = user[0].attributes["gitHubUsername"];
    const emailAddress = user[0].attributes["email"];

    const branchName = `test/${botName}`;
    const title = `Register bot ${botName}`;
    const body = dedent`
    Registration for bot ${botName} submitted by ${username}.
    
    Description:
    ${description}

    ${gitHubUsername && "@" + gitHubUsername}
    `;

    // create file for bot account
    const res = await octokit.createPullRequest({
      owner: process.env.GITHUB_REPO_OWNER!,
      repo: process.env.REPO!,
      title,
      body,
      head: branchName,
      base: process.env.BRANCH_NAME,
      changes: [
        {
          files,
          commit: title,
        },
      ],
    });

    if (!res) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Failed to create pull request." }),
      };
    }

    // submit application entry
    const issueResult = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner,
        repo: "bot-applications",
        title: `${botName} Bot Application`,
        body: submission,
      }
    );

    const issueId = issueResult.data.number;
    const issueUrl = issueResult.data.html_url;
    const message = `${botName} issue #${issueId}`;
    const path = `data/${botName}-${issueId}.json`;

    const fileData = {
      handle: botName,
      owner: owner,
      issueId,
      issueUrl,
    };

    const content = Buffer.from(JSON.stringify(fileData, null, 2)).toString(
      "base64"
    );

    // add data file for application entry
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo: "bot-applications",
      path,
      message,
      content,
    });

    if (!emailAddress) {
      return {
        statusCode: 201,
        body: JSON.stringify({ message: `Created PR ${res.data.number}` }),
      };
    }

    const emailSubject = `Application to register bot "${botName}" has been submitted`;
    const emailBody =
      `Your application to register a new bot (${botName}) has been received. ` +
      `\n\nYou can see the PR here: ${res.data.html_url}`;
    await sendConfirmationEmail(emailAddress, emailSubject, emailBody);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: `Created PR ${res.data.number}` }),
    };
  } catch (error) {
    return {
      statusCode: error.status || error.response.status || 500,
      body: JSON.stringify({
        error:
          error.message ||
          error.response?.data?.message?.toString() ||
          "Internal server error.",
      }),
    };
  }
};
