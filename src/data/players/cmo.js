export const QUERY_ALL_PLAYERS = `
{
    allPlayers {
      id
      createdAt
      title
      description
      slug
      slug
      excerpt
      coverImage {
        url
      }
    }
  }
`;