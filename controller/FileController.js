//Dependencies
import {config} from "dotenv";

import helpers from "./../helpers";

import fs from "fs";

import uniqid from 'uniqid';

import fileModel from '../model/fileModel';

import sharp from 'sharp';

config();

let file = {};

file.uploadFile = async (req, res) => {
  const { buffer, mimetype } = req.file;

  fs.access("./files/new", (error) => {
    if (error) {
      fs.mkdirSync("./files/new");
    }
  });

  try{
    const filename = uniqid() + '.jpg';

    await sharp(buffer)
    .jpeg({ mozjpeg: true, quality: 50 })
    .toFile("./files/" + filename);

      let dataset = {
        ID: uniqid(),
        PATH:filename,
        MIME_TYPE:mimetype
      };

      let fileId = await fileModel.createFile(req,dataset);

      if(fileId != null){
        res.status(201).json(helpers.response("201", "success", "Successfully file added",dataset));
      }
      else{
        res.status(400).json(helpers.response("400", "error", "Database error!"));
      }
  }catch (e) {
    res.status(500).json(helpers.response("500", "error", "Something went wrong", e));
  }
};



export default file;