import { Link } from "gatsby";
import React from "react";

const Footer = () => {
  return (
    <footer className="footer limited-width">
      <ul className="footer__items">
        <li className="footer__item">AN OPEN ORGANIZATION</li>
        <li className="footer__item">
          <a
            href="https://twitter.com/code4rena"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter (Opens in new Window)"
          >
            TWITTER
          </a>
        </li>
        <li className="footer__item">
          <a
            href="https://discord.gg/code4rena"
            target="_blank"
            rel="noreferrer"
            aria-label="Discord (Opens in new Window)"
          >
            DISCORD
          </a>
        </li>
        <li className="footer__item">
          <a
            href="https://github.com/code-423n4/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub (Opens in new Window)"
          >
            GITHUB
          </a>
        </li>
        <li className="footer__item">
          <a
            href="https://medium.com/code4rena"
            target="_blank"
            rel="noreferrer"
            aria-label="Medium (Opens in new Window)"
          >
            MEDIUM
          </a>
        </li>
        <li className="footer__item">
          <Link to="/newsletter-signup">NEWSLETTER</Link>
        </li>
        <li className="footer__item">
          <span className="eth-address">
            <a href="https://etherscan.io/address/0xC2BC2F890067C511215F9463A064221577A53E10">
              code4rena.eth
            </a>
          </span>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
