import React from "react";
import { ImageSlider } from "../../components/ImageSlider/ImageSlider";
import Img from "next/image";
import Link from "next/link";
import Layout from "../../components/layout";
import { Game } from "../games/[slug]";
import client from "../../utils/datacms";
import { fetchData } from '../../utils/fetchData';
import Head from "next/head";

export default ({ data, game: gameData }) => {
  const { work: game } = gameData || {};

  if (!game) return <Layout data={data} disableSlider><p>Запись не найдена</p></Layout>;

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
              <ImageSlider
                images={(game.gallery || []).map(item => item.url)}
                alt={game.title}
              />
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


  return { paths, fallback: 'blocking' }
}


export const getStaticProps = async ({ params }) => {
  const isDigitsOnly = /^\d+$/.test(params.slug);

  // Запускаем QUERY_BASE параллельно с основным запросом
  const basePromise = client({ query: QUERY_BASE });

  let game = {};
  if (!isDigitsOnly) {
    const response = await client({ query: QUERY(params.slug) });
    game = response.data;
  } else {
    let r;
    try {
      r = await fetchData('https://fc-sever.ru/c/news');
    } catch {
      r = '{ "result": []  }';
    }
    let news;
    try {
      news = JSON.parse(r).result;
    } catch {
      news = [];
    }
    const found = news.find(item => String(item.id) === String(params.slug));
    game = { work: found || null };
  }

  const responseBase = await basePromise;

  // JSON round-trip удаляет undefined-поля (Next.js не умеет их сериализовать)
  return {
    props: JSON.parse(JSON.stringify({ game, data: responseBase.data }))
  }
}
