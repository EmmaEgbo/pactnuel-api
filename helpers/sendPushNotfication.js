import notificationModel from '../model/notificationModel';
import userModel from '../model/userModel';
import followModel from '../model/followModel';
import sendPushNotfication from './pushNotifications';;

const authorFollow = async (senderID, userDetails) => {
    // Store notification
    const user = await userModel.getDetailById(senderID);
    const message = `${user.NAME} ${user.LAST_NAME} followed you, Follow Back`;

    const payload = {
        TITLE: `${user.NAME} ${user.LAST_NAME}`,
        NOTIFICATION_IMAGE: user.IMAGE,
        USER_FROM: senderID,
        USER_TO: userDetails.ID,
        NOTIFICATION_TYPE: "follow_author",
        ENTITY_ID: user.EMAIL,
        CONTENT: message
    };
    await notificationModel.createNotification(payload);
   
    // send push notification
    if(userDetails.PUSHTOKEN !== null) {
        const data = { ENTITY_ID: user.EMAIL, NOTIFICATION_TYPE: "follow_author", USER_FROM: senderID };
        await sendPushNotfication([userDetails.PUSHTOKEN], message, data)
    }
}

// Background
const notifyFollowers = async (senderID, blogDetails, ALIAS) => {
    const followers = await followModel.getAuthorFollowers(senderID);
    const user = await userModel.getDetailById(senderID);
    const title = `${user.NAME} ${user.LAST_NAME} just published a story, Check it out`
    let push_tokens = [];

    for (let i = 0; i < followers.length; i++) {
        const payload = {
            TITLE: `${user.NAME} ${user.LAST_NAME} published a story`,
            NOTIFICATION_IMAGE: JSON.parse(blogDetails.FEATURE_MEDIA).url,
            USER_FROM: senderID,
            USER_TO: followers[i].ID,
            NOTIFICATION_TYPE: "article_post",
            ENTITY_ID: ALIAS,
            CONTENT: blogDetails.TITLE
        };
        await notificationModel.createNotification(payload);
        if(followers[i].PUSHTOKEN !== null && senderID !== followers[i].ID) push_tokens.push(followers[i].PUSHTOKEN)
    }
    
    // send push notification to all followers
    if(push_tokens.length > 0) {
        const message = blogDetails.TITLE;
        const data = { ENTITY_ID: ALIAS, NOTIFICATION_TYPE: "article_post",  USER_FROM: senderID };
        await sendPushNotfication(push_tokens, message, data, `Pactnuel - ${title}`)
    }
}

// Background / Admin - Featured/Top Post
const notifyAllUsers = async (AdminID, blogDetails, type) => {
    const users = await userModel.getAllUsers();
    let push_tokens = [];

    for (let i = 0; i < users.length; i++) {
        const payload = {
            TITLE: `${type} Story`,
            NOTIFICATION_IMAGE: JSON.parse(blogDetails.FEATURE_MEDIA).url,
            USER_FROM: AdminID,
            USER_TO: users[i].ID,
            NOTIFICATION_TYPE: "article_post",
            ENTITY_ID: blogDetails.ALIAS,
            CONTENT: blogDetails.TITLE
        };
        await notificationModel.createNotification(payload);
        if(users[i].PUSHTOKEN !== null) push_tokens.push(users[i].PUSHTOKEN)
    }
   
    // send push notification to all users
    if(push_tokens.length > 0) {
        const title = `Pactnuel - ${type} Story`
        const message = blogDetails.TITLE;
        const data = { ENTITY_ID: blogDetails.ALIAS, NOTIFICATION_TYPE: "article_post",  USER_FROM: AdminID };
        await sendPushNotfication(push_tokens, message, data, title)
    }
}

export {
    authorFollow,
    notifyFollowers,
    notifyAllUsers
}