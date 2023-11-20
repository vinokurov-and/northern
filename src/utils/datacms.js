// lib/datocms.js
export const client = async ({ query, variables = {}, includeDrafts = false }) => {
    const response = await fetch("https://graphql.datocms.com/", {
      headers: {
        Authorization: `Bearer 2124294997ad966cac498651561bd0`,
        ...(includeDrafts ? { "X-Include-Drafts": "true" } : {}),
      },
      method: "POST",
      body: JSON.stringify({ query, variables }),
    });
    
    const responseBody = await response.json();
    
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(responseBody)}`);
    }
    
    return responseBody;
  }

  export default client;