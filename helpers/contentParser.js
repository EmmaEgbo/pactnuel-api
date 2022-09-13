import edjsHTML from "editorjs-html";

function imageUploadParser(block){
    let caption = block.data.caption ? block.data.caption : "Image";
    return `<img src="${
      block.data.file && block.data.file.url ? block.data.file.url : block.data.url
    }" alt="${caption}" />`;
}

function simpleImageParser(block){
    let caption = block.data.caption ? block.data.caption : "Image";
    return `<img src="${
      block.data && block.data.url ? block.data.url : block.data.url
    }" alt="${caption}" />`;
}
    
const edjsParser =  edjsHTML({ imageUpload: imageUploadParser, simpleImage: simpleImageParser });
const contentParser = (content) => {
        const html = edjsParser.parse(content);
        let cleanData = "";
        html.forEach((blog, i) => {
          cleanData+=blog;
        })
        return JSON.stringify(cleanData);
  };

  module.exports = contentParser;