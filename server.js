/**
COMP 3005 - W24 - Final Project
Carleton University
Group 163
Authour: Ben Granger
Student #101221725

TODO
Create database diagrams
Create explanation and demo video
Upload to github

ENSURE DOCUMENTATION IS MAINTAINED THROUGHOUT WRITING
*/

//constants declaration
const host = 'localhost'
const fs = require('fs')
const url = require('url')
const PORT = process.env.PORT || 3000
const {Client} = require('pg')
require('dotenv').config()
const ROOT_DIR = 'html' //dir to serve static files from on serverside

//a really dirty way of handling data transfer between files
let uname = ''
let passwd = ''
let metadata = -1
let credentials = -1

//function to get the database client
getClient = async () => {
	const client = new Client({
		host: process.env.PG_HOST,
		port: process.env.PG_PORT,
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
		ssl: false,
	});
	await client.connect();
	const res = await client.query('SELECT $1::text as connected', ['Connection to postgres successful!']);
	console.log(res.rows[0].connected);
	return client;
};

//asynchronous wrapper to server, to enable db queries
(async () => {
	const server = require('http').createServer(handler)
	const io = require('socket.io')(server)
	const client = await getClient()

	//for ease of use (dict of filetype shortcuts essentially)
	const MIME_TYPES = {
	  'css': 'text/css',
	  'gif': 'image/gif',
	  'htm': 'text/html',
	  'html': 'text/html',
	  'ico': 'image/x-icon',
	  'jpeg': 'image/jpeg',
	  'jpg': 'image/jpeg',
	  'js': 'application/javascript',
	  'json': 'application/json',
	  'png': 'image/png',
	  'svg': 'image/svg+xml',
	  'txt': 'text/plain'
	}


	//to get filetype (for content type JSON headers)
	function get_mime(filename) {
	  for (let ext in MIME_TYPES) {
		if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
		  return MIME_TYPES[ext]
		}
	  }
	  return MIME_TYPES['txt']
	}

	server.listen(PORT)

	//function to serve files when requested (in the url)
	function handler(request, response) {
	  //handler for http server requests including static files
	  let urlObj = url.parse(request.url, true, false)
	  console.log('\n============================')
	  console.log("PATHNAME: " + urlObj.pathname)
	  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
	  console.log("METHOD: " + request.method)

	  let filePath = ROOT_DIR + urlObj.pathname
	  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

	  fs.readFile(filePath, function(err, data) {
		if (err) {
		  //report error to console
		  console.log('ERROR: ' + JSON.stringify(err))
		  //respond with not found 404 to client
		  response.writeHead(404);
		  response.end(JSON.stringify(err))
		  return
		}
		response.writeHead(200, {
		  'Content-Type': get_mime(filePath)
		})
		response.end(data)
	  })
	}

	//when client connects, handle functions with the socket serverside
	io.on('connection', function(socket){
		console.log("client connected")
		
		/**
		REQUIREMENTS:
			LOGIN PAGE DONE
			
			MEMBERS ---------- DONE --------------
			User registration (from the 'register' button in login page) DONE
			Profile Management (Update information, fitness goals, healthcare metrics (allow deregister here)) (make a 
			separate page for this) DONE 
			Dashboard display (Diplay exercise routines, fitness achievements, health statistics) (main page once logged in) DONE
			Schedule management (Signup for classes (get data from database), ensure trainer is avaible at given time, updates
			account expenses when signup for class or refund if unregister) (separate page) DONE
			
			NOTE: FOR TRAINER AVAIBILITY DIVIDE DAY INTO MORNING AND AFTERNOON, AVAILABILITY IS ONLY VALID MON-FRI (5 DAYS, 
			10 SLOTS)
			TRAINERS (treated as normal members plus permissions and some interfaces) --------------------- DONE ---------------------------
			Schedule management (Set avaiability times (update database)) (part of trainer dashboard (if they're a trainer 
			append to normal dashboard)) DONE
			Member Profile Viewing (can see member's profile management page (non editable) by searching by page) (separate page, 
			click from trainer dashboard to get here) DONE
			
			ADMINISTRATIVE STAFF -------------------------- DONE ----------------------------------------
			Room Booking Management (dashboard to reserve rooms (from a rooms table in the database, update rooms table to set 
			it as reserved))
			Equipment Maintenance Monitoring (dashboard pulling from equipment table in database (add button to 
			request maintenance))
			Class Schedule Updating (admin dashboard which can modify all aspects of a class, lists available trainers to assign to
			classes)
			Class creation (dashboard to make a )
			Billing and Payment Processing (keep track of due bills (requesting mainenance adds a bill?) and enable admin staff
			to pay the bills)
		*/
		
		//BEGIN AUTH + SETUP FUNCTIONS
		//socket to assist with registration event (init)
		socket.on('register', function(data) {
			console.log("Register request received")
			//add info to database and redirect user to login page
			if(client) console.log("Client detected!")
		})
		//socket to handle registration event
		socket.on('registration_request', function(data){
			duplicateUnameCheck(data)
		})
		//socket to initalize registration
		socket.on('registration_info', function(data){
			registration(data)
		})
		//function to handle duplicate username check queries
		duplicateUnameCheck = async(data) => {
			uname = data.uname
			passwd = data.passwd
			let result = await client.query('SELECT * FROM credentials WHERE uname=\'' + uname + '\'')
			let isValid = (result.rows.length == 0)
			console.log("REGISTRATION UNAME CHECK RESULTS:")
			console.log(result.rows)
			console.log(isValid)
			if((uname == "" || passwd == "") || !isValid){
				socket.emit('unsuccessful_registration', {uname: uname, passwd: passwd})
			}else{
				socket.emit('successful_registration', {uname: uname, passwd: passwd})
			}
		}
		//async function to check for duplicate username, and then create credentials database entry
		registration = async(data) => {
			if(uname == '' || passwd == '') socket.emit('invalid_registration')
			let fname = data.fname
			let lname = data.lname
			let weight = data.weight
			let height = data.height
			let squat = data.squat
			let bp = data.bp
			let dl = data.dl
			if(client) console.log("Client detected!")
			
			let acc_res = await client.query('INSERT INTO accounts_receivable(last_name, amount) VALUES ($1, $2)', [lname, 50])
			console.log(acc_res)
			
			let acc_number_query = await client.query('SELECT ar_id FROM accounts_receivable WHERE last_name=\'' + lname + '\'')
			if(acc_number_query.rows.length != 0) console.log("something's wrong")
			let acc_number = acc_number_query.rows[0].ar_id
			console.log("Account number: " + acc_number)
			
			let res = await client.query('INSERT INTO credentials(s_id, t_id, uname, passwd) VALUES ($1, $2, $3, $4)', [null, null, uname, passwd])
			console.log(res)
			
			let m_id_query = await client.query('SELECT m_id FROM credentials WHERE uname=\'' + uname + '\' AND passwd=\'' + passwd +'\'')
			console.log(m_id_query)
			if(m_id_query.rows.length == 0) console.log("something's wrong")
			let m_id = m_id_query.rows[0].m_id
			console.log("m_id = " + m_id)
			
			let mem_res = await client.query('INSERT INTO members(member_id, first_name, last_name, classes, availability, weight, height, goal_weight, current_squat, current_bench, current_deadlift, goal_squat, goal_bench, goal_deadlift, account_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)', [m_id, fname, lname, null, [true, true, true, true, true, true, true, true, true, true], weight, height, null, squat, bp, dl, parseInt(squat, 10) + 50, parseInt(bp, 10) + 25, parseInt(dl, 10) + 100, acc_number])
			console.log(mem_res)
			
			socket.emit('registration_complete', {uname: uname})
			uname = ''
			passwd = ''
		}
		//socket for login event
		socket.on('login', function(data) {
			credentialVerification(data)
		})
		//login function to ensure username and password are in the database and set metadata
		credentialVerification = async(data) => {
			console.log("Login request received")
			console.log("uname = " + data.uname)
			console.log("passwd = " + data.passwd)
			if(client) console.log("Client detected!")
			let uname = data.uname
			let passwd = data.passwd
			//check if valid credentials in Database as well
			let result = await client.query('SELECT * FROM credentials WHERE uname=\'' + uname + '\' AND passwd=\'' + passwd +'\'')
			console.log(result.rows)
			let isValid = (result.rows.length == 0)
			console.log(isValid)
			if(!(uname == "" || passwd == "" || !isValid)){
				socket.emit('login_unsuccessful', {})
				return
			}
			if(credentials == -1){
				credentials = result.rows[0]
			}
			//need to send database info for all fields minus password to client
			let q_result = await client.query('SELECT member_id, t_id, first_name, last_name, classes, availability, weight, height, goal_weight, current_squat, current_bench, current_deadlift, goal_squat, goal_bench, goal_deadlift FROM credentials, members WHERE member_id = credentials.m_id AND credentials.uname = \'' + uname + '\' AND credentials.passwd = \'' + passwd + '\'')
			console.log("Member metadata:")
			console.log(q_result.rows)
			if(metadata == -1){
				console.log("setting metadata")
				metadata = q_result.rows[0]
			}
			socket.emit('login_successful', {member_id: result.rows[0].m_id, trainer_id: result.rows[0].t_id, staff_id: result.rows[0].s_id})
		}
		//socket to serve metadata to initalized client
		socket.on("setup_complete", function(data){
			socket.emit("init_data", metadata)
			metadata = -1
		})
		
		//END AUTH + SETUP FUNCTIONS
		//socket for goal lifts modification event
		socket.on("modification_to_goals_request", function(data){
			modifyGoals(data)
		})
		//function to handle queries for goal lifts modification
		modifyGoals = async(data) =>{
			console.log("MODIFY GOAL LIFT REQUEST:")
			console.log(data)
			let id = data.id
			let squat = data.squat
			let bench = data.bench
			let deadlift = data.deadlift
			let weight = data.weight
			
			let mod_query = await client.query('UPDATE members SET goal_squat = ' + squat + ', goal_bench = ' + bench + ', goal_deadlift = ' + deadlift + ', goal_weight = ' + weight + ' WHERE member_id = ' + id)
			let metadata_query = await client.query('SELECT member_id, first_name, last_name, classes, weight, height, goal_weight, current_squat, current_bench, current_deadlift, goal_squat, goal_bench, goal_deadlift FROM members WHERE member_id = ' + id)
			socket.emit("update_metadata", metadata_query.rows[0])
		}
		//socket for current lifts modification event
		socket.on("modification_to_lifts_request", function(data){
			modifyCurrent(data)
		})
		//function to handle queries for current lifts modification
		modifyCurrent = async(data) =>{
			console.log("MODIFY CURRENT LIFT REQUEST:")
			console.log(data)
			let id = data.id
			let squat = data.squat
			let bench = data.bench
			let deadlift = data.deadlift
			let weight = data.weight
			
			let mod_query = await client.query('UPDATE members SET current_squat = ' + squat + ', current_bench = ' + bench + ', current_deadlift = ' + deadlift + ', weight = ' + weight + ' WHERE member_id = ' + id)
			let metadata_query = await client.query('SELECT member_id, first_name, last_name, classes, weight, height, goal_weight, current_squat, current_bench, current_deadlift, goal_squat, goal_bench, goal_deadlift FROM members WHERE member_id = ' + id)
			socket.emit("update_metadata", metadata_query.rows[0])
		}
		//socket to handle balance request event
		socket.on("request_balance", function(data){
			balanceQuery(data)
		})
		//function to serve balance of a given account
		balanceQuery = async(data) =>{
			let id = data.id
			let account_id_query = await client.query('SELECT account_id FROM members WHERE member_id = ' + id)
			let account_id = account_id_query.rows[0].account_id
			
			let balance_query = await client.query('SELECT amount FROM accounts_receivable, members WHERE member_id = ' + id + ' AND ar_id = ' + account_id)
			
			let balance = balance_query.rows[0].amount
			console.log("Balance query for " + id + " = " + balance)
			
			socket.emit("balance_query_complete", {balance: balance})
		}
		//socket for account payment event
		socket.on("account_payment", function(data){
			makePayment(data)
		})
		//function to handle queries for account payments
		makePayment = async(data) =>{
			let id = data.id
			let payment = data.payment
			
			let account_id_query = await client.query('SELECT account_id FROM members WHERE member_id = ' + id)
			
			if(!(account_id_query.rows[0])){
				return
			}
			
			let account_id = account_id_query.rows[0].account_id
			console.log(account_id_query.rows[0])
			console.log("PAYMENT REQUEST OF AMOUNT " + payment + " FOR ID " + account_id)
			
			let update_query = await client.query('UPDATE accounts_receivable SET amount = amount - ' + payment + ' WHERE ar_id=' + account_id)
			socket.emit("payment_successful", {})
		}
		//socket for deregistration event
		socket.on("request_deregister", function(data){
			console.log("DEREGISTRATION REQUEST RECEIVED")
			console.log(data)
			deregister(data)
		})
		//funciton to handle queries for deregistration
		deregister = async(data) => {
			let id = data.id
			
			//get account_id
			let account_id_query = await client.query('SELECT account_id FROM members WHERE member_id = ' + id)
			
			if(!(account_id_query.rows[0])){
				return
			}
			
			let account_id = account_id_query.rows[0].account_id
			
			//check if balance is greater than 0
			
			let balance_query = await client.query('SELECT amount FROM accounts_receivable, members WHERE member_id = ' + id)
			
			let balance = balance_query.rows[0].amount
			console.log("(Deregistration) Balance query for " + id + " = " + balance)
			console.log(typeof balance)
			console.log(balance >= 0)
			if(balance > 0){
				socket.emit("unsuccessful_deregistration", {})
				return
			}
			
			//delete member
			let query
			query = await client.query('DELETE FROM members WHERE member_id = ' + id)
			//delete account
			query = await client.query('DELETE FROM accounts_receivable WHERE ar_id = ' + account_id)
			//delete credentials
			query = await client.query('DELETE FROM credentials WHERE m_id = ' + id)
			
			socket.emit("successful_deregistration")
		}
		//socket for general class list event
		socket.on("class_list_request", function(data){
			get_class_list(data)
		})
		//function to serve all class data in standard classes JSON
		get_class_list = async(data) =>{
			let class_query = await client.query("SELECT name, description, cost, timeslot, trainer_id FROM classes")
			let rows = class_query.rows
			console.log("CLASS LIST REQUEST:")
			console.log(class_query.rows)
			socket.emit("class_list", {classes: rows})
		}
		//socket for user class list event
		socket.on("class_list_for_user_request", function(data){
			get_user_class_list(data)
		})
		//function to serve class list data in standard classes JSON
		get_user_class_list = async(data) =>{
			let id = data.id
			let classes = data.classes
			let class_list = []
			for(i = 0; i < classes.length; i++){
				let class_query = await client.query('SELECT name, description, cost, timeslot FROM classes WHERE class_id = ' + classes[i])
				class_list.push(class_query.rows[0])
			}
			
			socket.emit('user_class_list_data', {classes: class_list})
		}
		//socket for registration class event
		socket.on('class_registration_request', function(data){
			//modify classes list
			register_class(data)
		})
		//function to handle queries for class registration
		register_class = async(data) =>{
			let id = data.id
			let name = data.class_name
			let timeslot = data.timeslot + 1
			
			let class_id_query = await client.query('SELECT class_id FROM classes WHERE name=\'' + name + '\'')
			let class_id = class_id_query.rows[0].class_id
			
			let member_update_classes = await client.query('UPDATE members SET classes = array_append(classes, ' + class_id + ') WHERE member_id = '+ id)
			let member_update_availability = await client.query('UPDATE members SET availability[' + timeslot + '] = FALSE WHERE member_id = ' + id)
			
			//charge account
			let account_id_query = await client.query('SELECT account_id FROM members WHERE member_id = ' + id)
			let account_id = account_id_query.rows[0].account_id
			console.log(account_id_query.rows[0])
			console.log("CHARGE REQUEST OF AMOUNT " + data.amount + " FOR ID " + account_id + "\nREASON: ACCOUNT CHARGE FOR CLASS " + name + " REGISTRATION")
			
			let update_query = await client.query('UPDATE accounts_receivable SET amount = amount + ' + data.amount + ' WHERE ar_id=' + account_id)
			
			let q_result = await client.query('SELECT member_id, first_name, last_name, classes, availability, weight, height, goal_weight, current_squat, current_bench, current_deadlift, goal_squat, goal_bench, goal_deadlift FROM members WHERE member_id = ' + id)
			socket.emit('update_metadata', q_result.rows[0])
		}
		
		// ============================ END OF MEMBER FUNCTIONALITY ===================================
		//socket for trainer setup event
		socket.on('trainer_setup_complete', function(data){
			get_trainer_metadata(data)
			metadata = -1
		})
		//function to get trainer metadata and send to client
		get_trainer_metadata = async(data) =>{
			let id = credentials.t_id
			credentials = -1
			
			let data_query = await client.query('SELECT * FROM trainers WHERE trainer_id = ' + id)
			
			socket.emit('trainer_data_init', data_query.rows[0])
		}
		//socket to handle setting trainer availability event
		socket.on('set_trainer_availability', function(data){
			set_trainer_availability(data)
		})
		//function to set trainer availability, data is trainer id (id) and new availability (availability) as array of 10 bool
		set_trainer_availability = async(data) =>{
			console.log("SET TRAINER AVAILABILITY REQUEST")
			console.log(data)
			
			let id = data.id
			let availability = data.availability
			
			let avail_string = "["
			
			for(i = 0; i < availability.length; i++){
				if(i == availability.length - 1){
					if(availability[i]){
						avail_string += "TRUE"
					}else{
					avail_string += "FALSE"
					}
					continue
				}
				if(availability[i]){
					avail_string += "TRUE, "
				}else{
					avail_string += "FALSE, "
				}
			}
			avail_string += "]"
			console.log(avail_string)
			
			let query = await client.query('UPDATE trainers SET availability = ARRAY ' + avail_string + ' WHERE trainer_id = ' + id)
		}
		//socket for member search event
		socket.on('member_search_request', function(data){
			search_members(data)
		})
		//function to handle member search requests
		search_members = async(data) =>{
			let fname = data.first_name
			let lname = data.last_name
			
			console.log('MEMBER SEARCH REQUEST FOR ' + fname + ' ' + lname)
			
			let search_query = await client.query('SELECT * FROM members WHERE first_name = \'' + fname + '\' AND last_name = \'' + lname + '\'')
			
			if(search_query.rows.length == 0){
				socket.emit('member_not_found', {first_name: fname, last_name: lname})
			}else{
				socket.emit('member_found', search_query.rows[0])
			}
		}
		
		// ============================ END OF TRAINER FUNCTIONALITY =====================================
		//socket for staff setup event
		socket.on('staff_setup_complete', function(data){
			get_staff_metadata(data)
			metadata = -1
		})
		//function to get staff metadata and send to client
		get_staff_metadata = async(data) =>{
			let id = credentials.s_id
			credentials = -1
			
			let data_query = await client.query('SELECT * FROM staff WHERE staff_id = ' + id)
			
			let equipment_query = await client.query('SELECT * from equipment')
			let rooms_query = await client.query('SELECT * from rooms')
			let trainers_query = await client.query('SELECT * from trainers')
			let payable_query = await client.query('SELECT * FROM accounts_payable')
			
			socket.emit('staff_data_init', {last_name: data_query.rows[0].last_name, staff_id: id, rooms: rooms_query.rows, equipment: equipment_query.rows, trainers: trainers_query.rows, accounts_payable: payable_query.rows})
		}
		//socket to handle class modification event
		socket.on('class_modification', function(data){
			class_modification(data)
		})
		//function to handle class modification queries
		class_modification = async(data) =>{
			let name = data.name
			console.log("CLASS MODIFICATION REQUEST FOR CLASS " + name)
		
			let new_name = data.new_name
			let new_description = data.new_description
			let new_trainer = data.new_trainer
			let timeslot = data.timeslot
			
			console.log(data)
			
			let trainer_id_query = await client.query("SELECT trainer_id FROM trainers WHERE last_name = \'" + new_trainer + "\'")
			
			let current_trainer_id_query = await client.query("SELECT classes.trainer_id FROM trainers, classes WHERE name = \'" + name + '\'')
			
			let cur_t_id = current_trainer_id_query.rows[0].trainer_id
			
			let current_trainer_update_query = await client.query("UPDATE trainers SET availability[" + (timeslot + 1) + "] = TRUE WHERE trainer_id = " + cur_t_id)
			
			new_trainer = trainer_id_query.rows[0].trainer_id
			
			let update_query = await client.query("UPDATE classes SET name = \'" + new_name + "\', description = \'" + new_description + "\', trainer_id = " + new_trainer + " WHERE name = \'" + name + "\'")
			
			let trainer_update = await client.query("UPDATE trainers SET availability[" + (timeslot + 1) + "] = FALSE WHERE trainer_id = " + new_trainer)
			
			let class_query = await client.query("SELECT * FROM classes")
			let trainer_query = await client.query('SELECT * FROM trainers')
			
			socket.emit('class_updated', {data: {classes: class_query}, trainers: trainer_query.rows})
		}
		//socket to handle out of order -> in order equipment modifications
		socket.on('set_equipment_out_of_order', function(data){
			modify_equipment(data)
		})
		//socket to handle in order -> out of order equipment modifications
		socket.on('add_invoice_for_equipment_out_of_order', function(data){
			insert_invoice(data.invoice)
			modify_equipment(data.equipment)
		})
		//function to insert invoice for equipment repairs
		insert_invoice = async(data) =>{
			console.log('INVOICE CREATION REQUEST WITH NAME ' + data.name)
			console.log(data)
			let name = data.name
			let description = data.description
			let amount = data.amount
			
			let insert_query = await client.query('INSERT INTO accounts_payable(name, description, amount) VALUES ($1, $2, $3)', [name, description, amount])
		}
		//function to modify equipment state
		modify_equipment = async(data) =>{
			console.log(data)
			console.log("EQUIPMENT MODIFICATION REQUEST FOR ID = " + data.equipment_id)
			
			let id = data.equipment_id
			
			if(data.out_of_order){
				let update_query = await client.query("UPDATE equipment SET time_since_maintenance = 0, out_of_order = FALSE WHERE equipment_id = " + id)
			}else{
				let update_query = await client.query("UPDATE equipment SET out_of_order = TRUE WHERE equipment_id = " + id)
			}
			
			let equipment_query = await client.query('SELECT * from equipment')
			
			socket.emit('equipment_modified', equipment_query.rows)
		}
		//socket to handle accounts payable metadata requests
		socket.on('accounts_payable_metadata_request', function(data){
			get_accounts_payable_data()
		})
		//function to serve accounts payable metadata
		get_accounts_payable_data = async(data) =>{
			let query = await client.query('SELECT * FROM accounts_payable')
			
			socket.emit('accounts_payable_data', query.rows)
		}
		//socket to handle invoice payment event
		socket.on('pay_invoice', function(data){
			pay_invoice(data)
		})
		//function to pay invoice
		pay_invoice = async(data) =>{
			let id = data.id
			
			console.log("PAYING INVOICE ID: " + id)
			
			let query = await client.query("DELETE FROM accounts_payable WHERE ap_id = " + id)
			let d = await client.query("SELECT * FROM accounts_payable")
			
			socket.emit('successful_invoice_payment', d.rows)
		}
		//socket to handle room metadata requests
		socket.on('get_room_metadata', function(data){
			get_room_metadata()
		})
		//function to serve room metadata
		get_room_metadata = async(data) =>{
			let query = await client.query("SELECT * FROM rooms")
			
			socket.emit('room_metadata', query.rows)
		}
		//socket to handle room booking event
		socket.on('book_room', function(data){
			book_room(data)
		})
		//function to handle room booking queries
		book_room = async(data) =>{
			let id = data.room.room_id
			let timeslot = data.timeslot
			
			let query = await client.query('UPDATE rooms SET availability[' + (timeslot + 1) + "] = FALSE WHERE room_id = " + id)
			let d = await client.query('SELECT * FROM rooms')
			
			socket.emit('room_booked', d.rows)
		}
		//socket to handle class creation event
		socket.on('class_creation', function(data){
			create_class(data)
		})
		//function to handle class creation queries
		create_class = async(data) =>{
			let name = data.name
			let description = data.description
			let cost = data.cost
			let t_lname = data.trainer_lname
			let room_num = data.room_num
			let timeslot = data.timeslot
			
			console.log("CLASS CREATION REQUEST")
			console.log(data)
			
			let room_query = await client.query('SELECT room_id FROM rooms WHERE room_number = ' + room_num)
			let room_id = room_query.rows[0].room_id
			
			let trainer_query = await client.query('SELECT trainer_id FROM trainers WHERE last_name = \'' + t_lname + '\'')
			let trainer_id = trainer_query.rows[0].trainer_id
			
			let index = 0
			let timeslot_arr = []
			for(i = 0; i < index; i++){
				timeslot_arr.push(false)
			}
			timeslot_arr.push(true)
			for(i = index + 1; i < 10; i++){
				timeslot_arr.push(false)
			}
			
			let creation_query = await client.query('INSERT INTO classes(name, description, room_id, cost, timeslot, trainer_id) VALUES ($1, $2, $3, $4, $5, $6)', [name, description, room_id, cost, timeslot_arr, trainer_id])
			
			let room_update = await client.query('UPDATE rooms SET availability[' + (timeslot + 1) + '] = FALSE WHERE room_id = ' + room_id)
			let trainer_update = await client.query('UPDATE trainers SET availability[' + (timeslot + 1) + '] = FALSE WHERE trainer_id = ' + trainer_id)
		}
		
		socket.on('disconnect', function(data) {
		//event emitted when a client disconnects
		console.log('client disconnected')
	  })
	})

	console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
	console.log(`To Test:`)
	console.log(`Navigate to: http://${host}:${PORT}/`)
})()
