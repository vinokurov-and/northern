import React from "react";
import Head from "next/head";
import { Layout } from "../core/ui/Layout";

const TemplateWrapper = (props) => {
  const { children, beforeMainChildren = null, disableSlider = false } = props;

  return (
    <Layout disableSlider={disableSlider}>
      <Head>
        <script
          data-ad-client="ca-pub-5506357121404841"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        />
        <script
          type="text/javascript"
          src="//www.goalstream.org/api/connect/all.js?20"
        />
      </Head>
      {beforeMainChildren}
      {children}
    </Layout>
  );
};

export default TemplateWrapper;
