const AllexamRoute = require("express").Router();
const AllexamController = require("../../controllers/school/Allexam.controller");
const auth = require("../../Middlewares/userauth");

AllexamRoute.get("/", auth, AllexamController.getAllExam);

AllexamRoute.get("/master", auth, AllexamController.getMaster);

AllexamRoute.get("/category", AllexamController.getCategory);

AllexamRoute.get("/chapterlist/:sub_id", auth, AllexamController.getChapterList);

AllexamRoute.get("/chapterlist/topicwise/:sub_id", auth, AllexamController.getTopicWiseTest);

AllexamRoute.get("/chapterwiseexam/:chapter_id", auth, AllexamController.getChapterWise);

AllexamRoute.get("/typewiseexam/:types_id", auth, AllexamController.getTypeWise);

AllexamRoute.get("/homecategory", AllexamController.getHomeCategory);

AllexamRoute.get("/chapterlistall/:chapter_id", auth, AllexamController.getChapterWiseList);

AllexamRoute.get("/allexamcategory", AllexamController.getAllExamCategory);

//-------------------------- Exam Main Category Route End -----------------------------------//

module.exports = AllexamRoute;
