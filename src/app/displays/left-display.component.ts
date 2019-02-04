import { Component, AfterViewInit, Input, ViewChildren } from '@angular/core';
import { AppComponent} from "../app.component";
import { Injectable } from '@angular/core';
import { RightComponent } from "../right/right.component";

@Component({
  selector: 'display',
  templateUrl: './left-display.component.html',
  styleUrls: ['./left-display.component.css']
})

export class LeftDisplayComponent implements AfterViewInit {
  @Input() tasks: string;
  @ViewChildren('panel') rightPanel;
  @Input() done: string;
  open: any = [];
  constructor() { 
  }

  show(index){
    if(this.rightPanel._results[index].expanded == false){
      this.rightPanel._results[index].expanded = true;
    }
    else{
      this.rightPanel._results[index].expanded = false;
    }
    
    console.log("index: ", index , " " , this.rightPanel._results[index]);
  }

  ngAfterViewInit(){
    
  }

}
