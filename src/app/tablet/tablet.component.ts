import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit } from '@angular/core';
import * as Plotly from 'plotly.js';
import { RightComponent } from '../right/right.component';
import { LeftComponent } from '../left/left.component';
import { MiddleComponent } from '../middle/middle.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChatService} from '../chat.service';
import { WebsocketService } from '../websocket.service';
import { ActionService } from '../action.service';

@Component({
  selector: 'app-tablet',
  templateUrl: './tablet.component.html',
  styleUrls: ['./tablet.component.css']
})
export class TabletComponent implements OnInit, AfterViewInit {

  

  title = 'multiViewer';
  graphDataOriginal = 0;
  graphDataImproved  = 0;
  
  @ViewChildren('chartTablet') chartTablet;
  @ViewChildren('rightPanel') rightPanelTablet;
  @ViewChild(RightComponent) rightPanel: RightComponent;
  @ViewChild(LeftComponent) leftPanel: LeftComponent;
  @ViewChild(MiddleComponent) middlePanel: MiddleComponent;
  @ViewChildren('panel') panel;
  @ViewChild('appCompButton') appCompButton;

  likes: any = 10;
  private myTemplate: any = "";
  @Input() url: string = "app/right.display.component.html";

  tasks = { "content" : [
      {"text": "task 0", "color":"rgb(38, 143, 85)"},
    ]
  };

  done = { "content" : [
      {"text": "task 0", "color":"rgb(38, 143, 85)"},
    ]
  };

  expand = [false,false,false,false];

  messageState : number = 0;
  panelIndex : number = 0;
  currentState : boolean = false

 
  public thePanel;

  constructor(private actionService : ActionService, private chat : WebsocketService) { 
    // this.chat.newMessageReceived().subscribe(data=>{
    //   console.log("data: ", data);
    //   this.messageState = data.state
    // });
    
  }

  expandTaskPanel(index){
    //this.tabletComp.handleLeftPanel(0);
    this.chat.sendExpand("task",index);
  }

  expandDonePanel(index){
    //this.tabletComp.handleLeftPanel(0);
    this.chat.sendExpand("done",index);
  }

  

  dropTasks(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.chat.sendMove("change",event.previousIndex,event.currentIndex,event.container.data);
    } else {
      
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      this.chat.sendMove("add",event.previousIndex,event.currentIndex,event.container.data);
      console.log("green transfer prevData: ", event.container.data[event.previousIndex], " \n currentData" , event.container.data[event.currentIndex]);
    }
  }

  dropDones(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      console.log("move done");
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.chat.sendMove("changeDone",event.previousIndex,event.currentIndex,event.container.data);

    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      this.chat.sendMove("remove",event.previousIndex,event.currentIndex,event.container.data);
    }
    console.log("blue transfer prevData:")
  }

  ngOnInit(){

    this.basicChart('#ab63fa');
    const tasksObservable = this.actionService.getActions();
    tasksObservable.subscribe(tasksData => {
      this.tasks = tasksData;
    })
    const doneObservable = this.actionService.getCountermeasures();
    doneObservable.subscribe(doneData => {
      this.done = doneData; 
    })
  }

  handleRightPanel(index){
    console.log("this.chartTablet: ", this.chartTablet);
    var update = {
      fillcolor: 'gray',
      line: {
        color: 'gray'
      }
    };

    var update2 = {
      fillcolor: '#ab63fa',
      line: {
        color: '#ab63fa'
      }
    };

    var update3 = {
      fillcolor: 'rgba(0,0,0,0)',
      line: {
        color: 'rgba(0,0,0,0)'
      }
    };

    if(this.rightPanelTablet._results[index].expanded == false){
      if(index == 0){
        Plotly.restyle('chartTablet', update2, [0]);
      }
      else if(index == 1){
        Plotly.restyle('chartTablet', update3, [2]);
      }
      
      this.middlePanel.changeColor(update2);
    }
    else{
      if(index == 0){
        Plotly.restyle('chartTablet', update, [0]);
      }
      else if(index == 1){
        Plotly.restyle('chartTablet', update2, [2]);
      }

      this.middlePanel.changeColor(update);
    }
    
    this.rightPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  public handleLeftPanel(index){
    console.log("this.messageState: ", this.messageState, " \n this: ", this, " \n state: ", this.currentState);
    
  }

  getData(time){
    

    var number =  Math.random() * (0.8 - 0.1)+0.1;
    if(time%20 == 0){
        number = 0.7;
    }
    else{
      number = 0.1;
    }

    this.graphDataOriginal = number;
    return number;

  }

  getData2(time){

    var number =  Math.random() * (0.8 - 0.1)+0.1;
    if(time%20 == 0){
        number = 0.7-0.2;
    }
    else{
      number = 0.1;
    }
    
    this.graphDataImproved = number;
    return number;

  }

  getData3(time){

    var number =  Math.random() * (0.0 + 0.2)+0.2;
    if(time%20 == 0){
        number = 0.0-0.2;
    }
    else{
      number = 0.0;
    }
    
    this.graphDataImproved = number;
    return number;

  }

  basicChart(changeColor) {
    var grayColor = '#ab63fa';
    Plotly.plot('chartTablet',[
      {
        y:[this.getData(0)],
        type:"scatter",
        fill: 'tozeroy',
        fillcolor: '#ab63fa',
        line: {
          color: '#ab63fa'
        }

      },
      {
        y:[this.getData2(0)],
        type:"scatter",
        fill: 'tozeroy',
        fillcolor: '#ab63fa',
        line: {
          color: '#ab63fa'
        }
      },
      {
        y:[this.getData3(0)],
        type:"scatter",
        fill: 'tozeroy',
        fillcolor: 'rgba(0,0,1,0)',
        line: {
          color: 'rgba(0,0,1,0)'
        }
      }
    ]);

    var cnt = 0;
    //setInterval(function(){
        Plotly.extendTraces('chartTablet',{ y:[[this.getData(cnt)], [this.getData2(cnt)], [this.getData3(cnt)]] }, [0,1,2]);
        cnt++;
      

        Plotly.relayout('chartTablet',{
            xaxis: {
                range: [cnt-50,cnt]
            },
            yaxis: {
                range: [-0.2,1]
            }
        });
 
   // }.bind(this),15);
  }




  ngAfterViewInit() {

  }

}
