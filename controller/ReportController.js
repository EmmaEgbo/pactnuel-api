import helpers from "../helpers";
import { config } from "dotenv";
import reportModel from '../model/reportModel';

config();

let blogReport = {};

blogReport.reportBlog  = async (req,res) => {
  const { id } = req.params;
  const { TYPE } = req.body;

  console.log(TYPE);

  try{
    let payload = req.params;
    payload.USER_ID = req.mwValue.auth.ID;
    payload.BLOG_ID = id;
    payload.TYPE = TYPE;

    const blog_id = typeof (id) === "string" && id.trim().length > 0? id : false;
    const report_type = typeof (TYPE) === "string" && TYPE.trim().length > 0? TYPE : false;

    // validation
    if(blog_id && report_type) {
      const blogReportDetails = await reportModel.reportBlog(payload);
      if(blogReportDetails == null){
        res.status(200).json(helpers.response("200", "error", "Database Error!"));
      }
      else{
        res.status(201).json(helpers.response("201", "success", "Blog Report Added!"));
      }
    }
    else{
      res.status(200).json(helpers.response("200", "error", "Validation Error!"));
    }
  }catch(e){
    res.status(500).json(helpers.response("500", "error", "Something went wrong"));
  }
};

blogReport.getAllReports = async (req,res) => {
  const page = req.query.page ? req.query.page : 1;
  const size = req.query.size ? req.query.size : 10;
  try {
    let data = await reportModel.getAllReports(page, size);
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

export default blogReport;

