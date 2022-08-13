import helpers from "../helpers";
import { config } from "dotenv";
import notificationModel from '../model/notificationModel';

config();

let notification = {};

notification.createNotification  = async (req,res) =>{
  try{
    let payload = req.body;
    payload.USER_FROM = req.mwValue.auth.ID;
    const { USER_TO, NOTIFICATION_TYPE, ENTITY_ID, CONTENT } = payload;
    const user_to = typeof (USER_TO) === "string" && USER_TO.trim().length > 0? USER_TO : false;
    const entity_id = typeof (ENTITY_ID) === "string" && ENTITY_ID.trim().length > 0? ENTITY_ID : false;
    const notification_type = typeof (NOTIFICATION_TYPE) === "string" && NOTIFICATION_TYPE.trim().length > 0? NOTIFICATION_TYPE : false;
    const content = typeof (CONTENT) === "string" && CONTENT.trim().length > 0? CONTENT : false;
    // validation
    if(user_to && entity_id  && notification_type && content) {
      const notificationDetails = await notificationModel.createNotification(payload);
      if(notificationDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(201).json(helpers.response("201", "success", "Notification Added!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};

notification.getAllNotifications = async (req,res) => {
  const userID = req.mwValue.auth.ID;
  let page = req.query.page ? req.query.page : 1;
  let size = req.query.size ? req.query.size : 10;
  console.log(page, size)
  try {
    let data = await notificationModel.getAllNotifications(userID, page, size);
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

notification.getUnReadCount = async (req,res) => {
  const userID = req.mwValue.auth.ID;
  try {
    let data = await notificationModel.getUnReadCount(userID);
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

notification.markNotificationAsRead = async (req,res) => {
    const { id } = req.params;
    const userID = req.mwValue.auth.ID;
  try{
    if (!req.params.id) {
      res.status(400);
      res.end();
      return;
    }
    const notification = await notificationModel.getNotification({ ID: id });
    if(notification !== null && notification.USER_TO === userID){
      let status = await notificationModel.markNotificationAsRead(id);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Update is not possible!"));
      }
    }
    else{
      res.status(404).json(helpers.response("404", "error", "Notification doesn't exists!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }
};

notification.markNotificationAsReadWithEntity = async (req,res) => {
  const userID = req.mwValue.auth.ID;
try{
  let payload = req.body;
  payload.USER_TO = req.mwValue.auth.ID;
  const { NOTIFICATION_TYPE, ENTITY_ID, USER_FROM } = payload;
  const user_from = typeof (USER_FROM) === "string" && USER_FROM.trim().length > 0? USER_FROM : false;
  const entity_id = typeof (ENTITY_ID) === "string" && ENTITY_ID.trim().length > 0? ENTITY_ID : false;
  const notification_type = typeof (NOTIFICATION_TYPE) === "string" && NOTIFICATION_TYPE.trim().length > 0? NOTIFICATION_TYPE : false;

  if(user_from && entity_id  && notification_type) {
    const notification = await notificationModel.getNotification(payload, true);
    if(notification !== null && notification.USER_TO === userID){
      let status = await notificationModel.markNotificationAsReadWithEntity(payload);
      if(status != null){
        res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
      }
      else {
        res.status(200).json(helpers.response("200", "error", "Update is not possible!"));
      }
    }
    else{
      res.status(404).json(helpers.response("404", "error", "Notification doesn't exists!"));
    }
  } else {
    res.status(200).json(helpers.response("200", "error", "Validation Error!"));
  }
}
catch (e) {
  console.log(e)
  res.status(400).json(helpers.response("400", "error", "Something went wrong."));
}
};

notification.markAllNotificationsAsRead = async (req,res) => {
  const userID = req.mwValue.auth.ID;
  try{
    const status = await notificationModel.markAllNotificationsAsRead(userID);
    if(status !== null){
        res.status(200).json(helpers.response("200", "success", "Updated Successfully!"));
    } else {
        res.status(200).json(helpers.response("200", "error", "Update is not possible!"));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }
};

export default notification;

