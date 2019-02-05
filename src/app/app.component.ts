import { Component, ViewChildren, ViewChild, Input } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PusherService } from './pusher.service';
import {HttpClientModule} from '@angular/common/http';
import { RightComponent } from './right/right.component';
import { LeftComponent } from './left/left.component';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'multiViewer';

  @ViewChild(RightComponent) rightPanel: RightComponent;
  @ViewChild(LeftComponent) leftPanel: LeftComponent;

  likes: any = 10;
  private myTemplate: any = "";
  @Input() url: string = "app/right.display.component.html";

  tasks = { "content" : [
      {"text": "task 0", "color":"rgb(38, 143, 85)"},
      {"text": "task 1", "color":"rgb(59, 253, 91)"},
      {"text": "task 2", "color":"rgb(59, 253, 91)"},
      {"text": "task 3", "color":"rgb(237, 253, 6)"}
    ]
  };

  expand = [false,false,false,false];

  done = { "content" : [
    {"text": "done 0", "color":"rgb(3, 37, 231)"},
    {"text": "done 1", "color":"rgb(3, 37, 231)"}
  ]
};

  constructor(private pusherService: PusherService) {
    this.myTemplate = this.url;
    console.log(this.tasks.content);           
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

  ngOnInit(){
    this.basicChart();
  }

  handleRightPanel(index){
    console.log("index: ", index);
    this.rightPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  handleLeftPanel(index){
    console.log("index: ", index);
    this.leftPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  getData(time){
    

    var number =  Math.random() * (0.8 - 0.3)+0.3;
    if(time%20 == 0){
        number = 0.7;
    }
    else{
      number = 0.3;
    }

    return number;

  }

  getData2(time){

    return this.getData(time)-0.1;

  }

  basicChart() {
    
    Plotly.plot('chartTablet',[
      {
        y:[this.getData(0)],
        type:"scatter",
        fill: 'tonexty',
      },
      {
        y:[this.getData2(0)],
        type:"scatter",
        fill: 'tonexty'
      }
  ]);


  
    var cnt = 0;
    setInterval(function(){
        Plotly.extendTraces('chartTablet',{ y:[[this.getData(cnt)], [this.getData(cnt)-0.1]]} , [0,1]);
        cnt++;
      

        Plotly.relayout('chartTablet',{
            xaxis: {
                range: [cnt-50,cnt]
            }
        });
 
        Plotly.relayout('chartTablet', {
            yaxis: {
                range: [0,1]
            }
        });
    }.bind(this),15);
  }


  ngAfterViewInit() {
    //this.child.show(0);
  }
  //https://blog.angularindepth.com/exploring-drag-and-drop-with-the-angular-material-cdk-2e0237857290
}
