import React from "react";
import Slider from "react-slick";
import Img from "next/image";
import Layout from "../../components/layout";
import client from "../../utils/datacms";

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 2,
};
const BaseGage = ({ data, item }) => (
  <Layout data={data}>
    <article className="sheet">
      <Game datoCmsGame={item.game} />
    </article>
  </Layout>
);

export const Game = ({ datoCmsGame, isPreview }) => {
  const point = `${datoCmsGame.pointHome}:${datoCmsGame.pointGuest}`;

  let label = `${datoCmsGame.teamHome} ${datoCmsGame.pointHome ||
    "-"}:${datoCmsGame.pointGuest || "-"}${" "}
  ${datoCmsGame.guestTeam}`;

  if (datoCmsGame.pointHome && datoCmsGame.pointGuest) {
    let winner =
      datoCmsGame.pointHome > datoCmsGame.pointGuest
        ? datoCmsGame.teamHome
        : datoCmsGame.guestTeam;

    if (isPreview) {
      if (datoCmsGame.pointHome === datoCmsGame.pointGuest)
        label = `Игра закончилась со счётом ${point}`;
      else label = `Результат встречи ${point} в пользу команды ${winner}`;
    }
  }

  return (
    <>
      <h1 className={isPreview ? "sheet__title-preview" : "sheet__title"}>
        {label}
      </h1>
      {datoCmsGame.stadium && <p>Стд. {datoCmsGame.stadium}</p>}
      <p>{new Date(datoCmsGame.date).toLocaleString()}</p>
      <br />
      {datoCmsGame.gallery && (
        <div className="sheet__inner">
          <div className="sheet__slider">
            <Slider {...settings}>
              {datoCmsGame.gallery.map((item) => (
                <img alt={datoCmsGame.title} key={item.src} src={item.src} />
              ))}
            </Slider>
          </div>
        </div>
      )}
      <div
        className="sheet__body"
        dangerouslySetInnerHTML={{
          __html: datoCmsGame.description,
        }}
      />
      <div className="sheet__inner">
        {datoCmsGame.image && (
          <div className="sheet__gallery">
            <Img src={datoCmsGame.image.fluid} />
          </div>
        )}
      </div>
    </>
  );
};

export default BaseGage;

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

const QUERY = (slug) => `
{
  game(filter:{
  slug: {
    in: "${slug}"
  }
}) {
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
}`;

const QUERY_ALL_GAMES = `
{
  allGames {
    slug
  }
}
`

export async function getStaticPaths() {
  const response = await client({
    query: QUERY_ALL_GAMES
  });

  const paths = response.data.allGames.map((game) => {
    return {
      params: { slug: game.slug }
    }
  });

  return { paths, fallback: false }
}


export const getStaticProps = async ({params}) => {
  console.log(params)
    const response = await client({
      query: QUERY(params.slug)
    })

    console.log(response);
  
    const responseBase = await client({query: QUERY_BASE});
  
    
    return {
      props: {item: response.data, data: responseBase.data}
    }
  }
  