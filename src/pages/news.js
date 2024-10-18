import React from "react";
import Masonry from "react-masonry-component";
import Img from "next/image";
import Layout from "../components/layout";
import Link from "next/link";
import client from "../utils/datacms";
import { fetchData } from "../utils/fetchData";

const NewsPage = (props) => {
  const { data, works } = props;
  return (
    <Layout data={data}>
      <Masonry className="showcase">
        {works.map((work) => {
          return (
            <div key={work.id} className="showcase__item">
              <figure className="card">
                <Link href={`/works/${work.slug || work.id}`} className="card__image">
                  <Img style={{ position: 'relative', width: '100%', height: 'auto' }} width={200} height={200} src={work.coverImage?.url || work.image} />
                </Link>
                <figcaption className="card__caption">
                  <h6 className="card__title">
                    <Link href={`/works/${work.slug || work.id}`}>{work.title}</Link>
                  </h6>
                  <div className="card__description">
                    <p>{work.excerpt || work.description}</p>
                  </div>
                </figcaption>
              </figure>
            </div>
          )
        })}
      </Masonry>
    </Layout>
  )
};

const WORKS = `
{
  allWorks{
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

const QUERY = `
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

export const getStaticProps = async (data) => {
  const response = await client({
    query: QUERY
  });

  const response2 = await client({
    query: WORKS
  });

  let r;
  try {
    r = await fetchData('https://fc-sever.ru/c/news');
  } catch {
    r = '{ "result": []  }'
  }
  
  const news = JSON.parse(r).result;

  // Обработка данных и передача их компоненту
  return { props: { data: response.data, works: [...news.reverse(), ...response2.data.allWorks] } }

}



export default NewsPage;
