import { knex } from "../config/config";
import uniqid from "uniqid";
import notificationModel from "./notificationModel";

exports.createNotification = async (data) => {
  const { USER_TO, USER_FROM, NOTIFICATION_TYPE, ENTITY_ID, CONTENT, TITLE, NOTIFICATION_IMAGE } = data;
  try {
    const notification = await notificationModel.getNotification(data, true);
    if (notification !== null) {
        await notificationModel.deleteNotification(notification.ID);
    }
    await knex('c_user_notifications').insert({
        ID: uniqid(),
        USER_TO,
        USER_FROM,
        NOTIFICATION_TYPE,
        ENTITY_ID,
        CONTENT,
        TITLE,
        NOTIFICATION_IMAGE
    });
    return 'success';
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

exports.getAllNotifications = async (userId, page, size) => {
  try {
    const notifications = await knex("c_user_notifications").where({
      USER_TO: userId
    }).orderBy('CREATED_AT', 'desc').paginate({ perPage: parseInt(size), currentPage: parseInt(page) });
    return notifications;
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

exports.getUnReadCount = async (userId) => {
  try {
    const notifications = await knex("c_user_notifications").where({
      USER_TO: userId, OPENED: false
    }).count('ID as TOTAL');
    return notifications[0].TOTAL;
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

exports.getNotification = async (data, full = false) => {
  const { ID, USER_TO, USER_FROM, NOTIFICATION_TYPE, ENTITY_ID } = data;
  let notification;
  try {
    if(full) {
        notification = await knex("c_user_notifications").where({
          USER_TO,
          USER_FROM,
          NOTIFICATION_TYPE,
          ENTITY_ID,
        });
    } else {
        notification = await knex("c_user_notifications").where({ ID });
    }

    if (notification.length === 0) {
        return null;
    }

    return notification[0];
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

exports.deleteNotification = async (ID) => {
  try {
    const notifications = await knex("c_user_notifications")
      .where({
        ID,
      })
      .del();
    return notifications;
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

exports.markNotificationAsRead = async (id) => {
  try {
    await knex("c_user_notifications")
      .where({
        ID: id,
      })
      .update({
        OPENED: true,
      });
    return "success";
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

exports.markNotificationAsReadWithEntity = async (data) => {
  const { USER_TO, USER_FROM, NOTIFICATION_TYPE, ENTITY_ID } = data;
  try {
    await knex("c_user_notifications")
      .where({
        USER_TO,
        USER_FROM,
        NOTIFICATION_TYPE,
        ENTITY_ID
      })
      .update({
        OPENED: true,
      });
    return "success";
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};

exports.markAllNotificationsAsRead = async (userId) => {
  try {
    await knex("c_user_notifications")
      .where({
        USER_TO: userId,
      })
      .update({
        OPENED: true,
      });
    return "success";
  } catch (e) {
    console.log(e.message);
    throw e;
  }
};
