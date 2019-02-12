import { Component, ViewChildren, OnInit, Input, Inject } from '@angular/core';
import { forwardRef } from '@angular/core';
import { ActionService } from '../action.service';

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {
  @Input() tasks;
  @Input() expand;
  @ViewChildren('panel') panel;

  tasks2: {};
  constructor(private actionService : ActionService) {

  }

  onClick(){
    console.log("click");
    this.actionService.emitChange('Data from child');
  
  }

  show(index){
    console.log("index: ", index , " " , this.panel);
    if(this.panel._results[index].expanded == false){
      this.panel._results[index].expanded = true;
    }
    else{
      this.panel._results[index].expanded = false;
    }
    
    
  }

  ngOnInit() {
    
    this.tasks = this.actionService.getActions();
    console.log("tasks: ", this.tasks);
  }


}
