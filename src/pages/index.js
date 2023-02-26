import React, { useState, useEffect, useCallback } from "react";
import { graphql } from "gatsby";
import { getDates } from "../utils/time";
import useUser from "../hooks/UserContext";

import ContestList from "../components/ContestList";
import DefaultLayout from "../templates/DefaultLayout";
import HomepageHero from "../components/content/HomepageHero";
import Testimonials from "../components/Testimonials";
import TrustBar from "../components/TrustBar";
import SecondaryNav from "../components/SecondaryNav";
import SecondaryNavItem from "../components/SecondaryNavItem";
import HomepageTopNames from "../components/content/HomepageTopNames";
import SkeletonLoader from "../components/SkeletonLoader";

export default function SiteIndex({ data }) {
  const { currentUser } = useUser();

  // @todo: implement global state management instead of props drilling
  const [contestStatusChanges, updateContestStatusChanges] = useState(0);
  const [filteredContests, setFilteredContest] = useState(null);
  const [viewMode, setViewMode] = useState("warden"); // warden | sponsor
  const contests = data.contests.edges;

  const updateContestStatus = useCallback(() => {
    updateContestStatusChanges(contestStatusChanges + 1);
    setFilteredContest(sortContests(contests));
  }, [contests, contestStatusChanges]);

  const sortContests = (contestArray) => {
    let statusObject = {
      upcomingContests: [],
      activeContests: [],
      recentlyEndedContests: [],
    };

    contestArray.forEach((element) => {
      const statusBasedOnDates = getDates(
        element.node.start_time,
        element.node.end_time
      ).contestStatus;
      if (statusBasedOnDates === "soon") {
        statusObject.upcomingContests.push(element.node);
      } else if (statusBasedOnDates === "active") {
        statusObject.activeContests.push(element.node);
      }
      // status based on dates is "ended", limit to contests that have ended in the last 3 weeks
      else if (
        statusBasedOnDates === "completed" &&
        element.node.end_time < Date.now() - 1814400000
      ) {
        statusObject.recentlyEndedContests.push(element.node);
      }
    });

    for (const keys in statusObject) {
      statusObject[keys].sort(function (a, b) {
        let keyA = new Date(a.start_time);
        let keyB = new Date(b.start_time);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
    }
    return statusObject;
  };

  useEffect(() => {
    if (contests) {
      setFilteredContest(sortContests(contests));
    }
  }, [contests]);

  return (
    <DefaultLayout bodyClass="home" key={"home" + contestStatusChanges}>
      {/* Nav switcher */}
      <SecondaryNav>
        <SecondaryNavItem
          to="#wardens"
          active={viewMode === "warden"}
          onClick={() => setViewMode("warden")}
        >
          For Wardens
        </SecondaryNavItem>
        <SecondaryNavItem
          to="#sponsors"
          active={viewMode === "sponsor"}
          onClick={() => setViewMode("sponsor")}
        >
          For Sponsors
        </SecondaryNavItem>
      </SecondaryNav>

      {/* Hero */}
      <HomepageHero viewMode={viewMode} />

      {/* Top names bar under hero */}
      {!viewMode || (viewMode === "warden" && <HomepageTopNames />)}
      {viewMode === "sponsor" && <TrustBar />}

      {/* Contests */}
      <section
        className={
          "home__featured-contests background--low-contrast background--" +
          viewMode
        }
      >
        <div className="limited-width">
          <h1 className="type__headline__l">Competitive audits</h1>
          {!filteredContests ? <SkeletonLoader /> : null}
          {filteredContests && filteredContests.activeContests.length > 0 ? (
            <div>
              <p className="type__subline__m spacing-bottom__xl">
                Currently finding the highest-severity vulnerabilities for:
              </p>
              <ContestList
                updateContestStatus={updateContestStatus}
                contests={filteredContests.activeContests}
                user={currentUser}
              />
            </div>
          ) : null}
        </div>
      </section>
      {filteredContests && filteredContests.upcomingContests.length > 0 ? (
        <section>
          <h1 className="upcoming-header">
            Under construction - Upcoming contests
          </h1>
          <ContestList
            updateContestStatus={updateContestStatus}
            contests={filteredContests.upcomingContests}
            user={currentUser}
          />
        </section>
      ) : null}
      {filteredContests && filteredContests.recentlyEndedContests.length > 0 ? (
        <section>
          <h1 className="upcoming-header">
            Under construction - recently ended contests
          </h1>
          <ContestList
            updateContestStatus={updateContestStatus}
            contests={filteredContests.recentlyEndedContests}
            user={currentUser}
          />
        </section>
      ) : null}
      {/* <section>
          <Testimonials />
        </section>
        <section className="center">
          <h5>Want to learn more?</h5>
          <div className="button-wrapper">
            <a className="button cta-button" href="https://docs.code4rena.com">
              <strong>Read the docs</strong>
            </a>
          </div>
        </section> */}
    </DefaultLayout>
  );
}

export const query = graphql`
  query {
    contests: allContestsCsv(
      filter: { hide: { ne: true } }
      sort: { fields: start_time, order: ASC }
    ) {
      edges {
        node {
          id
          title
          details
          hide
          league
          start_time
          end_time
          amount
          repo
          findingsRepo
          sponsor {
            name
            image {
              childImageSharp {
                resize(width: 80) {
                  src
                }
              }
            }
            link
          }
          fields {
            submissionPath
            contestPath
            status
            codeAccess
          }
          contestid
        }
      }
    }
  }
`;
