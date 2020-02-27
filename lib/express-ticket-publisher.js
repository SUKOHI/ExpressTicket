const fs = require('fs');
const pathPairs = require('../storage/data/path-pairs');

class Publisher {

  constructor(force = false) {

    this.pathPairs = pathPairs;
    this.force = force;

  }

  publish(publishingKey) {

    const keys = Object.keys(this.pathPairs);

    keys.forEach(key => {

      if(publishingKey === 'all' || key === publishingKey) {

        const pathPair = this.pathPairs[key];
        const srcPath = pathPair.src;
        const destPath = pathPair.dest;

        if(!fs.existsSync(destPath)) {

          fs.mkdirSync(destPath);

        }

        fs.readdirSync(srcPath).forEach(fileName => {

          const srcFilePath = srcPath +'/'+ fileName;
          const destFilePath = destPath +'/'+ fileName;

          if(this.force === true && fs.existsSync(destFilePath)) {

            fs.unlinkSync(destFilePath);

          }

          if(!fs.existsSync(destFilePath)) {

            fs.copyFileSync(srcFilePath, destFilePath);
            console.log('*** Copied ***');
            console.log('From: `'+ srcFilePath +'`');
            console.log('To: `'+ destFilePath +'`');

          } else {

            console.log('*** Warning *** `'+ destFilePath +'` already exists. Use `--force.`');

          }

        });

      }

    });

  }

}

module.exports = Publisher;
