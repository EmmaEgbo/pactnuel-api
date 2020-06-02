import helpers from "../helpers";
import {config} from "dotenv";
import followModel from '../model/followModel';
import uniqid from 'uniqid';
import blogModel from "../model/blogModel";
import publicationModel from "../model/publicationModel";
import userModel from "../model/userModel";
import categoryModel from "../model/categoryModel";

config();

let follow = {};

follow.followBlog = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetails = await blogModel.getDetailById(req.params.id);
    if(getDetails != null && getDetails.STATUS  == 'PUBLISHED'){
      let status = await followModel.followBlog(req, req.params.id);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Followed Successfully!",status));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Following is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Blog doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

follow.followPublication = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetails = await publicationModel.getDetailById(req.params.id);
    if(getDetails != null && getDetails.STATUS  == 'ACTIVE'){
      let status = await followModel.followPublication(req, req.params.id);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Followed Successfully!",status));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Following is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Publication doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

follow.followAuthor = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetails = await userModel.getDetailById(req.params.id);
    if(getDetails != null ){
      let status = await followModel.followAuthor(req, req.params.id);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Followed Successfully!",status));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Following is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Author doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

follow.followCategory = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetails = await categoryModel.getDetail(req, req.params.id);
    if(getDetails != null ){
      let status = await followModel.followCategory(req, req.params.id);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Followed Successfully!",status));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Following is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Category doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

follow.getFollowedBlog = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let getDetails = await userModel.getDetailById(req.params.id);
    if(getDetails != null){
      let result = await followModel.getFollowedBlog(req, req.params.id, skip, take);
      if(result != null){
        res.status(200).json(helpers.response("200", "success", "Fetch Successfully!",result));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Fetch is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "User doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }

};

follow.getFollowedAuthor = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let getDetails = await userModel.getDetailById(req.params.id);
    if(getDetails != null){
      let result = await followModel.getFollowedAuthor(req, req.params.id, skip, take);
      if(result != null){
        res.status(200).json(helpers.response("200", "success", "Fetch Successfully!",result));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Fetching is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "User doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }

};

follow.getFollowedCategories = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let getDetails = await userModel.getDetailById(req.params.id);
    if(getDetails != null){
      let result = await followModel.getFollowedCategories(req, req.params.id, skip, take);
      if(result != null){
        res.status(200).json(helpers.response("200", "success", "Fetched Successfully!",result));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Fetch is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "User doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }

};

follow.getFollowedPublication = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let getDetails = await userModel.getDetailById(req.params.id);
    if(getDetails != null){
      let result = await followModel.getFollowedPublication(req, req.params.id, skip, take);
      if(result != null){
        res.status(200).json(helpers.response("200", "success", "Fetch Successfully!",result));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Fetch is not possible!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "User doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }

};






export default follow;

