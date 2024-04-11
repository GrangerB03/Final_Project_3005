--create credentials
INSERT INTO credentials(s_id, t_id, uname, passwd) VALUES
(null, null, 'bengranger3', 'super_secret_password'),
(null, null, 'username', 'password'),
(null, null, 'bobdylan', 'guitar'),
(null, null, 'elton_john', 'piano_rocks'),
(null, null, 'bon_jovi', 'singing_is_cool'),
(1, null, 'admin', 'password123'),
(2, null, 'maintenance_staff', 'tools_and_things'),
(3, null, 'manager123', 'this_is_my_password'),
(null, 1, 'cooltrainer', 'password123'),
(null, 2, 'gym_girl123', 'squats_are_cool'),
(null, 3, 'boxing_man345', 'rocky_1974'),
(null, 4, 'yoga_teacher', 'namaste'),
(null, 5, 'buffguy', 'benchpress');

--create accounts receivable for members
INSERT INTO accounts_receivable(last_name, amount) VALUES
('Granger', 50),
('Name', 65),
('John', 45),
('Jovi', 50),
('Dylan', 25);

--create members
INSERT INTO members(member_id, first_name, last_name, classes, availability, weight, height, goal_weight, current_squat, current_bench, current_deadlift, goal_squat, goal_bench, goal_deadlift, account_id) VALUES
((SELECT m_id FROM credentials WHERE uname = 'bengranger3'), 'Ben', 'Granger', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE], 210, 180, 215, 365, 235, 455, 405, 275, 495, (SELECT ar_id FROM accounts_receivable WHERE last_name = 'Granger')),
((SELECT m_id FROM credentials WHERE uname = 'elton_john'), 'Elton', 'John', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE], 150, 180, 155, 100, 75, 150, 120, 100, 200, (SELECT ar_id FROM accounts_receivable WHERE last_name = 'John')),
((SELECT m_id FROM credentials WHERE uname = 'bon_jovi'), 'Bon', 'Jovi', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE], 150, 180, 155, 100, 75, 150, 120, 100, 200, (SELECT ar_id FROM accounts_receivable WHERE last_name = 'Jovi')),
((SELECT m_id FROM credentials WHERE uname = 'username'), 'User', 'Name', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE], 160, 190, 170, 120, 100, 200, 150, 120, 250, (SELECT ar_id FROM accounts_receivable WHERE last_name = 'Name')),
((SELECT m_id FROM credentials WHERE uname = 'bobdylan'), 'Bob', 'Dylan', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE], 170, 200, 165, 75, 50, 100, 100, 75, 120, (SELECT ar_id FROM accounts_receivable WHERE last_name = 'Dylan'));

--create staff
INSERT INTO staff(staff_id, last_name) VALUES 
(1, 'Owner'),
(2, 'Maintenance'),
(3, 'Managers');

--create trainers
INSERT INTO trainers(trainer_id, last_name, classes, availability) VALUES
(1, 'Trainer', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]),
(2, 'Fox', null, ARRAY [FALSE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]),
(3, 'Stephenson', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE]),
(4, 'Eduardo', null, ARRAY [TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]),
(5, 'Guy', null, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]);

--create rooms
INSERT INTO rooms(room_id, room_number, availability) VALUES
(1, 100, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE]),
(2, 101, ARRAY [TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]),
(3, 102, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]),
(4, 200, ARRAY [TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]),
(5, 205, ARRAY [TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]),
(6, 310, ARRAY [FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]);

--create equipment
INSERT INTO equipment(name, description, time_since_maintenance, out_of_order) VALUES
('Bench press', 'A bench to press on using a barbell.', 30, false),
('Squat rack', 'An area to squat in using a barbell.', 15, false),
('Smith machine', 'A machine to perform barbell excercises in a controlled vertical plane.', 45, false),
('Hack Squat', 'A controlled plane to squat in.', 75, true),
('Calf Raise', 'A machine to perform calf raises in.', 5, false),
('Punching Bag', 'A bag to practice punching.', 60, false);

--create accounts payable
INSERT INTO accounts_payable(name, description, amount) VALUES
('Equipment Repair Invoice - Squat Rack', 'Invoice to repair Squat Rack from in March', 150),
('Repair Deposit - Smith Machine', 'Deposit for scheduled repair of Smith Machine.', 25),
('Repair Deposit - Hack Squat', 'Deposit for scheduled repair of Hack Squat.', 25);

--create classes 
INSERT INTO classes(name, description, room_id, cost, timeslot, trainer_id) VALUES
('Spin Class', 'A fun time, cycling for 60 minutes with music.', 2, 10, ARRAY [FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE], 2),
('Boxing Class', 'Introduction to boxing, 75 minutes with our boxing specalist.', 1, 50, ARRAY [FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE], 3),
('Weightlifting', 'An introduction to olympic style weightlifting, 80 minutes.', 6, 75, ARRAY [TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE], 2),
('Yoga Class', 'A yoga class with calming music, 45 minutes.', 5, 35, ARRAY [FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE], 4);