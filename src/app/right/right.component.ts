import { Component, AfterViewInit, Input, ViewChildren, OnInit } from '@angular/core';
import { AppComponent} from "../app.component";
import { Injectable } from '@angular/core';
import { LeftComponent } from "../left/left.component";
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})

export class RightComponent implements OnInit, AfterViewInit {
  // @Input() tasks: string;
  @ViewChildren('panel') panel;
  open: any = [];

  done1 = { "content" : [
    {"text": "task 0", "color":"rgb(38, 143, 85)"},
  ]};
  constructor(private actionService : ActionService, private display : WebsocketService) {
  }

  show(index){
    if(this.panel._results[index].expanded == false){
      this.panel._results[index].expanded = true;
    }
    else{
      this.panel._results[index].expanded = false;
    }
    
    console.log("index: ", index , " " , this.panel._results[index]);
  }

  ngAfterViewInit(){
    this.display.expandItem().subscribe(data=>{
      if(data.type === "done"){
        if(this.panel._results[data.state].expanded == false){
          this.panel._results[data.state].expanded = true;
        }
        else{
          this.panel._results[data.state].expanded = false;
        }  
      }
        
    });
    
    this.display.moveItem().subscribe(data=>{
      if(data.type === "changeDone"){
        console.log("data.previousIndex: ", data.previousIndex, " \n data.currentIndex: ", data.currentIndex);
        moveItemInArray(this.done1.content, data.previousIndex, data.currentIndex);
      }
      else if(data.type === "add"){
        transferArrayItem(this.done1.content,
          [],
          data.previousIndex,
          data.currentIndex);

      } else if(data.type === "remove"){
        this.done1.content = data.containerData;
      }
    });
      
    
  }

  ngOnInit(){

    const CMmeasures = this.actionService.getCountermeasures();
    CMmeasures.subscribe(doneData => {
      this.done1 = doneData;
    })
    console.log("this.done: ", this.panel);
    
  }

  

}
