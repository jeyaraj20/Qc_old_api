# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 15.207.47.132 (MySQL 5.7.31-0ubuntu0.18.04.1)
# Database: question_cloud
# Generation Time: 2020-09-04 23:24:04 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table tbl__adminmenu_all
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__adminmenu_all`;

CREATE TABLE `tbl__adminmenu_all` (
  `menu_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `menu_title_apiname` varchar(250) NOT NULL DEFAULT '',
  `menu_type` varchar(250) NOT NULL,
  `pid` int(10) NOT NULL,
  `menu_link` varchar(250) NOT NULL,
  `menu_icon` varchar(250) NOT NULL,
  `menu_home` enum('N','Y') NOT NULL DEFAULT 'N',
  `menu_pos` int(10) unsigned NOT NULL,
  `menu_status` enum('Y','N','D') NOT NULL,
  `menu_lastupdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `menu_for` enum('G','I','B') DEFAULT NULL,
  `menu_title` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `tbl__adminmenu_all` WRITE;
/*!40000 ALTER TABLE `tbl__adminmenu_all` DISABLE KEYS */;

INSERT INTO `tbl__adminmenu_all` (`menu_id`, `menu_title_apiname`, `menu_type`, `pid`, `menu_link`, `menu_icon`, `menu_home`, `menu_pos`, `menu_status`, `menu_lastupdate`, `menu_for`, `menu_title`)
VALUES
	(1,'sidebar.qcsettings','S',0,'/app/settings/view','settings','Y',1,'Y','2020-08-11 03:14:59','B','Settings'),
	(2,'sidebar.qcadminfaculty','S,A',0,'/app/adminfaculty/view','account','Y',15,'Y','2020-08-12 00:05:13','B','Admin & Faculty'),
	(3,'Masters','S,A',0,'','','N',2,'N','2020-08-10 19:44:08','',NULL),
	(4,'sidebar.qcqbankmaincategory','S,A',0,'/app/qbankmaincategory/view','arrows','Y',3,'Y','2020-08-11 03:15:27','B','Q Bank Main Category'),
	(5,'sidebar.qcqbanksubcategory','S,A,O',0,'/app/qbanksubcategory/view','bookmark','Y',4,'Y','2020-08-11 03:15:37','B','Q Bank Sub Category'),
	(6,'Questions','S,A,O',0,'','','N',3,'N','2020-08-11 03:15:49','B','Questions'),
	(7,'sidebar.qcexamcategory','S,A',0,'/app/exammaincategory/view','edit','Y',5,'Y','2020-08-11 03:15:56','B','Exam Main Category'),
	(8,'sidebar.qcexamsubcategory','S,A',0,'/app/examsubcategory/view','reader','Y',6,'Y','2020-08-11 03:16:05','B','Exam Sub Category'),
	(9,'sidebar.qcstudents','S,A',0,'/app/students/view','accounts','Y',7,'Y','2020-08-11 03:16:11','B','Students'),
	(10,'sidebar.qcstate','S,A',0,'/app/statecategory/view','map','Y',1,'Y','2020-08-11 03:16:45','G','State'),
	(11,'sidebar.qccity','S,A',0,'/app/citycategory/view','pin','Y',1,'Y','2020-08-14 16:19:24','G','City'),
	(12,'sidebar.qchomecategory','S,A',0,'/app/homecategory/view','home','Y',2,'Y','2020-08-14 16:19:26','G','Home Category'),
	(13,'sidebar.qcaddschool','S',0,'/app/addschool/view','library','Y',8,'Y','2020-08-11 03:16:42','G','School'),
	(15,'sidebar.qcstaffassign','S',0,'/app/staffassign/view','accounts-add','Y',16,'Y','2020-08-20 12:56:37','I','Staff Assign');

/*!40000 ALTER TABLE `tbl__adminmenu_all` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
