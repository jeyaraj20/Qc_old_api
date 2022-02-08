# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 15.207.47.132 (MySQL 5.7.31-0ubuntu0.18.04.1)
# Database: question_cloud
# Generation Time: 2020-08-31 08:42:20 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table tbl__school
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__school`;

CREATE TABLE `tbl__school` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schoolName` varchar(255) DEFAULT NULL,
  `schoolLogo` varchar(255) DEFAULT NULL,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `phoneNumber` int(11) DEFAULT NULL,
  `emailId` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `mobileNumber` int(11) DEFAULT NULL,
  `totalStudents` bigint(20) DEFAULT NULL,
  `schoolStatus` enum('D','N','Y') DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `createdTimestamp` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedBy` int(11) DEFAULT NULL,
  `updatedTimestamp` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `tbl__school` WRITE;
/*!40000 ALTER TABLE `tbl__school` DISABLE KEYS */;

INSERT INTO `tbl__school` (`id`, `schoolName`, `schoolLogo`, `address1`, `address2`, `phoneNumber`, `emailId`, `password`, `contactPerson`, `mobileNumber`, `totalStudents`, `schoolStatus`, `ipAddress`, `createdBy`, `createdTimestamp`, `updatedBy`, `updatedTimestamp`)
VALUES
	(1,'Sample Updated','file-1596042992354.png','Near Shop','Main Road Edit',987654321,'sample@gmail.com','aHdhQCRhZG1pbg==','Manager',2147483647,9080,'Y','127.0.0.1',1,'2020-08-18 21:05:12',1,'2020-08-18 21:05:12'),
	(2,'TestingUpdated','file-1596043019834.png','Near Shop Testing','Main Road Test',2147483647,'sample1@gmail.com','c2FtcGxlQDIwMjA=','Manager',2147483647,9080,'Y','127.0.0.1',1,'2020-08-10 02:09:44',1,'2020-08-10 02:09:44'),
	(3,'Sample','file-1596128743348.png','Near Shop','Main Road',987654321,'sample234@gmail.com','c2FtcGxlQDIwMjA=','Manager',2147483647,908,'Y','127.0.0.1',1,'2020-08-10 02:09:47',NULL,'2020-08-10 02:09:47'),
	(4,'jsdf','file-1596202085688.jpg','north','south',2147483647,'mani@gmail.com','a2poeXU2NzU=','maninegali',2147483647,253,'D','127.0.01',1,'2020-08-06 23:42:57',NULL,'2020-08-06 23:42:57'),
	(5,'ghfvh','file-1596383992764.jpg','jkgyuiui','hjgutyui',2147483647,'mani@gmail.cmo','NzZoamdq','uuiyyiuou',867577968,256,'D','127.0.01',1,'2020-08-05 17:14:48',NULL,'2020-08-05 17:14:48'),
	(6,'K.V.S.Hr.Sec.School','file-1596452661733.jpg','Madurai Road','Near Kamarajar memorial',4562,'kvssech','MTIzNDU2','Dhanasekaran',994459815,1000,'Y','127.0.01',1,'2020-08-06 23:42:08',NULL,'2020-08-06 23:42:08'),
	(7,'hjgyu','file-1596471450050.jpg','ihubkj','nmbjhn',2147483647,'mbnjmkb,','aGpmdXlqaA==',',mbvgjjhvk',2147483647,1568,'Y','127.0.01',1,'2020-08-06 23:42:08',NULL,'2020-08-06 23:42:08'),
	(8,'K.V.S.Hr.Sec.School','file-1596617576645.jpeg','Madurai Road','Near Kamarajar Memorial',2147483647,'KVSHR@gmail.com','OTk0NDU5ODE1MA==','Dhanasekaran',2147483647,3000,'Y','127.0.01',1,'2020-08-06 23:42:08',NULL,'2020-08-06 23:42:08'),
	(9,'Noble Matriculation','file-1596617693429.jpg','57,Samiyarkinatrustreet','Near Rajalakshmi theater',2147483647,'noblematric@gmail.com','OTk0NDU5ODE1MA==','Noble ',2147483647,2000,'Y','127.0.01',1,'2020-08-06 23:42:08',NULL,'2020-08-06 23:42:08'),
	(10,'R.J.Mantra School','file-1596736089191.jpeg','Virudhunagar','Virudhunagar',987655678,'rjm@gmail.com','cmptMTIz','Murugan',123456789,500,'Y','127.0.01',1,'2020-08-07 12:48:01',NULL,'2020-08-07 12:48:01'),
	(11,'fgbfffhfdhfgbbb','file-1596783597906.jpg','njhbuytgh','nmsbdvgusyhj',2147483647,'rathi@gmail.com','amlnNzc4','dfgg',2147483647,456,'Y','127.0.01',1,'2020-08-07 12:29:59',NULL,NULL),
	(12,'ff','file-1596784492647.jpg','fgh','fhhfh',2147483647,'ghffhfhf@gmail.com','bWFuaW0zNA==','vbfgffb',2147483647,523,'Y','127.0.01',1,'2020-08-07 12:44:53',NULL,NULL),
	(13,'dgg','file-1596785313914.jpg','dfgg','dbdh',975646466,'ryfy@gmail.com','ZGpnaHU3OA==','mnajsd',2147483647,152,'Y','127.0.01',1,'2020-08-07 12:58:37',NULL,NULL),
	(14,'uytgiu','file-1596790412384.jpg','jhgj','haioid',2147483647,'mani@gmail.com','aGp2Z2Joa2o4Nw==','jhgu',975214632,253,'Y','127.0.01',1,'2020-08-07 14:23:36',NULL,NULL),
	(15,'jbhk','file-1596790812499.jpg','kg','hjgj',2147483647,'mani@gmail.com','Ym5qNzY4','kjghb',2147483647,256,'Y','127.0.01',1,'2020-08-07 14:30:13',NULL,NULL),
	(16,'Sample Updated 2','file-1597048276674.jpg','Near Shop','Main Road Edit',987654321,'sample@gmail.com','YUhkaFFDUmhaRzFwYmc9PQ==','Manager',2147483647,9080,'N','127.0.0.1',1,'2020-08-10 14:04:25',1,'2020-08-10 14:04:25'),
	(17,'Anna University','file-1597156010567.jpeg','test','test',2147483647,'venkat245015@gmail.com','MTIzNDU2','Venkatesh',2147483647,50,'Y','127.0.01',1,'2020-08-11 19:56:51',NULL,NULL);

/*!40000 ALTER TABLE `tbl__school` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__school_exam_category
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__school_exam_category`;

CREATE TABLE `tbl__school_exam_category` (
  `exa_cat_id` int(10) NOT NULL AUTO_INCREMENT,
  `exaid` int(10) NOT NULL,
  `schoolid` int(10) NOT NULL,
  `exaid_sub` int(15) NOT NULL,
  `examcat_type` enum('M','C','S') NOT NULL,
  `exa_cat_name` varchar(200) NOT NULL,
  `exa_cat_slug` varchar(250) NOT NULL,
  `exa_cat_desc` varchar(250) NOT NULL,
  `exa_cat_image` varchar(250) NOT NULL,
  `exa_cat_pos` int(10) NOT NULL,
  `exa_cat_status` enum('Y','N','D') NOT NULL,
  `exa_cat_dt` datetime NOT NULL,
  `exa_cat_lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`exa_cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `tbl__school_exam_category` WRITE;
/*!40000 ALTER TABLE `tbl__school_exam_category` DISABLE KEYS */;

INSERT INTO `tbl__school_exam_category` (`exa_cat_id`, `exaid`, `schoolid`, `exaid_sub`, `examcat_type`, `exa_cat_name`, `exa_cat_slug`, `exa_cat_desc`, `exa_cat_image`, `exa_cat_pos`, `exa_cat_status`, `exa_cat_dt`, `exa_cat_lastupdate`)
VALUES
	(1,1,1,1,'M','fdf','fdf','fhfhfjf','file-1596811257661.jpg',0,'Y','2020-08-07 14:40:57','2020-08-07 20:10:57'),
	(2,0,1,1,'M','fdf','fdf','','file-1596810724136.jpg',1,'N','2020-08-07 14:32:04','2020-08-07 20:02:04'),
	(3,1,1,0,'C','vdfd','vdfd','','file-1596810843867.jpg',1,'Y','2020-08-07 14:34:03','2020-08-07 20:04:03'),
	(4,112,1,147,'S','gd','science','ghjgjfj','',0,'Y','2020-08-08 07:28:22','2020-08-08 12:58:22'),
	(5,112,1,147,'S','hgtjuyguihk','science','','',0,'Y','2020-08-08 07:27:23','2020-08-08 12:57:23'),
	(6,0,1,0,'M','Main One','main-one','Main Cat','file-1597070790980.png',3,'Y','2020-08-10 14:46:30','2020-08-10 20:16:30'),
	(7,0,0,1,'M','ssd','ssd','','',0,'Y','0000-00-00 00:00:00','2020-08-10 20:36:26'),
	(8,6,1,0,'C','Test','test','test','file-1597072047406.png',6,'Y','2020-08-10 15:07:27','2020-08-10 20:37:27'),
	(9,0,0,0,'M','sdsd','sdsd','','',0,'Y','0000-00-00 00:00:00','2020-08-10 20:38:00'),
	(10,0,1,1,'M','fsgg','sggg','fhfhfjf12','file-1597073578582.png',1,'N','2020-08-10 15:32:58','2020-08-10 21:02:58'),
	(11,6,1,8,'S','Check','check','new check','',0,'Y','2020-08-10 17:49:50','2020-08-10 23:19:50'),
	(12,6,1,8,'S','Cycle Test I','cycle-test-i','the test','',0,'Y','2020-08-11 12:44:09','2020-08-11 18:14:09'),
	(13,0,17,0,'M','B.E-CSE','b.e-cse','CSE Examination','file-1597156968426.jpeg',1,'Y','2020-08-11 14:42:48','2020-08-11 20:12:48'),
	(14,13,17,0,'C','Data Structure','data-structure','Data Structure - First Year','file-1597157031612.jpeg',2,'Y','2020-08-11 14:43:51','2020-08-11 20:13:51'),
	(15,6,1,8,'S','testing','testing','Some Description','',0,'Y','2020-08-12 08:19:50','2020-08-12 13:49:50'),
	(16,0,1,0,'M','Mid Term','testing','Some Description','',0,'Y','0000-00-00 00:00:00','2020-08-20 15:00:55'),
	(17,0,1,0,'M','Cycle Test','New','Desc','',0,'Y','0000-00-00 00:00:00','2020-08-20 15:01:52'),
	(18,0,1,0,'M','Revision Exam','slug','desc','',0,'Y','0000-00-00 00:00:00','2020-08-20 15:02:18');

/*!40000 ALTER TABLE `tbl__school_exam_category` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__school_operator
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__school_operator`;

CREATE TABLE `tbl__school_operator` (
  `op_id` int(10) NOT NULL AUTO_INCREMENT,
  `op_name` varchar(250) NOT NULL,
  `op_uname` varchar(100) NOT NULL,
  `op_password` varchar(400) NOT NULL,
  `op_type` enum('O','A') NOT NULL,
  `feat_id` text NOT NULL,
  `op_dt` datetime NOT NULL,
  `op_status` enum('Y','N','D') NOT NULL,
  `op_lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `schoolid` int(10) DEFAULT NULL,
  PRIMARY KEY (`op_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `tbl__school_operator` WRITE;
/*!40000 ALTER TABLE `tbl__school_operator` DISABLE KEYS */;

INSERT INTO `tbl__school_operator` (`op_id`, `op_name`, `op_uname`, `op_password`, `op_type`, `feat_id`, `op_dt`, `op_status`, `op_lastupdate`, `schoolid`)
VALUES
	(1,'Venkatesh','venkat','aHdhQCRhZG1pbg==','O','4,5,5,4,5,4,2','2019-10-11 11:51:47','Y','2020-08-18 18:27:14',1),
	(2,'Dhanasekaran','dhana','aHdhQCRhZG1pbg==','A','3,4,2,5','2019-10-11 11:51:47','Y','2020-08-18 19:05:32',1),
	(3,'Dhana','dhana123','aHdhQCRhZG1pbg==','A','4,5','2020-08-10 13:07:19','Y','2020-08-17 12:50:11',17),
	(4,'New User','user1','bmV3cGFzcw==','A','4,5,8','2020-08-11 18:51:08','Y','2020-08-18 18:24:50',1),
	(5,'Venkatesh','venkat245015','MTIzNDU2','A','4,5,7,8','2020-08-11 19:41:23','Y','2020-08-12 01:11:23',17);

/*!40000 ALTER TABLE `tbl__school_operator` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__school_question_category
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__school_question_category`;

CREATE TABLE `tbl__school_question_category` (
  `cat_id` int(10) NOT NULL AUTO_INCREMENT,
  `pid` int(10) NOT NULL,
  `schoolid` int(10) NOT NULL,
  `cat_name` varchar(200) NOT NULL,
  `cat_slug` varchar(250) NOT NULL,
  `cat_code` varchar(250) NOT NULL,
  `cat_desc` varchar(250) NOT NULL,
  `cat_image` varchar(250) NOT NULL,
  `cat_pos` int(10) NOT NULL,
  `cat_status` enum('Y','N','D') NOT NULL,
  `cat_dt` datetime NOT NULL,
  `cat_lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `tbl__school_question_category` WRITE;
/*!40000 ALTER TABLE `tbl__school_question_category` DISABLE KEYS */;

INSERT INTO `tbl__school_question_category` (`cat_id`, `pid`, `schoolid`, `cat_name`, `cat_slug`, `cat_code`, `cat_desc`, `cat_image`, `cat_pos`, `cat_status`, `cat_dt`, `cat_lastupdate`)
VALUES
	(1,1,1,'Miscellaneous1','miscellaneous123','DFDJB','','',1,'Y','2020-08-06 14:59:57','2020-08-10 15:02:39'),
	(2,2,1,'english4','english12','DFDJB','fdggdg','',2,'Y','2020-08-06 15:15:04','2020-08-13 13:14:40'),
	(3,2,1,'english4','english12','DFDJB','fdggdg','',2,'Y','2020-08-06 15:24:34','2020-08-10 15:32:12'),
	(4,1,2,'english12','english12','IUTYUGH','','',2,'Y','2020-08-06 15:27:43','2020-08-08 15:51:12'),
	(5,0,1,'English Category','english-category','PORSDRC','','',1,'Y','2020-08-06 15:32:38','2020-08-13 12:10:12'),
	(6,0,1,'School1','school1','','','',3,'Y','2020-08-09 23:57:11','2020-08-10 23:12:00'),
	(7,0,1,'Miscellaneous123','miscellaneous123','','','',2,'Y','2020-08-10 05:14:28','2020-08-13 12:07:44'),
	(8,0,1,'tamil12','tamil','','','',4,'Y','2020-08-10 06:03:15','2020-08-13 12:07:44'),
	(9,0,1,'Unit Exam','unit-exam','','','',5,'Y','2020-08-10 13:31:37','2020-08-13 12:07:44'),
	(10,9,1,'Others','','OTEX','Test','',0,'D','2020-08-10 13:44:06','2020-08-10 20:01:28'),
	(11,7,1,'Sub Category Name','','EXAMSUB','Description','',0,'Y','2020-08-12 08:50:21','2020-08-12 14:20:21'),
	(12,0,1,'English Category1','english-category1','','','',6,'Y','2020-08-13 06:42:37','2020-08-13 12:22:37'),
	(13,0,17,'Test','test','','','',1,'Y','2020-08-14 21:08:37','2020-08-15 02:38:37'),
	(14,13,17,'Test1','','1234','test','',0,'Y','2020-08-14 21:08:58','2020-08-15 02:38:58');

/*!40000 ALTER TABLE `tbl__school_question_category` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__school_staffassign
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__school_staffassign`;

CREATE TABLE `tbl__school_staffassign` (
  `staffassign_id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `examcategory_id` text NOT NULL,
  PRIMARY KEY (`staffassign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `tbl__school_staffassign` WRITE;
/*!40000 ALTER TABLE `tbl__school_staffassign` DISABLE KEYS */;

INSERT INTO `tbl__school_staffassign` (`staffassign_id`, `school_id`, `staff_id`, `examcategory_id`)
VALUES
	(1,1,1,'17,18'),
	(2,1,2,'16,6'),
	(3,1,4,'18,16,6');

/*!40000 ALTER TABLE `tbl__school_staffassign` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__school_student
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__school_student`;

CREATE TABLE `tbl__school_student` (
  `stud_id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `stud_fname` varchar(250) COLLATE utf8_bin NOT NULL,
  `stud_lname` varchar(250) COLLATE utf8_bin NOT NULL,
  `stud_dob` date NOT NULL,
  `stud_regno` varchar(250) COLLATE utf8_bin NOT NULL,
  `stud_email` varchar(250) COLLATE utf8_bin NOT NULL,
  `stud_mobile` bigint(15) NOT NULL,
  `mob_otp` int(6) NOT NULL,
  `otp_status` enum('N','Y') COLLATE utf8_bin NOT NULL,
  `stud_image` varchar(500) COLLATE utf8_bin NOT NULL,
  `stud_gender` enum('MALE','FEMALE') COLLATE utf8_bin NOT NULL,
  `stud_pass` varchar(250) COLLATE utf8_bin NOT NULL,
  `edu_qual` text COLLATE utf8_bin NOT NULL,
  `med_opt` text COLLATE utf8_bin NOT NULL,
  `country_id` int(11) NOT NULL,
  `state_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `parent_name` varchar(250) COLLATE utf8_bin NOT NULL,
  `state` varchar(250) COLLATE utf8_bin NOT NULL,
  `district` varchar(250) COLLATE utf8_bin NOT NULL,
  `location` varchar(250) COLLATE utf8_bin NOT NULL,
  `address` text COLLATE utf8_bin NOT NULL,
  `pincode` int(11) NOT NULL,
  `parent_relation` varchar(250) COLLATE utf8_bin NOT NULL,
  `parent_mobile` int(11) NOT NULL,
  `stud_date` datetime NOT NULL,
  `stud_status` enum('W','Y','N','D') COLLATE utf8_bin NOT NULL,
  `ipaddress` varchar(250) COLLATE utf8_bin NOT NULL,
  `lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stud_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `tbl__school_student` WRITE;
/*!40000 ALTER TABLE `tbl__school_student` DISABLE KEYS */;

INSERT INTO `tbl__school_student` (`stud_id`, `school_id`, `category_id`, `stud_fname`, `stud_lname`, `stud_dob`, `stud_regno`, `stud_email`, `stud_mobile`, `mob_otp`, `otp_status`, `stud_image`, `stud_gender`, `stud_pass`, `edu_qual`, `med_opt`, `country_id`, `state_id`, `city_id`, `parent_name`, `state`, `district`, `location`, `address`, `pincode`, `parent_relation`, `parent_mobile`, `stud_date`, `stud_status`, `ipaddress`, `lastupdate`)
VALUES
	(26,1,0,X'4A6F686E',X'5065746572','0000-00-00',X'313233',X'6A6F686E40676D61696C2E636F6D',6374514587,1212,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 16:38:56',X'59',X'3135372E35302E39312E3937','2020-08-19 22:08:56'),
	(27,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:38:56',X'59',X'3135372E35302E39312E3937','2020-08-19 22:08:56'),
	(28,1,0,X'4A6F686E',X'5065746572','0000-00-00',X'313233',X'6A6F686E40676D61696C2E636F6D',6374514587,1212,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(29,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(30,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(31,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(32,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(33,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(34,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(35,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(36,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(37,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(38,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(39,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(40,1,0,X'4A6F7368',X'446F6E616C64','0000-00-00',X'32333635',X'4A6F736840676D61696C2E636F6D',9956458758,8265,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:40:57',X'59',X'3135372E35302E39312E3937','2020-08-19 22:10:57'),
	(41,1,0,X'4A6F686E',X'5065746572','0000-00-00',X'313233',X'6A6F686E40676D61696C2E636F6D',6374514587,1212,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 16:48:29',X'59',X'3135372E35302E39312E3937','2020-08-19 22:18:29'),
	(42,1,0,X'536D697468',X'4B616E65','0000-00-00',X'343635',X'736D69746840676D61696C2E636F6D',326544,2587,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:48:29',X'59',X'3135372E35302E39312E3937','2020-08-19 22:18:29'),
	(43,1,0,X'4A6F73686E61',X'4164616D','0000-00-00',X'373839',X'4A6F73686E6140676D61696C2E636F6D',78988,7848,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:48:29',X'59',X'3135372E35302E39312E3937','2020-08-19 22:18:29'),
	(44,1,0,X'457665',X'437269737469616E61','0000-00-00',X'343738',X'65766540676D61696C2E636F6D',458747,4879,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:48:29',X'59',X'3135372E35302E39312E3937','2020-08-19 22:18:29'),
	(45,1,0,X'4B6176696E',X'506F70','0000-00-00',X'313539',X'6B6176696E40676D61696C2E636F6D',1548484,4587,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:48:29',X'59',X'3135372E35302E39312E3937','2020-08-19 22:18:29'),
	(46,1,0,X'4461766964',X'4368726973','0000-00-00',X'383935',X'646176696440676D61696C2E636F6D',878554,7895,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',9,'2020-08-19 16:48:29',X'59',X'3135372E35302E39312E3937','2020-08-19 22:18:29'),
	(47,1,0,X'4D6174686577',X'44616E69656C','0000-00-00',X'323435303531',X'6D617468657740676D61696C2E636F6D',5898587,5687,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:08:18',X'59',X'3135372E35302E39312E3937','2020-08-19 23:38:18'),
	(48,1,0,X'42726F68697468',X'4C616C','1970-01-01',X'36353938',X'6C616C40676D61696C2E636F6D',547999,4875,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:08:18',X'59',X'3135372E35302E39312E3937','2020-08-19 23:38:18'),
	(49,1,0,X'4D6174686577',X'44616E69656C','0000-00-00',X'323435303531',X'6D617468657740676D61696C2E636F6D',5898587,5687,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:11:32',X'59',X'3135372E35302E39312E3937','2020-08-19 23:41:32'),
	(50,1,0,X'42726F68697468',X'4C616C','1970-01-01',X'36353938',X'6C616C40676D61696C2E636F6D',547999,4875,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:11:32',X'59',X'3135372E35302E39312E3937','2020-08-19 23:41:32'),
	(51,1,0,X'4D6174686577',X'44616E69656C','0000-00-00',X'323435303531',X'6D617468657740676D61696C2E636F6D',5898587,5687,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:13:39',X'59',X'3135372E35302E39312E3937','2020-08-19 23:43:39'),
	(52,1,0,X'42726F68697468',X'4C616C','1970-01-01',X'36353938',X'6C616C40676D61696C2E636F6D',547999,4875,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:13:39',X'59',X'3135372E35302E39312E3937','2020-08-19 23:43:39'),
	(53,1,6,X'4D6174686577',X'44616E69656C','0000-00-00',X'323435303531',X'6D617468657740676D61696C2E636F6D',5898587,5687,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:15:58',X'59',X'3135372E35302E39312E3937','2020-08-19 23:45:58'),
	(54,1,6,X'42726F68697468',X'4C616C','1970-01-01',X'36353938',X'6C616C40676D61696C2E636F6D',547999,4875,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:15:58',X'59',X'3135372E35302E39312E3937','2020-08-19 23:45:58'),
	(55,1,6,X'4D6174686577',X'44616E69656C','0000-00-00',X'323435303531',X'6D617468657740676D61696C2E636F6D',5898587,5687,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:18:29',X'59',X'3135372E35302E39312E3937','2020-08-19 23:48:29'),
	(56,1,6,X'42726F68697468',X'4C616C','1970-01-01',X'36353938',X'6C616C40676D61696C2E636F6D',547999,4875,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:18:29',X'59',X'3135372E35302E39312E3937','2020-08-19 23:48:29'),
	(57,1,6,X'4D6174686577',X'44616E69656C','0000-00-00',X'323435303531',X'6D617468657740676D61696C2E636F6D',5898587,5687,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:19:38',X'59',X'3135372E35302E39312E3937','2020-08-19 23:49:38'),
	(58,1,6,X'42726F68697468',X'4C616C','1970-01-01',X'36353938',X'6C616C40676D61696C2E636F6D',547999,4875,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:19:38',X'59',X'3135372E35302E39312E3937','2020-08-19 23:49:38'),
	(59,1,6,X'526F62696E',X'5061756C','1970-01-01',X'3136353438',X'726F62696E40676D61696C2E636F6D',4587,9856,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:23:54',X'59',X'3135372E35302E39312E3937','2020-08-19 23:53:54'),
	(60,1,6,X'4A6F686E736F6E',X'47656F726765','0000-00-00',X'3435383936',X'6A6F686E736F6E40676D61696C2E636F6D',78545,1548,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:23:54',X'59',X'3135372E35302E39312E3937','2020-08-19 23:53:54'),
	(61,1,6,X'526F62696E',X'5061756C','1970-01-01',X'3136353438',X'726F62696E40676D61696C2E636F6D',4587,9856,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:29:25',X'59',X'3135372E35302E39312E3937','2020-08-19 23:59:25'),
	(62,1,6,X'4A6F686E736F6E',X'47656F726765','0000-00-00',X'3435383936',X'6A6F686E736F6E40676D61696C2E636F6D',78545,1548,X'59',X'20','',X'20',X'20',X'20',1,1,1,X'20',X'20',X'20',X'20',X'20',626,X'20',6,'2020-08-19 18:29:25',X'59',X'3135372E35302E39312E3937','2020-08-19 23:59:25');

/*!40000 ALTER TABLE `tbl__school_student` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__schoolexam
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolexam`;

CREATE TABLE `tbl__schoolexam` (
  `exam_id` int(11) NOT NULL AUTO_INCREMENT,
  `schoolid` int(11) NOT NULL,
  `exam_cat` int(11) NOT NULL,
  `exam_sub` int(11) NOT NULL,
  `exam_sub_sub` int(15) NOT NULL,
  `exam_name` varchar(250) COLLATE utf8_bin NOT NULL,
  `exam_slug` varchar(250) COLLATE utf8_bin NOT NULL,
  `assign_test_type` enum('D','M') COLLATE utf8_bin NOT NULL,
  `exam_type` enum('C','B') COLLATE utf8_bin NOT NULL COMMENT 'c-common,b-bank',
  `exam_code` varchar(15) COLLATE utf8_bin NOT NULL,
  `exam_level` varchar(11) COLLATE utf8_bin NOT NULL,
  `sect_cutoff` enum('N','Y') COLLATE utf8_bin NOT NULL,
  `sect_timing` enum('N','Y') COLLATE utf8_bin NOT NULL,
  `tot_questions` int(11) NOT NULL,
  `tot_mark` int(11) NOT NULL,
  `mark_perquest` decimal(10,2) NOT NULL,
  `neg_markquest` decimal(5,2) NOT NULL,
  `ques_ans` int(11) NOT NULL,
  `total_time` int(11) NOT NULL,
  `quest_type` enum('MANU','AUTO') COLLATE utf8_bin NOT NULL,
  `exam_type_cat` enum('T','C','P') COLLATE utf8_bin NOT NULL COMMENT 'T-added type,C-chapterwise,P-Previous Year',
  `exam_type_id` int(11) NOT NULL,
  `exam_pos` int(15) NOT NULL,
  `exam_status` enum('W','Y','N','D') COLLATE utf8_bin NOT NULL,
  `exam_add_type` char(5) COLLATE utf8_bin NOT NULL,
  `exam_add_id` int(11) NOT NULL,
  `exam_add_name` varchar(250) COLLATE utf8_bin NOT NULL,
  `exam_date` datetime NOT NULL,
  `ip_addr` varchar(250) COLLATE utf8_bin NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`exam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `tbl__schoolexam` WRITE;
/*!40000 ALTER TABLE `tbl__schoolexam` DISABLE KEYS */;

INSERT INTO `tbl__schoolexam` (`exam_id`, `schoolid`, `exam_cat`, `exam_sub`, `exam_sub_sub`, `exam_name`, `exam_slug`, `assign_test_type`, `exam_type`, `exam_code`, `exam_level`, `sect_cutoff`, `sect_timing`, `tot_questions`, `tot_mark`, `mark_perquest`, `neg_markquest`, `ques_ans`, `total_time`, `quest_type`, `exam_type_cat`, `exam_type_id`, `exam_pos`, `exam_status`, `exam_add_type`, `exam_add_id`, `exam_add_name`, `exam_date`, `ip_addr`, `last_update`)
VALUES
	(1,1,1,28,1,X'5465737436',X'7465737431',X'44',X'43',X'746573743039',X'31',X'4E',X'4E',10,0,1.00,0.00,0,X'4D414E55',X'54',1,0,X'57',X'53',1,X'687761646D696E','2020-08-10 12:40:05',X'3139372E302E30','2020-08-10 19:36:12'),
	(2,1,1,28,1,X'5465737431',X'7465737431',X'44',X'43',X'746573743032',X'31',X'4E',X'4E',10,0,0.00,0.00,0,X'4D414E55',X'54',1,0,X'57',X'53',1,X'687761646D696E','2020-08-09 00:00:00',X'','2020-08-10 19:36:16'),
	(3,1,1,28,1,X'5465737431',X'7465737431',X'44',X'43',X'746573743033',X'31',X'4E',X'4E',10,0,0.00,0.00,0,X'4D414E55',X'54',1,0,X'59',X'53',1,X'687761646D696E','2020-08-09 00:00:00',X'3139372E302E30','2020-08-10 19:36:19'),
	(4,1,1,28,1,X'5465737431',X'7465737431',X'44',X'43',X'746573743038',X'31',X'4E',X'4E',10,0,1.00,0.00,0,X'4D414E55',X'54',1,0,X'57',X'53',1,X'687761646D696E','2020-08-10 00:00:00',X'3139372E302E30','2020-08-10 19:36:21'),
	(5,1,1,28,1,X'5465737431',X'7465737431',X'44',X'43',X'746573743039',X'31',X'4E',X'4E',10,0,1.00,0.00,0,X'4D414E55',X'54',1,0,X'57',X'53',1,X'687761646D696E','2020-08-10 00:00:00',X'3139372E302E30','2020-08-10 19:36:26');

/*!40000 ALTER TABLE `tbl__schoolexam` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__schoolexam_sectdetails
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolexam_sectdetails`;

CREATE TABLE `tbl__schoolexam_sectdetails` (
  `sect_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `schoolid` int(11) NOT NULL,
  `main_cat` int(11) NOT NULL,
  `sub_cat` int(11) NOT NULL,
  `menu_title` varchar(250) CHARACTER SET utf8 NOT NULL,
  `no_ofquest` int(11) NOT NULL,
  `mark_perquest` decimal(10,2) NOT NULL,
  `tot_marks` int(11) NOT NULL,
  `neg_mark` decimal(10,2) NOT NULL,
  `ques_ans` int(11) NOT NULL,
  `cut_off` decimal(10,2) NOT NULL,
  `sect_time` int(11) NOT NULL,
  `sect_date` datetime NOT NULL,
  `lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sect_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `tbl__schoolexam_sectdetails` WRITE;
/*!40000 ALTER TABLE `tbl__schoolexam_sectdetails` DISABLE KEYS */;

INSERT INTO `tbl__schoolexam_sectdetails` (`sect_id`, `exam_id`, `schoolid`, `main_cat`, `sub_cat`, `menu_title`, `no_ofquest`, `mark_perquest`, `tot_marks`, `neg_mark`, `ques_ans`, `cut_off`, `sect_time`, `sect_date`, `lastupdate`)
VALUES
	(1,1,1,0,0,'fggd',5,1.00,5,1.00,1.00,1,'0000-00-00 00:00:00','2020-08-10 19:56:22');

/*!40000 ALTER TABLE `tbl__schoolexam_sectdetails` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__schoolexamchapters
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolexamchapters`;

CREATE TABLE `tbl__schoolexamchapters` (
  `chapt_id` int(11) NOT NULL AUTO_INCREMENT,
  `exa_cat_id` int(11) NOT NULL,
  `schoolid` int(11) NOT NULL,
  `exmain_cat` int(11) NOT NULL,
  `exsub_cat` int(11) NOT NULL,
  `chapter_name` varchar(500) COLLATE utf8_bin NOT NULL,
  `chapter_date` datetime NOT NULL,
  `chapter_status` enum('Y','N','D') COLLATE utf8_bin NOT NULL,
  `lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`chapt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `tbl__schoolexamchapters` WRITE;
/*!40000 ALTER TABLE `tbl__schoolexamchapters` DISABLE KEYS */;

INSERT INTO `tbl__schoolexamchapters` (`chapt_id`, `exa_cat_id`, `schoolid`, `exmain_cat`, `exsub_cat`, `chapter_name`, `chapter_date`, `chapter_status`, `lastupdate`)
VALUES
	(1,1,1,1,1,X'666467','0000-00-00 00:00:00',X'59','2020-08-08 11:21:46'),
	(2,11,1,6,8,X'636865636B696E67','2020-08-10 15:29:06',X'59','2020-08-10 20:59:06'),
	(3,15,1,6,8,X'436861707465722031','2020-08-12 08:19:50',X'59','2020-08-12 13:49:50');

/*!40000 ALTER TABLE `tbl__schoolexamchapters` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__schoolexamquestions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolexamquestions`;

CREATE TABLE `tbl__schoolexamquestions` (
  `exq_id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `schoolid` int(11) NOT NULL,
  `exam_cat` int(11) NOT NULL,
  `exam_subcat` int(11) NOT NULL,
  `sect_id` int(11) NOT NULL,
  `exam_name` varchar(350) COLLATE utf8_bin NOT NULL,
  `exam_code` varchar(350) COLLATE utf8_bin NOT NULL,
  `quest_type` enum('MANU','AUTO') COLLATE utf8_bin NOT NULL,
  `quest_assigned_type` char(5) COLLATE utf8_bin NOT NULL,
  `quest_assigned_id` int(11) NOT NULL,
  `quest_assigned_name` varchar(250) COLLATE utf8_bin NOT NULL,
  `qid` int(11) NOT NULL,
  `cat_id` int(11) NOT NULL,
  `sub_id` int(11) NOT NULL,
  `q_type` enum('T','I') COLLATE utf8_bin NOT NULL,
  `question` text COLLATE utf8_bin NOT NULL,
  `quest_desc` text COLLATE utf8_bin NOT NULL,
  `opt_type1` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_type2` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_type3` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_type4` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_type5` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_1` text COLLATE utf8_bin NOT NULL,
  `opt_2` text COLLATE utf8_bin NOT NULL,
  `opt_3` text COLLATE utf8_bin NOT NULL,
  `opt_4` text COLLATE utf8_bin NOT NULL,
  `opt_5` text COLLATE utf8_bin NOT NULL,
  `crt_ans` varchar(250) COLLATE utf8_bin NOT NULL,
  `quest_level` int(11) NOT NULL,
  `exam_queststatus` enum('Y','N') COLLATE utf8_bin NOT NULL,
  `exam_questpos` int(11) NOT NULL,
  `exam_questadd_date` datetime NOT NULL,
  `ip_addr` varchar(250) COLLATE utf8_bin NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`exq_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `tbl__schoolexamquestions` WRITE;
/*!40000 ALTER TABLE `tbl__schoolexamquestions` DISABLE KEYS */;

INSERT INTO `tbl__schoolexamquestions` (`exq_id`, `exam_id`, `schoolid`, `exam_cat`, `exam_subcat`, `sect_id`, `exam_name`, `exam_code`, `quest_type`, `quest_assigned_type`, `quest_assigned_id`, `quest_assigned_name`, `qid`, `cat_id`, `sub_id`, `q_type`, `question`, `quest_desc`, `opt_type1`, `opt_type2`, `opt_type3`, `opt_type4`, `opt_type5`, `opt_1`, `opt_2`, `opt_3`, `opt_4`, `opt_5`, `crt_ans`, `quest_level`, `exam_queststatus`, `exam_questpos`, `exam_questadd_date`, `ip_addr`, `last_update`)
VALUES
	(1,7,1,112,1,1,X'686767686768',X'6667677968',X'4D414E55',X'31',1,X'72666464686468',1,232,256,X'54','','',X'54',X'54',X'54',X'54',X'54','','','','','',X'31',1,X'4E',1,'0000-00-00 00:00:00',X'3139372E302E30','2020-08-09 16:51:40'),
	(2,3,1,1,28,1,X'5465737431',X'746573743033',X'4D414E55',X'53',1,X'687761646D696E',1,1,1,X'54',X'546573745175657374696F6E',X'66626766666864',X'54',X'54',X'54',X'54',X'54',X'7465737431',X'7465737432',X'7465737433',X'7465737434','',X'31',1,X'59',1,'2020-08-09 11:42:39',X'3139372E302E30','2020-08-09 17:12:39'),
	(3,3,1,1,28,1,X'5465737431',X'746573743033',X'4D414E55',X'53',1,X'687761646D696E',1,1,1,X'54',X'546573745175657374696F6E',X'66626766666864',X'54',X'54',X'54',X'54',X'54',X'7465737431',X'7465737432',X'7465737433',X'7465737434','',X'31',1,X'59',1,'2020-08-09 11:46:17',X'3139372E302E30','2020-08-09 17:16:17'),
	(4,3,1,1,28,1,X'5465737431',X'746573743033',X'4D414E55',X'53',1,X'687761646D696E',1,1,1,X'54',X'546573745175657374696F6E',X'66626766666864',X'54',X'54',X'54',X'54',X'54',X'7465737431',X'7465737432',X'7465737433',X'7465737434','',X'31',1,X'59',1,'2020-08-10 16:23:10',X'3139372E302E30','2020-08-10 21:53:10'),
	(5,3,1,1,28,1,X'5465737431',X'746573743033',X'4D414E55',X'53',1,X'687761646D696E',1,1,1,X'54',X'546573745175657374696F6E',X'66626766666864',X'54',X'54',X'54',X'54',X'54',X'7465737431',X'7465737432',X'7465737433',X'7465737434','',X'31',1,X'59',1,'2020-08-10 17:03:17',X'3139372E302E30','2020-08-10 22:33:17');

/*!40000 ALTER TABLE `tbl__schoolexamquestions` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__schoolexamtypes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolexamtypes`;

CREATE TABLE `tbl__schoolexamtypes` (
  `extype_id` int(11) NOT NULL AUTO_INCREMENT,
  `exa_cat_id` int(11) NOT NULL,
  `schoolid` int(11) NOT NULL,
  `exmain_cat` int(11) NOT NULL,
  `exsub_cat` int(11) NOT NULL,
  `extest_type` varchar(500) COLLATE utf8_bin NOT NULL,
  `extype_date` datetime NOT NULL,
  `extype_status` enum('Y','N','D') COLLATE utf8_bin NOT NULL,
  `lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`extype_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `tbl__schoolexamtypes` WRITE;
/*!40000 ALTER TABLE `tbl__schoolexamtypes` DISABLE KEYS */;

INSERT INTO `tbl__schoolexamtypes` (`extype_id`, `exa_cat_id`, `schoolid`, `exmain_cat`, `exsub_cat`, `extest_type`, `extype_date`, `extype_status`, `lastupdate`)
VALUES
	(2,11,1,6,8,X'','2020-08-10 15:29:06',X'59','2020-08-10 20:59:06'),
	(3,4,1,2,2,X'736269','0000-00-00 00:00:00',X'59','2020-08-10 19:39:16'),
	(4,15,1,6,8,X'46756C6C2054657374','2020-08-12 08:19:50',X'59','2020-08-12 13:49:50');

/*!40000 ALTER TABLE `tbl__schoolexamtypes` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table tbl__schoolquestion
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolquestion`;

CREATE TABLE `tbl__schoolquestion` (
  `qid` int(11) NOT NULL AUTO_INCREMENT,
  `cat_id` int(11) NOT NULL,
  `sub_id` int(11) NOT NULL,
  `schoolid` int(11) NOT NULL,
  `quest_add_type` enum('A','O','S') COLLATE utf8_bin NOT NULL,
  `q_type` enum('T','I') CHARACTER SET utf8 NOT NULL,
  `question` text CHARACTER SET utf8 NOT NULL,
  `question_code` varchar(250) CHARACTER SET utf8 NOT NULL,
  `quest_desc` text CHARACTER SET utf8 NOT NULL,
  `opt_type1` enum('T','I') CHARACTER SET utf8 NOT NULL,
  `opt_1` text CHARACTER SET utf8 NOT NULL,
  `opt_type2` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_type3` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_type4` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_type5` enum('T','I') COLLATE utf8_bin NOT NULL,
  `opt_2` text CHARACTER SET utf8 NOT NULL,
  `opt_3` text CHARACTER SET utf8 NOT NULL,
  `opt_4` text CHARACTER SET utf8 NOT NULL,
  `opt_5` text COLLATE utf8_bin NOT NULL,
  `crt_ans` varchar(250) CHARACTER SET utf8 NOT NULL,
  `quest_level` int(11) NOT NULL,
  `quest_add_id` int(11) NOT NULL,
  `quest_add_by` varchar(100) COLLATE utf8_bin NOT NULL,
  `quest_pos` int(11) NOT NULL,
  `quest_status` enum('W','Y','N','D') CHARACTER SET utf8 NOT NULL,
  `quest_date` datetime NOT NULL,
  `aproved_date` datetime NOT NULL,
  `quest_ipaddr` varchar(250) CHARACTER SET utf8 NOT NULL,
  `lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`qid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

LOCK TABLES `tbl__schoolquestion` WRITE;
/*!40000 ALTER TABLE `tbl__schoolquestion` DISABLE KEYS */;

INSERT INTO `tbl__schoolquestion` (`qid`, `cat_id`, `sub_id`, `schoolid`, `quest_add_type`, `q_type`, `question`, `question_code`, `quest_desc`, `opt_type1`, `opt_1`, `opt_type2`, `opt_type3`, `opt_type4`, `opt_type5`, `opt_2`, `opt_3`, `opt_4`, `opt_5`, `crt_ans`, `quest_level`, `quest_add_id`, `quest_add_by`, `quest_pos`, `quest_status`, `quest_date`, `aproved_date`, `quest_ipaddr`, `lastupdate`)
VALUES
	(1,1,1,1,X'41','T','TestQuestion','fgbfhhhfhd','fbgffhd','T','test1',X'54',X'54',X'54',X'54','test2','test3','test4','','1',1,1,X'68776161646D696E',0,'Y','2020-08-08 14:18:35','2020-08-08 14:18:35','127.0.0','2020-08-10 20:05:36'),
	(2,1,1,1,X'41','T','TestQuestion','DFDJB0001','fbgffhd','T','test1',X'54',X'54',X'54',X'54','test2','test3','test4','','1',1,1,X'68776161646D696E',0,'D','2020-08-08 14:28:08','2020-08-08 14:28:08','127.0.0','2020-08-10 20:05:06');

/*!40000 ALTER TABLE `tbl__schoolquestion` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
