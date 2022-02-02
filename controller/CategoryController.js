import helpers from "../helpers";
import {config} from "dotenv";
import categoryModel from '../model/categoryModel';
import uniqid from 'uniqid';

config();

let category = {};
category.addCategory  = async (req,res) =>{
  try{

    let payload = req.body;
    let desc = typeof (payload.DESCRIPTION) === "string" && payload.DESCRIPTION.trim().length > 0? payload.DESCRIPTION : false;
    let name = typeof (payload.NAME) === "string" && payload.NAME.trim().length > 0? payload.NAME : false;
    let image = typeof (payload.IMAGE_ID) === "string" && payload.IMAGE_ID.trim().length > 0? payload.IMAGE_ID : false;
    let usedIn = typeof (payload.USED_IN) === "object"? payload.USED_IN : false;
    // validation
    if(desc && name  && image && usedIn) {
      payload.ID = uniqid();
      payload.STATUS = 'active';
      payload.USED_IN = JSON.stringify(payload.USED_IN);
      let categoryDetails = await categoryModel.createCategory(req, payload);
      if(categoryDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(201).json(helpers.response("201", "success", "categoryDetails Added!", {ID:categoryDetails}));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};


category.getCategory = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await categoryModel.getDetail(req, req.params.id);

      if(getDetials != null){
        res.status(200).json(helpers.response("200", "success", "Fetch Successful",getDetials));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Fetch is not possible!"));
      }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

category.getAllCategory = async (req,res) => {
  try {
    let data = await categoryModel.getAll(req);
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

category.updateCategory = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await categoryModel.getDetail(req.params.id);
    if(getDetials != null){
      let status = await categoryModel.updateCategory(req,req.params.id,req.body);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Delete is not possible!"));
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

category.deleteCategory = async (req,res) => {
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    let getDetials = await categoryModel.getDetail(req.params.id);
    if(getDetials != null){
      let status = await categoryModel.deleteCategory(req.params.id);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Deleted Successfully!"));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Delete is not possible!"));
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



export default category;

