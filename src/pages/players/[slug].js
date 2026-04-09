import React from "react";
import { ImageSlider } from "../../components/ImageSlider/ImageSlider";
import Img from "next/image";
import Layout from "../../components/layout";
import client from "../../utils/datacms";



const PlayerSlug = ({ data, item, ...rest }) => {

  const { player } = item || {};

  if (!player) return <Layout data={data}><p>Игрок не найден</p></Layout>;

  return (
    <Layout data={data}>
    <article className="sheet">
      <div className="sheet__inner">
        <h1 className="sheet__title">{player.title}</h1>
        <p className="sheet__lead">{player.excerpt}</p>
        <div className="sheet__slider">
          <ImageSlider
            images={player.gallery?.map?.(item => item.url || item) || []}
            alt={player.title}
          />
        </div>
        <div
          className="sheet__body"
          dangerouslySetInnerHTML={{
            __html: player.description,
          }}
        />
        {player.coverImage && (
          <div className="sheet__gallery">
            <Img width={200} height={200} style={{height: 'auto', width: 'auto'}} src={player.coverImage.url} />
          </div>
        )}
      </div>
    </article>
  </Layout>
)};

export default PlayerSlug;

const QUERY = (slug) => `
{
  player(filter:{
    slug: {
      in: "${slug}"
    }
  }) {
    title
    slug
    excerpt
    gallery {
      url
    }
    description
    coverImage {
      url
    }
  }
}
`;

const QUERY_ALL_PLAYERS = `
{
  allPlayers {
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

// export async function getInitialProps() {
//   const response = await client({
//     query: QUERY
//   })

//   const responseBase = await client({
//     query: QUERY_BASE
//   })

//   console.log(response)
  
//   // Обработка данных и передача их компоненту
//   return { player: response.data, data: responseBase.data }
  
// }

// PlayerSlug.getServerSideProps = async (context) => {
//   console.log(context);
//   return {};
// }



// PlayerSlug.getInitialProps = getInitialProps;

export async function getStaticPaths() {
  const response = await client({
    query: QUERY_ALL_PLAYERS
  });

  const paths = response.data.allPlayers.map((player) => {
    return {
      params: { slug: player.slug }
    }
  });

  return { paths, fallback: 'blocking' }
}


export const getStaticProps = async ({params}) => {
  const response = await client({
    query: QUERY(params.slug)
  })

  const responseBase = await client({query: QUERY_BASE});

  
  return {
    props: {item: response.data, data: responseBase.data}
  }
}
