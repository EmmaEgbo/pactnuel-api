import helpers from "./../helpers";

import {knex} from "../config/config";

let middleware = {};

middleware.checkFormatKey = (req, res, next) => {
  let _format = typeof(req.query._format) === "string" && req.query._format === "json" && typeof(req.body) === "object" ? req.query._format : false;
  if(_format){
    next();
  }else{
    res.status(403).json({"message" : "check the api route"});
  }
};

// middleware to format data if string | quote issue | for sql injection
middleware.refineData = (req, res, next) =>{
  try {
    // not required |  nor tested
    /*if (Object.keys(req.headers).length > 0) {
      req.headers = middleware._refineFactory(req.headers);
    }*/
    /*  if (Object.keys(req.params).length > 0) {
      req.params = middleware._refineFactory(req.params);
    }*/

    if (Object.keys(JSON.parse(req.query.input)).length > 0) {
      req.query.input = JSON.stringify(middleware._refineFactory(JSON.parse(req.query.input)));
    }

    next();
  }catch (e) {
    res.status(500).json({"message" : `error | middleware.refineData | ${e.toString()}`});
  }
};

middleware._refineFactory = (object) =>{
  for (let property in object) {
    if (object.hasOwnProperty(property)) {
      if (typeof object[property] == "object"){
        middleware._refineFactory(object[property]);
      }else{
        if(typeof object[property] === "string"){
          object[property] = object[property].replace(/\'/g, "\\\'");
          object[property] = object[property].replace(/\"/g, "\\\"");
        }
      }
    }
  }
  return object;
};

middleware.checkUserAuth = (req, res, next) => {
  try{
    let token = typeof (req.headers.authorization.split(" ")) === "object" && req.headers.authorization.split(" ").length === 2 ? req.headers.authorization.split(" ") : false;
    if(token){
      helpers.verifyToken(token[1],(err, tokenData) =>{
        if(!err && tokenData){
          req.mwValue = {};
          req.mwValue.auth = tokenData.sub;
          next();
        }
        else{
          res.status(403).json(helpers.response("403","error","User Unauthorized"));
        }
      });
    }else{
      res.status(403).json(helpers.response("403","error","Token not valid"));
    }
  }
  catch (err) {
    res.status(403).json(helpers.response("403","error","Token not valid", err.message));
  }
};

middleware.checkUserCourseRole = async (req, res, next) => {
  try{
    let auth = req.mwValue.auth;
    let courseId = false;
    if(req.headers.hasOwnProperty("courseid") && typeof(req.headers.courseid) === "string" && !isNaN(req.headers.courseid)){
      courseId = parseInt(req.headers.courseid);
    }
    let accessRole = false;
    if(req.headers.hasOwnProperty("accessrole") && typeof(req.headers.accessrole) === "string" && !isNaN(req.headers.accessrole)){
      accessRole = parseInt(req.headers.accessrole);
    }
    let paramsCourseId = false;
    if(req.params.hasOwnProperty("courseId") && typeof(req.params.courseId) === "string" && !isNaN(req.params.courseId)){
      paramsCourseId = parseInt(req.params.courseId);
    }

    if(req.query.hasOwnProperty("courseId") && helpers.validArray([JSON.parse(req.query.courseId)],"number")){
      paramsCourseId = JSON.parse(req.query.courseId);
    }
    if(req.body.hasOwnProperty("courseId") && helpers.validArray([req.body.courseId],"number")){
      paramsCourseId = req.body.courseId;
    }

    if(courseId && accessRole){
      let queryObj = {
        table_name : "rp_user_course",
        data : ["user_course_id as userCourseId"] ,
        cond : [{field : "user_id", opt : "=", value : auth.id , type:"AND"}, {field : "role_id", opt : "=", value : accessRole , type:"AND"}, {field : "course_id", opt : "=", value : courseId , type:"AND"}]
      };

      let courseStatus = await helpers.checkEntityId("rp_course", courseId, "course_id");
      let roleStatus = await helpers.checkEntityId("rp_roles", accessRole, "role_id");

      if (courseStatus.status && roleStatus.status) {
        knex.raw("CALL SelectData(?)", [JSON.stringify(queryObj)])
          .then((resp) => {
            let qResp = JSON.parse(resp[0][1][0].response);
            let rows = resp[0][0];
            if (qResp.status === "success" && rows.length > 0 ) {
              if (paramsCourseId){
                if(paramsCourseId === courseId){
                  next();
                } else {
                  res.status(200).json(helpers.response("200", "error", "Access Denied!"));
                }
              } else {
                next();
              }
            }else if(qResp.status === "success" && rows.length === 0){
              res.status(200).json(helpers.response("200", "error", "Access Denied!"));
            }else{
              res.status(200).json(helpers.response("200", "error", "Access Denied!"));
            }
          })
          .catch((e) => {
            res.status(500).json(helpers.response("500", "error", "Something went wrong", e));
          });
      } else {
        res.status(200).json(helpers.response("200", "error", "Invalid role or course!"));
      }
    } else {
      res.status(200).json(helpers.response("200", "error", "Access Denied!"));
    }
  }
  catch (err) {
    res.status(400).json(helpers.response("400","error","Bad request"));
  }
};

middleware.adjustUserAuth = (req, res, next) =>{
  try{
    if(req.headers.hasOwnProperty("authorization")) {
      let token = typeof (req.headers.authorization.split(" ")) === "object" && req.headers.authorization.split(" ").length === 2 ? req.headers.authorization.split(" ") : false;
      if (token) {
        helpers.verifyToken(token[1], (err, tokenData) => {
          if (!err && tokenData) {
            req.mwValue = {};
            req.mwValue.auth = tokenData.sub;
            next();
          } else {
            res.status(403).json(helpers.response("403", "error", "User Unauthorized"));
          }
        });
      } else {
        res.status(403).json(helpers.response("403", "error", "Token not valid"));
      }
    }else{
      req.mwValue = {};
      req.mwValue.auth = {};
      req.mwValue.auth.id = 0;
      next();
    }
  }
  catch (err) {
    res.status(403).json(helpers.response("403","error","Token not valid", err.message));
  }
};


export default middleware;
