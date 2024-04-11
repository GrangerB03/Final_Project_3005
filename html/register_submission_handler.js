/**
COMP 3005 - W24 - Final Project
Carleton University
Authour: Ben Granger
Student #101221725
*/

const socket = io('http://' + window.document.location.host)

//get all fields from portal, send to server for account creation
function submission(){
	console.log("Submission attempt")
	let fname = document.getElementById('fname').value.trim()
	let lname = document.getElementById('lname').value.trim()
	let weight = document.getElementById('weight').value.trim()
	let height = document.getElementById('height').value.trim()
	let squat = document.getElementById('squat').value.trim()
	let bp = document.getElementById('bench').value.trim()
	let dl = document.getElementById('deadlift').value.trim()
	
	if(isNaN(parseInt(weight)) || isNaN(parseInt(height)) || isNaN(parseInt(squat)) || isNaN(parseInt(bp)) || isNaN(parseInt(dl))){
		document.getElementById("error_message_div").innerHTML = "Invalid input, weight, height, squat, bench press and deadlift must be integers."
		return
	}
	
	if(fname == "" || lname == "" || weight == "" || height == "" || squat == "" || bp == "" || dl == ""){
		document.getElementById("error_message_div").innerHTML = "Invalid input, ensure all fields are filled out"
		return
	}
	socket.emit("registration_info", {fname: fname, lname: lname, weight: parseInt(weight), height: parseInt(height), squat: parseInt(squat), bp: parseInt(bp), dl: parseInt(dl)})
	console.log("info sent")
}

//when sever completes registration, send user back to login page
socket.on('registration_complete', function(data){
	window.location.replace('index.html')
})

//load event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
  
    //add listener to buttons
    document.getElementById('submit_button').addEventListener('click', submission)
})