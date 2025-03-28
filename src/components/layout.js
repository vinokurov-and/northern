/* eslint-disable jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid*/
import React, { useState } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Helmet } from "react-helmet";

import { LogoSvg } from "./LogoSvg";
import { Layout } from "../core/ui/Layout";

const TemplateWrapper = (props) => {
  const {data, children, beforeMainChildren = null, disableSlider = false} = props;
  const [showMenu, setShowMenu] = useState(false);
  return (
        <Layout disableSlider={disableSlider}>
          {beforeMainChildren}
          {children}
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
         {/* <div className={`container ${showMenu ? "is-open" : ""}`}> */}
            
            {/* <div className="container__sidebar">
              <div className="sidebar"> */}
                {/* <h6 className="sidebar__title">
                  <Link href="/">{data._site.globalSeo.siteName}</Link>
                </h6> */}
                {/* <div
                  className="sidebar__intro"
                  dangerouslySetInnerHTML={{
                    __html:
                      data.home.introText
                  }}
                /> */}
                {/* <ul className="sidebar__menu">
                <li>
                    <Link href="/">Главная</Link>
                  </li>
                  <li>
                    <Link href="/news">Новости</Link>
                  </li>
                  <li>
                    <Link href="/player">Наша команда</Link>
                  </li>
                  <li>
                    <Link href="/game">Игры (сезон 2021)</Link>
                  </li>
                  <li>
                    <Link href="/stats">Статистика (сезон 2021)</Link>
                  </li>
                </ul> */}

                {/* <LogoSvg /> */}

                {/* <p className="sidebar__social">
                  {data.allSocialProfiles?.edges?.map?.(
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
                  {data.home.copyright}
                </div> */}
              {/* </div>
            </div> */}
            {/* <div className="container__body"> */}
              {/* <div className="container__mobile-header"> */}
                {/* <div className="mobile-header"> */}
                  {/* <div className="mobile-header__menu"> */}
                    {/* eslint-disable-next-line */}
                    {/* <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowMenu(!showMenu);
                      }}
                    /> */}
                  {/* </div> */}
                  {/* <div className="mobile-header__logo">
                    <Link href="/">{data._site.globalSeo.siteName}</Link>
                  </div> */}
                {/* </div> */}
              {/* </div> */}
              
            {/* </div> */}
          {/* </div> */}
        </Layout>
  );
};

TemplateWrapper.propTypes = {
  children: PropTypes.object
};

export default TemplateWrapper;
/* eslint-enable jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid*/
