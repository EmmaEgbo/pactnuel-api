import userModel from "./userModel";
const uniqid = require('uniqid');
import jwt from "jsonwebtoken";
import {knex} from "../config/config";
const md5 = require('md5');
const moment = require('moment');
import helpers from "../helpers";
import {config} from "dotenv";

config();

//get UserID wise data
exports.getDetail = async (req, email) => {
  let userId = 0;
  if(req.hasOwnProperty('mwValue')){
    userId = req.mwValue.auth.ID;
  }
  try{
    let result = await knex.select('c_user.*','c_user_followed_authors.ID as FOLLOWEDSTATUS')
      .leftJoin('c_user_followed_authors', function () {
        this
          .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
          .onIn('c_user_followed_authors.USER_ID',[userId])
      })
      .from('c_user').where({ "c_user.EMAIL": email}).limit(1);
    if (result.length == 0) {
      return null;
    }
    return result[0];
  }catch (e) {
    throw e
  }
};

exports.getUserDetails = async (req) => {
  let userId = 0;
  if(req.hasOwnProperty('mwValue')){
    userId = req.mwValue.auth.ID;
  }
  try{
    let result = await knex.select('*')
      .from('c_user').where({ "ID": userId }).limit(1);
    if (result.length == 0) {
      return null;
    }
    return result[0];
  }catch (e) {
    throw e
  }
};

exports.getDetailFromMobile = async (mobile) => {
  const dbTransaction = await knex.transaction;
  try{
    let result = await knex.select('*')
      .from('c_user').where({ "MOBILE": mobile}).limit(1);
    if (result.length == 0) {
      return null;
    }
    return result[0];
  }catch (e) {
    throw e
  }
};

exports.createUser = async (context,dataset) => {
  // Save User
  const trx =  await knex.transaction();
  try {
    dataset.ALIAS = await userModel.generateAlias(dataset.EMAIL);
    await trx('c_user').insert([{
      ID: dataset.ID,
      EMAIL:dataset.EMAIL,
      ROLE:dataset.ROLE,
      PASSWORD:dataset.PASSWORD,
      NAME:dataset.NAME,
      LAST_NAME:dataset.LAST_NAME,
      SOURCE:dataset.SOURCE,
      MOBILE:dataset.MOBILE,
      REGISTRATION_TYPE:dataset.REGISTRATION_TYPE,
      GOOGLE_ID:dataset.GOOGLE_ID,
      FACEBOOK_ID:dataset.FACEBOOK_ID,
      ALIAS:dataset.ALIAS,
      REMEMBER_TOKEN:dataset.REMEMBER_TOKEN
    }]);
    trx.commit();
    return dataset.ID;
  }
  catch (e) {
    trx.rollback();
    throw e;
  }


};

exports.generateAlias = async (email,id=0) => {
  try{
    let aliasArray = email.split('@');
    let alias = aliasArray[0];
    let result = await knex.select('c_user.ALIAS')
      .from('c_user')
      .whereNot('ID',id)
      .where('ALIAS','LIKE','%'+alias+'%');
    if (result.length != 0) {
      alias = alias + '-'+(result.length)
    }

    return alias;
  }catch (e) {
    return e;
  }


};

exports.accountActivation = async (email) => {
  try {
    let dataset = {};
    dataset.EMAIL_VERIFY = 1;
    dataset.UPDATED_AT = new Date();
    await knex('c_user').where({
      EMAIL: email
    }).update(dataset);

    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.updateToken = async (email,token) => {
  try {
    let dataset = {};
    dataset.REMEMBER_TOKEN = token;
    dataset.UPDATED_AT = new Date();
    await knex('c_user').where({
      EMAIL: email
    }).update(dataset);

    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.updatePushToken = async (userID, push_token) => {
  try {
    await knex('c_user').where({
      ID: userID
    }).update({ PUSHTOKEN: push_token});
    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};


const generateToken = async (data, expires, refresh = false) => {
  const payload = {
    sub: refresh ? data.ID : data,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, helpers.hash(process.env.APP_SUPER_SECRET_KEY));
};

const saveToken = async (token, userId, expires, blacklisted = false) => {
  await knex('c_user_tokens').insert({
    ID: uniqid(),
    TOKEN: token,
    USER_ID: userId,
    EXPIRES: expires.toDate(),
    BLACKLISTED: blacklisted
  });
};

exports.generateAuthTokens = async (userData) => {
  const accessTokenExpires = moment().add(1440, 'minutes');
  const accessToken = await generateToken(userData, accessTokenExpires);

  const refreshTokenExpires = moment().add(182.5, 'days');
  const refreshToken = await generateToken(userData, refreshTokenExpires, true);
  await saveToken(refreshToken, userData.ID, refreshTokenExpires);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

exports.verifyToken = async (token) => {
  const payload = jwt.verify(token, helpers.hash(process.env.APP_SUPER_SECRET_KEY));
  const tokenDoc = await knex.from('c_user_tokens').where({ TOKEN:token, USER_ID: payload.sub });
  if (!tokenDoc[0]) {
    return false;
  }
  const user = await knex.from('c_user').where({ ID: tokenDoc[0].USER_ID});
  if (!user) {
    throw new Error();
  }
  await knex('c_user_tokens').where('USER_ID', user[0].ID).del();
  return user[0];
};

exports.logout = async (token) => {
  await knex('c_user_tokens').where('TOKEN', token).del();
};

exports.updatePassword = async (email,password) => {
  try {
    let dataset = {};
    dataset.PASSWORD = password;
    dataset.UPDATED_AT = new Date();
    await knex('c_user').where({
      EMAIL: email
    }).update(dataset);

    return 'success'
  }
  catch (e) {
    console.log(e.message);
    throw e;
  }
};

exports.updateUserData = async (context,dataset) => {
  try {
    if(dataset.hasOwnProperty('PASSWORD')){
      dataset.PASSWORD = md5(dataset.PASSWORD);
    }
    dataset.UPDATED_AT = new Date();
    await knex('c_user').where({
      ID: dataset.ID
    }).update(dataset);

    return 'success'
  }
  catch (e) {
    console.log(e.message);
    throw e;
  }
};


exports.getAll = async (req, skip, take, filters) => {
  try {
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }
    let data = {};
    let query = knex.from('c_user')
      .leftJoin('c_user_followed_authors', function () {
        this
          .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
          .onIn('c_user_followed_authors.AUTHOR_ID',[userId])
      })
      .where({ });

    if (filters) {
      query = userModel.generateFilters(query, filters);
    }
    data.DATA = await query.offset(skip).limit(take).distinct('c_user.*','c_user_followed_authors.ID as FOLLOWEDSTATUS');
    let totalCount = await userModel.getCount(filters);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e;
  }

};

exports.getAllUsers = async () => {
  try {
    const users = knex.select('*').from('c_user');
    return users;
  }
  catch (e) {
    return e;
  }

};

exports.getCount = async (filters) => {
  try {
    let query = knex.from('c_user')
      .where({ });
    if (filters) {
      query = userModel.generateFilters(query, filters);
    }
    return await query.count({ 'COUNT': 'c_user.ID' });
  }
  catch (e) {
    return e;
  }

};

exports.generateFilters = function (query, filters) {
  let dateFields = ['CREATED_AT', 'UPDATED_AT'];
  let sort = filters.sortFilter;
  let tableName = query._single.table;
  if(sort != undefined || sort != null){
    query.orderBy(sort.FIELD_NAME,sort.SORT_ORDER).orderBy(tableName+'.ID','DESC');
  }
  else{
    query.orderBy(tableName+'.CREATED_AT','DESC').orderBy(tableName+'.ID','DESC');
  }
  if(filters.search != undefined){
    for (let i = 0; i < filters.search.length; i++) {
      //check the fieldname with table name or not
      let fieldwithTableName = filters.search[i].FIELD_NAME.split('.');
      if (filters.search[i].FIELD_VALUE != null && filters.search[i].FIELD_VALUE != '') {
        if (filters.search[i].OPT == 'LIKE') {
          query = query.where(filters.search[i].FIELD_NAME, filters.search[i].OPT, '%' + filters.search[i].FIELD_VALUE + '%');
        } else if (dateFields.indexOf(filters.search[i].FIELD_NAME) != -1 || dateFields.indexOf(fieldwithTableName[1]) != -1) {
          let startDate = filters.search[i].FIELD_VALUE + ' 00:00:00';
          let endDate = filters.search[i].FIELD_VALUE + ' 23:59:59';
          query = query.whereBetween(filters.search[i].FIELD_NAME, [new Date(startDate), new Date(endDate)]);
        } else {
          query = query.where(filters.search[i].FIELD_NAME, filters.search[i].OPT, filters.search[i].FIELD_VALUE);
        }
      }
    }
  }

  return query;
};

//get UserID wise data
exports.getDetailById = async (id) => {
  try{
    let result = await knex.select('*')
      .from('c_user').where({ "ID": id}).limit(1);
    if (result.length == 0) {
      return null;
    }
    return result[0];
  }catch (e) {
    throw e.message;
  }
};