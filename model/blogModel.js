const uniqid = require('uniqid');
import {knex} from "../config/config";
import blogModel from './blogModel';
const _ = require('lodash');


//get BLOG wise data
exports.getDetail = async (req,alias) => {
    try {
      let userId = 0;
      if(req.hasOwnProperty('mwValue')){
        userId = req.mwValue.auth.ID;
      }
      let query = knex.from('c_blog')
        .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
        .leftJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
        .leftJoin('c_publication', 'c_publication.ID', 'c_blog.PUBLICATION')
        .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
        .leftJoin('c_user_followed_blog', function () {
          this
            .on('c_blog.ID', 'c_user_followed_blog.BLOG_ID')
            .onIn('c_user_followed_blog.USER_ID',[userId])
        })
        .leftJoin('c_user_followed_categories', function () {
          this
            .on('c_blog_category.CATEGORY_ID', 'c_user_followed_categories.CATEGORY_ID')
            .onIn('c_user_followed_categories.USER_ID',[userId])
        })
        .leftJoin('c_user_followed_publication', function () {
          this
            .on('c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
            .onIn('c_user_followed_publication.USER_ID',[userId])
        })
        .leftJoin('c_blog_likes', function () {
          this
            .on('c_blog.ID', 'c_blog_likes.BLOG_ID')
            .onIn('c_blog_likes.USER_ID',[userId])
        })
        .leftJoin('c_user_followed_authors', function () {
          this
            .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
            .onIn('c_user_followed_authors.USER_ID',[userId])
        })
        .where({'c_blog.ALIAS':alias});

      let data = await query.select( 'c_blog.*','c_user.EMAIL','c_user.NAME','c_user.LAST_NAME',
        'c_user_followed_blog.ID as BLOGFOLLOWEDSTATUS',
        'c_user_followed_categories.ID as CATEGORYFOLLOWEDSTATUS',
        'c_user_followed_publication.ID as PUBLICATIONFOLLOWEDSTATUS',
        'c_user_followed_authors.ID as AUTHORFOLLOWEDSTATUS',
        'c_blog_likes.ID as LIKEDSTATUS',
        'c_publication.TITLE as PUBLICATION_TITLE',
        knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAGS"),
        knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORIES"))

      return data[0];
    }
    catch (e) {
      return e;
    }



};

exports.createBlog = async (context,dataset) => {

  const trx =  await knex.transaction();
  try {
    dataset.ALIAS = await blogModel.generateAlias(dataset.TITLE);
    await trx('c_blog').insert([{
      ID: dataset.ID,
      TITLE:dataset.TITLE,
      DESCRIPTION:dataset.DESCRIPTION,
      FEATURE_MEDIA:dataset.FEATURE_MEDIA,
      PUBLICATION:dataset.PUBLICATION,
      AUTHOR_BY:dataset.AUTHOR_BY,
      CONTENT: {},
      HTML:dataset.HTML,
      STATUS:dataset.STATUS,
      ALIAS:dataset.ALIAS,
      UPDATED_AT:new Date()
    }]);

    for(let i=0; i< dataset.CATEGORIES.length; i++){
      await trx('c_blog_category').insert([{
        ID: uniqid(),
        BLOG_ID:dataset.ID,
        CATEGORY_ID:dataset.CATEGORIES[i],
      }]);
    }
    for(let j=0; j< dataset.TAGS.length; j++){
      await trx('c_blog_tag').insert([{
        ID: uniqid(),
        BLOG_ID:dataset.ID,
        TAG_ID:dataset.TAGS[j].id,
      }]);
    }
    trx.commit();
    return {"ID":dataset.ID,"ALIAS":dataset.ALIAS};
  }
  catch (e) {
    trx.rollback();
    throw e;
  }


};

exports.updateBlog = async (context,id,dataset) => {
  if (dataset.STATUS === 'DELETED') {
    await knex('c_blog').where({
      ID: id
    }).delete();
    return {"ID":id,"ALIAS":dataset.ALIAS};
  }
  const trx =  await knex.transaction();
  try {
    dataset.ALIAS = await blogModel.generateAlias(dataset.TITLE,id);
    await knex('c_blog').where({
      ID: id
    }).update({
      HTML:  dataset.HTML,
    });
    await knex('c_blog').where({
      ID: id
    }).update({
      TITLE:dataset.TITLE,
      DESCRIPTION:dataset.DESCRIPTION,
      FEATURE_MEDIA:dataset.FEATURE_MEDIA,
      PUBLICATION:dataset.PUBLICATION,
      AUTHOR_BY:dataset.AUTHOR_BY,
      HTML:  dataset.HTML,
      STATUS:dataset.STATUS,
      ALIAS:dataset.ALIAS,
      UPDATED_AT: new Date()
    });
    //get previous blog categories
    let currentCategories = dataset.CATEGORIES;
    if(typeof (dataset.CATEGORIES) === "string"){
      currentCategories = JSON.parse(currentCategories);
    }
    //category update
    let previousCategories = await knex.select('c_blog_category.*').from('c_blog_category')
      .where({ "c_blog_category.BLOG_ID": id});
    for(let i=0; i< previousCategories.length; i++){
      let checkExists = currentCategories.indexOf(previousCategories[i].CATEGORY_ID);
      if(checkExists == -1){
        await trx('c_blog_category').where({
          ID: previousCategories[i].ID
        }).delete();
      }
      else{
        currentCategories.splice(checkExists,1)
      }
    }
    for(let p = 0; p < currentCategories.length; p++){
      await trx('c_blog_category').insert([{
        ID: uniqid(),
        BLOG_ID:id,
        CATEGORY_ID:currentCategories[p].id,
      }]);
    }

    //tags update
    let currentTags = dataset.TAGS;
    if(typeof (dataset.TAGS) === "string"){
      currentTags = JSON.parse(dataset.TAGS);
    }


    let previousTags = await knex.select('c_blog_tag.*').from('c_blog_tag')
      .where({ "c_blog_tag.BLOG_ID": id});
    for(let i=0; i< previousTags.length; i++){
      let checkExists = currentTags.indexOf(previousTags[i].TAG_ID);
      if(checkExists == -1){
        await trx('c_blog_tag').where({
          ID: previousTags[i].ID
        }).delete();
      }
      else{
        currentTags.splice(checkExists,1)
      }
    }
    for(let p = 0; p < currentTags.length; p++){
      await trx('c_blog_tag').insert([{
        ID: uniqid(),
        BLOG_ID:id,
        TAG_ID:currentTags[p].id,
      }]);
    }

    trx.commit();
    return {"ID":id,"ALIAS":dataset.ALIAS};
  }
  catch (e) {
    trx.rollback();
    throw e;
  }

};

exports.updateStoryStatus = async (context,id,dataset) => {
  if (dataset.STATUS === 'DELETED') {
    await knex('c_blog').where({
      ID: id
    }).delete();
    return { "ID": id, "ALIAS": dataset.ALIAS };
  }

  try {
    dataset.ALIAS = await blogModel.generateAlias(dataset.TITLE,id);
    await knex('c_blog').where({
      ID: id
    }).update({
      STATUS:dataset.STATUS
    });
    return { "ID":id };
  }
  catch (e) {
    throw e;
  }
};

exports.updateBlogCategory = async (context,id,dataset) => {
  const trx =  await knex.transaction();
  try {
     //get previous blog categories
     let currentCategories = dataset.CATEGORIES;
     if(typeof (dataset.CATEGORIES) === "string"){
       currentCategories = JSON.parse(currentCategories);
     }
     //category update
     let previousCategories = await knex.select('c_blog_category.*').from('c_blog_category')
       .where({ "c_blog_category.BLOG_ID": id});
     for(let i=0; i< previousCategories.length; i++){
       let checkExists = currentCategories.indexOf(previousCategories[i].CATEGORY_ID);
       if(checkExists == -1){
         await trx('c_blog_category').where({
           ID: previousCategories[i].ID
         }).delete();
       }
       else{
         currentCategories.splice(checkExists,1)
       }
     }
     for(let p = 0; p < currentCategories.length; p++){
       await trx('c_blog_category').insert([{
         ID: uniqid(),
         BLOG_ID:id,
         CATEGORY_ID: currentCategories[p].id,
       }]);
     }
 
     trx.commit();
     return { "ID":id };
  }
  catch (e) {
    trx.rollback();
    throw e;
  }
};

exports.getAll = async (req, skip, take, filters) => {
  try {
    let data = {};
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_publication', 'c_publication.ID', 'c_blog.PUBLICATION')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_user_followed_blog', function () {
        this
          .on('c_blog.ID', 'c_user_followed_blog.BLOG_ID')
          .onIn('c_user_followed_blog.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_categories', function () {
        this
          .on('c_blog_category.CATEGORY_ID', 'c_user_followed_categories.CATEGORY_ID')
          .onIn('c_user_followed_categories.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_publication', function () {
        this
          .on('c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
          .onIn('c_user_followed_publication.USER_ID',[userId])
      })
      .leftJoin('c_blog_likes', function () {
        this
          .on('c_blog.ID', 'c_blog_likes.BLOG_ID')
          .onIn('c_blog_likes.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_authors', function () {
        this
          .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
          .onIn('c_user_followed_authors.USER_ID',[userId])
      })
      .whereNot('c_blog.STATUS','DELETED')
      .orderBy('c_blog.CREATED_AT', 'desc');
    query.whereNotNull('c_blog_category.CATEGORY_ID');

    if (filters) {
      query = blogModel.generateFilters(query, filters);
    }
    data.DATA = await query.offset(skip).limit(take).distinct(
      'c_blog.ID',
      'c_blog.TITLE',
      'c_blog.DESCRIPTION',
      'c_blog.FEATURE_MEDIA',
      'c_blog.PUBLICATION',
      'c_blog.AUTHOR_BY',
      'c_blog.VIEWS',
      'c_blog.STATUS',
      'c_blog.CREATED_AT',
      'c_blog.UPDATED_AT',
      'c_blog.ALIAS',
      'c_blog.FEATURED',
      'c_blog.CONTENT',
      'c_blog.HTML',
      'c_blog.TOP'
      ,'c_user.EMAIL','c_user.NAME','c_user.LAST_NAME', 'c_user.IMAGE',
      'c_user_followed_blog.ID as BLOGFOLLOWEDSTATUS',
      'c_user_followed_categories.ID as CATEGORYFOLLOWEDSTATUS',
      'c_user_followed_publication.ID as PUBLICATIONFOLLOWEDSTATUS',
      'c_user_followed_authors.ID as AUTHORFOLLOWEDSTATUS',
      'c_blog_likes.ID as LIKEDSTATUS',
      'c_publication.TITLE as PUBLICATION_TITLE',
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAGS"),
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORIES"))

    let totalCount = await blogModel.getCount(req, filters);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e;
  }

};

exports.getCount = async (req, filters) => {
  try {
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .leftJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_publication', 'c_publication.ID', 'c_blog.PUBLICATION')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_user_followed_blog', function () {
        this
          .on('c_blog.ID', 'c_user_followed_blog.BLOG_ID')
          .onIn('c_user_followed_blog.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_categories', function () {
        this
          .on('c_blog_category.CATEGORY_ID', 'c_user_followed_categories.CATEGORY_ID')
          .onIn('c_user_followed_categories.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_publication', function () {
        this
          .on('c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
          .onIn('c_user_followed_publication.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_authors', function () {
        this
          .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
          .onIn('c_user_followed_authors.USER_ID',[userId])
      })
      .where({ });

    if (filters) {

      query = blogModel.generateFilters(query, filters);
    }
    return await query.countDistinct({ 'COUNT': 'c_blog.ID' });
  }
  catch (e) {
    return e;
  }

};

exports.generateAlias = async (name,id=0) => {
  try{
    let alias = name.replace(/[^A-Z0-9]+/ig, '-');
    let result = await knex.select('c_blog.ALIAS')
      .from('c_blog')
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

exports.markTop = async (id,status) => {
  try{

    await knex('c_blog').where({
      ID: id
    }).update({
      TOP:status
    });

    return 'success';

  }catch (e) {
    return e;
  }
};

exports.markFeatured = async (id,status) => {
  try{

    await knex('c_blog').where({
      ID: id
    }).update({
      FEATURED:status
    });

    return 'success';

  }catch (e) {
    return e;
  }


};

exports.updateViewsCount = async (alias,views) => {
  try{

    await knex('c_blog').where({
      ALIAS: alias
    }).update({
      VIEWS:views+1
    });

    return 'success';

  }catch (e) {
    return e;
  }


};

exports.getDetailById = async (id) => {
  try {
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .leftJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .where({'c_blog.ID':id});

    let data = await query.select( 'c_blog.*','c_user.EMAIL','c_user.NAME','c_user.LAST_NAME',
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAGS"),
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORIES"))

    return data[0];
  }
  catch (e) {
    return e;
  }



};

exports.relatedBlogs = async (req,alias) => {
  try {
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }
    //get Author Id
    let blogDetails = await blogModel.getDetail(req,alias);
    //get category Id
    let categories = JSON.parse(blogDetails.CATEGORIES);
    if(categories) {
      categories = categories.map(a => a.id);
    }
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .leftJoin('c_publication', 'c_publication.ID', 'c_blog.PUBLICATION')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_category', function () {
        this
          .on('c_blog_category.BLOG_ID', 'c_blog.ID')
          .onIn('c_blog_category.CATEGORY_ID',categories)
      })
      .leftJoin('c_user_followed_blog', function () {
        this
          .on('c_blog.ID', 'c_user_followed_blog.BLOG_ID')
          .onIn('c_user_followed_blog.USER_ID',[userId])
      })

      .leftJoin('c_user_followed_categories', function () {
        this
          .on('c_blog_category.CATEGORY_ID', 'c_user_followed_categories.CATEGORY_ID')
          .onIn('c_user_followed_categories.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_publication', function () {
        this
          .on('c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
          .onIn('c_user_followed_publication.USER_ID',[userId])
      })
      .leftJoin('c_blog_likes', function () {
        this
          .on('c_blog.ID', 'c_blog_likes.BLOG_ID')
          .onIn('c_blog_likes.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_authors', function () {
        this
          .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
          .onIn('c_user_followed_authors.USER_ID',[userId])
      })
      .whereNot({'c_blog.ALIAS':alias})
      .whereNot({'c_blog_category.BLOG_ID':null})
      .orderByRaw('RAND()')
      .limit(5);

    let data = await query.distinct(
      'c_blog.ID',
      'c_blog.TITLE',
      'c_blog.DESCRIPTION',
      'c_blog.CONTENT',
      'c_blog.FEATURE_MEDIA',
      'c_blog.PUBLICATION',
      'c_blog.AUTHOR_BY',
      'c_blog.VIEWS',
      'c_blog.STATUS',
      'c_blog.CREATED_AT',
      'c_blog.UPDATED_AT',
      'c_blog.ALIAS',
      'c_blog.FEATURED',
      'c_blog.TOP',
      'c_user.EMAIL','c_user.NAME','c_user.LAST_NAME',
      'c_user_followed_blog.ID as BLOGFOLLOWEDSTATUS',
      'c_user_followed_categories.ID as CATEGORYFOLLOWEDSTATUS',
      'c_user_followed_publication.ID as PUBLICATIONFOLLOWEDSTATUS',
      'c_user_followed_authors.ID as AUTHORFOLLOWEDSTATUS',
      'c_blog_likes.ID as LIKEDSTATUS',
      'c_publication.TITLE as PUBLICATION_TITLE',
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAGS"),
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORIES"))
    return data;
  }
  catch (e) {
    return e;
  }
};

exports.pickedBlogs = async (req,userId) => {
  try {
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }
    //get user followed author, interest, publication

    let query1 = knex.from('c_publication')
      .innerJoin('c_user', 'c_publication.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_user_followed_publication', 'c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
      .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
      .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
      .where({ 'c_user_followed_publication.USER_ID':userId });

    let publication = await query1.distinct('c_publication.ID');
    publication = publication.map(a => a.ID);

    let categories = await knex.select('c_category.ID')
      .from('c_category')
      .innerJoin('c_user_followed_categories', 'c_category.ID', 'c_user_followed_categories.CATEGORY_ID')
      .innerJoin('c_file as i1','i1.ID','c_category.IMAGE_ID')
      .where({'c_user_followed_categories.USER_ID':userId});
    categories = categories.map(a => a.ID);


    let query3 = knex.from('c_user')
      .innerJoin('c_user_followed_authors', 'c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
      .where({ 'c_user_followed_authors.USER_ID':userId});

    let author = await query3.distinct('c_user.ID');
    author = author.map(a => a.ID);


    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .leftJoin('c_publication', 'c_publication.ID', 'c_blog.PUBLICATION')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_category', function () {
        this
          .on('c_blog_category.BLOG_ID', 'c_blog.ID')
      })

      .leftJoin('c_user_followed_blog', function () {
        this
          .on('c_blog.ID', 'c_user_followed_blog.BLOG_ID')
          .onIn('c_user_followed_blog.USER_ID',[userId])
      })

      .leftJoin('c_user_followed_categories', function () {
        this
          .on('c_blog_category.CATEGORY_ID', 'c_user_followed_categories.CATEGORY_ID')
          .onIn('c_user_followed_categories.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_publication', function () {
        this
          .on('c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
          .onIn('c_user_followed_publication.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_authors', function () {
        this
          .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
          .onIn('c_user_followed_authors.USER_ID',[userId])
      })
      .where({'c_blog.STATUS':'PUBLISHED'})
      .where(function() {this.whereIn('c_blog.PUBLICATION',publication).orWhere('c_blog.AUTHOR_BY','IN',author).orWhere('c_blog_category.CATEGORY_ID','IN',categories)})
      .orderByRaw('RAND()').limit(5);

    let data = await query.distinct(
      'c_blog.ID',
      'c_blog.TITLE',
      'c_blog.DESCRIPTION',
      'c_blog.FEATURE_MEDIA',
      'c_blog.PUBLICATION',
      'c_blog.AUTHOR_BY',
      'c_blog.VIEWS',
      'c_blog.STATUS',
      'c_blog.CREATED_AT',
      'c_blog.UPDATED_AT',
      'c_blog.ALIAS',
      'c_blog.FEATURED',
      'c_blog.TOP',
      'c_user.EMAIL','c_user.NAME','c_user.LAST_NAME',
      'c_user_followed_blog.ID as BLOGFOLLOWEDSTATUS',
      'c_user_followed_categories.ID as CATEGORYFOLLOWEDSTATUS',
      'c_user_followed_publication.ID as PUBLICATIONFOLLOWEDSTATUS',
      'c_user_followed_authors.ID as AUTHORFOLLOWEDSTATUS',
      'c_publication.TITLE as PUBLICATION_TITLE',
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAGS"),
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORIES"))

    return data;
  }
  catch (e) {
    return e;
  }



};

exports.searchBlogs = async (req,searchText) => {
  try {
    let userId = 0;
    if(req.hasOwnProperty('mwValue')){
      userId = req.mwValue.auth.ID;
    }
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .leftJoin('c_publication', 'c_publication.ID', 'c_blog.PUBLICATION')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_category', function () {
        this
          .on('c_blog_category.BLOG_ID', 'c_blog.ID')
      })

      .leftJoin('c_user_followed_blog', function () {
        this
          .on('c_blog.ID', 'c_user_followed_blog.BLOG_ID')
          .onIn('c_user_followed_blog.USER_ID',[userId])
      })

      .leftJoin('c_user_followed_categories', function () {
        this
          .on('c_blog_category.CATEGORY_ID', 'c_user_followed_categories.CATEGORY_ID')
          .onIn('c_user_followed_categories.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_publication', function () {
        this
          .on('c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
          .onIn('c_user_followed_publication.USER_ID',[userId])
      })
      .leftJoin('c_user_followed_authors', function () {
        this
          .on('c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
          .onIn('c_user_followed_authors.USER_ID',[userId])
      })
      .where({'c_blog.STATUS':'PUBLISHED'})
      .where(function() {this.where('c_blog.TITLE','LIKE','%'+searchText+'%').orWhere('c_blog.DESCRIPTION','LIKE','%'+searchText+'%')}).limit(5);

    let data = await query.distinct(
      'c_blog.ID',
      'c_blog.TITLE',
      'c_blog.DESCRIPTION',
      'c_blog.FEATURE_MEDIA',
      'c_blog.PUBLICATION',
      'c_blog.AUTHOR_BY',
      'c_blog.VIEWS',
      'c_blog.STATUS',
      'c_blog.CREATED_AT',
      'c_blog.UPDATED_AT',
      'c_blog.ALIAS',
      'c_blog.FEATURED',
      'c_blog.TOP',
      'c_user.EMAIL','c_user.NAME','c_user.LAST_NAME',
      'c_user_followed_blog.ID as BLOGFOLLOWEDSTATUS',
      'c_user_followed_categories.ID as CATEGORYFOLLOWEDSTATUS',
      'c_user_followed_publication.ID as PUBLICATIONFOLLOWEDSTATUS',
      'c_user_followed_authors.ID as AUTHORFOLLOWEDSTATUS',
      'c_publication.TITLE as PUBLICATION_TITLE',
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAGS"),
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORIES"))

    return data;
  }
  catch (e) {
    return e;
  }



};


