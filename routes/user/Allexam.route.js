const AllexamRoute = require("express").Router();
const AllexamController = require("../../controllers/user/Allexam.controller");
const auth = require("../../Middlewares/userauth");

AllexamRoute.get("/", auth, AllexamController.getAllExam);

AllexamRoute.get("/master", auth, AllexamController.getMaster);

AllexamRoute.get("/category/:master_id", auth, AllexamController.getCategory);

AllexamRoute.get("/chapterlist/:sub_id", auth, AllexamController.getChapterList);

AllexamRoute.get("/chapterlist/topicwise/:sub_id", auth, AllexamController.getTopicWiseTest);

AllexamRoute.get("/chapterwiseexam/:chapter_id", auth, AllexamController.getChapterWise);

AllexamRoute.get("/typewiseexam/:types_id", auth, AllexamController.getTypeWise);

AllexamRoute.get("/chapterlistall/:chapter_id", auth, AllexamController.getChapterWiseList);

AllexamRoute.get("/homecategory", AllexamController.getHomeCategory);

AllexamRoute.get("/allcategory", AllexamController.getAllCategory);

AllexamRoute.get("/allexamcategory", AllexamController.getAllExamCategory);

AllexamRoute.get("/allpaidtest/:subid", AllexamController.getAllPaidTest);

AllexamRoute.post("/getduration", AllexamController.getDurationById);

AllexamRoute.get("/getprice/:packageId", AllexamController.getPriceByDuration);

AllexamRoute.get("/getallpayments", auth, AllexamController.getAllPayments);

AllexamRoute.get("/getsubpaidstatus/:subid", auth, AllexamController.getSubPaidStatus);

AllexamRoute.get("/getchapterpaidstatus/:chapid", auth, AllexamController.getChapterPaidStatus);

//-------------------------- Exam Main Category Route End -----------------------------------//

module.exports = AllexamRoute;
