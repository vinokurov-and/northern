import React from "react";
import { Link, graphql } from "gatsby";
import Masonry from "react-masonry-component";
import Img from "gatsby-image";
import Layout from "../components/layout";

const GamePage = ({ data }) => (
  <Layout>
    <Masonry className="showcase">
      {data.allDatoCmsGame.edges.map(({ node: game }) => (
        <div key={game.id} className="showcase__item">
          <figure className="card">
            {game.image && (
              <Link to={`/games/${game.slug}`} className="card__image">
                <Img fluid={game.image.fluid} />
              </Link>
            )}
            <figcaption className="card__caption">
              <h6 className="card__title">
                {new Date(game.date).toLocaleString()} <br />
                <Link to={`/games/${game.slug}`}>
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
);

export default GamePage;

export const query = graphql`
  query GameQuery {
    allDatoCmsGame(sort: { fields: [date], order: DESC }) {
      edges {
        node {
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
            fluid(maxWidth: 600, imgixParams: { fm: "jpg", auto: "compress" }) {
              ...GatsbyDatoCmsSizes
            }
          }
        }
      }
    }
  }
`;
