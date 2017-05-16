	/*
		Role:
			2 - Admin
			1 - Tech
			0 - Customer
		Service Type:
			0 - item base
			1 - time base
	*/

	-- Insert data for badges --
	insert into `Badges` (`description`, `icon`) values
		('Bronze', 'url'),
		('Silver', 'url'),
		('Gold', 'url'),
		('Platinum', 'url');

	-- Insert data for login --
	insert into `Logins` (`email`, `passwordHash`, `role`, `whenRegistered`) values
		('admin@pomelo.com', '$2a$10$ewWJ0dmjgHYT6hdAzCSem.6THkdBnkh1gAa1QOpGxzjG3L8kuSVq6', 2, NOW()),
		('tech1@pomelo.com', '$2a$10$U4DwDhzPEgQbWJ6OCO1tVumEcF7njvmQgERpPrLKPjrIqq2Y9Zxxa', 1, NOW()),
		('tech2@pomelo.com', '$2a$10$3gXUMRKrLya6GD7OfaCeme63Vkg5oZApaPpEyeJJRDe6HzHE2e6qW', 1, NOW()),
		('tech3@pomelo.com', '$2a$10$nVvbCL0BdtwBuVKvDAs2ye7JkA6mu3nPNIypti9OaHp1S6xvtK4SK', 1, NOW()),
		('tech4@pomelo.com', '$2a$10$Ldk2dzZ73ZhAG/5RP13s6.0166A.3/FX3hUHTUaioeLko9SXDNVoS', 1, NOW()),
		('tech5@pomelo.com', '$2a$10$JIarV7MpOLSSXPEG0c0al.77MYf.gCs32S2ChKAm2ow7f6oBF6K92', 1, NOW()),
		('tech6@pomelo.com', '$2a$10$WIzIKiqfSr7KwQJmv1Ny8.w3f9Qj86zL/Dr5N5A8wX6PBtKSshagS', 1, NOW()),
		('tech7@pomelo.com', '$2a$10$dtKt65ZAhNT2b.z0IJltPOwmIwu3pWHXCFpirF5iVejsVM8/LdO92', 1, NOW()),
		('tech8@pomelo.com', '$2a$10$Kgipz/F.7FUUn2ZN.ZzNsO1FYZKLhSRsSIDbRcleS/EJsfs3rM34u', 1, NOW());



	-- insert data into technicians --
	-- status 1: active, 0: not --
	insert into `Technicians` (`log_id`, `firstName`, `lastName`, `hourlyRate`,
		`City`, `Zip`, `ratings`, `bad_id`, `status`, `aboutMe`) values
		(2, 'Tech_1', 'Byakugan', 46.5, 'SLO', 93405, 3.5, 2, 1, 'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.'),
		(3, 'Tech_2', 'Uhara', 30.0, 'Santa Clara', 95050, 4.2, 3, 1,'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.'),
		(4, 'Tech_3', 'Hosei', 35.5, 'Santa Clara', 95050, 2.5, 4, 1, 'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.'),
		(5, 'Tech_4', 'Zin', 50.0, 'San Luis Obispo', 93405, 4.5, 3, 1, 'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.'),
		(6, 'Tech_5', 'Zee', 30.0, 'San Luis Obispo', 93405, 4.5, 3, 0, 'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.'),
		(7, 'Tech_6', 'Zin2', 55.0, 'San Luis Obispo', 93403, 4.5, 3, 1,'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.'),
		(8, 'Tech_7', 'Zee2', 45.0, 'San Luis Obispo', 93406, 4.5, 3, 1,'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.'),
		(9, 'Tech_8', 'Tun', 25.5, 'Santa Maria', 93454, 2.5, 4, 1,'While most qualitative researchers base their theories on in-depth interviews with a small number of people, an autoethnographer only uses his or her own experiences and feelings to understand a wider subject.');

	-- insert into certification --
	insert into `Certifications` (`tec_id`, `certificationName`, `institution`, `yearObtained`) values
		(1, 'Bachelor in CS', 'Cal Poly', '2017-01-12'),
		(1, 'Bachelor in Math', 'Cal Poly', '2017-01-25'),
		(2, 'Master in CS', 'UCLA', '2015-02-23');

-- 	-- insert data into profolio --
-- 	insert into `Portfolio` (`tec_id`, `websites`, `aboutMe`, `companyName`,
-- 		`CompanyAddress`, `CompanyPhone`) values
-- 		(1, 'url', 'tech1 is me', 'Company_tec_1', 'SLO', 'xxx-xxx-xxxx'),
-- 		(2, 'url', 'tech2 is me', 'Company_tec_2', 'LA', 'xxx-xxx-xxxx');

	-- insert data into customer --
	insert into `Customers` (`email`) values
		('cus1@pomelo.com'),
		('cus2@pomelo.com');

	-- insert data into categories --
	insert into `Categories` (`category`) values
		('Desktop'), -- 1
		('Laptop'), -- 2
		('Tablet'), -- 3
		('Smart Phone'); -- 4

	-- insert data into Manufactures --
	insert into `Manufacturers` (`manufacturer`) values
		('Samsung'), -- 1
		('Apple'), -- 2
		('Google'), -- 3
		('Dell'), -- 4
		('ASUS'); -- 5

	-- insert data into catergories manufacture --
	insert into `CategoriesManufacturers` (`cat_id`, `man_id`) values
		(1, 1), (1, 2), (1, 4), (1, 5),
		(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
		(3, 1), (3, 2), (3, 3),
		(4, 1), (4, 2), (4, 3);

	-- insert into Models table --
	insert into `Models` (`catMan_id`, `model`) values
		(3, 'Dell Dekstop'), -- 1
		(2, 'Apple Mac Station'), -- 2
		(6, 'Macbook 2015'), -- 3
		(8, 'XPS 13'), -- 4
		(11, 'iPad 2 mini'), -- 5
		(13, 'Galaxy s6'), -- 6
		(13, 'Galaxy s7'), -- 7
		(14, 'iPhone 7'), -- 8
		(14, 'iPhone 6'); -- 9

	-- insert into categories issues --
	insert into `Issues` (`issue`) values
		('Can\'t turn on'), -- 1
		('Upgrade RAM'), -- 2
		('Webcame doesn\'t work'), -- 3
		('Can\'t connect to WiFi'), -- 4
		('Keyboard doesn\'t work'), -- 5
		('Broken Screen'), -- 6
		('Replace battery'); -- 7

	-- insert into ModelsIssues --
	insert into `ModelsIssues` (`mod_id`, `iss_id`) values
		(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
		(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
		(3, 1), (3, 2), (3, 3), (3, 4), (3, 5),
		(4, 1), (4, 2), (4, 3), (4, 4), (4, 5);

	insert into `ModelsIssues` (`mod_id`, `iss_id`) values
		(5, 3), (5, 4), (5, 6), (5, 7),
		(6, 3), (6, 4), (6, 6), (6, 7),
		(7, 3), (7, 4), (7, 6), (7, 7),
		(8, 3), (8, 4), (8, 6), (8, 7),
		(9, 3), (9, 4), (9, 6), (9, 7);

	-- insert data into Service offer by tech --
	insert into `ServicesOfferedByTech` (`tec_id`, `modIss_id`,
		 `catMan_id`, `servType`, `estAmount`, `status`) values
		(1, 1, 3, 0, 50.99, 1),
		(1, 2, 3, 1, 46.50, 0),
		(1, 3, 3, 0, 60.99, 1),
		(1, 4, 3, 0, 50.99, 1),
		(1, 5, 3, 1, 46.50, 1),
		(1, 6, 3, 0, 60.99, 1),
		(1, 7, 3, 0, 149.99, 1),
		(1, 16, 3, 1, 46.50, 1),
		(1, 17, 3, 0, 60.99, 1),
		(1, 18, 3, 0, 149.99, 1),
		(2, 5, 3, 0, 99.99, 1),
		(2, 6, 3, 1, 30.00, 1),
		(2, 10, 3, 0, 149.99, 1),
		(2, 11, 3, 0, 99.99, 1),
		(2, 12, 3, 1, 30.00, 1),
		(2, 1, 3, 0, 99.99, 1),
		(2, 2, 3, 1, 30.00, 1),
		(2, 3, 3, 0, 149.99, 1),
		(2, 20, 3, 0, 99.99, 1),
		(2, 22, 3, 1, 30.00, 1);

	-- insert data into ServiceHistory --
	insert into `ServicesHistory` (`serTec_id`, `cus_id`, `description`, `amount`, `status`,
		`orderedDate`, `completedDate`, `isReview`) values
		(1, 1, 'My Dell Desktop deosn\'t turn on, please help!', 200.50, 3, '2016-02-22', now(), 1),
		(2, 1, 'Upgrade Ram PLS', 149.99, 4, '2017-01-10', '2017-01-12', 1),
		(20, 2, 'ipad mini 2 can\'t connect to WIFI', 69.99, 3, '2016-04-21', '2016-04-25', 1),
		(19, 2, 'xps13 bad keyboard', 239.99, 3, '2017-01-12', '2017-01-15', 0);

	-- insert data into review --
	insert into `Reviews` (`serHis_id`, `cus_id`, `tec_id`, `stars`, `comment`) values
		(1, 1, 1, 5.0, 'Good Service, Fast'),
		(2, 1, 1, 1.0, 'Bad Service'),
		(3, 2, 1, 4.5, 'Okay but slow');
