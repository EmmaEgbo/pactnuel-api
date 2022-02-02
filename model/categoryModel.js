const uniqid = require('uniqid');
import {knex} from "../config/config";
import categoryModel from './categoryModel';

//get UserID wise data
exports.getDetail = async (req, id) => {
  try{
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }
    let result = await knex.select('c_category.*','i1.PATH as IMAGE_PATH','c_user_followed_categories.ID as FOLLOWEDSTATUS')
      .from('c_category')
      .innerJoin('c_file as i1','i1.ID','c_category.IMAGE_ID')
      .leftJoin('c_user_followed_categories', function () {
        this
          .on('c_category.ID', 'c_user_followed_categories.CATEGORY_ID')
          .onIn('c_user_followed_categories.USER_ID',[userId])
      })
      .where({ "c_category.ID": id}).limit(1);
    if (result.length == 0) {
      return null;
    }

    return result[0];
  }catch (e) {
    return e.message;
  }

};

exports.createCategory = async (context,dataset) => {

  // Save Category
  try {
    dataset.ALIAS = await categoryModel.generateAlias(dataset.NAME);
    await knex('c_category').insert([dataset]);
    return dataset.ID;
  }
  catch (e) {
    console.log(e.message)
    return null;
  }


};

exports.updateCategory = async (context,id,dataset) => {
  try {
    dataset.USED_IN = JSON.stringify(dataset.USED_IN );
    dataset.ALIAS = await categoryModel.generateAlias(dataset.NAME,id);
    dataset.UPDATED_AT = new Date();
    await knex('c_category').where({
      ID: id
    }).update(dataset);
    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.deleteCategory = async (id) => {
  try {
    await knex('c_category').where({
      ID: id
    }).del();
    return 'success'
  }
  catch (e) {
    console.log(e.message)
    throw e;
  }
};

exports.getAll = async (req) => {
  try{
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }

    let result = await knex.select('c_category.*','i1.PATH as IMAGE_PATH','c_user_followed_categories.ID as FOLLOWEDSTATUS')
      .from('c_category')
      .innerJoin('c_file as i1','i1.ID','c_category.IMAGE_ID')
      .leftJoin('c_user_followed_categories', function () {
        this
          .on('c_category.ID', 'c_user_followed_categories.CATEGORY_ID')
          .onIn('c_user_followed_categories.USER_ID',[userId])
      })
      .where({});

    return result;
  }catch (e) {
    return e.message;
  }


};

exports.generateAlias = async (name,id=0) => {
  try{
    let alias = name.replace(/[^A-Z0-9]+/ig, '-');
    let result = await knex.select('c_category.ALIAS')
      .from('c_category')
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



