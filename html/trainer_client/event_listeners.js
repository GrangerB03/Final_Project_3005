/**
COMP 3005 - W24 - Final Project
Carleton University
Authour: Ben Granger
Student #101221725
*/

//global variables used for easy data transfer, no sensitive information in them
let metadata = -1
let availability_button_arr = []
//function to send user back to login page
function logout(){
	console.log("logout request")
	window.location.replace('index.html')
}
//function to close search menu
function close_search_menu(){
	document.getElementById("member_search").innerHTML = ''
}
//function to close availability portal
function close_availability_portal(){
	document.getElementById("availability").innerHTML = ''
}
//function to close all menus (for convenience)
function close_all(){
	close_search_menu()
	close_availability_portal()
	document.getElementById('error_message_div').innerHTML = ''
}
//function to generate html table for all availability related functions
function create_availability_element(data){
	/**
	* ASSUME: data is a JSON object returned from a trainer availability query
	*/
	
	console.log("AVAILABILITY LIST:")
	let days_of_the_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
	let availability = data.availability
	
	//create table
	let table = document.createElement("table")
	let tablebody = document.createElement("tbody")
	let headerRow = document.createElement("tr")
	let headerElem = document.createElement("th")
	
	availability_button_arr = []
	
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
		
		if(availability[2*i]){
			mornCell.innerHTML = 'Available'
		}else{
			mornCell.innerHTML = 'Unavailable'
		}
		
		let mornButton = document.createElement('button')
		mornButton.innerHTML = 'Switch Availability<br>'
		mornButton.index = 2*i
		availability_button_arr.push(mornButton)
		mornCell.appendChild(mornButton)
		
		if(availability[2*i + 1]){
			aftCell.innerHTML = 'Available'
		}else{
			aftCell.innerHTML = 'Unavailable'
		}
		
		let aftButton = document.createElement('button')
		aftButton.innerHTML = 'Switch Availability<br>'
		aftButton.index = 2*i + 1
		availability_button_arr.push(aftButton)
		aftCell.appendChild(aftButton)
		
		//add cells
		row.appendChild(dayCell)
		row.appendChild(mornCell)
		row.appendChild(aftCell)
		//add row
		tablebody.appendChild(row)
	}
	
	for(i = 0; i < availability_button_arr.length; i++){
		availability_button_arr[i].addEventListener('click', swap_availability)
	}
	
	table.appendChild(tablebody)
	return table
}
//event listener for swap availability button, send request to server to update DB
function swap_availability(e){
	console.log(e)
	let target = e.currentTarget
	let index = e.currentTarget.index
	console.log("Switch availability request for index " + index)
	
	metadata.availability[index] = !metadata.availability[index]
	modify_availability()
	socket.emit('set_trainer_availability', {id: metadata.trainer_id, availability: metadata.availability})
}
//function to modify availability
function modify_availability(){	
	close_all()
	console.log("availability menu opening")
	let table = create_availability_element(metadata)
	document.getElementById('availability').appendChild(table)
}
//funciton to send query to server
function search_member(){
	document.getElementById('error_message_div').innerHTML = ''
	console.log(document.getElementById('member_search_field'))
	let value = document.getElementById('member_search_field').value.trim()
	console.log("search request for value = " + value)
	
	let words = value.split(' ')
	if(words.length > 2){
		document.getElementById('error_message_div').innerHTML = "Invalid entry, please enter first and last name only."
	}
	
	console.log("first name: " + words[0])
	console.log("last name: " + words[1])
	
	socket.emit('member_search_request', {first_name: words[0], last_name: words[1]})
}
//function to create member search UI
function member_search_setup(){
	close_all()
	console.log("member search init")
	let searchDiv = document.getElementById('member_search')
	searchDiv.innerHTML = "Enter the member's first and last name: "
	
	let input = document.createElement('input')
	input.type = 'text'
	input.id = 'member_search_field'
	console.log(input)
	searchDiv.appendChild(input)
	
	let submitButton = document.createElement('button')
	submitButton.innerHTML = "Search"
	submitButton.addEventListener('click', search_member)
	searchDiv.appendChild(submitButton)
}
//function to init data
function init_data(data){
	console.log("DATA INITALIZATION")
	metadata = data
	console.log(metadata)
	
	document.getElementById('logged_in_text').innerHTML = "You are logged in as: " + metadata.last_name + ", trainer id: " + metadata.trainer_id
}
//socket to handle successful query, create result table
socket.on('member_found', function(data){
	let div = document.getElementById('member_search')
	
	div.innerHTML += "<br>Here is member " + data.first_name + " " + data.last_name + "'s data:"
	
	//create table
	let table = document.createElement("table")
	let tablebody = document.createElement("tbody")
	let headerRow = document.createElement("tr")
	let headerElem = document.createElement("th")
	
	table.id = "member_search_results"
	
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Field"
	headerRow.appendChild(headerElem)
	
	headerElem = document.createElement("th")
	headerElem.innerHTML = "Value"
	headerRow.appendChild(headerElem)
	
	table.appendChild(headerRow)
	
	let row = document.createElement("tr")
	let fieldCell = document.createElement("td")
	let valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "First Name"
	valueCell.innerHTML = data.first_name
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Last Name"
	valueCell.innerHTML = data.last_name
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Height"
	valueCell.innerHTML = data.height
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Weight"
	valueCell.innerHTML = data.weight
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Goal Weight"
	valueCell.innerHTML = data.goal_weight
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Squat"
	valueCell.innerHTML = data.current_squat
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Goal Squat"
	valueCell.innerHTML = data.goal_squat
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Bench Press"
	valueCell.innerHTML = data.current_bench
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Goal Bench Press"
	valueCell.innerHTML = data.goal_bench
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Deadlift"
	valueCell.innerHTML = data.current_deadlift
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	row = document.createElement("tr")
	fieldCell = document.createElement("td")
	valueCell = document.createElement("td")
	
	fieldCell.innerHTML = "Goal Deadlift"
	valueCell.innerHTML = data.goal_deadlift
	
	row.appendChild(fieldCell)
	row.appendChild(valueCell)
	table.appendChild(row)
	
	div.appendChild(table)
})
//socket to handle unsuccessful query
socket.on('member_not_found', function(data){
	let first_name = data.first_name
	let last_name = data.last_name
	document.getElementById('error_message_div').innerHTML = 'Member ' + first_name + ' ' + last_name + ' was not found.'
})
//update metadata
socket.on('trainer_metadata_update', function(data){
	init_data(data)
})
//init metadata
socket.on('trainer_data_init', function(data){
	init_data(data)
})
//load event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
	console.log("cool")
	socket.emit("trainer_setup_complete")
	document.getElementById('member_search_button').addEventListener('click', member_search_setup)
	document.getElementById('logout_button').addEventListener('click', logout)
	document.getElementById('availability_button').addEventListener('click', modify_availability)
})