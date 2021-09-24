const fs = require('fs');
const path = require('path');
const globArray = require("glob-array")
const sharp = require('sharp');

const output_path = path.join(`${__dirname}/files/resizedJpg`);

const patterns = ['./files/*jpg'];

var files = globArray.sync(patterns);

console.log(files);

fs.access(output_path, (error) => {
    if (error) {
      fs.mkdirSync(output_path);
    }
});

console.log(files.length);

files.forEach(function(inputFile) {
    if (fs.existsSync(inputFile)) {
        // path exists
        console.log("exists:", inputFile);
    } else {
        const image = sharp(inputFile);
    image
    .metadata()
    .then(function(metadata) {
            return image
            .png({ palette: true, quality: 80 })
            .toFile(path.join(output_path, path.basename(inputFile, path.extname(inputFile))+'.jpg'))
    }).catch(err => {
        console.log(inputFile)
        throw err;
    });
    console.log('done');
    }
});

console.log('All images Resized')


  

  