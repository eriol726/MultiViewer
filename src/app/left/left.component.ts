import { Component, ViewChildren, OnInit, Input } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {
  @Input() tasks: string;
  @Input() expand;
  @ViewChildren('panel') panel;


  constructor() {

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

  ngOnInit() {
  }

}
