import React from "react";
import Slider from "react-slick";
import Img from "next/image";
import Link from "next/link";
import Layout from "../../components/layout";
import { Game } from "../games/[slug]";
import client from "../../utils/datacms";
import { fetchData } from '../../utils/fetchData';
import Head from "next/head";

export default ({ data, game: gameData }) => {
  const { work: game } = gameData;

  return (
    <>
      <Head>
        <title>{game.title}</title>
        <meta name="title" content={game.title} />
        <meta name="description" content={game.description} />
      </Head>
      <Layout data={data} disableSlider>
        <article className="sheet">
          <div className="sheet__inner">
            <h1 className="sheet__title">{game.title}</h1>
            <p className="sheet__lead">{game.excerpt}</p>
            {game.previewGame && (
              <>
                <p>
                  Игра команд {game.previewGame.teamHome} и{" "}
                  {game.previewGame.guestTeam} состоится на стадионе{" "}
                  {game.previewGame.stadium}{" "}
                  {new Date(game.previewGame.date).toLocaleString()}
                </p>
                <br />
                <Link href={`/games/${game.previewGame.slug}`}>
                  Перейти на страницу игры
                </Link>
              </>
            )}

            <div className="sheet__slider">
              <Slider infinite={true} slidesToShow={2} arrows>
                {(game.gallery || []).map((item) => (
                  <img
                    alt={game.title}
                    style={{ width: '100%', height: 'auto' }}
                    key={item.url}
                    src={item.url}
                  />
                ))}
              </Slider>
            </div>
            {game.description && (
              <div
                className="sheet__body"
                dangerouslySetInnerHTML={{
                  __html: game.description,
                }}
              />
            )}
            {game.image && (
              <div className="sheet__gallery">
                <Img width={100} height={100} style={{ width: '100%', height: 'auto' }} src={game.image} />
              </div>
            )}
            {game.game && (
              <div className="sheet__gallery">
                <Img width={100} height={100} style={{ width: '100%', height: 'auto' }} src={game.url} />
              </div>
            )}
          </div>
          {game.game && !game.previewGame && (
            <Game datoCmsGame={game.game} isPreview />
          )}
        </article>
      </Layout>
    </>
  )
};

export const QUERY = (slug) => `
{
    work(filter:{
      slug: {
        in: "${slug}"
      }
    }) {
      title
      excerpt
      gallery {
        url
      }
      description
      game {
        date
        teamHome
        guestTeam
        stadium
        pointHome
        pointGuest
        id
        slug
        description
        image {
          url
        }
        gallery {
          url
        }
      }
      previewGame {
        date
        stadium
        guestTeam
        teamHome
        slug
      }
      coverImage {
        url
      }
    }
  }
`;

const QUERY_ALL_WORKS = `
{
  allWorks {
    slug
  }
}
`;


const QUERY_BASE = `
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

export async function getStaticPaths() {
  const response = await client({
    query: QUERY_ALL_WORKS
  });

  let r;
  try {
    r = await fetchData('https://fc-sever.ru/c/news');
  } catch {
      r = '{ "result": []  }'
  }
  

  let news = [];
  try {
    news = JSON.parse(r).result || [];
  } catch {
    news = [];
  }

  const paths = response.data.allWorks.map((work) => {
    return {
      params: { slug: work.slug }
    }
  });

  news.forEach(element => {
    paths.push({
      params: {
        slug: String(element.id)
      },
    })
  });


  return { paths, fallback: false }
}


export const getStaticProps = async ({ params }) => {

  let game = {};
  const isDigitsOnly = /^\d+$/.test(params.slug);
  if (!isDigitsOnly) {
    const response = await client({
      query: QUERY(params.slug)
    })
    game = response.data
  } else {
    let r;
    try {
      r = await fetchData('https://fc-sever.ru/c/news');
    } catch {
        r = '{ "result": []  }'
    }
    let news;
    try {
      news = JSON.parse(r).result;
    } catch {
      news = [];
    }
    game = { work: news.find(item => String(item.id) === String(params.slug)) };
  }

  console.log(game);

  const responseBase = await client({ query: QUERY_BASE });

  return {
    props: { game, data: responseBase.data }
  }
}
