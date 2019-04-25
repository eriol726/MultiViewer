let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

// app.get('/', function(req, res){
//     res.sendFile('index.html', {"root": '.'});
//   });


io.on('connection', (socket) => {

    // Log whenever a user connects
    console.log('user connected');

    //Log whenever a client disconnects from our websocket server
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    // When we receive a 'message' event from our client, print out
    // the contents of that message and then echo it back to our client
    // using `io.emit()`
    socket.on('expandItem', (panel, itemIndex, close, lockedStatus) => {
        console.log("Message Received, state: " + itemIndex);
        io.emit('expandItem', {type:panel, state: itemIndex, closedIndex:close, locked:lockedStatus});    
    });

    socket.on('lockItem', (panel, itemIndex) => {
        console.log("Message Received, state: " + itemIndex);
        io.emit('lockItem', {type:panel, state: itemIndex});    
    });

    socket.on('moveItem', (action, prevIndex, currIndex, indexData) => {
        console.log("Message Received, state: " + prevIndex + " " + currIndex);
        io.emit('moveItem', {type: action, previousIndex: prevIndex, currentIndex: currIndex, containerData: indexData});    
    });

    socket.on('zoomChart', (zoom, min, max, xyk) => {
        console.log("Message Received, zoom: " + zoom);
        io.emit('zoomChart', {state: zoom, xDomainMin: min, xDomainMax: max, brushTransform: xyk});    
    });

    socket.on('maximizeChart', (maximized) => {
        console.log("Message Received, zoom: " + maximized);
        io.emit('maximizeChart', {state: maximized});    
    });

    socket.on('swipeCM', (index) => {
        console.log("Message Received, zoom: " + index);
        io.emit('swipeCM',index);    
    });

    socket.on('switchCCP', (index, index2) => {
        console.log("Message Received, zoom: " + index);
        io.emit('switchCCP',{graphFactorIndex: index, swiperIndex: index2});    
    });

    socket.on('getANumber', (index) => {
        console.log("getANumber: " + index);
        io.emit('getANumber',index);    
    });

    socket.on('setPlaneIcons', (index) => {
        console.log("setPlaneIcons: " + index);
        io.emit('setPlaneIcons',index);    
    });


},{reconnection:false});

// Initialize our websocket server on port 5000
http.listen(3000, () => {
    console.log('started on port 3000');
});