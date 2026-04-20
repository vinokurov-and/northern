import React from "react";
import Img from "next/image";
import Layout from "../components/layout";
import Link from "next/link";
import client from "../utils/datacms";
import { fetchData } from "../utils/fetchData";

const DEFAULT_IMAGE = '/img/default-news.jpg';

const NewsPage = (props) => {
  const { data, works } = props;
  // TODO(#27): разместить AdBlock ad-admitad-news-inline между карточками
  // (например, после первых 3 элементов works.map) после одобрения Admitad.
  // Пример: { works.slice(0, 3) } <AdBlock ctaId="ad-admitad-news-inline" .. /> { works.slice(3) }
  return (
    <Layout data={data}>
      <div className="showcase">
        {works.map((work) => {
          const imageSrc = work.coverImage?.url || work.image || DEFAULT_IMAGE;
          const href = work.slug ? `/works/${work.slug}` : '#';

          return (
            <div key={work.id} className="showcase__item">
              <figure className="card">
                {imageSrc && imageSrc !== DEFAULT_IMAGE ? (
                  <Link href={href} className="card__image">
                    <Img style={{ position: 'relative', width: '100%', height: 'auto' }} width={200} height={200} src={imageSrc} alt={work.title || ''} />
                  </Link>
                ) : null}
                <figcaption className="card__caption">
                  <h6 className="card__title">
                    {work.slug ? (
                      <Link href={href}>{work.title}</Link>
                    ) : (
                      work.title
                    )}
                  </h6>
                  <div className="card__description">
                    <p>{work.excerpt || (work.description || '').substring(0, 150)}</p>
                  </div>
                </figcaption>
              </figure>
            </div>
          )
        })}
      </div>
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
`;

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
`;

export const getStaticProps = async () => {
  const response = await client({ query: QUERY });
  const response2 = await client({ query: WORKS });

  let news = [];
  try {
    const r = await fetchData('https://fc-sever.ru/c/news');
    news = JSON.parse(r).result || [];
  } catch {}

  // VK новости импортированы через wall.get (новые → старые), insertion order
  // в SQLite соответствует id ASC, значит малый id = новый пост, большой id = старый.
  // Без сортировки SELECT * FROM news возвращает id ASC, что уже даёт "новые сверху".
  // (Раньше тут был .reverse() который выдавал старые первыми.)
  return {
    props: {
      data: response.data || {},
      works: [...news, ...(response2.data?.allWorks || [])],
    },
  };
};

export default NewsPage;
