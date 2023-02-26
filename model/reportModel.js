import { knex } from "../config/config";
import uniqid from "uniqid";

exports.reportBlog = async (data) => {
  const { USER_ID, BLOG_ID, TYPE } = data;
  try {
    await knex('c_blog_report').insert({
        ID: uniqid(),
        USER_ID,
        BLOG_ID,
        TYPE
    });
    return 'success';
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

exports.getAllReports = async (page, size) => { 
  try {
    const reports = await knex("c_blog_report")
        .join('c_blog', 'c_blog_report.BLOG_ID', '=', 'c_blog.ID')
        .join('c_user', 'c_blog_report.USER_ID', '=', 'c_user.ID')
        .orderBy('c_blog_report.CREATED_AT', 'desc')
        .select('c_blog.TITLE', 'c_blog.FEATURE_MEDIA', 'c_user.EMAIL', 'c_user.NAME', 'c_user.LAST_NAME', 'c_blog_report.TYPE',)
        .paginate({ perPage: parseInt(size), currentPage: parseInt(page) });
    return reports;
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};
