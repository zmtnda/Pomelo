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
-- Table ServicesCategories
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Categories (
  id_cat INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categories VARCHAR(100) NOT NULL
);
-- -----------------------------------------------------
-- Table ServicesManufacturers
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Manufacturers (
  id_man INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  manufacturer VARCHAR(100) NOT NULL
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
  description VARCHAR(500) NOT NULL ,
  CONSTRAINT fkVideosTechnicians
    FOREIGN KEY (tec_id )
    REFERENCES Technicians (id_tec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table Photos
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Photos (
  id_pho INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tec_id INT(11) UNSIGNED NOT NULL ,
  description VARCHAR(500) NOT NULL ,
  CONSTRAINT fkPhotosTechnicians
    FOREIGN KEY (tec_id )
    REFERENCES Technicians (id_tec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table ServicesCategoriesManufacturers
-- -----------------------------------------------------

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
  description VARCHAR(500) NOT NULL ,
  CONSTRAINT fkVideosTechnicians
    FOREIGN KEY (tec_id )
    REFERENCES Technicians (id_tec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table Photos
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Photos (
  id_pho INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tec_id INT(11) UNSIGNED NOT NULL ,
  description VARCHAR(500) NOT NULL ,
  CONSTRAINT fkPhotosTechnicians
    FOREIGN KEY (tec_id )
    REFERENCES Technicians (id_tec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table ServicesCategoriesManufacturers
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS CategoriesManufacturers (
  id_catMan INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cat_id INT(11) UNSIGNED NOT NULL ,
  man_id INT(11) UNSIGNED NOT NULL ,
  model VARCHAR(50) NOT NULL,
  CONSTRAINT fkCategoriesManufacturersCategories
    FOREIGN KEY (cat_id)
    REFERENCES Categories (id_cat)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fkCategoriesManufacturersManufacturers
    FOREIGN KEY (man_id )
    REFERENCES Manufacturers (id_man )
    ON DELETE CASCADE
    ON UPDATE CASCADE
  )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table CategoriesIssues
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS CategoriesIssues (
  id_catIss INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cat_id INT(11) UNSIGNED NOT NULL ,
  issues VARCHAR(500) NOT NULL ,
  CONSTRAINT fkCategoriesIssuesCategories
    FOREIGN KEY (cat_id)
    REFERENCES Categories (id_cat)
    ON DELETE CASCADE
    ON UPDATE CASCADE
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
  catMan_id INT(11) UNSIGNED NOT NULL ,
  catIss_id INT(11) UNSIGNED NOT NULL ,
  servType TINYINT UNSIGNED NOT NULL,
  estAmount NUMERIC(6,2) UNSIGNED NOT NULL,
  status INT(11) NOT NULL,
  CONSTRAINT fkServicesOfferedByTechTechnicians
    FOREIGN KEY (tec_id)
    REFERENCES Technicians (id_tec)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fkServicesOfferedByTechCategoriesManufacturers
    FOREIGN KEY (catMan_id)
    REFERENCES CategoriesManufacturers (id_catMan)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fkServicesOfferedByTechCategoriesIssues
    FOREIGN KEY (catIss_id)
    REFERENCES CategoriesIssues (id_catIss)
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
    ON UPDATE NO ACTION,
  CONSTRAINT fkReviewsTechnicians
    FOREIGN KEY (tec_id)
    REFERENCES Technicians (id_tec)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fkReviewsCustomers
    FOREIGN KEY (cus_id)
    REFERENCES Customers (id_cus)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
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
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
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
