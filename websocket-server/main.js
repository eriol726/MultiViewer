let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

// app.get('/', function(req, res){
//     res.sendFile('index.html', {"root": '.'});
//   });

io.on('connection', (socket) => {

    // Log whenever a user connects
    console.log('user connected');

    // Log whenever a client disconnects from our websocket server
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    // When we receive a 'message' event from our client, print out
    // the contents of that message and then echo it back to our client
    // using `io.emit()`
    socket.on('expandItem', (panel, itemIndex) => {
        console.log("Message Received, state: " + itemIndex);
        io.emit('expandItem', {type:panel, state: itemIndex});    
    });

    socket.on('moveItem', (action, prevIndex, currIndex, indexData) => {
        console.log("Message Received, state: " + prevIndex + " " + currIndex);
        io.emit('moveItem', {type: action, previousIndex: prevIndex, currentIndex: currIndex, containerData: indexData});    
    });

    socket.on('zoomChart', (zoom, min, max) => {
        console.log("Message Received, zoom: " + zoom);
        io.emit('zoomChart', {state: zoom, xDomainMin: min, xDomainMax: max});    
    });

    // socket.on('drop', (message) => {
    //     console.log("Message Received, state: " + message);
    //     io.emit('state', {type:'new-message', state: message});    
    // });
});

// Initialize our websocket server on port 5000
http.listen(3000, () => {
    console.log('started on port 3000');
});