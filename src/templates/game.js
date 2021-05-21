import React from "react";
import Slider from "react-slick";
import { HelmetDatoCms } from "gatsby-source-datocms";
import Img from "gatsby-image";
import { graphql } from "gatsby";
import Layout from "../components/layout";

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 2,
};

export default ({ data }) => (
  <Layout>
    <article className="sheet">
      <HelmetDatoCms seo={data.datoCmsGame.seoMetaTags} />
      <Game datoCmsGame={data.datoCmsGame} />
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
              {datoCmsGame.gallery.map(({ fluid }) => (
                <img alt={datoCmsGame.title} key={fluid.src} src={fluid.src} />
              ))}
            </Slider>
          </div>
        </div>
      )}
      <div
        className="sheet__body"
        dangerouslySetInnerHTML={{
          __html: datoCmsGame.descriptionNode.childMarkdownRemark.html,
        }}
      />
      <div className="sheet__inner">
        {datoCmsGame.image && (
          <div className="sheet__gallery">
            <Img fluid={datoCmsGame.image.fluid} />
          </div>
        )}
      </div>
    </>
  );
};

export const query = graphql`
  query GamePageQuery($slug: String!) {
    datoCmsGame(slug: { eq: $slug }) {
      date
      teamHome
      guestTeam
      stadium
      pointHome
      pointGuest
      id
      slug
      descriptionNode {
        childMarkdownRemark {
          html
        }
      }
      image {
        url
        fluid(maxWidth: 600, imgixParams: { fm: "jpg", auto: "compress" }) {
          ...GatsbyDatoCmsSizes
        }
      }
      gallery {
        fluid(maxWidth: 200, imgixParams: { fm: "jpg", auto: "compress" }) {
          src
        }
      }
    }
  }
`;
