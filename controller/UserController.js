import helpers from "../helpers";
import {config} from "dotenv";
import {knex} from "../config/config";
import userModel from '../model/userModel';
import uniqid from 'uniqid';
import followModel from "../model/followModel";
const md5 = require('md5');
import fileModel from '../model/fileModel';
import sharp from 'sharp';

config();

let user = {};
user.register = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let password = typeof (payload.PASSWORD) === "string" && payload.PASSWORD.trim().length > 0? payload.PASSWORD : false;
    let firstName = typeof (payload.FIRST_NAME) === "string" && payload.FIRST_NAME.trim().length > 0? payload.FIRST_NAME : false;
    let lastName = typeof (payload.LAST_NAME) === "string" && payload.LAST_NAME.trim().length > 0? payload.LAST_NAME : false;
    let source = typeof (payload.SOURCE) === "string" && payload.SOURCE.trim().length > 0? payload.SOURCE : null;
    let mobile = typeof (payload.MOBILE) === "string" && payload.MOBILE.trim().length > 0? payload.MOBILE : null;
    let loginType = typeof (payload.REGISTRATION_TYPE) === "string" && payload.REGISTRATION_TYPE.trim().length > 0? payload.REGISTRATION_TYPE : 'EMAIL';
    let facebookId = typeof (payload.GOOGLE_ID) === "string" && payload.GOOGLE_ID.trim().length > 0? payload.GOOGLE_ID : null;
    let googleId = typeof (payload.FACEBOOK_ID) === "string" && payload.FACEBOOK_ID.trim().length > 0? payload.FACEBOOK_ID : null;
    let role = typeof (payload.ROLE) === "object" && payload.ROLE.ROLES.length > 0? payload.ROLE : false;
    if(email && password && role && firstName && lastName && loginType){
      let userDetails = await userModel.getDetail(req, email);
      let userDetailsMobile = null;
      if(mobile != null){
        userDetailsMobile = await userModel.getDetailFromMobile(mobile);
      }

      if(userDetails == null && userDetailsMobile == null){
        let userId = uniqid();
        let token = uniqid();
        let dataSet = {
          ID:userId,
          NAME:firstName,
          LAST_NAME:lastName,
          ROLE:JSON.stringify(role),
          EMAIL:email,
          MOBILE:mobile,
          PASSWORD:md5(password),
          SOURCE:source,
          REGISTRATION_TYPE:loginType,
          GOOGLE_ID:googleId,
          FACEBOOK_ID:facebookId,
          REMEMBER_TOKEN:token
        };
        //create user
        let createdUser = await userModel.createUser(req,dataSet);
        if(createdUser != null){
         //send email for verification
          let data = {"URL":process.env.FRONT_END_URL,"VERIFYLINK":process.env.FRONT_END_URL+'/verify?status=pending&email='+email+'&token='+token, "NAME": `${firstName} ${lastName}`}
          helpers.sendEmail([email],
            `[Mootverse] Verify your email address`,
            'verification',data);
          res.status(200).json(helpers.response("200", "success", "Please check Your Mailbox!"));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Your mobile/email is already registered with us, Please login!"));
      }

    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }


};

//frontend user login
user.login = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let password = typeof (payload.PASSWORD) === "string" && payload.PASSWORD.trim().length > 0? payload.PASSWORD : false;
    if(email && password){
      //check mobile and otp is correct or not
        let userDetails = await userModel.getDetail(req, email);

        if(userDetails != null){
          if(userDetails.EMAIL_VERIFY == 0){
            return res.status(200).json(helpers.response("200", "error", "Your Email is not verified.",{"action":"resendActivationEmail"}));
          }
          if(userDetails.STATUS == 0){
            return res.status(200).json(helpers.response("200", "error", "Your Profile is not active."));
          }

          if(userDetails.DELETED === 1){
            return res.status(400).json(helpers.response("400", "error", "Account deleted"));
          }

          else if(userDetails.PASSWORD.toUpperCase() == (md5(password)).toUpperCase()){
            let rowsData = {};
            rowsData.ID = userDetails.ID;
            rowsData.EMAIL = userDetails.EMAIL;
            rowsData.NAME = userDetails.NAME;
            rowsData.COUNTRY_CODE = userDetails.COUNTRY_CODE;
            rowsData.LAST_NAME = userDetails.LAST_NAME;
            rowsData.MOBILE = userDetails.MOBILE;
            rowsData.REGISTRATION_TYPE = userDetails.REGISTRATION_TYPE;
            rowsData.GOOGLE_ID = userDetails.GOOGLE_ID;
            rowsData.ROLE = userDetails.ROLE;
            rowsData.FACEBOOK_ID = userDetails.FACEBOOK_ID;
            rowsData.IMAGE = userDetails.IMAGE;
            rowsData.BIO = userDetails.BIO;

            const tokens = await userModel.generateAuthTokens(rowsData);
            rowsData.TOKENS = tokens; 

            user.postAuth(userDetails).then((updateData) => {
              if (updateData.status) {
                res.status(200).json(helpers.response("200", "success", "Login Successful", rowsData));
              } else {
                res.status(500).json(helpers.response("500", "error", "Something went wrong", rowsData));
              }
            });
          }
          else {
            res.status(200).json(helpers.response("200", "error", "Password not matched!"));
          }

        }
        else{
          res.status(200).json(helpers.response("200", "error", "You are not registered with us!"));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Validation Error!"));
      }

  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }

};

user.getDetails = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    if(email){
      //check mobile and otp is correct or not
      let userDetails = await userModel.getDetail(req, email);
      if(userDetails != null){
        delete userDetails.PASSWORD;
        //get followers
        let totalFCount = await followModel.getFollowersCount(userDetails.ID);
        userDetails.TOTAL_FOLLOWERS = totalFCount[0].COUNT;
      
        //get blog written
        let totalBCount = await followModel.getBlogPostedCount(userDetails.ID);
        userDetails.TOTAL_BLOG = totalBCount[0].COUNT;

        //get followed publication
        let totalCount = await followModel.getFollowedPublicationCount(userDetails.ID);
        userDetails.TOTAL_PUBLICATION = totalCount[0].COUNT;

        //get followed authors
        let totalACount = await followModel.getFollowedAuthorCount(userDetails.ID);
        userDetails.TOTAL_AUTHOR = totalACount[0].COUNT;

        res.status(200).json(helpers.response("200", "success", "Successful!", userDetails));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "User Not Found!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }

  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

user.getUserDetails = async (req,res) => {
  try{
      let userDetails = await userModel.getUserDetails(req);
      if(userDetails != null){
        delete userDetails.PASSWORD;
        //get followers
        let totalFCount = await followModel.getFollowersCount(userDetails.ID);
        userDetails.TOTAL_FOLLOWERS = totalFCount[0].COUNT;
      
        //get blog written
        let totalBCount = await followModel.getBlogPostedCount(userDetails.ID);
        userDetails.TOTAL_BLOG = totalBCount[0].COUNT;

        //get followed publication
        let totalCount = await followModel.getFollowedPublicationCount(userDetails.ID);
        userDetails.TOTAL_PUBLICATION = totalCount[0].COUNT;

        //get followed authors
        let totalACount = await followModel.getFollowedAuthorCount(userDetails.ID);
        userDetails.TOTAL_AUTHOR = totalACount[0].COUNT;

        res.status(200).json(helpers.response("200", "success", "Successful!", userDetails));
      }
      else{
        res.status(200).json(helpers.response("200", "error", "User Not Found!"));
      }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

user.accountActivation = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let token = typeof (payload.TOKEN) === "string" && payload.TOKEN.trim().length > 0? payload.TOKEN : false;

    if(email && token){
      let userDetails = await userModel.getDetail(req, email);
      if(userDetails != null){
       if(token==userDetails.REMEMBER_TOKEN){
         //Update User with verify 1
         let result = await userModel.accountActivation(email);
         if(result){
          //  Add to mailing list
            let userDetails = await userModel.getDetail(req, email);
            const { NAME, LAST_NAME, EMAIL } = userDetails;
            const data = {"NAME": `${NAME} ${LAST_NAME}`};
            helpers.sendEmail([email],
              `Welcome to Mootverse`,
              'welcome', data);
            helpers.subscribeToMailList(NAME, LAST_NAME, EMAIL);
            return res.status(200).json(helpers.response("200", "success", "Your account has been verified! Please login now!"));
         }
       }
       else{
         res.status(200).json(helpers.response("200", "error", "Your token has expired!"));
       }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Your Email address doesn't exists."));
      }

    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }


};

user.forgotPasswordResendActivation = async (req,res) => {
  try{
    let payload = req.body;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let type = typeof (payload.TYPE) === "string" && (payload.TYPE=='RESEND' || payload.TYPE=='FORGOT') && payload.TYPE.trim().length > 0 ? payload.TYPE : false;
    if(email && type){
      //check mobile and otp is correct or not
      let userDetails = await userModel.getDetail(req, email);
      const { NAME, LAST_NAME } = userDetails;
      if(userDetails != null){
        let token = uniqid();
        let result = await userModel.updateToken(email,token);
        if(result){
          let data = '';
          if(type == 'FORGOT'){
            data = {"URL":process.env.FRONT_END_URL,"VERIFYLINK":process.env.FRONT_END_URL+'/forgotpassword?status=pending&email='+email+'&token='+token, "NAME": `${NAME} ${LAST_NAME}`};
            helpers.sendEmail([email],
              `[Mootverse] Password Reset Request`,
              'passwordreset', data);
          }
          else {
            data = {"URL":process.env.FRONT_END_URL,"VERIFYLINK":process.env.FRONT_END_URL+'/verify?status=pending&email='+email+'&token='+token, "NAME": `${NAME} ${LAST_NAME}`};
            helpers.sendEmail([email],
              `[Mootverse] Verify your email address`,
              'verification',data);
          }

          res.status(200).json(helpers.response("200", "success", "Please check your Mailbox!"));

        }
        else {
          res.status(200).json(helpers.response("200", "error", "Something went wrong!"));

        }

      }
      else{
        res.status(200).json(helpers.response("200", "error", "User Not Found!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }

  }
  catch (e) {
    console.log("hhh", e)
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }

};

user.forgotPassword = async (req,res) => {
  try{
    let payload = req.body;
    let password = typeof (payload.PASSWORD) === "string" && payload.PASSWORD.trim().length > 0 ? payload.PASSWORD : false;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let token = typeof (payload.TOKEN) === "string" && payload.TOKEN.trim().length > 0? payload.TOKEN : false;

    if(email && token && password){
      let userDetails = await userModel.getDetail(req, email);
      if(userDetails != null){
        if(token==userDetails.REMEMBER_TOKEN){
          //change password
          let result = await userModel.updatePassword(email,md5(password));
          if(result){
            res.status(200).json(helpers.response("200", "success", "Your password has been changed successfully! Please login now!"));
          }
        }
        else{
          res.status(200).json(helpers.response("200", "error", "Your token has expired!"));
        }
      }
      else{
        res.status(200).json(helpers.response("200", "error", "Your Email address doesn't exists."));
      }

    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }


};

user.getAllUsers = async (req,res) => {
  try {
    let skip = req.query.skip ? req.query.skip : 0;
    let take = req.query.take ? req.query.take : 50;
    let filters = typeof (req.body.filters) === "object" ? req.body.filters : [];
    let data = await userModel.getAll(req,skip,take,filters);
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

user.updateUser = async (req,res) => {
  try{
    let payload = req.body;
    let firstName = typeof (payload.FIRST_NAME) === "string" && payload.FIRST_NAME.trim().length > 0? payload.FIRST_NAME : false;
    let lastName = typeof (payload.LAST_NAME) === "string" && payload.LAST_NAME.trim().length > 0? payload.LAST_NAME : false;
    let password = typeof (payload.PASSWORD) === "string" && payload.PASSWORD.trim().length > 0 ? payload.PASSWORD : false;
    let email = typeof (payload.EMAIL) === "string" && payload.EMAIL.trim().length > 0 ? payload.EMAIL : false;
    let status = typeof (payload.STATUS) === "string" && payload.STATUS.trim().length > 0 ? payload.STATUS : false;
    let id = typeof (payload.ID) === "string" && payload.ID.trim().length > 0 ? payload.ID : false;
    let mobile = typeof (payload.MOBILE) === "string" && payload.MOBILE.trim().length > 0? payload.MOBILE : null;
    if(id){
      let a=0;
      let userDetails = await userModel.getDetailById(id);
      if(userDetails != null){
        let result = await userModel.updateUserData(req,req.body);
        if(result){
          res.status(200).json(helpers.response("200", "success", "Your profile has been changed successfully!"));
        }
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }


};

user.updatePassword = async (req,res) => {
  try{
    let payload = req.body;
    let password = typeof (payload.PASSWORD) === "string" && payload.PASSWORD.trim().length > 0 ? payload.PASSWORD : false;
    let currentPassword = typeof (payload.CURRENT_PASSWORD) === "string" && payload.CURRENT_PASSWORD.trim().length > 0 ? payload.CURRENT_PASSWORD : false;
    let id = typeof (payload.ID) === "string" && payload.ID.trim().length > 0 ? payload.ID : false;
    if(id){
      let a=0;
      let userDetails = await userModel.getDetailById(id);
      if(userDetails.PASSWORD != md5(currentPassword)){
        res.status(200).json(helpers.response("200", "error", "Your current password doesn't match!"));
        return;
      }
      if(userDetails != null){
        delete req.body.CURRENT_PASSWORD;
        let result = await userModel.updateUserData(req,req.body);
        if(result){
          res.status(200).json(helpers.response("200", "success", "Your password has been changed successfully!"));
        }
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }


};

user.updateImage = async (req,res) => {
  try{
    let payload = req.body;
    let image = typeof (payload.IMAGE) === "string" && payload.IMAGE.trim().length > 0 ? payload.IMAGE : false;
    let currentPassword = typeof (payload.CURRENT_PASSWORD) === "string" && payload.CURRENT_PASSWORD.trim().length > 0 ? payload.CURRENT_PASSWORD : false;
    let id = typeof (payload.ID) === "string" && payload.ID.trim().length > 0 ? payload.ID : false;
    if(id){
      let userDetails = await userModel.getDetailById(id);
      if(userDetails != null){
        let result = await userModel.updateUserData(req,req.body);
        if(result){
          res.status(200).json(helpers.response("200", "success", "Your Image has been changed successfully!"));
        }
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }


};

user.updatePushToken = async (req,res) => {
  try{
    let payload = req.body;
    const userID = req.mwValue.auth.ID;
    let push_token = typeof (payload.PUSHTOKEN) === "string" && payload.PUSHTOKEN.trim().length > 0 ? payload.PUSHTOKEN : false;
    if(push_token){
      let status = await userModel.updatePushToken(userID, push_token);
      if(status != null){
        return res.status(200).json(helpers.response("200", "success", "Your Push Token has been changed successfully!"));
      } else {
        return res.status(400).json(helpers.response("400", "error", "Something went wrong."));
      }
    }
    else{
      return res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    return res.status(400).json(helpers.response("400", "error", "Something went wrong.", e.message));
  }
};

user.deleteUser = async (req,res) => {
  try{
    const userID = req.mwValue.auth.ID;
    await userModel.deleteUser(userID);
    return res.status(200).json(helpers.response("200", "success", "User Account deleted successfully!"));
  } catch (e) {
    return res.status(400).json(helpers.response("400", "error", "Something went wrong.", e.message));
  }
};

user.refreshTokens = async (req,res) => {
  try {
    const user = await userModel.verifyToken(req.body.refreshToken);
    if (!user) {
      return res.status(200).json(helpers.response("200", "success", "User not found"));
    }
    const tokens = await userModel.generateAuthTokens(user);
    if (tokens != null) {
      res.status(200).json(helpers.response("200", "success", "Fetch Successful", tokens));
    }
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }
};

user.logout = async (req,res) => {
  try {
    await userModel.logout(req.body.refreshToken);
    res.status(204).json(helpers.response("204"));
  }
  catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong."));
  }
};

user.updateProfilePic = async (req,res) => {
  const { buffer, mimetype } = req.file;

  try{
    const filename = uniqid() + '.jpg';

    await sharp(buffer)
    .jpeg({ mozjpeg: true, quality: 70 })
    .toFile("./files/" + filename);

      let dataset = {
        ID: uniqid(),
        PATH:filename,
        MIME_TYPE:mimetype 
      }; 

     await fileModel.createFile(req,dataset);
    
    let payload = req.body;
    payload.IMAGE = "https://api.pactnuel.com/" + dataset.PATH;
    payload.ID = req.mwValue.auth.ID;
        const result = await knex('c_user').where({
          ID: payload.ID
        }).update({
          IMAGE: payload.IMAGE 
        });
        if(result){
          res.status(200).json(helpers.response("200", "success", "Your Image has been changed successfully!"));
        }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch (e) {
    res.status(400).json(helpers.response("400", "error", "Something went wrong.",e.message));
  }
};




//POST AUTH
/**
 *
 *
 * @param tokenObj
 * @returns {Promise<any>}
 */
user.postAuth = (tokenObj) => {
  return new Promise((resolve,reject) => {
    try{
      const updatedTokenObj = tokenObj;
      /**
       * Code here | override updatedTokenObj with your new logic & update this variable
       */
      delete updatedTokenObj.password;
      resolve(helpers.promiseResponse(true,updatedTokenObj)); //(code,status,message,data="")
    }catch(e){
      reject(helpers.promiseResponse(false));
    }
  });
};

export default user;

