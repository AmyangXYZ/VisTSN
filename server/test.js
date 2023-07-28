// Copy this code to your browser console

var socket = new WebSocket("ws://localhost:4399");

socket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    console.log(data);
}
