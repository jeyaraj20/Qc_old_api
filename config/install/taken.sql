# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 15.207.47.132 (MySQL 5.7.31-0ubuntu0.18.04.1)
# Database: question_cloud
# Generation Time: 2020-09-04 23:57:12 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table tbl__schoolexam_result
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolexam_result`;

CREATE TABLE `tbl__schoolexam_result` (
  `result_id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) DEFAULT NULL,
  `stud_id` int(11) DEFAULT NULL,
  `taken_id` int(15) DEFAULT NULL,
  `exam_id` int(11) DEFAULT NULL,
  `quest_id` int(11) DEFAULT NULL,
  `sect_id` int(11) DEFAULT NULL,
  `attend_ans` int(11) DEFAULT NULL,
  `review_val` char(10) COLLATE utf8_bin DEFAULT NULL,
  `crt_ans` int(11) DEFAULT NULL,
  `crt_mark` decimal(10,2) DEFAULT NULL,
  `neg_mark` decimal(10,2) DEFAULT NULL,
  `ipaddress` varchar(250) COLLATE utf8_bin DEFAULT NULL,
  `attend_date` datetime DEFAULT NULL,
  `lastupdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`result_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table tbl__schoolexamtaken_list
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tbl__schoolexamtaken_list`;

CREATE TABLE `tbl__schoolexamtaken_list` (
  `taken_id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) DEFAULT '0',
  `stud_id` int(11) DEFAULT NULL,
  `exam_id` int(11) DEFAULT NULL,
  `exam_type` char(10) COLLATE utf8_bin DEFAULT NULL,
  `exam_type_cat` char(10) COLLATE utf8_bin DEFAULT NULL,
  `exam_type_id` int(11) DEFAULT NULL,
  `post_mark` decimal(10,2) DEFAULT NULL,
  `neg_mark` decimal(10,2) DEFAULT NULL,
  `tot_quest` int(11) DEFAULT NULL,
  `tot_attend` int(11) DEFAULT NULL,
  `not_attend` int(11) DEFAULT NULL,
  `not_answered` int(11) DEFAULT NULL,
  `skip_quest` int(11) DEFAULT NULL,
  `answ_crt` int(11) DEFAULT NULL,
  `answ_wrong` int(11) DEFAULT NULL,
  `tot_postimark` decimal(10,2) DEFAULT NULL,
  `tot_negmarks` decimal(10,2) DEFAULT NULL,
  `total_mark` decimal(10,2) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `exam_status` enum('S','C','SYS') COLLATE utf8_bin DEFAULT NULL COMMENT 'S-started,C-completed,SYS-cronclosed',
  `ip_addr` varchar(250) COLLATE utf8_bin DEFAULT NULL,
  `lastupdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`taken_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
