import React, { useEffect, useState } from "react";
import Layout from "../components/layout";
import client from "../utils/datacms";

const AnalyticsPage = ({ data }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fc-sever.ru/c/analytics')
      .then(res => res.json())
      .then(json => {
        if (json.ok) setAnalytics(json.result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout data={data}>
      <div className="sheet">
        <div className="sheet__inner">
          <h1 className="sheet__title">Аналитика</h1>

          {loading && <p>Загрузка...</p>}

          {analytics && (
            <>
              <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
                <div>
                  <h3>{analytics.total}</h3>
                  <p>Всего просмотров</p>
                </div>
                <div>
                  <h3>{analytics.today}</h3>
                  <p>Сегодня</p>
                </div>
              </div>

              <h2>Топ страницы</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>URL</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Просмотры</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPages.map((p, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{p.url}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'right' }}>{p.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2>Последние визиты</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>URL</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Источник</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recent.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{r.url}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{r.referer || '—'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{r.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

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
  const responseBase = await client({ query: QUERY_BASE });
  return {
    props: { data: responseBase.data || {} },
  };
}

export default AnalyticsPage;
