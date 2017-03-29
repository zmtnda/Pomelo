drop database if exists zilikini_db;
create database zilikini_db;
use zilikini_db;

-- -----------------------------------------------------
-- Table Logins
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Logins (
  id_log INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(128) NOT NULL ,
  passwordSalt VARCHAR(30) NOT NULL ,
  passwordHash VARCHAR(128) NOT NULL ,
  role INT(11) UNSIGNED NOT NULL ,
  whenRegistered DATETIME not null,
  UNIQUE KEY (email)
);

-- -----------------------------------------------------
-- Table Badges
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Badges (
  id_bad INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR (500) NULL ,
  icon VARCHAR (200) NOT NULL
);

-- -----------------------------------------------------
-- Table Customers
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Customers (
  id_cus INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------
-- Table Technicians
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Technicians (
  id_tec INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  log_id INT(11) UNSIGNED NOT NULL ,
  firstName VARCHAR(45) NOT NULL ,
  lastName VARCHAR(45) NOT NULL ,
  hourlyRate NUMERIC (6,2) UNSIGNED NOT NULL ,
  city VARCHAR(30) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  avatar VARCHAR (200) NULL,
  ratings FLOAT(5,4) NOT NULL,
  bad_id INT(11) UNSIGNED NOT NULL,
  status INT(11) NOT NULL,
  CONSTRAINT fkTechniciansLogins
    FOREIGN KEY (log_id )
    REFERENCES Logins (id_log)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fkTechniciansBadges
    FOREIGN KEY (bad_id )
    REFERENCES Badges (id_bad)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table Certifications
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Certifications (
  id_cer INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tec_id INT(11) UNSIGNED NOT NULL ,
  certificationName VARCHAR(100) NOT NULL ,
  institution VARCHAR(100) NOT NULL ,
  yearObtained DATETIME not null,
  CONSTRAINT fkCertificationsTechnicians
    FOREIGN KEY (tec_id )
    REFERENCES Technicians (id_tec)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table Videos
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Videos (
  id_vid INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tec_id INT(11) UNSIGNED NOT NULL ,
  directory VARCHAR (200) NOT NULL,
  description VARCHAR(500) NOT NULL ,
  CONSTRAINT fkVideosTechnicians
    FOREIGN KEY (tec_id)
    REFERENCES Technicians(id_tec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table Photos
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Photos (
  id_pho INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tec_id INT(11) UNSIGNED NOT NULL ,
  directory VARCHAR (200) NOT NULL,
  description VARCHAR(500) NOT NULL ,
  CONSTRAINT fkPhotosTechnicians
    FOREIGN KEY (tec_id )
    REFERENCES Technicians (id_tec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table ServicesCategories
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Categories (
  id_cat INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------
-- Table ServicesManufacturers
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Manufacturers (
  id_man INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  manufacturer VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------
-- Table CategoriesManufacturers
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS CategoriesManufacturers (
  id_catMan INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cat_id INT(11) UNSIGNED NOT NULL ,
  man_id INT(11) UNSIGNED NOT NULL ,
  CONSTRAINT fkCategoriesManufacturesCategories
    FOREIGN KEY (cat_id)
    REFERENCES Categories (id_cat)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT fkCategoriesManufacturesManufacturers
    FOREIGN KEY (man_id)
    REFERENCES Manufacturers (id_man)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
  )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table Models
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Models (
  id_mod INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  catMan_id INT(11) UNSIGNED NOT NULL,
  model VARCHAR(50) NOT NULL DEFAULT "",
  CONSTRAINT fkModelsCategoriesManufacturers
    FOREIGN KEY (catMan_id)
    REFERENCES CategoriesManufacturers (id_catMan)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table Issues
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Issues (
  id_iss INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  issue VARCHAR(500) NOT NULL
);

-- -----------------------------------------------------
-- Table ModelsIssues
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS ModelsIssues (
  id_modIss INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mod_id INT(11) UNSIGNED NOT NULL,
  iss_id INT(11) UNSIGNED NOT NULL,
  CONSTRAINT fkModelsIssuesModels
    FOREIGN KEY (mod_id)
    REFERENCES Models (id_mod)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT fkModelsIssuesIssues
    FOREIGN KEY (iss_id)
    REFERENCES Issues (id_iss)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table ServicesOfferedByTech
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS ServicesOfferedByTech (
  id_serTec INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tec_id INT(11) UNSIGNED NOT NULL ,
  modIss_id INT(11) UNSIGNED NOT NULL,
  catMan_id INT(11) UNSIGNED NOT NULL,
  servType TINYINT UNSIGNED NOT NULL,
  estAmount NUMERIC(6,2) UNSIGNED NOT NULL,
  status INT(11) NOT NULL,
  CONSTRAINT fkServicesOfferedByTechTechnicians
    FOREIGN KEY (tec_id)
    REFERENCES Technicians (id_tec)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT fkServicesOfferedByTechCategoriesManufacture
      FOREIGN KEY (catMan_id)
      REFERENCES CategoriesManufacturers (id_catMan)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT fkServicesOfferedByTechModelsIssues
    FOREIGN KEY (modIss_id)
    REFERENCES ModelsIssues (id_modIss)
    ON DELETE CASCADE
    ON UPDATE CASCADE
  )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table ServicesHistory
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS ServicesHistory (
  id_serHis INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  serTec_id INT(11) UNSIGNED NOT NULL ,
  cus_id INT(11) UNSIGNED NOT NULL ,
  description VARCHAR(500) NOT NULL ,
  amount NUMERIC (5,2) UNSIGNED NOT NULL ,
  status INT(11) NOT NULL,
  orderedDate DATETIME NOT NULL,
  completedDate DATETIME NOT NULL,
  serHisHash VARCHAR(128) NOT NULL,
  isReview TINYINT(1) DEFAULT 0,
  CONSTRAINT fkServicesHistoryServicesOfferedByTech
    FOREIGN KEY (serTec_id)
    REFERENCES ServicesOfferedByTech (id_serTec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fkServicesHistoryCustomers
    FOREIGN KEY (cus_id)
    REFERENCES Customers (id_cus)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table Reviews
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Reviews (
  id_rev INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stars TINYINT UNSIGNED NOT NULL ,
  comment VARCHAR(500),
  serHis_id INT(11) UNSIGNED NOT NULL,
  cus_id INT(11) UNSIGNED NOT NULL,
  tec_id INT(11) UNSIGNED NOT NULL,
  CONSTRAINT fkReviewsServicesHistory
    FOREIGN KEY (serHis_id)
    REFERENCES ServicesHistory (id_serHis)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT fkReviewsTechnicians
    FOREIGN KEY (tec_id)
    REFERENCES Technicians (id_tec)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT fkReviewsCustomers
    FOREIGN KEY (cus_id)
    REFERENCES Customers (id_cus)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
  )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table Portfolio
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Portfolio (
  id_por INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tec_id INT(11) UNSIGNED NOT NULL ,
  websites VARCHAR(200) NULL DEFAULT NULL ,
  aboutMe VARCHAR(500) NULL DEFAULT NULL ,
  companyName VARCHAR(100) NULL DEFAULT NULL ,
  companyAddress VARCHAR(100) NULL DEFAULT NULL ,
  companyPhone VARCHAR(45) NULL DEFAULT NULL ,
  vid_id INT(11) UNSIGNED NULL DEFAULT NULL ,
  pho_id INT(11) UNSIGNED NULL DEFAULT NULL ,
  CONSTRAINT fkPortfolioTechnicians
    FOREIGN KEY (tec_id)
    REFERENCES Technicians (id_tec)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fkPortfolioVideos
    FOREIGN KEY (vid_id)
    REFERENCES Videos (id_vid)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fkPortfolioPhotos
    FOREIGN KEY (pho_id)
    REFERENCES Photos (id_pho)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Create View for all cat man
-- -----------------------------------------------------
DROP VIEW IF EXISTS ViewAllCategoriesManufactures;
CREATE VIEW ViewAllCategoriesManufactures AS
   SELECT cm.*, c.category, m.manufacturer
   FROM CategoriesManufacturers cm, Categories c, Manufacturers m
   WHERE cm.cat_id = c.id_cat AND cm.man_id = m.id_man
   ORDER BY c.category ASC, m.manufacturer ASC;

-- -----------------------------------------------------
-- Create View for all model issues
-- -----------------------------------------------------
DROP VIEW IF EXISTS ViewALLModelsIssues;
CREATE VIEW ViewALLModelsIssues AS
   SELECT MI.*, M.model, Iss.issue
   FROM ModelsIssues MI, Issues Iss, Models M
   WHERE MI.mod_id = M.id_mod AND MI.iss_id = Iss.id_iss
   ORDER BY M.model ASC, Iss.issue ASC;

-- -----------------------------------------------------
-- Create View for all services offer with all status
-- -----------------------------------------------------
DROP VIEW IF EXISTS ViewAllServicesOffer;
CREATE VIEW ViewAllServicesOffer AS
   SELECT T.id_tec, T.lastName, T.firstName, SO.id_serTec,M.id_mod, M.model, Iss.id_iss,
   	Iss.issue, SO.servType, SO.estAmount, SO.status
   FROM ServicesOfferedByTech SO, ModelsIssues MI, Models M, Issues Iss, Technicians T
   WHERE SO.tec_id = T.id_tec AND SO.modIss_id = MI.id_modIss
   	AND MI.mod_id = M.id_mod AND MI.iss_id = Iss.id_iss
   ORDER BY T.id_tec ASC, M.model ASC, Iss.issue ASC;

-- -----------------------------------------------------
-- Create View for all services offer with status is 1 - visible to customer
-- -----------------------------------------------------
DROP VIEW IF EXISTS ViewAllServicesOfferForCustomer;
CREATE VIEW ViewAllServicesOfferForCustomer AS
   SELECT T.id_tec, T.lastName, T.firstName, SO.id_serTec,M.id_mod, M.model, Iss.id_iss,
   	Iss.issue, SO.servType, SO.estAmount, SO.status
   FROM ServicesOfferedByTech SO, ModelsIssues MI, Models M, Issues Iss, Technicians T
   WHERE SO.tec_id = T.id_tec AND SO.modIss_id = MI.id_modIss
   	AND MI.mod_id = M.id_mod AND MI.iss_id = Iss.id_iss AND SO.status = 1
   ORDER BY T.id_tec ASC, M.model ASC, Iss.issue ASC;

-- -----------------------------------------------------
-- Create View for all services history
-- -----------------------------------------------------
DROP VIEW IF EXISTS ViewAllServicesHistory;
CREATE VIEW ViewAllServicesHistory AS
   SELECT SH.id_serHis, C.id_cus, C.email, SO.id_serTec, T.id_tec, T.lastName, T.firstName,
      M.model, I.issue, SH.description, SH.amount, SH.status, SH.orderedDate, SH.completedDate
   FROM ServicesHistory SH ,Technicians T, Customers C, ServicesOfferedByTech SO,
      ModelsIssues MI, Models M, Issues I
   WHERE SH.serTec_id = SO.id_serTec AND SH.cus_id = C.id_cus
      AND SO.tec_id = T.id_tec AND SO.modIss_id = MI.id_modIss
      AND MI.mod_id = M.id_mod AND MI.iss_id = I.id_iss;

-- -----------------------------------------------------
-- Create View for all reivews
-- -----------------------------------------------------
DROP VIEW IF EXISTS ViewAllReviews;
CREATE VIEW ViewAllReviews AS
   SELECT SH.id_serHis, C.id_cus, C.email, SO.id_serTec, T.id_tec, T.lastName, T.firstName,
   	M.model, I.issue, SH.description, SH.amount, SH.status, SH.orderedDate,
   	SH.completedDate, R.stars, R.comment
   FROM Reviews R, ServicesHistory SH ,Technicians T, Customers C,
   	ServicesOfferedByTech SO, ModelsIssues MI, Models M, Issues I
   WHERE R.serHis_id = SH.id_serHis AND SH.serTec_id = SO.id_serTec AND SH.cus_id = C.id_cus
      AND SO.tec_id = T.id_tec AND SO.modIss_id = MI.id_modIss
      AND MI.mod_id = M.id_mod AND MI.iss_id = I.id_iss;

-- -----------------------------------------------------
-- Create View for all stars of each technician
-- -----------------------------------------------------
DROP VIEW IF EXISTS ViewAllTechStars;
CREATE VIEW ViewAllTechStars AS
	SELECT T.id_tec, IFNULL(R.stars,0)
	FROM Technicians T
	LEFT JOIN
	(SELECT tec_id, SUM(stars)/COUNT(1) AS stars
	FROM Reviews
	GROUP BY tec_id) R
	ON T.id_tec = R.tec_id;

-- -----------------------------------------------------
-- Create Procedure to update ratings for each technician
-- -----------------------------------------------------
DROP PROCEDURE IF EXISTS UpdateRatings;

DELIMITER $$
CREATE PROCEDURE updateRatings ()
BEGIN
   DECLARE v_finished INTEGER DEFAULT 0;
   DECLARE tecId INT DEFAULT 0;
   DEClARE tecId_cursor CURSOR FOR
   	SELECT id_tec FROM Technicians;
   DECLARE CONTINUE HANDLER
   	FOR NOT FOUND SET v_finished = 1;
   OPEN tecId_cursor;
   	calculate_update_ratings: LOOP
   		FETCH tecId_cursor INTO tecId;
   		IF v_finished = 1 THEN
   		LEAVE calculate_update_ratings;
   		END IF;
   		UPDATE Technicians SET ratings = (SELECT IFNULL(SUM(stars)/COUNT(1),0)
   										          FROM Reviews WHERE tec_id = tecId)
   		WHERE id_tec = tecId;
   	END LOOP calculate_update_ratings;
   CLOSE tecId_cursor;
END$$
DELIMITER ;
