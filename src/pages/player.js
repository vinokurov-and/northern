import React from "react";
import Masonry from "react-masonry-component";
import Img from "next/image";
import Layout from "../components/layout";
import Link from "next/link";
import client from "../utils/datacms";

const PlayerPage = ({ data, player }) => (
  <Layout data={data}>
    <Masonry className="showcase">
      {player.allPlayers.map((player) => (
        <div key={player.id} className="showcase__item">
          <figure className="card">
            {player.coverImage && (
              <Link href={`/players/${player.slug}`} className="card__image">
                <Img height={100} width={100} style={{width: '100%', height: 'auto'}} src={player.coverImage.url} alt={player.title} />
              </Link>
            )}
            <figcaption className="card__caption">
              <h6 className="card__title">
                <Link href={`/players/${player.slug}`}>{player.title}</Link>
              </h6>
              <div className="card__description">
                <p>{player.excerpt}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      ))}
    </Masonry>
  </Layout>
);

const QUERY = `
{
  allPlayers{
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

export async function getInitialProps() {
  const response = await client({
    query: QUERY
  })

  const responseBase = await client({
    query: QUERY_BASE
  })

  
  // Обработка данных и передача их компоненту
  return { player: response.data, data: responseBase.data }
  
}



PlayerPage.getInitialProps = getInitialProps;
export default PlayerPage;
