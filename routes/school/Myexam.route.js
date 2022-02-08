const MyExamRoute = require("express").Router();
const MyexamController = require("../../controllers/school/Myexam.controller");
const auth = require("../../Middlewares/userauth");

MyExamRoute.get("/", auth, MyexamController.getAllExam);

MyExamRoute.get("/master", auth, MyexamController.getMaster);

MyExamRoute.get("/category/:master_id", auth, MyexamController.getCategory);

MyExamRoute.get("/chapterlist/:sub_id", auth, MyexamController.getChapterList);

MyExamRoute.get("/chapterlist/topicwise/:sub_id", auth, MyexamController.getTopicWiseTest);

MyExamRoute.get("/chapterwiseexam/:chapter_id", auth, MyexamController.getChapterWise);

MyExamRoute.get("/typewiseexam/:types_id", auth, MyexamController.getTypeWise);

MyExamRoute.get("/homecategory", MyexamController.getHomeCategory);

MyExamRoute.get("/chapterlistall/:chapter_id", auth, MyexamController.getChapterWiseList);

MyExamRoute.get("/allexamcategory", auth, MyexamController.getAllExamCategory);

//-------------------------- Exam Main Category Route End -----------------------------------//

module.exports = MyExamRoute;
