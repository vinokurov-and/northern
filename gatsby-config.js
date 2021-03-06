require("dotenv").config();

module.exports = {
  siteMetadata: {
    title: `ФК Северный г. Калуга`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-yandex-metrica`,
      options: {
        trackingId: "79204078",
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        trackHash: true,

        // Detailed recordings of user activity on the site: mouse movement, scrolling, and clicks.
        webvisor: true,
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    `gatsby-transformer-remark`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-datocms`,
      options: {
        apiToken: "2124294997ad966cac498651561bd0",
      },
    },
  ],
};
