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
	insert into `Logins` (`email`, `passwordSalt`, `passwordHash`, `role`, `whenRegistered`) values
		('admin@pomelo.com', '$2a$10$ewWJ0dmjgHYT6hdAzCSem.' ,'$2a$10$ewWJ0dmjgHYT6hdAzCSem.6THkdBnkh1gAa1QOpGxzjG3L8kuSVq6', 2, NOW()),
		('tech1@pomelo.com', '$2a$10$U4DwDhzPEgQbWJ6OCO1tVu', '$2a$10$U4DwDhzPEgQbWJ6OCO1tVumEcF7njvmQgERpPrLKPjrIqq2Y9Zxxa', 1, NOW()),
		('tech2@pomelo.com', '$2a$10$3gXUMRKrLya6GD7OfaCeme', '$2a$10$3gXUMRKrLya6GD7OfaCeme63Vkg5oZApaPpEyeJJRDe6HzHE2e6qW', 1, NOW()),
		('tech3@pomelo.com', '$2a$10$nVvbCL0BdtwBuVKvDAs2ye', '$2a$10$nVvbCL0BdtwBuVKvDAs2ye7JkA6mu3nPNIypti9OaHp1S6xvtK4SK', 1, NOW());

	-- insert data into technicians --
	-- status 1: active, 0: not --
	insert into `Technicians` (`log_id`, `firstName`, `lastName`, `hourlyRate`,
		`City`, `Zip`, `ratings`, `bad_id`, `status`) values
		(2, 'Tech_1', 'Byakugan', 46.5, 'SLO', 93405, 3.5, 2, 1),
		(3, 'Tech_2', 'Uhara', 30.0, 'Santa Clara', 95050, 4.2, 3, 1),
		(4, 'Tech_3', 'Hosei', 35.5, 'Santa Clara', 95050, 2.5, 4, 0);

	-- insert into certification --
	insert into `Certifications` (`tec_id`, `certificationName`, `institution`, `yearObtained`) values
		(1, 'Bachelor in CS', 'Cal Poly', '2017-01-12'),
		(1, 'Bachelor in Math', 'Cal Poly', '2017-01-25'),
		(2, 'Master in CS', 'UCLA', '2015-02-23');

	-- insert data into profolio --
	insert into `Portfolio` (`tec_id`, `websites`, `aboutMe`, `companyName`,
		`CompanyAddress`, `CompanyPhone`) values
		(1, 'url', 'tech1 is me', 'Company_tec_1', 'SLO', 'xxx-xxx-xxxx'),
		(2, 'url', 'tech2 is me', 'Company_tec_2', 'LA', 'xxx-xxx-xxxx');

	-- insert data into customer --
	insert into `Customers` (`email`) values
		('cus1@pomelo.com'),
		('cus2@pomelo.com');

	-- insert data into categories --
	insert into `Categories` (`category`) values
		('Desktop'),
		('Laptop'),
		('Tablet'),
		('Smart Phone');

	-- insert data into Manufactures --
	insert into `Manufacturers` (`manufacturer`) values
		('Samsung'),
		('Apple'),
		('Google'),
		('Dell'),
		('ASUS');

	-- insert data into catergories manufacture --
	insert into `CategoriesManufacturers` (`cat_id`, `man_id`, `model`) values
		(1, 4, 'Dell Dekstop'), -- 1
		(1, 2, 'Apple Mac Station'), -- 2
		(2, 2, 'Macbook 2015'), -- 3
		(2, 4, 'XPS 13'), -- 4
		(3, 2, 'iPad 2 mini'), -- 5
		(4, 1, 'Galaxy s6'), -- 6
		(4, 1, 'Galaxy s7'), -- 7
		(4, 2, 'iPhone 7'), -- 8
		(4, 2, 'iPhone 6'); -- 9

	-- insert into categories issues --
	insert into `CategoriesIssues` (`cat_id`, `issue`) values
		(1, 'Can\'t turn on'), -- 1
		(1, 'Upgrade RAM'), -- 2
		(2, 'Can\'t turn on'), -- 3
		(2, 'Can\'t connect to WiFi'), -- 4
		(2, 'Keyboard doesn\'t work'), -- 5
		(3, 'Broken Screen'), -- 6
		(3, 'Can\'t turn on'), -- 7
		(4, 'Broken Screen'), -- 8
		(4, 'Replace battery'); -- 9

	-- insert data into Service offer by tech --
	insert into `ServicesOfferedByTech` (`tec_id`, `catMan_id`, `catIss_id`,
		`servType`, `estAmount`, `status`) values
		(1, 1, 1, 0, 50.99, 1), -- dell desktop cant turn on -- 1
		(1, 3, 4, 1, 46.50, 1), -- macbook 2015 cant connect wifi -- 2
		(1, 5, 8, 0, 60.99, 1), -- ipad 2 mini broken screen -- 3
		(1, 7, 9, 0, 149.99, 1), -- galaxy 7 replace baterry -- 4
		(2, 6, 9, 0, 99.99, 1), -- galaxy s6 replace baterry -- 5
		(2, 4, 5, 1, 30.00, 1); -- xps13 keyboard doesn't work -- 6

	-- insert data into ServiceHistory --
	insert into `ServicesHistory` (`serTec_id`, `cus_id`, `description`, `amount`, `status`,
		`orderedDate`, `completedDate`) values
		(1, 1, 'My Dell Desktop deosn\'t turn on, please help!', 200.50, 3, '2016-02-22', now()),
		(2, 1, 'Can\'t connect wifi help!!', 149.99, 4, '2017-01-10', '2017-01-12'),
		(3, 2, 'ipad mini 2 broken screen', 69.99, 3, '2016-04-21', '2016-04-25'),
		(6, 2, 'xps13 bad keyboard', 239.99, 3, '2017-01-12', '2017-01-15');

	-- insert data into review --
	insert into `reviews` (`serHis_id`, `cus_id`, `tec_id`, `stars`, `comment`) values
		(1, 1, 1, 5.0, 'Good Service, Fast'),
		(2, 1, 1, 1.0, 'Bad Service'),
		(3, 2, 1, 4.5, 'Okay but slow'),
		(4, 2, 2, 3.5, 'worked for 2 weeks happen again');
