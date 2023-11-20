import React from "react";
import Link from "next/link";
import Masonry from "react-masonry-component";
import Img from "next/image";
import Layout from "../components/layout";
import client from "../utils/datacms";

const GamePage = (props) => {
  const { data, game } = props;
  return (
  <Layout data={data}>
    <Masonry className="showcase">
      {game.allGames.map((game) => (
        <div key={game.id} className="showcase__item">
          <figure className="card">
            {game.image && (
              <Link href={`/games/${game.slug}`} className="card__image">
                <Img width={200} height={200} style={{width: '100%', height: 'auto'}} src={game.image.url} />
              </Link>
            )}
            <figcaption className="card__caption">
              <h6 className="card__title">
                {new Date(game.date).toLocaleString()} <br />
                <Link href={`/games/${game.slug}`}>
                  <span className="bold">
                    {game.teamHome} - {game.guestTeam}
                  </span>
                </Link>
              </h6>
              <div className="card__description"></div>
            </figcaption>
          </figure>
        </div>
      ))}
    </Masonry>
  </Layout>
)};

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

const QUERY = `
{
allGames {
  date
  teamHome
  guestTeam
  stadium
  pointHome
  pointGuest
  id
  slug
  image {
    url
  }
}
}
`;

export async function getInitialProps() {
  const response = await client({
    query: QUERY
  })

  const responseBase = await client({
    query: QUERY_BASE
  })

  
  // Обработка данных и передача их компоненту
  return { game: response.data, data: responseBase.data }
  
}

GamePage.getInitialProps = getInitialProps;

export default GamePage;