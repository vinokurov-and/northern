import React from "react";
import Img from "next/image";
import Layout from "../../components/layout";
import Link from "next/link";
import client from "../../utils/datacms";

const PlayerPage = ({ data, player }) => {
  const players = player?.allPlayers || [];

  return (
    <Layout data={data}>
      <div className="showcase">
        {players.map((p) => (
          <div key={p.id} className="showcase__item">
            <figure className="card">
              {p.coverImage && (
                <Link href={`/players/${p.slug}`} className="card__image">
                  <Img height={100} width={100} style={{width: '100%', height: 'auto'}} src={p.coverImage.url || p.coverImage} alt={p.title} />
                </Link>
              )}
              <figcaption className="card__caption">
                <h6 className="card__title">
                  <Link href={`/players/${p.slug}`}>{p.title}</Link>
                </h6>
                <div className="card__description">
                  <p>{p.excerpt}</p>
                </div>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </Layout>
  );
};

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
`;

export async function getStaticProps() {
  const [response, responseBase] = await Promise.all([
    client({ query: QUERY }),
    client({ query: QUERY_BASE }),
  ]);

  return {
    props: {
      player: response.data || { allPlayers: [] },
      data: responseBase.data || {},
    },
  };
}

export default PlayerPage;
