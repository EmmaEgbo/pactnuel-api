//Dependencies
import cors from "cors";

import express from "express";

import routes from "../routes";

import {config} from "dotenv";

import http from "http";

import path from "path";

config();
const app = express();
//Creating Server instance
let server = {};
global.dbInstance = require('knex')({
  client: process.env.DB_CONNECTION,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  pool: {
    min: 0,
    max: 30
  },
  log: {
    warn(message) {
      logger.warn('KNEX: ', message);
    },
    error(message) {
      logger.error('KNEX: ', message);
    },
    deprecate(message) {},
    debug(message) {
      logger.info('KNEX: ', message);
    },
  },
  acquireConnectionTimeout: 10000000
});


//Routes
app.use(cors());

app.use(express.json());

let staticPath = path.join(__dirname, "../files");
console.log(staticPath);
app.use(express.static(staticPath));

app.use("/api/v1", routes);

app.use(function (req, res) {
  res.status(404).send("Sorry can not find that!");
});


//Initializing HTTP & HTTPS Server.
let httpServer = http.createServer(app);

server.init = function(){
  //Starting HTTP Server
  if(process.env.HTTP_APP_PORT == "PRODUCTION"){
    try{
      httpServer.listen(process.env.PORT, '127.0.0.1', function () {
        console.log(`Http Server Listening On Port : ${process.env.PORT}!`);
      });
    }
    catch (e) {
      //Do something for production
    }
  }
  else{
    httpServer.listen(process.env.PORT, '127.0.0.1', function () {
      console.log(`Http Server Listening On Port : ${process.env.PORT}!`);
    });
  }

};

server.init();
//Exporting server module
export default server;