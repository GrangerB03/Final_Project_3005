/**
COMP 3005 - W24 - Final Project
Carleton University
Authour: Ben Granger
Student #101221725

room booking (not for classes)
class creation (room booking and trainer assingment)
update classes (choose a class from dropdown and change fields)
set equipemnt to broken/repaired
when equipment broken generate invoice, with description and name and amount
pay invoices
*/

//global variables used for easy data transfer, no sensitive information in them
let metadata = -1
let rooms_metadata = -1
let equipment_metadata = -1
let accounts_payable_metadata = -1
let classes_metadata = -1
let trainers_metadata = -1
let currently_mod_class = {name: '', timeslot: -1}

//function to send user back to login page
function logout(){
	console.log("logout request")
	window.location.replace('index.html')
}
//function to close equipement menu
function close_equipment_menu(){
	document.getElementById("equipment").innerHTML = ''
}
//function to close classes menu
function close_classes_menu(){
	document.getElementById("classes").innerHTML = ''
}
//function to close rooms menu
function close_rooms_menu(){
	document.getElementById("rooms").innerHTML = ''
}
//function to close payments menu
function close_payments_menu(){
	document.getElementById("payments").innerHTML = ''
}
//function to close all menus (for convenience)
function close_all(){
	close_equipment_menu()
	close_classes_menu()
	close_rooms_menu()
	close_payments_menu()
	document.getElementById('error_message_div').innerHTML = ''
}
//function to generate html table for all class related functions
function create_class_list_element(data){
	/**
	* ASSUME: data is a JSON object returned from a 'class_list' socket emit from server
	*/
	
	console.log("CLASS LIST:")
	let class_names = []
	let days_of_the_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
	let classes = data.classes
	for(i = 0; i < classes.length; i++){
		console.log(classes[i])
		class_names.push(classes[i].name)
	}
	
	//create table
	let table = document.createElement("table")
	let tablebody = document.createElement("tbody")
	let headerRow = document.createElement("tr")
	let headerElem = document.createElement("th")
	
	//create header row
	headerElem.innerHTML = "Day of the Week"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Morning"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Afternoon"
	headerRow.appendChild(headerElem)
	tablebody.appendChild(headerRow)
	
	//create rows
	for(i = 0; i < 5; i++){
		let row = document.createElement("tr")
		
		
		let dayCell = document.createElement("td")
		let mornCell = document.createElement("td")
		let aftCell = document.createElement("td")
		
		dayCell.innerHTML = days_of_the_week[i]
		
		for(k = 0; k < classes.length; k++){
			if(classes[k].timeslot[2*i]){
				//morning slot
				mornCell.innerHTML = classes[k].name + ". Cost: $" + classes[k].cost
			}else if(classes[k].timeslot[2*i + 1]){
				//afternoon slot
				aftCell.innerHTML = classes[k].name + ". Cost: $" + classes[k].cost
			}
		}
		
		//add cells
		row.appendChild(dayCell)
		row.appendChild(mornCell)
		row.appendChild(aftCell)
		//add row
		tablebody.appendChild(row)
	}
	
	table.appendChild(tablebody)
	return table
}
//event delegation for classes div
function check_for_class_listeners(e){
	let target = e.target
	
	console.log('checking')
	console.log(target)
	if(target.id == 'class_dropdown'){
		set_class_values()
	}else if(target.id == 'close_button'){
		close_all()
	}else if(target.id == 'class_submit_selection'){
		submit_class_modification()
	}else if(target.id == 'class_booking_button'){
		create_class_data(target.index)
	}else if(target.id == 'create_class_button'){
		create_class(target.timeslot)
	}
}
//update the textboxes to autofill with information from class
function set_class_values(){
	console.log("option selected")
	let name = document.getElementById('class_dropdown').value
	console.log(name + " is detected in class mod option")
	let trainerElem = document.createElement('select')
	trainerElem.id = 'new_trainer_dropdown'
	
	if(name == ''){
		return
	}
	
	console.log(classes_metadata)
	let index = -1
	for(i = 0; i < classes_metadata.classes.length; i++){
		if(name == classes_metadata.classes[i].name){
			index = i
			currently_mod_class.name = name
			console.log('index found')
		}
	}
	
	let timeslot = -1
	//get timeslot
	for(i = 0; i < classes_metadata.classes[index].timeslot.length; i++){
		if(classes_metadata.classes[index].timeslot[i]){
			timeslot = i
			currently_mod_class.timeslot = i
		}
	}
	
	for(i = 0; i < trainers_metadata.length; i++){
		if(trainers_metadata[i].trainer_id == classes_metadata.classes[index].trainer_id){
			let op = document.createElement('option')
			op.value = trainers_metadata[i].last_name
			op.innerHTML = trainers_metadata[i].last_name
			trainerElem.appendChild(op)
		}
	}
	
	for(i = 0; i < trainers_metadata.length; i++){
		if(trainers_metadata[i].availability[timeslot]){
			let op = document.createElement('option')
			op.value = trainers_metadata[i].last_name
			op.innerHTML = trainers_metadata[i].last_name
			trainerElem.appendChild(op)
		}
	}
	
	if(index == -1){
		return
	}
	
	document.getElementById('classes').innerHTML += "<br>Trainer: <br>"
	
	document.getElementById('classes').appendChild(trainerElem)
	
	document.getElementById("name_area").value = classes_metadata.classes[index].name
	document.getElementById("description_area").innerHTML = classes_metadata.classes[index].description
}
//handle submitting modification to server
function submit_class_modification(){
	//get values from fields and send to server
	console.log('submit class mod request')
	
	let name = currently_mod_class.name
	
	let index = -1
	for(i = 0; i < classes_metadata.classes.length; i++){
		if(name == classes_metadata.classes[i].name){
			index = i
			console.log('index found')
		}
	}
	
	if(index == -1){
		document.getElementById('error_message_div').innerHTML = "Invalid class selection, ensure the dropdown menu is not blank."
		return
	}
	
	socket.emit('class_modification', {name: name, new_name: document.getElementById("name_area").value, new_description: document.getElementById("description_area").value, new_trainer: document.getElementById('new_trainer_dropdown').value, timeslot: currently_mod_class.timeslot})
}
//function to send class creation request to server
function create_class(timeslot){
	let name = document.getElementById('name_area').value.trim()
	let description = document.getElementById('description_area').value.trim()
	let cost = document.getElementById('cost_area').value.trim()
	let trainer_lname = document.getElementById('trainer_dropdown').value.trim()
	let room_num = document.getElementById('room_dropdown').value.trim()
	
	if(parseInt(cost) == NaN || name == '' || cost == '' || trainer_lname == '' || room_num == ''){
		document.getElementById('error_message_div').innerHTML = 'Invalid input.'
		return
	}
	
	socket.emit('class_creation', {name: name, description: description, cost: parseInt(cost), trainer_lname: trainer_lname, room_num: parseInt(room_num), timeslot: timeslot})
}
//function to create class data entry fields
function create_class_data(i){
	let timeslot = i
	
	document.getElementById('classes').innerHTML += "<br><label for=\"name_area\" name=\"name_label\">Name:<\label><br><input id=\"name_area\" type=\"text\">"
	document.getElementById('classes').innerHTML += "<br><label for=\"description_area\" name=\"area_label\">Description:<\label><br><textarea id=\"description_area\">"
	document.getElementById('classes').innerHTML += "<br><label for=\"cost_area\" name=\"cost_label\">Cost:<\label><br><input id=\"cost_area\" type=\"text\">"
	
	let trainerElem = document.createElement('select')
	trainerElem.id = 'trainer_dropdown'
	
	for(i = 0; i < trainers_metadata.length; i++){
		if(trainers_metadata[i].availability[timeslot]){
			let op = document.createElement('option')
			op.value = trainers_metadata[i].last_name
			op.innerHTML = trainers_metadata[i].last_name
			trainerElem.appendChild(op)
		}
	}
	
	let selectElement = document.createElement('select')
	selectElement.id = 'room_dropdown'
	
	for(i = 0; i < rooms_metadata.length; i++){
		if(rooms_metadata[i].availability[timeslot]){
			let op = document.createElement('option')
			op.value = rooms_metadata[i].room_number
			op.innerHTML = rooms_metadata[i].room_number
			selectElement.appendChild(op)
		}
	}
	
	document.getElementById('classes').innerHTML += "<br>Select a Room: <br>" 
	document.getElementById('classes').appendChild(selectElement)
	
	document.getElementById('classes').innerHTML += "<br>Trainer: <br>"
	document.getElementById('classes').appendChild(trainerElem)
	
	let submitButton = document.createElement('button')
	submitButton.id = 'create_class_button'
	submitButton.timeslot = timeslot
	submitButton.innerHTML = "Create Class"
	
	document.getElementById('classes').appendChild(submitButton)
}
//function to handle creating classes (when making this do not forget to event delegate)
function create_class_init(){
	console.log("create class request")
	close_all()
	console.log("TIMESLOT LIST:")
	let days_of_the_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
	
	//create table
	let table = document.createElement("table")
	let tablebody = document.createElement("tbody")
	let headerRow = document.createElement("tr")
	let headerElem = document.createElement("th")
	
	//create header row
	headerElem.innerHTML = "Day of the Week"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Morning"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Afternoon"
	headerRow.appendChild(headerElem)
	tablebody.appendChild(headerRow)
	
	//create rows
	for(i = 0; i < 5; i++){
		let row = document.createElement("tr")
		
		
		let dayCell = document.createElement("td")
		dayCell.innerHTML = days_of_the_week[i]
		
		let mornCell = document.createElement("td")
		let aftCell = document.createElement("td")
		
		let mornButton = document.createElement('button')
		mornButton.innerHTML = 'Book a Class<br>'
		mornButton.index = 2*i
		mornButton.id = "class_booking_button"
		mornCell.appendChild(mornButton)
		
		let aftButton = document.createElement('button')
		aftButton.innerHTML = 'Book a Class<br>'
		aftButton.index = 2*i + 1
		aftButton.id = "class_booking_button"
		aftCell.appendChild(aftButton)
		
		//add cells
		row.appendChild(dayCell)
		row.appendChild(mornCell)
		row.appendChild(aftCell)
		//add row
		tablebody.appendChild(row)
	}
	
	table.appendChild(tablebody)
	
	document.getElementById('classes').appendChild(table)
	
	//add close button
	let closeButton = document.createElement('button')
	closeButton.innerHTML = "Close"
	closeButton.id = "close_button"
	document.getElementById('classes').appendChild(closeButton)
}
//function to begin class modificaiton tool
function modify_classes_init(){
	close_all()
	console.log("modify class request")
	socket.emit('class_list_request', {})
}
//event delegation for equipment div
function check_for_equipment_listeners(e){
	let target = e.target
	console.log(target)
	if(target.id == 'set_out_of_order_button'){
		set_equipment_out_of_order(target.index)
	}else if(target.id == 'close_button'){
		close_all()
	}else if(target.id == 'submit_invoice_info_button'){
		submit_invoice(target.index)
	}
}
//function to handle invoice submission
function submit_invoice(i){
	let index = parseInt(i)
	console.log('invoice submission')
	let name = document.getElementById('name_inv').value.trim()
	let description = document.getElementById('description_inv').value.trim()
	let amount = document.getElementById('amount_inv').value.trim()
	
	console.log(parseInt(amount))
	
	if(parseInt(amount) == NaN || name == '' || description == ''){
		document.getElementById('error_message_div').innerHTML = "Invalid entry"
		return
	}
	console.log('submitting invoice' + {name: name, description: description, amount: parseInt(amount)})
	console.log(equipment_metadata[index])
	console.log(index)
	console.log(equipment_metadata)
	socket.emit('add_invoice_for_equipment_out_of_order', {equipment: equipment_metadata[index], invoice: {name: name, description: description, amount: parseInt(amount)}})
}
//event listener to send equipment modify request to server
function set_equipment_out_of_order(i){
	if(!equipment_metadata[i].out_of_order){
		//require them to fill out invoice
		let e = document.getElementById('equipment')
		e.innerHTML += "Setting equipment to be out of order, please fill out the following fields to generate an invoice."
		
		e.innerHTML += "<br><label for=\"name_area\" name=\"name_label\">Name:<\label><br><input id=\"name_inv\" type=\"text\">"
		e.innerHTML += "<br><label for=\"description_area\" name=\"area_label\">Description:<\label><br><textarea id=\"description_inv\">"
		
		e.innerHTML += "<br><label for=\"amount_area\" name=\"amount_label\">Amount:<\label><br><input id=\"amount_inv\" type=\"text\">"
		
		let submitButton = document.createElement('button')
		submitButton.id = "submit_invoice_info_button"
		submitButton.index = i
		submitButton.innerHTML = "Submit"
		e.appendChild(submitButton)
		return
	}
	
	socket.emit('set_equipment_out_of_order', equipment_metadata[i])
}
//function to begin equipment modification tool
function modify_equipment_init(){
	close_all()
	console.log("modify equipment request")
	//make table with following columns: name, description, days since maintenance, out of order
	//if setting to out of order, prompt to create invoice for accounts payable
	if(equipment_metadata == -1){
		socket.emit('staff_setup_complete', {})
		return
	}
	
	//create table
	let table = document.createElement("table")
	let tableBody = document.createElement('tbody')
	let headerRow = document.createElement("tr")
	let headerElem = document.createElement("th")
	
	//create header row
	headerElem.innerHTML = "Name"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Description"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Time since last maintenance"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Out of Order"
	headerRow.appendChild(headerElem)
	
	tableBody.appendChild(headerRow)
	
	for(i = 0; i < equipment_metadata.length; i++){
		let row = document.createElement('tr')
		
		let nameCell = document.createElement('td')
		let descriptionCell = document.createElement('td')
		let timeCell = document.createElement('td')
		let orderCell = document.createElement('td')
		
		nameCell.innerHTML = equipment_metadata[i].name
		descriptionCell.innerHTML = equipment_metadata[i].description
		timeCell.innerHTML = equipment_metadata[i].time_since_maintenance + " days"
		
		if(equipment_metadata[i].out_of_order){
			orderCell.innerHTML = "YES"
		}else{
			orderCell.innerHTML = "NO"
		}
		
		//add swap out of order button
		let swapButton = document.createElement('button')
		swapButton.index = i
		swapButton.id = 'set_out_of_order_button'
		swapButton.innerHTML = "Swap out of order status (T -> F, or F -> T)"
		
		orderCell.appendChild(swapButton)
		
		row.appendChild(nameCell)
		row.appendChild(descriptionCell)
		row.appendChild(timeCell)
		row.appendChild(orderCell)
		
		tableBody.appendChild(row)
	}
	
	table.appendChild(tableBody)
	
	document.getElementById('equipment').appendChild(table)
	let closeButton = document.createElement('button')
	closeButton.innerHTML = "Close"
	closeButton.id = "close_button"
	document.getElementById('equipment').appendChild(closeButton)
}
//event delegation for rooms div
function check_for_room_listeners(e){
	let target = e.target
	console.log(target)
	if(target.id == 'room_booking_button'){
		list_rooms(target.index)
	}else if(target.id == 'close_button'){
		close_all()
	}else if(target.id == 'book_room_button'){
		book_room(target.timeslot)
	}
}
//function to book room and send request to server
function book_room(timeslot){
	let number = document.getElementById('room_dropdown').value
	
	if(number == ''){
		document.getElementById('error_message_div').innerHTML = "Invalid room entry"
		return
	}
	
	let index = -1
	
	for(i = 0; i < rooms_metadata.length; i++){
		if(rooms_metadata[i].room_number == parseInt(number)){
			index = i
			break
		}
	}
	
	socket.emit("book_room", {room: rooms_metadata[index], timeslot: timeslot})
}
//function to create room list for booking
function list_rooms(i){
	close_all()
	book_room_init()
	let timeslot = i
	
	if(rooms_metadata == -1){
		return
	}
	
	let selectElement = document.createElement('select')
	selectElement.id = 'room_dropdown'
	
	for(i = 0; i < rooms_metadata.length; i++){
		if(rooms_metadata[i].availability[timeslot]){
			let op = document.createElement('option')
			op.value = rooms_metadata[i].room_number
			op.innerHTML = rooms_metadata[i].room_number
			selectElement.appendChild(op)
		}
	}
	
	document.getElementById('rooms').innerHTML += "<br>Select a room: <br>" 
	document.getElementById('rooms').appendChild(selectElement)
	
	let submitButton = document.createElement('button')
	submitButton.id = 'book_room_button'
	submitButton.timeslot = timeslot
	submitButton.innerHTML = "Book this Room for timeslot " + timeslot
	
	document.getElementById('rooms').appendChild(submitButton)
}
//function to begin room booking tool
function book_room_init(){
	close_all()
	console.log("room booking request")
	
	console.log("TIMESLOT LIST:")
	let days_of_the_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
	
	//create table
	let table = document.createElement("table")
	let tablebody = document.createElement("tbody")
	let headerRow = document.createElement("tr")
	let headerElem = document.createElement("th")
	
	//create header row
	headerElem.innerHTML = "Day of the Week"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Morning"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Afternoon"
	headerRow.appendChild(headerElem)
	tablebody.appendChild(headerRow)
	
	//create rows
	for(i = 0; i < 5; i++){
		let row = document.createElement("tr")
		
		
		let dayCell = document.createElement("td")
		dayCell.innerHTML = days_of_the_week[i]
		
		let mornCell = document.createElement("td")
		let aftCell = document.createElement("td")
		
		let mornButton = document.createElement('button')
		mornButton.innerHTML = 'Book a Room<br>'
		mornButton.index = 2*i
		mornButton.id = "room_booking_button"
		mornCell.appendChild(mornButton)
		
		let aftButton = document.createElement('button')
		aftButton.innerHTML = 'Book a Room<br>'
		aftButton.index = 2*i + 1
		aftButton.id = "room_booking_button"
		aftCell.appendChild(aftButton)
		
		//add cells
		row.appendChild(dayCell)
		row.appendChild(mornCell)
		row.appendChild(aftCell)
		//add row
		tablebody.appendChild(row)
	}
	
	table.appendChild(tablebody)
	
	document.getElementById('rooms').appendChild(table)
	
	//add close button
	let closeButton = document.createElement('button')
	closeButton.innerHTML = "Close"
	closeButton.id = "close_button"
	document.getElementById('rooms').appendChild(closeButton)
	
	socket.emit('get_room_metadata')
}
//function to begin payment tool
function payment_init(){
	console.log("payment request")
	socket.emit("accounts_payable_metadata_request")
}
//event delegation for payments div
function check_for_payment_listeners(e){
	let target = e.target
	
	if(target.id == 'pay_invoice_button'){
		pay_invoice(target.index)
	}else if(target.id == 'close_button'){
		close_all()
	}
}
//function to handle payment events
function pay_invoice(i){
	let id = accounts_payable_metadata[i].ap_id
	
	socket.emit('pay_invoice', {id: id})
}
//function to create payment interface
function open_payment_menu(){
	close_all()
	let data = accounts_payable_metadata
	
	//create table
	let table = document.createElement("table")
	let tablebody = document.createElement("tbody")
	let headerRow = document.createElement("tr")
	let headerElem = document.createElement("th")
	
	//create header row
	headerElem.innerHTML = "Name"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Description"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Amount"
	headerRow.appendChild(headerElem)
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Pay Button"
	headerRow.appendChild(headerElem)
	tablebody.appendChild(headerRow)
	
	//create rows
	for(i = 0; i < data.length; i++){
		let row = document.createElement("tr")
		
		
		let nameCell = document.createElement("td")
		let descCell = document.createElement("td")
		let amountCell = document.createElement("td")
		let btnCell = document.createElement("td")
		
		nameCell.innerHTML = data[i].name
		descCell.innerHTML = data[i].description
		amountCell.innerHTML = data[i].amount
		
		let paymentButton = document.createElement('button')
		paymentButton.id = "pay_invoice_button"
		paymentButton.index = i
		paymentButton.innerHTML = "Pay"
		btnCell.appendChild(paymentButton)
		
		//add cells
		row.appendChild(nameCell)
		row.appendChild(descCell)
		row.appendChild(amountCell)
		row.appendChild(btnCell)
		//add row
		tablebody.appendChild(row)
	}
	
	table.appendChild(tablebody)
	
	document.getElementById('payments').appendChild(table)
	
	//add close button
	let closeButton = document.createElement('button')
	closeButton.innerHTML = "Close"
	closeButton.id = "close_button"
	document.getElementById('payments').appendChild(closeButton)
}
//function to init data
function init_data(data){
	console.log("DATA INITALIZATION")
	metadata = {last_name: data.last_name, staff_id: data.staff_id}
	rooms_metadata = data.rooms
	equipment_metadata = data.equipment
	trainers_metadata = data.trainers
	accounts_payable_metadata = data.accounts_payable
	console.log(metadata)
	
	document.getElementById('logged_in_text').innerHTML = "You are logged in as: " + metadata.last_name + ", staff id: " + metadata.staff_id
}
//socket for successful booking
socket.on('room_booked', function(data){
	close_all()
	rooms_metadata = data
	document.getElementById('rooms').innerHTML = 'Successful room booking'
})
//socket to receive room metadata
socket.on('room_metadata', function(data){
	rooms_metadata = data
})
//socket for successful payment
socket.on('successful_invoice_payment', function(data){
	close_all()
	accounts_payable_metadata = data
	document.getElementById('payments').innerHTML = 'Successful payment'
})
//socket to receive accounts payable metadata
socket.on('accounts_payable_data', function(data){
	accounts_payable_metadata = data
	open_payment_menu()
})
//socket for equipment modification finish event
socket.on('equipment_modified', function(data){
	close_all()
	document.getElementById('equipment').innerHTML = "Successful modification"
	equipment_metadata = data
})
//socket for class update finish event
socket.on('class_updated', function(data){
	document.getElementById('classes').innerHTML = "Successful class update."
	classes_metadata = data.data
	trainers_metadata = data.trainers
})
//when class list is received, display - modify this to allow class edits
socket.on('class_list', function(data){
	//data is the array of JSON objects with all classes
	let table = create_class_list_element(data)
	classes_metadata = data
	
	let class_names = []
	let classes = data.classes
	for(i = 0; i < classes.length; i++){
		class_names.push(classes[i].name)
	}
	
	//add everything to html
	document.getElementById('classes').appendChild(table)
	
	//add selection dropdown/button
	let selectElement = document.createElement('select')
	selectElement.id = "class_dropdown"
	selectElement.name = "class_selection"
	
	selectElement.appendChild(document.createElement('option'))
	
	for(i = 0; i < class_names.length; i++){
		let op = document.createElement('option')
		op.value = class_names[i]
		op.innerHTML = class_names[i]
		selectElement.appendChild(op)
	}
	
	document.getElementById('classes').innerHTML += "<label for=\"class_dropdown\" name=\"label\">Select a class to modify:<\label>"
	document.getElementById('classes').appendChild(selectElement)
	document.getElementById('classes').innerHTML += "<input id=\"class_submit_selection\" type=\"submit\">"
	document.getElementById('class_submit_selection').addEventListener('click', set_class_values)
	
	//add close button
	let closeButton = document.createElement('button')
	closeButton.innerHTML = "Close"
	closeButton.id = "close_button"
	closeButton.addEventListener('click', close_classes_menu)
	document.getElementById('classes').appendChild(closeButton)
	
	//add functionality to insert modified class data then add to server
	document.getElementById('classes').innerHTML += "<br><label for=\"name_area\" name=\"name_label\">Name:<\label><br><input id=\"name_area\" type=\"text\">"
	document.getElementById('classes').innerHTML += "<br><label for=\"description_area\" name=\"area_label\">Description:<\label><br><textarea id=\"description_area\">"
})
//update metadata
socket.on('staff_metadata_update', function(data){
	init_data(data)
})
//init metadata
socket.on('staff_data_init', function(data){
	init_data(data)
})
//load event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
	console.log("cool")
	socket.emit("staff_setup_complete")
	document.getElementById('create_class_button').addEventListener('click', create_class_init)
	document.getElementById('logout_button').addEventListener('click', logout)
	document.getElementById('modify_classes_button').addEventListener('click', modify_classes_init)
	document.getElementById('modify_equipment_button').addEventListener('click', modify_equipment_init)
	document.getElementById('book_room_button').addEventListener('click', book_room_init)
	document.getElementById('make_payment_button').addEventListener('click', payment_init)
	document.getElementById('payments').addEventListener('click', check_for_payment_listeners)
	document.getElementById('classes').addEventListener('click', check_for_class_listeners)
	document.getElementById('equipment').addEventListener('click', check_for_equipment_listeners)
	document.getElementById('rooms').addEventListener('click', check_for_room_listeners)
})