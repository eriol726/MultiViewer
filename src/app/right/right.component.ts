import { Component, AfterViewInit, Input, ViewChildren, OnInit } from '@angular/core';
import { AppComponent} from "../app.component";
import { Injectable } from '@angular/core';
import { LeftComponent } from "../left/left.component";
import { ActionService } from '../action.service';

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})

export class RightComponent implements OnInit {
  // @Input() tasks: string;
  @ViewChildren('panel') leftPanel;
  @Input() done;
  open: any = [];
  done2: {};
  constructor(private actionService : ActionService) {
  }

  show(index){
    if(this.leftPanel._results[index].expanded == false){
      this.leftPanel._results[index].expanded = true;
    }
    else{
      this.leftPanel._results[index].expanded = false;
    }
    
    console.log("index: ", index , " " , this.leftPanel._results[index]);
  }

  ngAfterViewInit(){
    
  }

  ngOnInit(){
    
    this.done = this.actionService.getCountermeasures();
    console.log("this.done: ", this.leftPanel);
    
  }

  

}
