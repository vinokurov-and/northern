require('dotenv').config()

module.exports = {
  siteMetadata: {
    title: `ФК Северный г. Калуга`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-datocms`,
      options: {
        apiToken: '2124294997ad966cac498651561bd0',
      },
    },
  ],
}
