const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const filename = path.join(process.cwd(), 'express-server', 'db-northen.sqlite').replace('express-server/express-server/', 'express-server/')

// you would have to import / invoke this in another file
async function openDb() {

  return open({
    filename: filename,
    driver: sqlite3.Database
  })
}
module.exports = {
    openDb
}