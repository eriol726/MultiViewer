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

  tasks = {};

  expand = [false,false,false,false];

  messageState : number = 0;
  panelIndex : number = 0;
  currentState : boolean = false

  done = {};
  public thePanel;

  constructor(private actionService : ActionService, private chat : WebsocketService) { 
    this.chat.newMessageReceived()
        .subscribe(data=>{this.messageState = data.state});

    
    
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



    this.basicChart('#ab63fa');
    this.tasks = this.actionService.getActions();
    console.log("done ", this.actionService.getCountermeasures())
    this.done = this.actionService.getCountermeasures();
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
    
    this.actionService.panelStatus.subscribe(state => {
      console.log("state: ", this);
      // this.panel._results[0].expanded =  state;
      // this.currentState = state;

    })


    if(this.leftPanel){
      this.leftPanel.show(index);
    }
    
    //this.chat.sendMessage(index);
    if(this.currentState){
      this.actionService.expandPanel();
      this.currentState = false;
    }else{
      this.actionService.closePanel();
      this.currentState = true;
    }
    
    // this.actionService.panelStatus.subscribe(state => {
    //   console.log("state: ", this.panel);
    //   this.currentState = state;

    // })
    // if(this.currentState){
    //   this.actionService.expandPanel();
    // }else{
    //   this.actionService.closePanel();
    // }
    if(this.panel){
      if(this.panel._results[index].expanded == false){
        this.panel._results[index].expanded = true;
      }
      else{
        this.panel._results[index].expanded = false;
      }
    }
    

    


    //this.messageState;
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
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
    this.actionService.panelStatus.subscribe(state => {
        console.log("state: ", this.panel);
        this.panel._results[0].expanded =  state;
        this.currentState = state;

    })
    console.log("this.rightPanelTablet: ", this.rightPanelTablet);
    this.thePanel = this.panel;
    console.log("this.panel: ", this.panel);
    //this.child.show(0);
  }

}
