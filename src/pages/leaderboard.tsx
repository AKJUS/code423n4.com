import React, { useEffect, useState } from "react";

import DefaultLayout from "../templates/DefaultLayout";
import LeaderboardTable from "../components/LeaderboardTable";


export default function Leaderboard({ data }) {
  const [timeFrame, setTimeFrame] = useState("2022");
  const [leaderboardResults, setLeaderboardResults] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/.netlify/functions/leaderboard?range=${timeFrame}`, {
        headers: {
          "Content-Type": "application/json",
          // "X-Authorization": `Bearer ${sessionToken}`,
          // "C4-User": currentUser.username,
        }
      });
      console.log("trigger async function")
      if (result.ok) {
        // @TODO: only return handles from endpoint? (maybe links?)
        // LeaderboardResult
        // const handleData = {
        //   handle: p.handle,
        // ------------------------
        //   image: p.image,
        //   link: p.link,
        //   members: p.members,
        // ------------------------
        //   lowRisk: 0,
        //   medRisk: 0,
        //   soloMed: 0,
        //   highRisk: 0,
        //   soloHigh: 0,
        //   nonCrit: 0,
        //   gasOptz: 0,
        //   allFindings: 0,
        //   awardTotal: 0,
        // };
        const response = await result.json();
        console.log(response);
        setLeaderboardResults(response);
      }
      else {
        console.log("error 😱")
        // @TODO: what to do here?
        // throw "Unable to fetch leaderboard results.";
      }
    })();
  }, [timeFrame]);

  const handleChange = (e) => {
    setTimeFrame(e.target.value);
  };

  const filterOptions = [
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
    { value: "Last 60 days", label: "Last 60 days" },
    { value: "Last 90 days", label: "Last 90 days" },
    { value: "All time", label: "All time" },
  ];

  return (
    <DefaultLayout pageTitle="Leaderboard" bodyClass="leaderboard">
      <div className="wrapper-main">
        <h1 className="page-header">Leaderboard</h1>
        <div className="dropdown-container">
        {/* browser-native select in firefox inherits the dropdown background color from the select element */}
          <select onChange={handleChange} className="dropdown">
            {filterOptions.map((option, index) => (
              <option value={option.value} key={`${option.value}-${index}`}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="leaderboard-container">
          <LeaderboardTable results={leaderboardResults} />
        </div>
      </div>
    </DefaultLayout>
  );
};
