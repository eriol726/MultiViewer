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
  

  expandPanelItem() {
    let observable = new Observable<{isExpanded:number, panelIndex:number, locked:boolean}>(observer => {
        this.socket.on('expandPanelItem', (data) => {
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
    let observable = new Observable<{currentIndex: number, containerData: {"text": string, "color":string, "startDate": Date, "endDate": Date}}>(observer => {
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

  changeCard() {
    let observable = new Observable<number>(observer => {
        this.socket.on('changeCard', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        }
    });
    return observable;
  }

  changeMessage(){
    let observable = new Observable<{graphFactorIndex:number, swiperIndex:number}>(observer => {
      this.socket.on('changeMessage', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }

  getANumber(){
    let observable = new Observable<number>(observer => {
      this.socket.on('getANumber', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }

  setPlaneIcons(){
    let observable = new Observable<boolean>(observer => {
      this.socket.on('setPlaneIcons', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }

  reloadPage(){
    let observable = new Observable<boolean>(observer => {
      this.socket.on('reloadPage', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }

  prioritize(){
    let observable = new Observable<boolean>(observer => {
      this.socket.on('prioritize', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }

  fullScreen(){
    let observable = new Observable<boolean>(observer => {
      this.socket.on('fullscreen', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
    return observable;
  }

  sendExpand(isExpanded, panelIndex, isLocked){
    this.socket.emit('expandPanelItem', isExpanded, panelIndex, isLocked );
  }

  sendLock(data, data1){
    this.socket.emit('lockItem', data, data1 );
  }

  sendMove(cmIndex, COUNTERMEASURES){
    this.socket.emit('moveItem',cmIndex, COUNTERMEASURES);
  }

  sendZoom(data, data1, data2,data3){
    this.socket.emit('zoomChart',data, data1, data2, data3);
  }

  sendMaximized(isMaximized){
    this.socket.emit('maximizeChart',isMaximized);
  }

  sendCardIndex(cardIndex){
    this.socket.emit('changeCard',cardIndex);
  }

  sendMessage(curveFactor, messageIndex){
    this.socket.emit('changeMessage',curveFactor, messageIndex);
  }

  sendANumber(data){
    this.socket.emit('getANumber',data);
  }

  sendPlaneIcon(data){
    this.socket.emit('setPlaneIcons',data);
  }

  sendReloadPage(isReloaded){
    this.socket.emit('reloadPage',isReloaded);
  }

  sendPriorotize(isPrioritized){
    this.socket.emit('prioritize',isPrioritized);
  }

  sendFullscreen(isFullScreen){
    this.socket.emit('fullscreen',isFullScreen);
  }



}
