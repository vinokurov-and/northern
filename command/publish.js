const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

const home = require('os').homedir();

const p = path.resolve(home, '.ssh', 'id_rsa');
console.log("Path", p);

ssh.connect({
    host: '95.140.158.22',
    username: 'root',
    privateKeyPath: '/users/avvinokurov/.ssh/id_rsa',
}).then((ssh) => {
    console.log("Connect success");

    console.log("Remove files...")
    ssh.execCommand('rm -rf out', { cwd: '/fcsever' }).then((result) => {
        console.log('fcsever/public delete success: ' + JSON.stringify(result));
    }).then(() => {
        console.log('Copy files...')
        ssh.putDirectory(path.resolve(__dirname, '..', 'out'), '/fcsever/out', {
            concurrency: 10,
            recursive: true,
            tick: (localPath, _, error) => {
                if (error) {
                    console.error('Error: ', error);
                } else {
                    console.log('Log: ' + localPath + ' success')
                }
            }
        }).then((value) => {
            console.log('put directory out success' + String(value));

            ssh.putDirectory(path.resolve(__dirname, '..', 'express-server'), '/fcsever/server', {
                concurrency: 10,
                recursive: true,
                tick: (localPath, _, error) => {
                    if (error) {
                        console.error('Error: ', error);
                    } else {
                        console.log('Log: ' + localPath + ' success')
                    }
                }
            }).then((value) => {
                console.log('put directory server success' + String(value));

                console.log('library server install...');
                ssh.exec('npm i', ['--silent'], {
                    cwd: '/fcsever/server'
                }).then((value) => {
                    console.log('library server install ' + value);
                    ssh.dispose();
                })
            })
        })
    });
});

