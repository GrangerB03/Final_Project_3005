/**
COMP 3005 - W24 - Final Project
Carleton University
Authour: Ben Granger
Student #101221725
*/

const socket = io('http://' + window.document.location.host)
let xttp = new XMLHttpRequest()
console.log("client connected")

function registerRequest(){
	console.log("Register request")
	window.location.replace('register.html')
}

function login(){
	console.log("Login request")
	let uname = document.getElementById('uname').value.trim()
	let passwd = document.getElementById('passwd').value.trim() //hash this later
	socket.emit('login', {uname: uname, passwd: passwd})
}

socket.on('login_successful', function(data){
	console.log("successful login")
	document.getElementById("error_message_div").innerHTML = ""
	console.log('http://' + window.document.location.host + '/client/client.html')
	console.log(data)
	
	if(data.trainer_id != null){
		xttp.open("GET", 'http://' + window.document.location.host + '/trainer_client/client.html', false)
		xttp.send(null)
		console.log(xttp.responseText)
		let clientHTML = document.open("text/html", "replace")
		clientHTML.write(xttp.responseText)
		//write html here with data from database query
		clientHTML.close()
		return
	}
	
	if(data.staff_id != null){
		xttp.open("GET", 'http://' + window.document.location.host + '/admin_client/client.html', false)
		xttp.send(null)
		console.log(xttp.responseText)
		let clientHTML = document.open("text/html", "replace")
		clientHTML.write(xttp.responseText)
		//write html here with data from database query
		clientHTML.close()
		return
	}
	
	//get new html document
	xttp.open("GET", 'http://' + window.document.location.host + '/client/client.html', false)
	xttp.send(null)
	console.log(xttp.responseText)
	
	//open new document
	let clientHTML = document.open("text/html", "replace")
	clientHTML.write(xttp.responseText)
	//write html here with data from database query
	clientHTML.close()
})

socket.on('login_unsuccessful', function(data){
	console.log("unsuccessful login")
	document.getElementById("error_message_div").innerHTML = "Unsuccessful login"
})

document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
  
    //add listener to buttons
    document.getElementById('register_button').addEventListener('click', registerRequest)
    document.getElementById('login_button').addEventListener('click', login)
})