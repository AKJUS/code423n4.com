import { readFileSync } from "fs";
import path from "path";
import fs from "fs";

exports.handler = async (event) => {
  // only allow GET
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method not allowed",
      headers: { Allow: "GET" },
    };
  }
  const userHandle = event.queryStringParameters.id;

  try {
    const handleDir = path.join(__dirname + "/../_data/handles");
    let file = fs.readdirSync(handleDir);
    let teams = [];
    file.forEach((handle) => {
      if (handle.includes(".json")) {
        const wardenFile = readFileSync(`./_data/handles/${handle}`);
        const warden = JSON.parse(wardenFile.toString());
        if (warden.image) {
          const imagePath = warden.image.slice(2);
          warden.image = `https://raw.githubusercontent.com/code-423n4/code423n4.com/main/_data/handles/${imagePath}`;
        }
        if (warden && warden.members && warden.members.includes(userHandle)) {
          teams.push({ ...warden, username: warden.handle });
        }
      }
    });
    if (teams.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(teams),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Team not found" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Team not found" }),
    };
  }
};
