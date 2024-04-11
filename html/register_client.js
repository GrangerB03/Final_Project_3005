/**
COMP 3005 - W24 - Final Project
Carleton University
Authour: Ben Granger
Student #101221725
*/

const socket = io('http://' + window.document.location.host)
let xttp = new XMLHttpRequest()
console.log("client connected to registration portal")

//function to init the registration process
function registerRequest(){
	console.log("Registration request")
	let uname = document.getElementById('uname').value.trim()
	let passwd = document.getElementById('passwd').value.trim() //hash this later
	socket.emit('registration_request', {uname: uname, passwd: passwd})
}

//function to send user to login page (if cancel button pressed)
function returnToLogin(){
	window.location.replace('index.html')
}

//when server accepts credentials, proceed to registration portal
socket.on('successful_registration', function(data){
	console.log("registration successful")
	console.log(data)
	
	//open new document
	window.location.replace('registration_information_input.html')
})

//when server rejects credentials, prompt for new credentials
socket.on('unsuccessful_registration', function(data){
	console.log("registration unsuccessful")
	console.log(data)
	document.getElementById("error_message_div").innerHTML = "Unsuccessful registration (duplicate username or invalid username/password)"
})

//load event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
  
    //add listener to buttons
    document.getElementById('register_button').addEventListener('click', registerRequest)
	document.getElementById('return_button').addEventListener('click', returnToLogin)
})