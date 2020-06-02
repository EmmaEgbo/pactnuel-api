import userModel from "./userModel";
const uniqid = require('uniqid');
import {knex} from "../config/config";
import categoryModel from "./categoryModel";
import publicationModel from "./publicationModel";

//get UserID wise data
exports.getDetail = async (email) => {
  const dbTransaction = await knex.transaction;
  try{
    let result = await knex.select('*')
      .from('c_user').where({ "EMAIL": email}).limit(1);
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

exports.getAll = async (req, skip, take, filters) => {
  try {
    let data = {};
    let query = knex.from('c_user')
      .where({ });

    if (filters) {
      query = userModel.generateFilters(query, filters);
    }
    data.DATA = await query.offset(skip).limit(take).distinct('c_user.*');
    let totalCount = await userModel.getCount(filters);
    data.TOTAL = totalCount[0].COUNT;
    return data;
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
  const dbTransaction = await knex.transaction;
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