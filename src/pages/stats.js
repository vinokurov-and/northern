import React, { useLayoutEffect } from 'react'
import Layout from "../components/layout"
import client from '../utils/datacms';

const Stats = ({data}) => {

    useLayoutEffect(() => {
        setTimeout(() => window.GS.Widgets.ChampStandings("gs_widget_d330", { mode: "0", width: 600, widthUnits: "px", height: "auto", title: "Чемпионат КФЛ", color1: "ffdef9", color2: "ffffff", color3: "000000", color4: "000000", textSize: 11, font: "Arial", clubLogos: 1, hideMatchCol: 0, additionally: "champ-goalscorers", watermark: 0 }, "gchampionship_season:1047890"), 100)
    }, []);

    return <Layout data={data}>
        <article className="sheet">
            <div className="sheet__inner">
                <h1 className="sheet__title">Статистика Чемпионата КФЛ 11x11 2021</h1>
                <div id="gs_widget_d330"></div>
            </div>
        </article>
    </Layout>
}

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

export async function getInitialProps() {
  const responseBase = await client({
    query: QUERY_BASE
  })

  
  // Обработка данных и передача их компоненту
  return { data: responseBase.data }
  
}



Stats.getInitialProps = getInitialProps;
export default Stats;
