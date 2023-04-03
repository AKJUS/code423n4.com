import { graphql } from "gatsby";
import React, { useEffect, useState } from "react";

import DefaultLayout from "../../templates/DefaultLayout";

import BotRegistrationForm from "../../components/BotRegistrationForm";
import { WardenFieldOption } from "../../components/reporter/widgets/WardenField";
import { format, isAfter, isBefore } from "date-fns";
import ProtectedSection from "../../components/ProtectedSection";

// @todo: replace with correct start and end times
const START = new Date("2023-03-16T20:43:00.000Z");
const END = new Date("2023-03-16T20:44:30.000Z");

enum Status {
  soon,
  open,
  closed,
}

function getRegistrationWindowStatus(): Status {
  const now = Date.now();
  if (isAfter(now, END)) {
    return Status.closed;
  } else if (isBefore(now, END) && isAfter(now, START)) {
    return Status.open;
  } else {
    return Status.soon;
  }
}

export default function TeamRegistration({ data }) {
  const [
    registrationWindowStatus,
    setRegistrationWindowStatus,
  ] = useState<Status>(getRegistrationWindowStatus());

  const handles: Set<string> = new Set([
    ...data.handles.edges.map((h) => h.node.handle),
    ...data.bots.edges.map((b) => b.node.handle),
  ]);

  let wardens: WardenFieldOption[] = [];
  data.handles.edges.forEach(({ node }) => {
    if (!node.members) {
      wardens.push({ value: node.handle, image: node.image });
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const currentStatus = getRegistrationWindowStatus();

      if (currentStatus === Status.closed) {
        clearInterval(timer);
      }
      setRegistrationWindowStatus(currentStatus);
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <DefaultLayout
      pageTitle="Code4rena Bot Races | Code4rena"
      hideConnectWalletDropdown={true}
    >
      <div className="register-bot">
        {/* Hero */}
        <section className="register-bot__hero type__copy">
          <div className="register-bot__hero-content limited-width">
            <h1 className="type__headline__page-title">
              Gentlefrens, start your engines
            </h1>
            <h2 className="type__subline__page-title">
              Coordinating AI and human efforts to provide the most
              comprehensive vulnerability reports for{" "}
              <span className="no-break">web3 projects</span>.
            </h2>
          </div>
          <div className="waves-wrapper">
            <img
              src="/images/br-hero-waves.svg"
              className="waves"
              alt="Vector illustration of a series of playful robots racing"
            />
          </div>
          <div className="register-bot__hero-ground"></div>
          <div className="register-bot__hero-countdown">
            The first Qualifier Race will be held in early April
          </div>
        </section>

        {/* What's a bot race */}
        <section className="register-bot__top-text-container limited-width type__copy">
          <h2 className="register-bot__sub-header type__headline__xl">
            What's a Bot Race?
          </h2>
          <div className="register-bot__top-text grid__one-by-two--break-m">
            <p>
              <img
                src="/images/br-icon-bot.svg"
                alt="Icon of a round, floating robot"
              />
              <strong>Bot Races</strong> make AI and automated tools part of the
              competitive audit.
            </p>
            <p>
              <img
                src="/images/br-icon-report.svg"
                alt="Icon of a wolf-like robot head printing a report out of its mouth"
              />
              <strong>Bot Crews</strong> compete to see whose bot can create the
              highest quality and most thorough audit report.
            </p>

            <p>
              <img
                src="/images/br-icon-coins.svg"
                alt="Icon of two stacks of coins that are shining"
              />
              <strong>10%</strong> of each contest pool will be dedicated to Bot
              Race prizes.
            </p>
          </div>
        </section>

        {/* Stages / Timeline */}
        <section className="register-bot__stage-container limited-width type__copy">
          <h2 className="register-bot__sub-header type__headline__xl">
            How do Bot Races work?
          </h2>
          <div className="register-bot__stage-one">
            <h3>
              <div className="register-bot__header-stage-number">Stage 1 </div>
              <div className="register-bot__header-stage-name">
                Qualifier Race
              </div>
            </h3>
            <div className="register-bot__text">
              <p className="register-bot__timeline-time">Early April</p>
              <ul>
                <li>
                  Bot Crews race to have their bots deliver the highest quality
                  and most thorough report based on a repo provided at start
                  time.
                </li>
                <li>Qualifier Races are open for one hour.</li>
                <li>
                  Judges choose the Top 20 Bots for upcoming competitions.
                </li>
              </ul>
            </div>
          </div>

          <div className="register-bot__stage-two">
            <h3>
              <div className="register-bot__header-stage-number">Stage 2</div>
              <div className="register-bot__header-stage-name">Bot Race</div>
            </h3>
            <div className="register-bot__text">
              <p className="register-bot__timeline-time">
                Date to be announced
              </p>
              <ul>
                <li>
                  The first hour of each audit competition will be dedicated to
                  a Bot Race.
                </li>
                <li>
                  Bot Race submissions will be assessed by Lookouts, and graded
                  A/B/C similarly to other reports based on report quality,
                  validity, and thoroughness.
                </li>
                <li>
                  The best Bot Race report will receive a 30% share bonus.
                </li>
                <li>
                  The top report will be shared in the competition’s channel and
                  will be considered the official source for known issue
                  submissions.
                </li>
              </ul>
            </div>
          </div>

          <div className="register-bot__learn-more center--flex">
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="button button--primary"
            >
              Learn more about Bot Races
            </a>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="register-bot__bottom-cta type__copy limited-width">
          <img
            src="/images/bot-pup.svg"
            alt="An illustration of a small, cute robot that has wolf-like features like a snout and ears."
            className="register-bot__bot-image"
          />
          <h2 className="register-bot__sub-header type__headline__xl">
            Is your Crew ready to race{" "}
            <span className="no-break">your bot?</span>
          </h2>
          <h3 className="type__headline__m">
            Be sure to give it a winning name!
          </h3>
          <p className="register-bot__coming-soon">
            Qualifier Race coming in early April
          </p>
        </section>
        <div className="limited-width register-bot__register-wrapper">
          {registrationWindowStatus === Status.open && (
            <section className="register-bot__register register-bot__register--open">
              <ProtectedSection message="To register a bot for Bot Races, you need to be a registered warden, currently connected via wallet.">
                <>
                  <h1>Register a Bot</h1>
                  <BotRegistrationForm handles={handles} wardens={wardens} />
                </>
              </ProtectedSection>
            </section>
          )}
          {/* {registrationWindowStatus === Status.closed && (
            <section className="register-bot__register register-bot__register--closed type__copy">
              <h1 className="spacing-bottom__l">Bot Registration is Closed</h1>
              <p>
                The first registration window for Bot Races has now closed.{" "}
                <br />
                Keep your eye on our{" "}
                <a
                  href=""
                  rel="noreferrer"
                  aria-label="Discord announcements channel (Opens in a new window)"
                >
                  announcements channel in Discord
                </a>{" "}
                to learn when the next one will be.
              </p>
            </section>
          )} */}
          {registrationWindowStatus === Status.soon && (
            <section className="register-bot__register register-bot__register--soon type__copy">
              <h1>Bot Registration Coming Soon...</h1>
              <p>
                The first registration window for Bot Races will open for one
                hour on {format(START, "d MMMM")} from {format(START, "h:mm")}{" "}
                to {format(END, "h:mm a")}
              </p>
            </section>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

export const query = graphql`
  query {
    handles: allHandlesJson(sort: { fields: handle, order: ASC }) {
      edges {
        node {
          handle
        }
      }
    }
    bots: allBotsJson(sort: { fields: handle, order: ASC }) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;
