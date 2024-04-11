/**
COMP 3005 - W24 - Final Project
Carleton University
Authour: Ben Granger
Student #101221725
*/

//global variables used for easy data transfer, no sensitive information in them
let metadata = -1
let class_data = -1
//function to send user back to login page
function logout(){
	console.log("logout request")
	window.location.replace('index.html')
}
//function to close modifications menu
function close_mod_menu(){
	document.getElementById("modifications").innerHTML = ''
}
//function to close payment menu
function close_payment_portal(){
	document.getElementById("payment_portal").innerHTML = ''
}
//function to close classes menu
function close_class_list(){
	document.getElementById("classes").innerHTML = ''
}
//function to close all menus (for convenience)
function close_all(){
	close_class_list()
	close_payment_portal()
	close_mod_menu()
	document.getElementById('error_message_div').innerHTML = ''
}
//function to send goal lifts modification request to server
function goal_mod_request(){
	console.log("goal modification request")
	let squat = document.getElementById('squat').value.trim()
	let bench = document.getElementById('bench').value.trim()
	let deadlift = document.getElementById('deadlift').value.trim()
	let weight = document.getElementById('weight').value.trim()
	
	if(squat == '' || bench == '' || deadlift == '' || weight == ''){
		document.getElementById('error_message_div').innerHTML = "Invalid Input, ensure all 3 values are filled in."
	}else{
		document.getElementById('error_message_div').innerHTML = ''
	}
	
	socket.emit("modification_to_goals_request", {id: metadata.member_id, squat: squat, bench: bench, deadlift: deadlift, weight: weight})
}
//function to create modification div (goals)
function mod_goals(){
	//set page to portal
	close_all()
	document.getElementById("modifications").innerHTML = "<form class =\"modification_menu\"><label for=\"squat\">Goal Squat:</label><br><input type=\"text\" id=\"squat\" name=\"squat\"><br><label for=\"bench\">Goal Bench:</label><br><input type=\"text\" id=\"bench\" name=\"bench\"><br><label for=\"deadlift\">Goal Deadlift:</label><br><input type=\"text\" id=\"deadlift\" name=\"deadlift\"><br><label for=\"weight\">Goal Weight (lbs):<\label><br><input type=\"text\" id=\"weight\" name=\"weight\"><br><div id=\"error_message_div\"></div><button type=\"button\" id=\"submit_button\" value=\"Submit\">Submit<br><button type=\"button\" id=\"close_button\" value=\"Close\">Close</form>"

	document.getElementById("submit_button").addEventListener('click', goal_mod_request)
	document.getElementById("close_button").addEventListener('click', close_mod_menu)
}
//function to send current lifts modificiation request to server
function lift_mod_request(){
	console.log("lift modification request")
	let squat = document.getElementById('squat').value.trim()
	let bench = document.getElementById('bench').value.trim()
	let deadlift = document.getElementById('deadlift').value.trim()
	let weight = document.getElementById('weight').value.trim()
	
	if(squat == '' || bench == '' || deadlift == '' || weight == ''){
		document.getElementById('error_message_div').innerHTML = "Invalid Input, ensure all 3 values are filled in."
	}else{
		document.getElementById('error_message_div').innerHTML = ''
	}
	
	socket.emit("modification_to_lifts_request", {id: metadata.member_id, squat: squat, bench: bench, deadlift: deadlift, weight: weight})
}
//function to create modification div (current)
function mod_lifts(){
	//set page to portal
	close_all()
	document.getElementById("modifications").innerHTML = "<form class =\"modification_menu\"><label for=\"squat\">Squat:</label><br><input type=\"text\" id=\"squat\" name=\"squat\"><br><label for=\"bench\">Bench:</label><br><input type=\"text\" id=\"bench\" name=\"bench\"><br><label for=\"deadlift\">Deadlift:</label><br><input type=\"text\" id=\"deadlift\" name=\"deadlift\"><br><label for=\"weight\">Weight (lbs):<\label><br><input type=\"text\" id=\"weight\" name=\"weight\"><br><div id=\"error_message_div\"></div><button type=\"button\" id=\"submit_button\" value=\"Submit\">Submit<br><button type=\"button\" id=\"close_button\" value=\"Close\">Close</form>"
	
	document.getElementById("submit_button").addEventListener('click', lift_mod_request)
	document.getElementById("close_button").addEventListener('click', close_mod_menu)
}
//function to get init payment page
function payment_request(){
	document.getElementById('error_message_div').innerHTML = ''
	socket.emit('request_balance', {id: metadata.member_id})
}
//function to send payment request to server
function submit_payment_request(){
	let value = document.getElementById('amount').value
	if(value < 0){
		document.getElementById('error_message_div').innerHTML = "Invalid payment amount."
		return
	}else{
		document.getElementById('error_message_div').innerHTML = ''
	}
	socket.emit('account_payment', {id: metadata.member_id, payment: value})
}
//function to handle accepting deregistration and send deregistration to server
function submit_deregister_request(){
	socket.emit('request_deregister', {id: metadata.member_id})
}
//function to handle cancel deregistration event
function cancel_deregister_request(){
	document.getElementById("deregister_confirmation").innerHTML = ""
}
//function to init the deregistration process
function deregister(){
	document.getElementById('error_message_div').innerHTML = ''
	document.getElementById("deregister_confirmation").innerHTML = "Are you sure you want to deregister, this is irreversible.<br><button id=\'confirm\'>YES<button id=\'cancel\'>NO"
	
	document.getElementById("confirm").addEventListener('click', submit_deregister_request)
	document.getElementById("cancel").addEventListener('click', cancel_deregister_request)
}
//function to init the class list process
function display_class_list(){
	close_all()
	socket.emit('class_list_request', {})
}
//function to init class registration
function submit_class_selection(){
	let value = document.getElementById('class_dropdown').value.trim()
	console.log('selected class is: ' + value)
	let classes = class_data.classes
	console.log(classes)
	let timeslot = -1
	let amount = -1
	//get class timeslot
	for(i = 0; i < classes.length; i++){
		if(classes[i].name == value){
			console.log("class name match found, listing timeslot")
			console.log(classes[i])
			amount = classes[i].cost
			for(j = 0; j < classes[i].timeslot.length; j++){
				console.log("checking timeslot " + j + " is " + classes[i].timeslot[j])
				if(classes[i].timeslot[j]){
					timeslot = j
					break
				}
			}
			console.log('timeslot not found')
			break
		}
	}
	console.log(timeslot)
	console.log(metadata.availability[timeslot])
	if(!metadata.availability[timeslot] || timeslot == -1){
		console.log("not available during selected timeslot")
		document.getElementById('error_message_div').innerHTML = "You are not available during this timeslot, please select another class"
		return
	}
	
	//send to server, modify class list
	socket.emit("class_registration_request", {id: metadata.member_id, class_name: value, timeslot: timeslot, amount: amount})
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
//function to init user class list request
function get_user_class_list(){
	if(metadata.classes == null){
		document.getElementById('classes').innerHTML = "You have not signed up for any classes yet!"
		return
	}
	socket.emit('class_list_for_user_request', {id: metadata.member_id, classes: metadata.classes})
}
//function to display user class list (using standard classes JSON)
function display_current_class_list(data){
	document.getElementById('classes').innerHTML = "Your current class schedule: "
	let table = create_class_list_element(data)
	document.getElementById('classes').appendChild(table)
	
	for(i = 0; i < data.classes.length; i++){
		console.log("adding description for current class")
		document.getElementById('classes').innerHTML += "<br>Name: " + data.classes[i].name + "<br>Description: " + data.classes[i].description + "<br>"
	}
}
//when user class list is received, display
socket.on('user_class_list_data', function(data){
	console.log(data)
	display_current_class_list(data)
})
//when class list is received, display
socket.on('class_list', function(data){
	//data is the array of JSON objects with all classes
	let table = create_class_list_element(data)
	class_data = data
	
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
	for(i = 0; i < class_names.length; i++){
		let op = document.createElement('option')
		op.value = class_names[i]
		op.innerHTML = class_names[i]
		selectElement.appendChild(op)
	}
	
	document.getElementById('classes').appendChild(selectElement)
	document.getElementById('classes').innerHTML += "<input id=\"class_submit_selection\" type=\"submit\">"
	document.getElementById('class_submit_selection').addEventListener('click', submit_class_selection)
	
	//add close button
	let closeButton = document.createElement('button')
	closeButton.innerHTML = "Close"
	closeButton.addEventListener('click', close_class_list)
	document.getElementById('classes').appendChild(closeButton)
})
//when deregistration is unsuccessful, set errordiv
socket.on('unsuccessful_deregistration', function(data){
	document.getElementById('error_message_div').innerHTML = "Unsuccessful deregistration, account balance is greater than $0. Pay off your balance before you deregister."
	document.getElementById("deregister_confirmation").innerHTML = ""
})
//when deregistraiton completes, logout
socket.on('successful_deregistration', function(data){
	logout()
})
//when balance query is complete handle
socket.on('balance_query_complete', function(data){
	let bal = data.balance
	close_all()
	document.getElementById("payment_portal").innerHTML = "Hello, " + metadata.first_name + " " + metadata.last_name + ", your current balance is: "+ bal + ".<br><form class =\"payment_portal\"><label for=\"amount\">Amount:</label><br><input type=\"text\" id=\"amount\" name=\"amount\"><br><button type=\"button\" id=\"submit_button\" value=\"Submit\">Submit<br><button type=\"button\" id=\"close_button\" value=\"Close\">Close</form>"
	
	document.getElementById("submit_button").addEventListener('click', submit_payment_request)
	document.getElementById("close_button").addEventListener('click', close_payment_portal)
})
//when payment is complete handle
socket.on('payment_successful', function(data){
	document.getElementById("payment_portal").innerHTML = "Payment successful, thank you!"
})
//when new metadata is sent from server update
socket.on('update_metadata', function(data){
	console.log("data received")
	console.log(data)
	metadata = data
	
	document.getElementById("logged_in_text").innerHTML = "You are logged in as: " + data.first_name + " " + data.last_name + "."
	document.getElementById("statistics_dashboard").innerHTML = "Your statistics:<br>Squat: " + data.current_squat + "<br>Bench: " + data.current_bench + "<br>Deadlift: " + data.current_deadlift + "<br>Height (cm): " + data.height + "<br>Weight (lbs): " + data.weight
	document.getElementById("goals_dashboard").innerHTML = "Your Goals: <br>Squat: " + data.goal_squat + ", you are " + ((data.current_squat / data.goal_squat) * 100).toFixed(2) + "% there.<br>Bench: " + data.goal_bench + ", you are " + ((data.current_bench / data.goal_bench) * 100).toFixed(2) + "% there.<br>Deadlift: " + data.goal_deadlift + ", you are " + ((data.current_deadlift / data.goal_deadlift) * 100).toFixed(2) + "% there.<br>Weight: " + data.goal_weight + ", you are " + ((data.weight / data.goal_weight) * 100).toFixed(2) + "% there."
})

//Setup function
socket.on("init_data", function(data){
	console.log("data received")
	console.log(data)
	metadata = data
	
	document.getElementById("logged_in_text").innerHTML = "You are logged in as: " + data.first_name + " " + data.last_name + "."
	document.getElementById("statistics_dashboard").innerHTML = "Your statistics:<br>Squat: " + data.current_squat + "<br>Bench: " + data.current_bench + "<br>Deadlift: " + data.current_deadlift + "<br>Height (cm): " + data.height + "<br>Weight (lbs): " + data.weight
	document.getElementById("goals_dashboard").innerHTML = "Your Goals: <br>Squat: " + data.goal_squat + ", you are " + ((data.current_squat / data.goal_squat) * 100).toFixed(2) + "% there.<br>Bench: " + data.goal_bench + ", you are " + ((data.current_bench / data.goal_bench) * 100).toFixed(2) + "% there.<br>Deadlift: " + data.goal_deadlift + ", you are " + ((data.current_deadlift / data.goal_deadlift) * 100).toFixed(2) + "% there.<br>Weight (lbs): " + data.goal_weight + ", you are " + ((data.weight / data.goal_weight) * 100).toFixed(2) + "% there."
})
//load event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
	console.log("cool")
	socket.emit("setup_complete")
	document.getElementById('deregister_button').addEventListener('click', deregister)
	document.getElementById('logout_button').addEventListener('click', logout)
	document.getElementById('modify_goals_button').addEventListener('click', mod_goals)
	document.getElementById('modify_current_lift_button').addEventListener('click', mod_lifts)
	document.getElementById('payment_button').addEventListener('click', payment_request)
	document.getElementById('class_list_button').addEventListener('click', display_class_list)
	document.getElementById('view_your_classes_button').addEventListener('click', get_user_class_list)
})