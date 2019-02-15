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
    let observable = new Observable<{type:String, state:number}>(observer => {
        this.socket.on('state', (data) => {
          console.log("Received message from Websocket Server: ", data );

          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  moveItem() {
    let observable = new Observable<{type:String, previousIndex:number, currentIndex: number, containerData: Array<{"text": string, "color":string}>}>(observer => {
        this.socket.on('moveItem', (data) => {
          console.log("Received message from Websocket Server: ", data );

          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  sendExpand(data){
    this.socket.emit('state', data );
    //this.socket.emit('state', data2);
  }

  sendMove(data, data1, data2, data3){
    this.socket.emit('moveItem',data, data1 ,data2, data3);
    //this.socket.emit('state', data2);
  }
}
