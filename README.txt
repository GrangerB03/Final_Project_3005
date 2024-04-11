COMP 3005 - w24 - Final Project
Group 163
Member(s): Ben Granger

Final Project v2 - Health and Fitness Club Management System

Installation:
	First, this program requires that you have Node.js and the node package manager (npm) installed on your system. To install the dependencies, 
	enter the directory that contains the 'package.json' file and run the command 'npm install'. Next, there must exist a database that has been 
	configured using the 'init.sql' and 'init_data.sql' files included in this repository. The credentials for the database must be included in 
	a file named '.env' with the following format:
	
	PG_HOST=<your_host_here>
	PG_PORT=<your_port_here>
	PG_DATABASE=<your_database_name_here>
	PG_PASSWORD=<your_password_here>
	PG_USER=<your_username_here>
	
	For most users, the host will be localhost and the port will be 5432.

Execution:
	To begin the server, type the following command in the same directory as the 'server.js' file: 'node server.js', the sever will begin running.
	To visit the website, in any browser, go to the address 'http://localhost:3000'.
	
	Once you are on the site, log into one of the accounts listed in the 'init_data.sql' file under 'credentials' and visit the functionality.
	All of the different pages have labelled buttons which explain much of the functionality of the code, and the submission video explains any unclear
	concepts.

For code documentation, please visit the 'server.js' file and read the comments, or the various '.js' files in the html directory and subdirectories.