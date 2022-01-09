import helpers from "../helpers";
import {config} from "dotenv";
import commentModel from '../model/commentModel';
import uniqid from 'uniqid';


config();

let comment = {};
comment.addComment  = async (req,res) =>{
  try{

    let payload = req.body;
    let blogId = typeof (payload.BLOG_ID) === "string" && payload.BLOG_ID.trim().length > 0? payload.BLOG_ID : null;
    let comments = typeof (payload.COMMENT) === "string" && payload.COMMENT.trim().length > 0? payload.COMMENT : false;

    //check tags are duplicate or not
    // validation
    if(blogId && comments) {
      payload.ID = uniqid();
      payload.STATUS = 'POSTED';
      payload.BLOG_ID = blogId;
      payload.COMMENT = comments;

      let commentDetails = await commentModel.createComment(req, payload);
      if(commentDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(201).json(helpers.response("201", "success", "Comment Added!", {ID:commentDetails}));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong",e.message));
  }
};

comment.getAllComment = async (req,res) => {
  try {
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let filters = typeof (req.body.filters) === "object" ? req.body.filters : [];
    let data = await commentModel.getAll(req,skip,take,filters);
    if (data != null) {
      res.status(200).json(helpers.response("200", "success", "Fetch Successful", data));
    }
    else {
      res.status(200).json(helpers.response("200", "error", "Fetch is not possible!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

comment.updateComment = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }


    let payload = req.body;
    let comments = typeof (payload.COMMENT) === "string" && payload.COMMENT.trim().length > 0? payload.COMMENT : false;

    //check tags are duplicate or not
    // validation
    if(comments) {
      payload.COMMENT = comments;
        let commentDetails = await commentModel.updateComment(req,req.params.id, payload);
        if(commentDetails == null){
          res.status(200).json(helpers.response("200", "error", "Database Error!"));
        }
        else{
          res.status(200).json(helpers.response("200", "success", "Comment Updated!", {ID:commentDetails}));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Validation Error!"));
      }
    }catch(e){
      res.status(500).json(helpers.response("500", "error", "Something went wrong!"));
    }

};

comment.changeStatus = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }


    let payload = req.body;
    let status = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0? payload.STATUS : false;

    //check tags are duplicate or not
    // validation
    if(status) {
      payload.STATUS = status;
      let commentDetails = await commentModel.changeStatus(req,req.params.id, payload);
      if(commentDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(200).json(helpers.response("200", "success", "Comment Updated!", {ID:commentDetails}));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong!"));
  }

};


export default comment;

