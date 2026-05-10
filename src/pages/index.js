import React from "react";
import Layout from "../components/layout";
import client from "../utils/datacms";
import { EngineHome } from "../screens/EngineHome";

// Минимальный QUERY — только то что нужно для favicon и siteName.
// Раньше тянули home.copyright/introText/works/players/news — всё legacy
// контент расформированной ФК Северный, на главной Engine не используется.
const QUERY = `
{
  _site {
    globalSeo {
      siteName
    }
    faviconMetaTags {
      tag
      content
      attributes
      __typename
    }
  }
}
`


const IndexPage = (props) => {
  const { data } = props;
  // Главная — лендинг Engine. Legacy News+Players (ФК Северный) убраны:
  // команда расформирована, домен теперь движок любительского футбола
  // Калужской области. Сам Северный получает страницу /team/severnyy
  // как любой другой клуб с собственным акцентом #9055a2.
  return (
    <Layout disableSlider disableHeader beforeMainChildren={<EngineHome />} data={data}></Layout>
  )
};


// IndexPage.getInitialProps = getInitialProps;

const fetchHtml = async (uri) => {
  return await fetch(uri)
    .then(function (response) {
      // When the page is loaded convert it to text
      return response.text()
    })
    .catch(function (err) {
      console.log('Failed to fetch page: ', err);
    });
}

function fetchData(url) {

  const https = require('https');

  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}


export const getStaticProps = async () => {
  const response = await client({ query: QUERY });
  return { props: { data: response.data } };
};

export default IndexPage;
