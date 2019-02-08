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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  constructor( private chat: ChatService) {}

  ngOnInit(){
    this.chat.messages.subscribe(msg => {
      console.log(msg);
    })
  }

  sendMessage(){
    this.chat.sendMsg("test message");
  }
  
  //https://blog.angularindepth.com/exploring-drag-and-drop-with-the-angular-material-cdk-2e0237857290
}
