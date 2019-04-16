import { Injectable, ViewChild } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable} from 'rxjs';
import {Subject} from 'rxjs';
import { environment} from '../environments/environment';
import { LeftComponent } from './left/left.component';
import { TabletComponent } from './tablet/tablet.component';




// @Injectable({
//   providedIn: 'root'
// })
export class WebsocketService {

  //private socket; // socket that connects to our socket.io server
  //@ViewChild(LeftComponent) leftPanel: LeftComponent;

  constructor() { 
    console.log("this.socket: ", this.socket);
  }

  private socket = io('http://localhost:3000');
  

  expandItem() {
    let observable = new Observable<{type:String, state:number, closedIndex:number}>(observer => {
        this.socket.on('expandItem', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  lockItem() {
    let observable = new Observable<{type:Boolean, state:number}>(observer => {
        this.socket.on('lockItem', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  moveItem() {
    let observable = new Observable<{type:String, previousIndex:number, currentIndex: number, containerData: {"text": string, "color":string, "startDate": Date, "endDate": Date}}>(observer => {
        this.socket.on('moveItem', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  zoomChart() {
    let observable = new Observable<{state:boolean, xDomainMin: Date, xDomainMax: Date, brushTransform: {x:number,y:number,k:number}}>(observer => {
        this.socket.on('zoomChart', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  maximizeChart() {
    let observable = new Observable<{state:boolean}>(observer => {
        this.socket.on('maximizeChart', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  swipeCM() {
    let observable = new Observable<number>(observer => {
        this.socket.on('swipeCM', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  switchCCP(){
    let observable = new Observable<number>(observer => {
      this.socket.on('swipeCM', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }

  sendExpand(data, data1, data2){
    this.socket.emit('expandItem', data, data1, data2 );
  }

  sendLock(data, data1){
    this.socket.emit('lockItem', data, data1 );
  }

  sendMove(data, data1, data2, data3){
    this.socket.emit('moveItem',data, data1 ,data2, data3);
  }

  sendZoom(data, data1, data2,data3){
    this.socket.emit('zoomChart',data, data1, data2, data3);
  }

  sendMaximized(data){
    this.socket.emit('maximizeChart',data);
  }

  sendSwipe(data){
    this.socket.emit('swipeCM',data);
  }

  sendCCP(data){
    this.socket.emit('swipeCM',data);
  }
}
