const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..', 'public', 'app');

fs.rm(dir, { recursive: true, force: true }, err => {
    if (err) {
      throw err
    }

    console.log(`${dir} is deleted!`);

    const dirSrc = path.resolve('../total/client/build');
    const dirOut = './public/app';

    fs.cp(path.resolve(dirSrc), dirOut, {recursive: true}, (err) => {
        if (err) {
            throw err;
        }

        console.error('moving client success');
    });
})




