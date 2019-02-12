import { Component, ViewChildren, OnInit, Input, Inject, AfterViewInit } from '@angular/core';
import { forwardRef } from '@angular/core';
import { ActionService } from '../action.service';
import { ChatService } from '../chat.service';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit, AfterViewInit {
  @Input() tasks;
  @Input() expand;
  @ViewChildren('panel') panel;

  tasks2: {};
  constructor(private actionService : ActionService, private chat : WebsocketService) {

  }

  onClick(){
    console.log("click");
    this.actionService.emitChange('Data from child');
  
  }

  show(index){
    console.log("index: ", index , " " , this.panel);
    // if(this.panel._results[index].expanded == false){
    //   this.panel._results[index].expanded = true;
    // }
    // else{
    //   this.panel._results[index].expanded = false;
    // }
    
    
  }

  ngOnInit() {

    
    
    this.tasks = this.actionService.getActions();
    console.log("tasks: ", this.tasks);
  }

  ngAfterViewInit(){
    this.chat.newMessageReceived().subscribe(data=>{
      if(this.panel._results[data.state].expanded == false){
        this.panel._results[data.state].expanded = true;
      }
      else{
        this.panel._results[data.state].expanded = false;
      }
    });
    // this.actionService.panelStatus.subscribe(state =>{
    //   if(this.panel._results[0].expanded == false){
    //     this.panel._results[0].expanded = true;
    //   }
    //   else{
    //     this.panel._results[0].expanded = false;
    //   }
    // })
  }


}
