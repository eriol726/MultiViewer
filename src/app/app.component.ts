import { Component, ViewChildren, ViewChild, Input, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PusherService } from './pusher.service';
import {HttpClientModule} from '@angular/common/http';
import { RightComponent } from './right/right.component';
import { LeftComponent } from './left/left.component';
import * as Plotly from 'plotly.js';
import { MiddleComponent } from './middle/middle.component';
import { ActionService } from './action.service';
import { ChatService} from './chat.service';
import { WebsocketService } from './websocket.service';
import { TabletComponent } from './tablet/tablet.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  //@ViewChild(LeftComponent) leftPanel: LeftComponent;
  index = 0;
  nr = 0;

  constructor( private _chatService: WebsocketService, private tabletComp : TabletComponent, private actionService : ActionService, ) {


    // this._chatService.newMessageReceived()
    // .subscribe(data=>{
    //   this.index = data.state
    // });



  }

  sendMessage(){
    //this.tabletComp.handleLeftPanel(0);
    //this._chatService.sendMessage(this.nr++,0);
  }

  // ngOnInit(){
  //     this.chat.messages.subscribe(msg => {
  //     console.log(msg);
  //   })
  // }
  
  //https://blog.angularindepth.com/exploring-drag-and-drop-with-the-angular-material-cdk-2e0237857290
}
