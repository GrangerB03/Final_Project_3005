CREATE TABLE credentials (
	cred_id SERIAL PRIMARY KEY,
	m_id SERIAL UNIQUE,
	s_id INTEGER UNIQUE,
	t_id INTEGER UNIQUE,
	uname VARCHAR (255) NOT NULL,
	passwd VARCHAR (255) NOT NULL
);

CREATE TABLE accounts_receivable(
	ar_id SERIAL PRIMARY KEY,
	last_name VARCHAR (255) NOT NULL,
	amount FLOAT
);

CREATE TABLE trainers(
	trainer_id INTEGER UNIQUE NOT NULL,
	last_name VARCHAR (255) NOT NULL,
	classes INTEGER [], --foreign key to class_id
	availability BOOL [], --(10 columns with boolean values, true for available, false for not)
	--[Mon_morning, Mon_afternoon, Tues_morning, Tues_afternoon, ..., Fri_afternoon]
	FOREIGN KEY (trainer_id) REFERENCES credentials(t_id)
);

CREATE TABLE staff(
	staff_id INTEGER UNIQUE NOT NULL,
	last_name VARCHAR (255) NOT NULL,
	FOREIGN KEY (staff_id) REFERENCES credentials(s_id)
);

CREATE TABLE rooms(
	room_id SERIAL PRIMARY KEY,
	room_number INTEGER NOT NULL,
	availability BOOL [] --(10 columns with boolean values, true for available, false for not)
	--[Mon_morning, Mon_afternoon, Tues_morning, Tues_afternoon, ..., Fri_afternoon]
);

CREATE TABLE classes(
	class_id SERIAL PRIMARY KEY,
	name VARCHAR (255) NOT NULL,
	description TEXT,
	room_id INTEGER NOT NULL,
	cost INTEGER NOT NULL,
	timeslot BOOL [], --(10 columns with boolean values, true for available, false for not)
	--[Mon_morning, Mon_afternoon, Tues_morning, Tues_afternoon, ..., Fri_afternoon]
	trainer_id INTEGER NOT NULL,
	FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id),
	FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

CREATE TABLE equipment(
	equipment_id SERIAL PRIMARY KEY,
	name VARCHAR (255) NOT NULL,
	description TEXT,
	time_since_maintenance INTEGER, --days since last maintenance
	out_of_order BOOL
);

CREATE TABLE accounts_payable(
	ap_id SERIAL PRIMARY KEY,
	name VARCHAR (255) NOT NULL,
	description TEXT,
	amount FLOAT
);

CREATE TABLE members(
	member_id INTEGER UNIQUE NOT NULL,
	first_name VARCHAR (255) NOT NULL,
	last_name VARCHAR (255) NOT NULL,
	classes INTEGER [], --foreign key to class_id
	availability BOOL [],
	weight INTEGER NOT NULL,
	height INTEGER NOT NULL,
	goal_weight INTEGER,
	current_squat INTEGER NOT NULL,
	current_bench INTEGER NOT NULL,
	current_deadlift INTEGER NOT NULL,
	goal_squat INTEGER,
	goal_bench INTEGER,
	goal_deadlift INTEGER,
	account_id INTEGER NOT NULL,
	FOREIGN KEY (member_id) REFERENCES credentials(m_id),
	FOREIGN KEY (account_id) REFERENCES accounts_receivable(ar_id)
);