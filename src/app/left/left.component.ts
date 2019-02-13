import { Component, ViewChildren, OnInit, Input, Inject, AfterViewInit } from '@angular/core';
import { forwardRef } from '@angular/core';
import { ActionService } from '../action.service';
import { ChatService } from '../chat.service';
import { WebsocketService } from '../websocket.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit, AfterViewInit {
 // @Input() tasks;
  @Input() expand;
  @ViewChildren('panel') panel;

  tasks2: {};
  tasks3 = { "content" : [
    {"text": "task 0", "color":"rgb(38, 143, 85)"},
  ]};
  constructor(private actionService : ActionService, private chat : WebsocketService) {

  }

  onClick(){
    console.log("click");
    this.actionService.emitChange('Data from child');
  
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
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

    const tasksObservable = this.actionService.getActions();
    tasksObservable.subscribe(tasksData => {
      this.tasks3 = tasksData;
      console.log("tasks: ", tasksData);
    })
    
   //this.tasks = this.actionService.getActions();
    console.log("tasks: ", this.tasks3);
  }

  ngAfterViewInit(){
    this.chat.newMessageReceived().subscribe(data=>{
      if(this.panel._results[data.state].expanded == false){
        this.panel._results[data.state].expanded = true;
      }
      else{
        this.panel._results[data.state].expanded = false;
      }
      
      
      // this.tasks3.content[]
      // this.tasks3[data.state] = this.tasks3[data.state2];
      console.log("this.tasks: ", this.tasks3);
      console.log("data.state: ", data.state);
      console.log("data.state2: ", data.state2);
      //state den han var på
      //state2 den han kom till
    });

    this.chat.moveItem().subscribe(data=>{
      moveItemInArray(this.tasks3.content, data.previousIndex, data.currentIndex);
      console.log("this.tasks: ", this.tasks3);
    })
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
