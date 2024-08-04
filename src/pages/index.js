import React from "react";
import Layout from "../components/layout";
import client from "../utils/datacms";
import { parse } from 'node-html-parser';
// import { GamesAnnouncementScreen } from "../screens/GamesAnnouncmentGames/GamesAnnouncmentGames";
import { News } from "../screens/News";
import { Players } from "../screens/Players";
import { QUERY_ALL_PLAYERS } from "../data/players/cmo";

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
  home {
     copyright
    _seoMetaTags {
      tag
      content
      attributes
      __typename
    }
    introText
  }
  
  allSocialProfiles {
    profileType
    url
  }
  
}
`

const WORKS = `
{
  allWorks{
    id
    title
    slug
    excerpt
    coverImage {
      url
    }
  }
}
`


const IndexPage = (props) => {
  const { data, works, games, players } = props;
  return (
    <Layout beforeMainChildren={
      <>
        {/* <GamesAnnouncementScreen data={games} /> */}
        <News works={works || []} />
        <Players data={players} />
      </>
    } data={data}></Layout>
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


export const getStaticProps = async (data) => {

  const response = await client({
    query: QUERY
  });

  const response2 = await client({
    query: WORKS
  });

  const playersResponse = await client({
    query: QUERY_ALL_PLAYERS
  });

  const playersDb = await fetchData('https://fc-sever.ru/c/players');
  console.log(playersDb);
  const jsonPlayersDb = JSON.parse(playersDb).result;

  const allPlayersDb = jsonPlayersDb.map(item => item.externalId);

  const allPlayers = playersResponse.data.allPlayers.filter(item => !allPlayersDb.includes(Number(item.id)));

  const r = await fetchData('https://fc-sever.ru/c/news');

  const news = JSON.parse(r).result;

  const gamesHtml = await fetchHtml('https://kfl-football.ru/tournament/1033939/calendar?type=tours');

  const kflDom = parse(gamesHtml);

  const games = [];

  const sheduleItems = kflDom.querySelectorAll('.schedule__matches-item');

  sheduleItems.forEach(scheduleItem => {
    const teams = scheduleItem.querySelectorAll('.schedule__team-name');

    if (teams.find(item => item.innerText.toLocaleLowerCase().includes('"северный"'))) {
      const date = scheduleItem.querySelector('.schedule__time');
      const score = scheduleItem.querySelector('.schedule__score-main');
      const place = scheduleItem.querySelector('.schedule__place');
      const round = scheduleItem.querySelector('.schedule__round-main');
      const scheduleScoreMain = scheduleItem.querySelector('.schedule__score');
      games.push({
        home: teams[0].innerText.trim(),
        guest: teams[1].innerText.trim(),
        date: date.innerText.trim(),
        score: score.innerText.trim(),
        place: place?.innerText.trim() || '-',
        tournament: round?.innerText.trim(),
        kflUrl: scheduleScoreMain ? 'https://kfl-football.ru' + scheduleScoreMain.getAttribute('href') : undefined
      });
    }
  })

  // Обработка данных и передача их компоненту
  return { props: { data: response.data, works: [...(news.reverse() || []), ...response2.data.allWorks], games, players: [...jsonPlayersDb, ...allPlayers] } }

}

export default IndexPage;
