import React from "react";
import Slider from "react-slick";
import { HelmetDatoCms } from "gatsby-source-datocms";
import Img from "gatsby-image";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import { Game } from "../templates/game";

export default ({ data }) => (
  <Layout>
    {console.log(data)}
    <article className="sheet">
      <HelmetDatoCms seo={data.datoCmsWork.seoMetaTags} />
      <div className="sheet__inner">
        <h1 className="sheet__title">{data.datoCmsWork.title}</h1>
        <p className="sheet__lead">{data.datoCmsWork.excerpt}</p>
        {data.datoCmsWork.previewGame && (
          <>
            <p>
              Игра команд {data.datoCmsWork.previewGame.teamHome} и{" "}
              {data.datoCmsWork.previewGame.guestTeam} состоится на стадионе{" "}
              {data.datoCmsWork.previewGame.stadium}{" "}
              {new Date(data.datoCmsWork.previewGame.date).toLocaleString()}
            </p>
            <br />
            <Link to={`/games/${data.datoCmsWork.previewGame.slug}`}>
              Перейти на страницу игры
            </Link>
          </>
        )}

        <div className="sheet__slider">
          <Slider infinite={true} slidesToShow={2} arrows>
            {data.datoCmsWork.gallery.map(({ fluid }) => (
              <img
                alt={data.datoCmsWork.title}
                key={fluid.src}
                src={fluid.src}
              />
            ))}
          </Slider>
        </div>
        {data.datoCmsWork.descriptionNode && (
          <div
            className="sheet__body"
            dangerouslySetInnerHTML={{
              __html: data.datoCmsWork.descriptionNode.childMarkdownRemark.html,
            }}
          />
        )}
        {!data.datoCmsWork.game && (
          <div className="sheet__gallery">
            <Img fluid={data.datoCmsWork.coverImage.fluid} />
          </div>
        )}
      </div>
      {data.datoCmsWork.game && !data.datoCmsWork.previewGame && (
        <Game datoCmsGame={data.datoCmsWork.game} isPreview />
      )}
    </article>
  </Layout>
);

export const query = graphql`
  query WorkQuery($slug: String!) {
    datoCmsWork(slug: { eq: $slug }) {
      seoMetaTags {
        ...GatsbyDatoCmsSeoMetaTags
      }
      title
      excerpt
      gallery {
        fluid(maxWidth: 200, imgixParams: { fm: "jpg", auto: "compress" }) {
          src
        }
      }
      descriptionNode {
        childMarkdownRemark {
          html
        }
      }
      game {
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
      previewGame {
        date
        stadium
        teamHome
        guestTeam
        slug
      }
      coverImage {
        url
        fluid(maxWidth: 600, imgixParams: { fm: "jpg", auto: "compress" }) {
          ...GatsbyDatoCmsSizes
        }
      }
    }
  }
`;
