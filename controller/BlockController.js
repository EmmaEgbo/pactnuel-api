import helpers from "../helpers";
import { config } from "dotenv";
import blockModel from '../model/blockModel';
import userModel from "../model/userModel";

config();

let blockController = {};

blockController.blockUser  = async (req,res) => {
  const { id } = req.params;
  try{
    let payload = req.params;
    payload.USER_ID = req.mwValue.auth.ID;
    payload.BLOCKED_USER_ID = id;
    const user_id = typeof (id) === "string" && id.trim().length > 0? id : false;

    // validation
    if(user_id) {
        let getDetails = await userModel.getDetailById(id);
        if(getDetails != null ) {
            await blockModel.blockUser(payload);
            return res.status(200).json(helpers.response("200", "success", "User blocked successfully!"));
        } else {
            res.status(200).json(helpers.response("200", "error", "User does not exist!"));
        }
    }
    else {
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    console.log("e", e)
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};

blockController.getBlockedUsers = async (req,res) => {
  const page = req.query.page ? req.query.page : 1;
  const size = req.query.size ? req.query.size : 10;
  try {
    let data = await blockModel.getAllBlockedUsers(page, size);
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

blockController.reportUser  = async (req,res) => {
  const { id } = req.params;
  try{
    let payload = req.params;
    payload.USER_ID = req.mwValue.auth.ID;
    payload.REPORTED_USER_ID = id;
    const user_id = typeof (id) === "string" && id.trim().length > 0? id : false;

    // validation
    if(user_id) {
        let getDetails = await userModel.getDetailById(id);
        if(getDetails != null ) {
            await blockModel.blockUser(payload);
            return res.status(200).json(helpers.response("200", "success", "User reported successfully!"));
        } else {
            res.status(200).json(helpers.response("200", "error", "User does not exist!"));
        }
    }
    else {
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    console.log("e", e)
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};

export default blockController;

