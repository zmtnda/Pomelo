drop database if exists tekcrew_db;
create database tekcrew_db;
use tekcrew_db;

-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Users (
  id INT(11)  AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(128) NOT NULL ,
  password VARCHAR(256) NOT NULL ,
  role int(11) UNSIGNED NOT NULL ,
  firstName VARCHAR(45) NOT NULL ,
  lastName VARCHAR(45) NOT NULL ,
  phone VARCHAR(45) NULL ,
  whenRegistered DATETIME not null,
  UNIQUE KEY (email)
);

/*
-- -----------------------------------------------------
-- Table reviews
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS reviews (
  idreview INT(11) NOT NULL AUTO_INCREMENT ,
  idreviewer INT(11) NOT NULL ,
  title VARCHAR(128) NOT NULL ,
  comment VARCHAR(500) NOT NULL ,
  rating ENUM('1','2','3','4','5') NOT NULL DEFAULT '1' ,
  users_iduser INT(11) NOT NULL ,
  users_user_name VARCHAR(15) NOT NULL ,
  technicians_idtechnician INT(11) NOT NULL ,
  PRIMARY KEY (idreview, idreviewer) ,
  INDEX fk_reviews_users1_idx (users_iduser ASC, users_user_name ASC) ,
  INDEX fk_reviews_technicians1_idx (technicians_idtechnician ASC) ,
  CONSTRAINT fk_reviews_users1
    FOREIGN KEY (users_iduser , users_user_name )
    REFERENCES users (iduser , user_name )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_reviews_technicians1
    FOREIGN KEY (technicians_idtechnician )
    REFERENCES technicians (idtechnician )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

SHOW WARNINGS;*/

-- -----------------------------------------------------
-- Table services
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS Services (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  serviceName VARCHAR(500) NOT NULL ,
  amount FLOAT NOT NULL DEFAULT 0.00 ,
  status int NOT NULL DEFAULT 0 ,
  timestamp DATETIME NOT NULL ,
  userId INT(11) NULL ,
  technicianId INT(11) NOT NULL ,
  CONSTRAINT fkServicesUsers
    FOREIGN KEY (userId)
    REFERENCES Users (id )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fkServicesTechnicians
    FOREIGN KEY (technicianId )
    REFERENCES Users (id )
    ON DELETE CASCADE
    ON UPDATE CASCADE);
-- -----------------------------------------------------
-- Table technicians
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS serviceHistory (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  userId INT(11) NOT NULL ,
  technicianId INT(11) NOT NULL ,
  serviceId INT(11) NOT NULL ,
  whenCompleted DATETIME NOT NULL ,
  CONSTRAINT fkHistoryUsers
    FOREIGN KEY (userId)
    REFERENCES Users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
	CONSTRAINT fkHistoryServices
	 FOREIGN KEY (serviceId)
    REFERENCES Services (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
	CONSTRAINT fkHistoryUsers1
    FOREIGN KEY (technicianId)
    REFERENCES Users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
-----
-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------
INSERT INTO Users
(id, email, password, role, firstName, lastName, phone, whenRegistered)
VALUES (2, "cust1@11.com", "password", 0, "I am", "customer1", 123456789, NOW());

INSERT INTO Users
(id, email, password, role, firstName, lastName, phone, whenRegistered)
VALUES (3, "cust2@11.com", "password", 0, "I am", "customer2", 123456789, NOW());

INSERT INTO Users
(id, email, password, role, firstName, lastName, phone, whenRegistered)
VALUES (4, "tech@11.com", "password", 1, "I am", "technician", 123456789, NOW());

INSERT INTO Users
(id, email, password, role, firstName, lastName, phone, whenRegistered)
VALUES (5, "tech2@11.com", "password", 1, "I am", "technician2", 123456789, NOW());
-- -----------------------------------------------------
-- Table services
-- -----------------------------------------------------
INSERT INTO Services
(id,serviceName)
VALUES (1, "Home wireless support");

INSERT INTO Services
(id,serviceName)
VALUES (2, "Smart phone screen replacement");

INSERT INTO Services
(id,serviceName)
VALUES (3, "Laptop screen replacement");

INSERT INTO Services
(id,serviceName)
VALUES (4, "Business network setup");

INSERT INTO Services
(id,serviceName)
VALUES (5, "Keyboard replacement");

INSERT INTO Services
(id,serviceName)
VALUES (6, "Battery replacement");
-- -----------------------------------------------------
-- Table services offer
-- -----------------------------------------------------
INSERT INTO ServicesOffer
(id,serviceName,amount, status,timestamp,technicianId)
VALUES (1, "Home Wireless Support", 200.00, 0, NOW(),4);

INSERT INTO ServicesOffer
(id,serviceName,amount, status,timestamp,technicianId)
VALUES (2, "Screen Replacement", 70.00, 0, NOW(),4);

INSERT INTO ServicesOffer
(id,serviceName,amount, status,timestamp,technicianId)
VALUES (3, "Battery Replacement", 40.00, 0, NOW(),4);

INSERT INTO ServicesOffer
(id,serviceName,amount, status,timestamp,technicianId)
VALUES (4, "Home Wireless Support", 180.00, 0, NOW(),5);

INSERT INTO ServicesOffer
(id,serviceName,amount, status,timestamp,technicianId)
VALUES (5, "Screen Replacement", 60.00, 0, NOW(),5);

INSERT INTO ServicesOffer
(id,serviceName,amount, status,timestamp,technicianId)
VALUES (6, "Battery Replacement", 30.00, 0, NOW(),5);

