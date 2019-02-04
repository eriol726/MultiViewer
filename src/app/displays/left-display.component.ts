import { Component, AfterViewInit, Input } from '@angular/core';
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
  open: any = [];
  constructor(public myapp: AppComponent) { 
    console.log("this.myapp ", this.myapp.tasks);
  }

  

  ngAfterViewInit(){
    
  }

}
