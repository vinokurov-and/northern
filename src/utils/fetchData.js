export function fetchData(url) {

    const https = require('https');
  
    return new Promise((resolve, reject) => {
        https.get(url, { rejectUnauthorized: false }, (res) => {
            let data = '';
  
            res.on('data', (chunk) => {
                data += chunk;
            });
  
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
  }