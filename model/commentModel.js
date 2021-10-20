import userModel from "./userModel";

const uniqid = require('uniqid');
import {knex} from "../config/config";
import commentModel from './commentModel';
const _ = require('lodash');

exports.createComment = async (context,dataset) => {

  const trx =  await knex.transaction();
  try {
    let userId = context.mwValue.auth.ID;
    dataset.CREATED_BY = userId;
    dataset.CREATED_AT = new Date();
    let weight = await knex.from('c_blog_comments')
      .where({'BLOG_ID':dataset.BLOG_ID}).count('ID as COUNT');
    dataset.WEIGHT = weight[0].COUNT + 1;

    await trx('c_blog_comments').insert([dataset]);

    trx.commit();
    return dataset.ID;
  }
  catch (e) {
    trx.rollback();
    throw e;
  }


};

exports.updateComment = async (context,id,dataset) => {
  const trx =  await knex.transaction();
  try {
    let userId = context.mwValue.auth.ID;
    dataset.UPDATED_BY = userId;
    dataset.UPDATED_AT = new Date();

    await trx('c_blog_comments').where({
      ID: id
    }).update(dataset);

    trx.commit();
    return id;
  }
  catch (e) {
    trx.rollback();
    throw e;
  }

};

exports.changeStatus = async (context,id,dataset) => {
  const trx =  await knex.transaction();
  try {
    let userId = context.mwValue.auth.ID;
    dataset.UPDATED_BY = userId;
    dataset.UPDATED_AT = new Date();

    await trx('c_blog_comments').where({
      ID: id
    }).update(dataset);

    trx.commit();
    return id;
  }
  catch (e) {
    trx.rollback();
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
    let query = knex.from('c_blog_comments')
      .innerJoin('c_user', 'c_blog_comments.CREATED_BY', 'c_user.ID')
      .innerJoin('c_blog', 'c_blog_comments.BLOG_ID', 'c_blog.ID')
      .where({ });

    if (filters) {
      query = commentModel.generateFilters(query, filters);
    }
    data.DATA = await query.offset(skip).limit(take).distinct('c_blog_comments.*',
      'c_blog.TITLE as BLOG_TITLE', 'c_blog.ID as BLOG_ID','c_blog.ALIAS as BLOG_ALIAS',
      'c_user.NAME as AUTHOR_FIRST_NAME','c_user.LAST_NAME as AUTHOR_LAST_NAME',
      'c_user.EMAIL as AUTHOR_EMAIL', 'c_user.IMAGE as AUTHOR_IMAGE'
    );
    let totalCount = await commentModel.getCount(filters);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e.message;
  }

};

exports.getCount = async (filters) => {
  try {
    let query = knex.from('c_blog_comments')
      .innerJoin('c_user', 'c_blog_comments.CREATED_BY', 'c_user.ID')
      .innerJoin('c_blog', 'c_blog_comments.BLOG_ID', 'c_blog.ID')
      .where({ });

    if (filters) {
      query = commentModel.generateFilters(query, filters);
    }
    return await query.count({ 'COUNT': 'c_blog_comments.ID' });
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
