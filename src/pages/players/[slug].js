import React from "react";
import Slider from "react-slick";
import Img from "next/image";
import Layout from "../../components/layout";
import client from "../../utils/datacms";



const PlayerSlug = ({ data, item, ...rest }) => {

  const { player } = item || {};

  return (
    <Layout data={data}>
    <article className="sheet">
      <div className="sheet__inner">
        {console.log(player.title)}
        <h1 className="sheet__title">{player.title}</h1>
        <p className="sheet__lead">{player.excerpt}</p>
        <div className="sheet__slider">
          <Slider infinite={true} slidesToShow={2} arrows>
            {player.gallery?.map?.(({ p }) => (
              <img
                alt={p.title}
                key={p.url}
                src={p.url}
              />
            ))}
          </Slider>
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


export const getServerSideProps = async ({params}) => {
  const response = await client({
    query: QUERY(params.slug)
  })

  const responseBase = await client({query: QUERY_BASE});

  
  return {
    props: {item: response.data, data: responseBase.data}
  }
}
