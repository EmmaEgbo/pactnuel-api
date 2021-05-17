// Update with your config settings.
require('dotenv').config()
// import {config} from "dotenv";
// config();
module.exports = {

  development: {
    client: process.env.DB_CONNECTION,
    connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USERNAME,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_DATABASE
    },
    debug:process.env.DEBUG,
    log: {
      warn(message) {
        console.log(message);
      },
      error(message) {
        console.log(message)
      },
      deprecate(message) {
        console.log(message)
      },
      debug(message) {
        console.log(message)
      },
    }},

  staging: {
    client: process.env.DEV_DB_CONNECTION,
    connection: {
      host : process.env.DEV_DB_HOST,
      user : process.env.DEV_DB_USERNAME,
      password : process.env.DEV_DB_PASSWORD,
      database : process.env.DEV_DB_DATABASE
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: process.env.DB_CONNECTION,
    connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USERNAME,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_DATABASE
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};
