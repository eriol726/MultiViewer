import { Injectable, ViewChild } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable} from 'rxjs';
import {Subject} from 'rxjs';
import { environment} from '../environments/environment';
import { LeftComponent } from './left/left.component';
import { TabletComponent } from './tablet/tablet.component';



@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  //private socket; // socket that connects to our socket.io server
  //@ViewChild(LeftComponent) leftPanel: LeftComponent;

  constructor() { }

  private socket = io('http://localhost:3000');

  newMessageReceived() {
    // If you aren't familiar with environment variables then
    // you can hard code `environment.ws_url` as `http://localhost:5000`
       

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    let observable = new Observable<{type:String, state:number, state2: number}>(observer => {
        this.socket.on('state1', (data) => {
          console.log("Received message from Websocket Server: ", data );
          //this.tabletComp.handleLeftPanel(0);
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
  
    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.
    // let observer = {
    //     next: (data: Object) => {
    //         this.socket.emit('message', data);
    //     }, 
    // };
    console.log("observable: ", observable);
    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return observable;
  }

  sendMessage(data, data2){
    
    this.socket.emit('state1', data, data2 );
    //this.socket.emit('state', data2);
  }
}
