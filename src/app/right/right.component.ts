import { Component, AfterViewInit, Input, ViewChildren } from '@angular/core';
import { AppComponent} from "../app.component";
import { Injectable } from '@angular/core';
import { LeftComponent } from "../left/left.component";

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})

export class RightComponent implements AfterViewInit {
  @Input() tasks: string;
  @ViewChildren('panel') leftPanel;
  @Input() done: string;
  open: any = [];
  constructor() { 
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

  

}
