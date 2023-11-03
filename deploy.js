const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

function uploadDirectory(conn, sftp, localDir, remoteDir) {
    fs.readdir(localDir, (err, items) => {
        if (err) throw err;

        items.forEach(item => {
            const localPath = path.join(localDir, item);
            const remotePath = path.join(remoteDir, item);

            fs.stat(localPath, (err, stats) => {
                if (err) throw err;

                if (stats.isFile()) {
                    sftp.fastPut(localPath, remotePath, {}, (uploadErr) => {
                        if (uploadErr) throw uploadErr;
                        console.log(`File ${localPath} uploaded successfully to ${remotePath}`);
                    });
                } else if (stats.isDirectory()) {
                    sftp.mkdir(remotePath, (mkdirErr) => {
                        if (mkdirErr && mkdirErr.code !== 4) { // Ignore "failure" error, which might mean directory already exists
                            throw mkdirErr;
                        }
                        uploadDirectory(conn, sftp, localPath, remotePath); // Recursively upload this directory
                    });
                }
            });
        });
    });
}

// ... (your connection code)



  const localDirectory = path.resolve(__dirname, 'public');
  const remoteDirectory = './fcsever/public';
  
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Client :: ready');
    uploadDirectory(conn, localDirectory, remoteDirectory);
  }).connect({
    host: '95.140.158.22',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync('/Users/avvinokurov/.ssh/id_rsa') // Если вы используете аутентификацию по ключу
    // password: 'your_password' // Если вы используете аутентификацию по паролю
  });

  conn.sftp((err, sftp) => {
    if (err) throw err;
    uploadDirectory(conn, sftp, localDirectory, remoteDirectory);
});