import { Component, ViewChildren, OnInit, Input, Inject, AfterViewInit } from '@angular/core';
import { forwardRef } from '@angular/core';
import { ActionService } from '../action.service';
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
  constructor(private actionService : ActionService, private display : WebsocketService) {

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
    console.log("ngInit");
    const tasksObservable = this.actionService.getActions();
    tasksObservable.subscribe(tasksData => {
      this.tasks3 = tasksData;
      console.log("tasks: ", tasksData);
    })

  }

  ngAfterViewInit(){
    this.display.expandItem().subscribe(data=>{
      if(data.type === "task"){
        if(this.panel._results[data.state].expanded == false){
          this.panel._results[data.state].expanded = true;
        }
        else{
          this.panel._results[data.state].expanded = false;
        }
      }
    });

    this.display.moveItem().subscribe(data=>{
      if(data.type === "change"){
        moveItemInArray(this.tasks3.content, data.previousIndex, data.currentIndex);
      }
      else if(data.type === "add"){
        console.log("data.type: ", data.type);
        
          this.tasks3.content = data.containerData;

      }else if(data.type === "remove"){
        transferArrayItem(this.tasks3.content,
          [],
          data.previousIndex,
          data.currentIndex);
      }
      
      console.log("this.tasks: ", this.tasks3, " \n currentData: ", data.containerData);
    })

  }


}
