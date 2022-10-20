/* eslint-disable jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid*/

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { StaticQuery, graphql } from "gatsby";
import { HelmetDatoCms } from "gatsby-source-datocms";
import { Helmet } from "react-helmet";

import "../styles/styles.css";
import { LogoSvg } from "./LogoSvg";
import { Layout } from "../core/ui/Layout";

const TemplateWrapper = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <StaticQuery
      query={graphql`
        query LayoutQuery {
          datoCmsSite {
            globalSeo {
              siteName
            }
            faviconMetaTags {
              ...GatsbyDatoCmsFaviconMetaTags
            }
          }
          datoCmsHome {
            seoMetaTags {
              ...GatsbyDatoCmsSeoMetaTags
            }
            introTextNode {
              childMarkdownRemark {
                html
              }
            }
            copyright
          }
          allDatoCmsSocialProfile(sort: { fields: [position], order: ASC }) {
            edges {
              node {
                profileType
                url
              }
            }
          }
        }
      `}
      render={(data) => (
        <Layout>
          <div className={`container ${showMenu ? "is-open" : ""}`}>
            <HelmetDatoCms
              favicon={data.datoCmsSite.faviconMetaTags}
              seo={data.datoCmsHome.seoMetaTags}
            />
            <Helmet>
              <script
                data-ad-client="ca-pub-5506357121404841"
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
              ></script>
              <script
                type="text/javascript"
                src="//www.goalstream.org/api/connect/all.js?20"
              ></script>
            </Helmet>
            <div className="container__sidebar">
              <div className="sidebar">
                <h6 className="sidebar__title">
                  <Link to="/">{data.datoCmsSite.globalSeo.siteName}</Link>
                </h6>
                <div
                  className="sidebar__intro"
                  dangerouslySetInnerHTML={{
                    __html:
                      data.datoCmsHome.introTextNode.childMarkdownRemark.html
                  }}
                />
                <ul className="sidebar__menu">
                  <li>
                    <Link to="/">Новости</Link>
                  </li>
                  <li>
                    <Link to="/player">Наша команда</Link>
                  </li>
                  <li>
                    <Link to="/game">Игры (сезон 2021)</Link>
                  </li>
                  <li>
                    <Link to="/stats">Статистика (сезон 2021)</Link>
                  </li>
                </ul>

                <LogoSvg />

                <p className="sidebar__social">
                  {data.allDatoCmsSocialProfile.edges.map(
                    ({ node: profile }) => (
                      <a
                        key={profile.profileType}
                        href={profile.url}
                        target="blank"
                        className={`social social--${profile.profileType.toLowerCase()}`}
                      >
                        {" "}
                      </a>
                    )
                  )}
                </p>
                <div className="sidebar__copyright">
                  {data.datoCmsHome.copyright}
                </div>
              </div>
            </div>
            <div className="container__body">
              <div className="container__mobile-header">
                <div className="mobile-header">
                  <div className="mobile-header__menu">
                    {/* eslint-disable-next-line */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowMenu(!showMenu);
                      }}
                    />
                  </div>
                  <div className="mobile-header__logo">
                    <Link to="/">{data.datoCmsSite.globalSeo.siteName}</Link>
                  </div>
                </div>
              </div>
              {children}
            </div>
          </div>
        </Layout>
      )}
    />
  );
};

TemplateWrapper.propTypes = {
  children: PropTypes.object
};

export default TemplateWrapper;
/* eslint-enable jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid*/
