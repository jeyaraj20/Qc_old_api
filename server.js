// Third Party Plugins
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const morgan = require("morgan");
const createError = require("http-errors");
const path = require("path");
const fs = require("fs");
const rfs = require("rotating-file-stream");
const socketIo = require("socket.io");
require("dotenv").config();

// Express Application
const app = express();
app.use(helmet());

// Ensure images directory exists
var imagesDirectory = path.join(__dirname, "./public/images/");
fs.existsSync(imagesDirectory) || fs.mkdirSync(imagesDirectory);

// Set Public Access to 'public' folder
app.use(express.static("public"));

// Cross-Origin Resource Sharing (Allow Cross domain Communiction)
app.use(cors());

// Log all Request and Response
app.use(morgan("dev"));

// Third Party Middleware ( Create Log File )
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
// ensure log directory exists
var logDirectory = path.join(process.env.accessLog);
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
var accessLogStream = rfs.createStream("access.log", {
    interval: "1d", // rotate daily
    path: logDirectory,
});

morgan.token("date", (req, res, tz) => {
    return moment().tz(tz).format();
});
morgan.format(
    "myformat",
    '[:date[Asia/Kolkatta]] ":method :url" :status :res[content-length] - :response-time ms'
);

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
// Body parser middleware that only parses JSON
app.use(bodyParser.json({ limit: "3000mb" }));
app.use(bodyParser.urlencoded({ limit: "3000mb", extended: true }));

//  Routing - Admin APIs'
app.use("/api/login", require("./routes/Login.route"));
app.use("/api/homecategory", require("./routes/HomeCategory.route"));
app.use("/api/dashboarddategory", require("./routes/DashboardCategory.route"));
app.use("/api/exammaincategory", require("./routes/ExamMainCategory.route"));
app.use("/api/examsubcategory", require("./routes/ExamSubCategory.route"));
app.use("/api/category", require("./routes/Category.route"));
app.use("/api/subcategory", require("./routes/SubCategory.route"));
app.use("/api/question", require("./routes/Question.route"));
app.use("/api/location", require("./routes/Location.route"));
app.use("/api/operator", require("./routes/Operator.route"));
app.use("/api/adminmenu", require("./routes/Adminmenu.route"));
app.use("/api/student", require("./routes/Student.route"));
app.use("/api/settings", require("./routes/Settings.route"));
app.use("/api/exam", require("./routes/Exam.route"));
app.use("/api/examquestion", require("./routes/Examquestion.route"));
app.use("/api/reports", require("./routes/reports.route"));
app.use("/api/exampackage", require("./routes/ExamPackage.route"));
app.use("/api/coupon", require("./routes/Coupon.route"));
app.use("/api/image", require("./routes/Image.route"));
app.use("/api/notes", require("./routes/Notes.route"));
app.use("/api/videos", require("./routes/Videos.route"));

// Routing - School APIs'
app.use("/api/school/operator", require("./routes/SchoolOperator.route"));
app.use("/api/school", require("./routes/School.route"));
app.use("/api/school/category", require("./routes/SchoolCategory.route"));
app.use("/api/school/exammaincategory", require("./routes/SchoolExamMainCategory.route"));
app.use("/api/school/examsubcategory", require("./routes/SchoolExamSubCategory.route"));
app.use("/api/school/exam", require("./routes/SchoolExam.route"));
app.use("/api/school/examquestion", require("./routes/SchoolExamquestion.route"));
app.use("/api/school/student", require("./routes/SchoolStudent.route"));
app.use("/api/school/staffassign", require("./routes/SchoolStaffAssign.route"));
app.use("/api/school/subcategory", require("./routes/SchoolSubCategory.route"));
app.use("/api/school/question", require("./routes/SchoolQuestion.route"));
app.use("/api/school/reports", require("./routes/SchoolReports.route"));
app.use("/api/school/qcexamcategory", require("./routes/QCExamCategory.route"));

// Routing - User APIs'
app.use("/userapi/allexam", require("./routes/user/Allexam.route"));
app.use("/userapi/login", require("./routes/user/Login.route"));
app.use("/userapi/exam", require("./routes/user/Exam.route"));
app.use("/userapi/dashboard", require("./routes/user/Dashboard.route"));
app.use("/userapi/payment", require("./routes/user/Payment.route"));
app.use("/userapi/cart", require("./routes/user/Cart.route"));

// Routing - School User APIs'
app.use("/userapi/school/allexam", require("./routes/school/Allexam.route"));
app.use("/userapi/school/myexam", require("./routes/school/Myexam.route"));
app.use("/userapi/school/exam", require("./routes/school/Exam.route"));
app.use("/userapi/school/newexam", require("./routes/school/ExamNew.route"));
app.use("/userapi/school/dashboard", require("./routes/school/Dashboard.route"));

// Routing - Utility APIs'
app.use("/api/util", require("./routes/Util.route"));

// Image Serving API's
app.use("/homecategory", express.static(path.join(__dirname, "public/images/homecategory")));
app.use("/exammaincategory", express.static(path.join(__dirname, "public/images/exammaincategory")));
app.use(
    "/schoolexammaincategory",
    express.static(path.join(__dirname, "public/images/schoolexammaincategory"))
);
app.use("/questions", express.static(path.join(__dirname, "public/images/questions")));
app.use("/schoolquestions", express.static(path.join(__dirname, "public/images/schoolquestions")));
app.use("/schools", express.static(path.join(__dirname, "public/images/schools")));
app.use("/settings", express.static(path.join(__dirname, "public/images/logo")));
app.use("/profiles", express.static(path.join(__dirname, "public/images/profiles")));

// PDF Serving APIs'
app.use("/exam-calender", express.static(path.join(__dirname, "public/examcalender.pdf")));

// Error handling Part
// 1. Route Not Found Error
app.use(async(req, res, next) => {
    next(createError.NotFound());
});

// 2. Error thrown method
app.use(async(err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

// Unhandled Exception
process.on("uncaughtException", function(error) {
    console.log("uncaughtException", error.stack);
});

const server = http.createServer(app);

// Socket IO connection
const io = socketIo(server, {
    transports: ['polling'],
    cors: {
        cors: {
            origin: process.env.ORIGIN
        }
    }
})

io.on('connection', (socket) => {
    console.log('A user is connected');

    socket.on('message', (message) => {
        console.log(`message from ${socket.id} : ${message}`);
    })

    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);
    })
})

global.io = io;

//  Server Port
const PORT = process.env.PORT || 4200;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});