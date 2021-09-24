const fs = require('fs');
const path = require('path');
const globArray = require("glob-array")
const sharp = require('sharp');

const output_path = path.join(`${__dirname}/files/resized`);

const patterns = ['./files/*jpeg', './files/*jpg', './files/*png'];

var files = globArray.sync(patterns);

fs.access(output_path, (error) => {
    if (error) {
      fs.mkdirSync(output_path);
    }
});

files.forEach(function(inputFile) {
    const image = sharp(inputFile);
    image
    .metadata()
    .then(function(metadata) {
        if (metadata.format === 'jpeg') {
            return image
            .jpeg({ mozjpeg: true })
            .toFile(path.join(output_path, path.basename(inputFile, path.extname(inputFile))+'.jpg'))
        }
        else if (metadata.format === 'png') {
            return image
            .png({ palette: true, quality: 80 })
            .toFile(path.join(output_path, path.basename(inputFile, path.extname(inputFile))+'.png'))
        }
    }).catch(err => {
        throw err;
    });

    console.log('done');
});


  

  