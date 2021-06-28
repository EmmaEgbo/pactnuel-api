const uniqid = require('uniqid');
import {knex} from "../config/config";
import followModel from "./followModel"


exports.followBlog = async (req ,id) => {
  try{
    let userId = req.mwValue.auth.ID;
    let status;
    let exists =  await knex.select('c_user_followed_blog.*')
      .from('c_user_followed_blog')
      .where({ "USER_ID": userId, "BLOG_ID":id}).limit(1);

    if(exists.length > 0){
      //delete
      await knex('c_user_followed_blog').where({ "USER_ID": userId, "BLOG_ID":id}).delete();
      status = 'deleted';

    }
    else{
      //create
      let dataset = {};
      dataset.ID = uniqid();
      dataset.BLOG_ID = id;
      dataset.USER_ID = userId;
      await knex('c_user_followed_blog').insert([dataset]);
      status = 'added';
    }

    return status;

  }catch (e) {
    return e;
  }


};

exports.likeBlog = async (req ,id) => {
  try{
    let userId = req.mwValue.auth.ID;
    let status;
    let exists =  await knex.select('c_blog_likes.*')
      .from('c_blog_likes')
      .where({ "USER_ID": userId, "BLOG_ID":id}).limit(1);

    if(exists.length > 0){
      //delete
      await knex('c_blog_likes').where({ "USER_ID": userId, "BLOG_ID":id}).delete();
      status = 'deleted';

    }
    else{
      //create
      let dataset = {};
      dataset.ID = uniqid();
      dataset.BLOG_ID = id;
      dataset.USER_ID = userId;
      await knex('c_blog_likes').insert([dataset]);
      status = 'added';
    }

    return status;

  }catch (e) {
    return e;
  }


};

exports.followPublication = async (req ,id) => {
  try{
    let userId = req.mwValue.auth.ID;
    let status;
    let exists =  await knex.select('c_user_followed_publication.*')
      .from('c_user_followed_publication')
      .where({ "USER_ID": userId, "PUBLICATION_ID":id}).limit(1);

    if(exists.length > 0){
      //delete
      await knex('c_user_followed_publication').where({ "USER_ID": userId, "PUBLICATION_ID":id}).delete();
      status = 'deleted';

    }
    else{
      //create
      let dataset = {};
      dataset.ID = uniqid();
      dataset.PUBLICATION_ID = id;
      dataset.USER_ID = userId;
      await knex('c_user_followed_publication').insert([dataset]);
      status = 'added';
    }

    return status;

  }catch (e) {
    return e;
  }


};

exports.followAuthor = async (req ,id) => {
  try{
    let userId = req.mwValue.auth.ID;
    let status;
    let exists =  await knex.select('c_user_followed_authors.*')
      .from('c_user_followed_authors')
      .where({ "USER_ID": userId, "AUTHOR_ID":id}).limit(1);

    if(exists.length > 0){
      //delete
      await knex('c_user_followed_authors').where({ "USER_ID": userId, "AUTHOR_ID":id}).delete();
      status = 'deleted';

    }
    else{
      //create
      let dataset = {};
      dataset.ID = uniqid();
      dataset.AUTHOR_ID = id;
      dataset.USER_ID = userId;
      await knex('c_user_followed_authors').insert([dataset]);
      status = 'added';
    }

    return status;

  }catch (e) {
    return e;
  }


};

exports.followCategory = async (req ,id) => {
  try{
    let userId = req.mwValue.auth.ID;
    let status;
    let exists =  await knex.select('c_user_followed_categories.*')
      .from('c_user_followed_categories')
      .where({ "USER_ID": userId, "CATEGORY_ID":id}).limit(1);

    if(exists.length > 0){
      //delete
      await knex('c_user_followed_categories').where({ "USER_ID": userId, "CATEGORY_ID":id}).delete();
      status = 'deleted';

    }
    else{
      //create
      let dataset = {};
      dataset.ID = uniqid();
      dataset.CATEGORY_ID = id;
      dataset.USER_ID = userId;
      await knex('c_user_followed_categories').insert([dataset]);
      status = 'added';
    }

    return status;

  }catch (e) {
    return e;
  }


};


exports.getFollowedBlog = async (req, userId, skip, take) => {
  try {
    let data = {};
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_user_followed_blog', 'c_blog.ID', 'c_user_followed_blog.BLOG_ID')
      .leftJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .where({'c_blog.STATUS':"PUBLISHED",'c_user_followed_blog.USER_ID':userId });
    data.DATA = await query.offset(skip).limit(take).distinct('c_blog.*','c_user.EMAIL','c_user.NAME','c_user.LAST_NAME',
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_tag inner join c_tags ct on c_blog_tag.TAG_ID = ct.ID where c_blog_tag.BLOG_ID=c_blog.ID) as TAGS"),
      knex.raw("(select CONCAT('[',GROUP_CONCAT('{\"text\":\"',ct.NAME,'\",\"id\":\"',ct.ID,'\"}'),']') from c_blog_category inner join c_category ct on c_blog_category.CATEGORY_ID = ct.ID where c_blog_category.BLOG_ID=c_blog.ID) as CATEGORIES"))

    let totalCount = await followModel.getFollowedBlogsCount(userId);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e;
  }

};

exports.getFollowedBlogsCount = async (userId) => {
  try {
    let query = knex.from('c_blog')
      .innerJoin('c_user', 'c_blog.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_user_followed_blog', 'c_blog.ID', 'c_user_followed_blog.BLOG_ID')
      .leftJoin('c_blog_category', 'c_blog_category.BLOG_ID', 'c_blog.ID')
      .leftJoin('c_blog_tag', 'c_blog_tag.BLOG_ID', 'c_blog.ID')
      .where({'c_blog.STATUS':"PUBLISHED",'c_user_followed_blog.USER_ID':userId });

    return await query.count({ 'COUNT': 'c_blog.ID' });
  }
  catch (e) {
    return e;
  }

};

exports.getBlogPostedCount = async (userId) => {
  try {
    let query = knex.from('c_blog')
      .where({'c_blog.STATUS':"PUBLISHED",'c_blog.AUTHOR_BY' :userId });
      await query.count({ 'COUNT': 'c_blog.ID' })
    return await query.count({ 'COUNT': 'c_blog.ID' });
  }
  catch (e) {
    return e;
  }
};

exports.getBlogLikeCount = async (blogId) => {
  try {
    let query = knex.from('c_blog_likes')
      .where({'c_blog_likes.BLOG_ID' : blogId });
    return await query.count({ 'COUNT': 'c_blog_likes.ID' });
  }
  catch (e) {
    return e;
  }
};

exports.getFollowedAuthor = async (req, userId, skip, take) => {
  try {
    let data = {};
    let query = knex.from('c_user')
      .innerJoin('c_user_followed_authors', 'c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
      .where({ 'c_user_followed_authors.USER_ID':userId});

    data.DATA = await query.offset(skip).limit(take).distinct('c_user.*');
    let totalCount = await followModel.getFollowedAuthorCount(userId);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e;
  }

};

exports.getFollowedAuthorCount = async (userId) => {
  try {
    let query = knex.from('c_user')
      .innerJoin('c_user_followed_authors', 'c_user.ID', 'c_user_followed_authors.AUTHOR_ID')
      .where({'c_user_followed_authors.USER_ID':userId });

    return await query.count({ 'COUNT': 'c_user.ID' });
  }
  catch (e) {
    return e;
  }

};

exports.getFollowedPublication = async (req,userId, skip, take) => {
  try {
    let data = {};
    let query = knex.from('c_publication')
      .innerJoin('c_user', 'c_publication.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_user_followed_publication', 'c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
      .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
      .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
      .where({ 'c_user_followed_publication.USER_ID':userId });

    data.DATA = await query.offset(skip).limit(take).distinct('c_publication.*','AVATAR.PATH as AVATAR_FILE_PATH',
      'LOGO.PATH as LOGO_FILE_PATH','c_user.NAME as AUTHOR_FIRST_NAME','c_user.LAST_NAME as AUTHOR_LAST_NAME');
    let totalCount = await followModel.getFollowedPublicationCount(userId);
    data.TOTAL = totalCount[0].COUNT;
    return data;
  }
  catch (e) {
    return e;
  }

};

exports.getFollowedPublicationCount = async (userId) => {
  try {
    let query = knex.from('c_publication')
      .innerJoin('c_user', 'c_publication.AUTHOR_BY', 'c_user.ID')
      .innerJoin('c_user_followed_publication', 'c_publication.ID', 'c_user_followed_publication.PUBLICATION_ID')
      .leftJoin('c_file as AVATAR', 'c_publication.AVATAR', 'AVATAR.ID')
      .leftJoin('c_file as LOGO', 'c_publication.LOGO', 'LOGO.ID')
      .where({'c_user_followed_publication.USER_ID':userId });

    return await query.count({ 'COUNT': 'c_publication.ID' });
  }
  catch (e) {
    return e;
  }

};

exports.getFollowedCategories = async (req,userId, skip, take) => {
  try{
    let result = await knex.select('c_category.*','i1.PATH as IMAGE_PATH')
      .from('c_category')
      .innerJoin('c_user_followed_categories', 'c_category.ID', 'c_user_followed_categories.CATEGORY_ID')
      .innerJoin('c_file as i1','i1.ID','c_category.IMAGE_ID')
      .where({'c_user_followed_categories.USER_ID':userId});

    return result;
  }catch (e) {
    return e.message;
  }


};

