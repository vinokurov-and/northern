import React from "react";
import Masonry from "react-masonry-component";
import Img from "next/image";
import Layout from "../components/layout";
import client from "../utils/datacms";
import Link from "next/link";
import { parse } from 'node-html-parser';
import {GamesAnnouncementScreen} from "../screens/GamesAnnouncmentGames/GamesAnnouncmentGames";

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

// export async function getInitialProps() {
 
// }




const IndexPage = (props) => {
  const {data, works, games} = props;
  return (
    <Layout beforeMainChildren={
      <GamesAnnouncementScreen data={games} />
    } data={data}>
      <Masonry className="showcase">
        {works.allWorks.map((work) => {
          return (
          <div key={work.id} className="showcase__item">
            <figure className="card">
              <Link href={`/works/${work.slug}`} className="card__image">
                <Img style={{position: 'relative', width: '100%', height: 'auto'}} width={200} height={200} src={work.coverImage.url} />
              </Link>
              <figcaption className="card__caption">
                <h6 className="card__title">
                  <Link href={`/works/${work.slug}`}>{work.title}</Link>
                </h6>
                <div className="card__description">
                  <p>{work.excerpt}</p>
                </div>
              </figcaption>
            </figure>
          </div>
        )})}
      </Masonry>
    </Layout>
    )
};


// IndexPage.getInitialProps = getInitialProps;

const fetchHtml = async (uri) => {
  return await fetch(uri)
    .then(function(response) {
        // When the page is loaded convert it to text
        return response.text()
    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
    });
}

export const getStaticProps = async (data) => {
  const response = await client({
    query: QUERY
  });

  const response2 = await client({
    query: WORKS
  });

  const gamesHtml = await fetchHtml('https://kfl-football.ru/tournament/1033939/calendar?type=tours');

  const kflDom = parse(gamesHtml);
  
  const games = [];

  const sheduleItems = kflDom.querySelectorAll('.schedule__matches-item');

  sheduleItems.forEach(scheduleItem => {
    const teams = scheduleItem.querySelectorAll('.schedule__team-name');
    
    if (teams.find(item=>item.innerText.toLocaleLowerCase().includes('"северный"'))) {
      const date = scheduleItem.querySelector('.schedule__time');
      const score = scheduleItem.querySelector('.schedule__score-main');
      const place = scheduleItem.querySelector('.schedule__place');
      const round = scheduleItem.querySelector('.schedule__round-main');
      const scheduleScoreMain = scheduleItem.querySelector('.schedule__score');
      games.push({home: teams[0].innerText.trim(), 
        guest: teams[1].innerText.trim(), 
        date: date.innerText.trim(),
       score: score.innerText.trim(),
        place: place?.innerText.trim() || '-',
        tournament: round?.innerText.trim(),
        kflUrl: scheduleScoreMain ? 'https://kfl-football.ru' + scheduleScoreMain.getAttribute('href') : undefined
      });
    }

    console.log(games);
  })

  // Обработка данных и передача их компоненту
  return  {props: { data: response.data, works: response2.data, games }}
  
}

export default IndexPage;
