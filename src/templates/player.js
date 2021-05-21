import React from "react";
import Slider from "react-slick";
import { HelmetDatoCms } from "gatsby-source-datocms";
import Img from "gatsby-image";
import { graphql } from "gatsby";
import Layout from "../components/layout";

export default ({ data }) => (
  <Layout>
    <article className="sheet">
      <HelmetDatoCms seo={data.datoCmsPlayer.seoMetaTags} />
      <div className="sheet__inner">
        <h1 className="sheet__title">{data.datoCmsPlayer.title}</h1>
        <p className="sheet__lead">{data.datoCmsPlayer.excerpt}</p>
        <div className="sheet__slider">
          <Slider infinite={true} slidesToShow={2} arrows>
            {data.datoCmsPlayer.gallery.map(({ fluid }) => (
              <img
                alt={data.datoCmsPlayer.title}
                key={fluid.src}
                src={fluid.src}
              />
            ))}
          </Slider>
        </div>
        <div
          className="sheet__body"
          dangerouslySetInnerHTML={{
            __html: data.datoCmsPlayer.descriptionNode.childMarkdownRemark.html,
          }}
        />
        {data.datoCmsPlayer.coverImage && (
          <div className="sheet__gallery">
            <Img fluid={data.datoCmsPlayer.coverImage.fluid} />
          </div>
        )}
      </div>
    </article>
  </Layout>
);

export const query = graphql`
  query PlayerPageQuery($slug: String!) {
    datoCmsPlayer(slug: { eq: $slug }) {
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
      coverImage {
        url
        fluid(maxWidth: 600, imgixParams: { fm: "jpg", auto: "compress" }) {
          ...GatsbyDatoCmsSizes
        }
      }
    }
  }
`;
