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
    socket.on('expandPanelItem', (_isExpanded, _panelIndex, _locked) => {
        console.log("Message Received, state: " + _panelIndex);
        io.emit('expandPanelItem', {isExpanded: _isExpanded, panelIndex:_panelIndex, locked:_locked});    
    });

    socket.on('lockItem', (panel, itemIndex) => {
        console.log("Message Received, state: " + itemIndex);
        io.emit('lockItem', {type:panel, state: itemIndex});    
    });

    socket.on('moveItem', (currIndex, CM) => {
        console.log("Message Received, state: " + currIndex );
        io.emit('moveItem', {currentIndex: currIndex, containerData: CM});    
    });

    socket.on('zoomChart', (zoom, min, max, xyk) => {
        console.log("Message Received, zoom: " + zoom);
        io.emit('zoomChart', {state: zoom, xDomainMin: min, xDomainMax: max, brushTransform: xyk});    
    });

    socket.on('maximizeChart', (maximized) => {
        console.log("Message Received, zoom: " + maximized);
        io.emit('maximizeChart', {state: maximized});    
    });

    socket.on('changeCard', (index) => {
        console.log("Message Received, zoom: " + index);
        io.emit('changeCard',index);    
    });

    socket.on('changeMessage', (index, index2) => {
        console.log("Message Received, zoom: " + index);
        io.emit('changeMessage',{graphFactorIndex: index, swiperIndex: index2});    
    });

    socket.on('getANumber', (index) => {
        console.log("getANumber: " + index);
        io.emit('getANumber',index);    
    });

    socket.on('setPlaneIcons', (index) => {
        console.log("setPlaneIcons: " + index);
        io.emit('setPlaneIcons',index);    
    });

    socket.on('reloadPage', (index) => {
        console.log("reloadPage: " + index);
        io.emit('reloadPage',index);    
    });

    socket.on('prioritize', (index) => {
        console.log("prioritize: " + index);
        io.emit('prioritize',index);    
    });

    socket.on('fullscreen', (index) => {
        console.log("fullscreen: " + index);
        io.emit('fullscreen',index);    
    });


},{reconnection:false});

// Initialize our websocket server on port 5000
http.listen(3000, () => {
    console.log('started on port 3000');
});