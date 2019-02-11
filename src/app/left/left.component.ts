import { Component, ViewChildren, OnInit, Input, Inject } from '@angular/core';
import { forwardRef } from '@angular/core';
import { ActionService } from '../action.service';
import { ChatService } from '../chat.service';
import { WebsocketService } from '../websocket.service';

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
  message2 : any;
  constructor(private actionService : ActionService) {

  }

  onClick(){
    console.log("click");
    this.actionService.emitChange('Data from child');
  
  }

  show(index){

    // this.chat.messages.subscribe(data => {
    //   this.message2 = data.state;
    //    console.log("message: ", this.message2);
    
      
    //   if(this.panel._results[this.message2].expanded == false){
    //     this.panel._results[this.message2].expanded = true;
    //   }
    //   else{
    //     this.panel._results[this.message2].expanded = false;
    //   }
    // })

       

    
    console.log("index: ", index , " " , this.panel._results[index]);
  }

  ngOnInit() {
    
    this.tasks = this.actionService.getActions();
    console.log("tasks: ", this.tasks);
  }


}
