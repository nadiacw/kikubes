ui.toolbar.title("Kikube konnection"); 
ui.toolbar.bgColor(230, 60, 100, 255); 
ui.toolbar.show(true); 
ui.screenMode("fullscreen"); 
ui.screenOrientation("portrait"); 

// Variables

var port = 0;
var client;
var btClient;
var btStatus = false;
var margin = 10;
var w = ui.screenWidth - 2*margin;
var h = 100;

var txt = ui.addText(10, h*10, ui.screenWidth, -1);
var BTdata = " ";
var r = 0.0;
var g = 0.0; 
var b = 0.0;
var counter = 1;

var box = 0;

// ---------------------------------------------------------------------------------------------
// OSC communication
var oscServer = network.createOSCServer(port).onNewData(function(name, data) { 
    console.log(name + " " + data);
}); 

// ---------------------------------------------------------------------------------------------
// Bluetooth communication
var btnConnect = ui.addButton("Connect to kikube", 110, 0, 500, 100).onClick(function() {
    //if you want to use the Bluetooth Address, use:
    //network.bluetooth.connectSerial(macAddess, function(status) {});
    btClient = network.bluetooth.connectSerial(function(status) {
        console.log("connected " + status);
         if (status === true){
            btStatus = true;
             ui.toast("Connected!");
             btnConnect.setAlpha(0);
             btnDisconnect.setAlpha(200);
         }
    });
    
    // ---------------------------------------------------------------------------------------------
    // GET COLOR SENSOR DATA via bluetooth
    
    btClient.onNewData(function(data) {
        //console.log(data);
        var str_data = data.split(" ");
        r = str_data[0]; g = str_data[1]; b = str_data[2];
        console.log(r + ", " + g + ", " + b);
        
        // ---------------------------------------------------------------------------------------------
        // BOX COMMUNICATION
        // 0 = no BOX
        // 1 = RED BOX
        // 2 = GREEN BOX
        // 3 = BLUE BOX
        
        if (r>=180 && g < 80 && b < 80){ // RED box detected
            box = 1;
        }
        else if (r<80 && g >= 130 && b < 100){ // GREEN box detected
            box = 2;
        }
        else if (r<40 && g < 80 && b > 160){ // BLUE box detected
            box = 3;
        }
        else box = 0; // NO box
        
    });
 });
 
// ---------------------------------------------------------------------------------------------
// display detected color on screen
var canvas = ui.addCanvas(110, h*2, 500, 200);
canvas.loopDraw(35, function() {
    if (r >0 && g>0 && b>0)
    canvas.background(Math.floor(r), Math.floor(g), Math.floor(b));
});


// ---------------------------------------------------------------------------------------------
var btnDisconnect = ui.addButton("Disconnect", 110, h, 500, 100).onClick(function() {
     if (btStatus === true ) {
         btClient.disconnect();
         btStatus = false;
         ui.toast("Disconnected!");
         btnConnect.setAlpha(200);
         btnDisconnect.setAlpha(0);
    }else{
         ui.toast("Not Connected");
     }
 });

// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------

// ROLE ASSIGNMENT: SEND OSC MESSAGES (x,y,z) + CHANGE LED COLORS

ui.addButton("Drums", 110, h*5, 500, 100).onClick(function(){
    port = 8020;
    client = network.connectOSC("192.168.1.133", port);
    sensors.accelerometer.onChange(function(x,y,z){
    var o = new Array();
    o.push(x);
    o.push(y);
    o.push(z);
    client.send("/accxyz", o);
    
    // send box connection message
    var send_box = new Array();
    send_box.push(box);
    client.send("/box", send_box);
    
    });
    
    sendColor("red");
});

ui.addButton("Keyboard", 110, h*6, 500, 100).onClick(function(){
    port = 8021;
    client = network.connectOSC("192.168.1.133", port);
    sensors.accelerometer.onChange(function(x,y,z){
    var o = new Array();
    o.push(x);
    o.push(y);
    o.push(z);
    client.send("/accxyz", o);
    
    // send box connection message
    var send_box = new Array();
    send_box.push(box);
    client.send("/box", send_box);
    
    });
    
    sendColor("green");
});

ui.addButton("Synthesizer", 110, h*7, 500, 100).onClick(function(){
    port = 8022;
    client = network.connectOSC("192.168.1.133", port);
    sensors.accelerometer.onChange(function(x,y,z){
    var o = new Array();
    o.push(x);
    o.push(y);
    o.push(z);
    client.send("/accxyz", o);
    
    // send box connection message
    var send_box = new Array();
    send_box.push(box);
    client.send("/box", send_box);
    
    });
    
    sendColor("blue");
});

ui.addButton("None", 110, h*8, 500, 100).onClick(function(){
    client.stop();
    sendColor("off");
});
// ---------------------------------------------------------------------------------------------
// SEND OSC MESSAGES FOR BOX COMMUNICATION


// ---------------------------------------------------------------------------------------------
// FUNCTIONS

function sendColor(color){
    if (btStatus === true){
         //ui.jump(btnSend);
         //console.log("String = "+color);
         btClient.send(color +"\n");
         ui.toast("Sent!");
     }else{
         ui.toast("Not connected!");
     }
}
