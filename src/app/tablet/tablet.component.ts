import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { RightComponent } from '../right/right.component';
import { LeftComponent } from '../left/left.component';
import { MiddleComponent } from '../middle/middle.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { WebsocketService } from '../websocket.service';
import { ActionService } from '../action.service';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { TEMPERATURES } from '../../data/temperatures';
import { DragulaService } from 'ng2-dragula';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type MyType = {
  text: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-tablet',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tablet.component.html',
  styleUrls: ['./tablet.component.css']
})
export class TabletComponent implements OnInit, AfterViewInit {

  title = 'multiViewer';
  graphDataOriginal = 0;
  graphDataImproved  = 0;
  
  @ViewChildren('chartTablet') chartTablet;
  @ViewChildren('panelRight') panelRight;
  @ViewChildren('panelLeft') panelLeft;
  @ViewChild(RightComponent) rightPanel: RightComponent;
  @ViewChild(LeftComponent) leftPanel: LeftComponent;
  @ViewChild(MiddleComponent) middlePanel: MiddleComponent;
  @ViewChildren('panel') panel: ElementRef;
  @ViewChildren('cell') cell: ElementRef;
  @ViewChild('appCompButton') appCompButton;
  @ViewChild('chart') mainChart: ElementRef;

  @ViewChild('chart') private chartContainer: ElementRef;

  likes: any = 10;
  private myTemplate: any = "";
  @Input() url: string = "app/right.display.component.html";

  tasks: MyType[];

  done: MyType[];

  

  chartData = [];
  //data = [];

  expand = [false,false,false,false];

  messageState : number = 0;
  panelIndex : number = 0;
  currentState : boolean = false

  data: any;
  private panelOpenState = false;

  private selectedCM = [false,false,false,false];
  private lockedCM = [{"locked": false, "graphFactor": 5},
                      {"locked": false, "graphFactor": 20},
                      {"locked": false, "graphFactor": 10},
                      {"locked": false, "graphFactor": 15}];

  public isExpanded: number  = -1;
    
  public thePanel;
  intersectionColor: d3.Area<[number, number]>;
  tasks2: any[];
  curveFactorLocked: number = 0;

  constructor(private actionService : ActionService, 
              private socket : WebsocketService, 
              private http: HttpClient, 
              private elRef:ElementRef,
              private dragulaService: DragulaService) { 

      let drake = dragulaService.createGroup('COPYABLE', {
        copy: (el, source) => { 
          console.log("source.id: ", source.id);
          return source.id === 'right';
        },
        accepts: (el, target, source, sibling) => {
          // To avoid dragging from left to right container
          let isCopyAble = (target.id !== 'right');

          if (this.done.some((x) => x.text == el.querySelector("#title").innerHTML) ){
            isCopyAble = false;
          }

          return isCopyAble;
        },
        invalid: function (el, handle) {
          return false; // don't prevent any drags from initiating by default
        }.bind(this),
        

      }).drake.on("drop", function(el,target, source){
        if(target){
          if (!this.done.some((x) => x.text == el.querySelector("#title").innerHTML) ){
            this.done.push(this.tasks[el.id]);
            this.isExpanded = -1;
            this.socket.sendMove("change",0,0,this.tasks[el.id]);
   
            el.style.backgroundColor = "yellow";
            this.elRef.nativeElement.querySelector('.example-list-right').children[el.id].style.backgroundColor = "gray";

          }
        }
          
      }.bind(this));
  }

  closeLeftPanel(){
    for (let index = 0; index < this.done.length; index++) {
      this.elRef.nativeElement.querySelector('.example-list').children[index].children[1].style.height = "0px";
      this.elRef.nativeElement.querySelector('.example-list').children[index].children[1].style.visibility = "hidden";
    }
    
  }

  expandTaskPanel(index){

    if(this.panelOpenState){
      this.isExpanded = index;
      this.socket.sendExpand("task",index,index);
    }
    else{
      this.socket.sendExpand("task",-1,index);
    }
  }

  expandDonePanel(index){

    this.socket.sendExpand("done",index,index);
  }

  dropTasks(event: CdkDragDrop<string[]>) {
    console.log("removed cm");
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.socket.sendMove("change",event.previousIndex,event.currentIndex,event.container.data);
    } else {
      
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      this.socket.sendMove("add",event.previousIndex,event.currentIndex,event.container.data);
      console.log("green transfer prevData: ", event.container.data[event.previousIndex], " \n currentData" , event.container.data[event.currentIndex]);
    }
  }

  dropDones(event: CdkDragDrop<string[]>) {
    
    if (event.previousContainer === event.container) {
      console.log("move done");
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.socket.sendMove("changeDone",event.previousIndex,event.currentIndex,event.container.data);

    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      this.socket.sendMove("remove",event.previousIndex,event.currentIndex,event.container.data);
    }
    console.log("blue transfer prevData:")
  }

  ngOnInit(){

    this.data = TEMPERATURES.map((v) => v.values.map((v) => v.date ))[0];
    //this.basicChart('#ab63fa');
    const tasksObservable = this.actionService.getActions();
    tasksObservable.subscribe(tasksData => {

      this.tasks = tasksData;
    })

    this.done = [];
  
  }

  ngOnChanges() {

  }

  selectCard(index){
    this.selectedCM[index] = true;
    
    console.log("index: ", index);
    if(this.lockedCM[index].locked){
      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "";
      this.lockedCM[index].locked = false;
      //this.curveFactorLocked = 0;
      this.curveFactorLocked -= this.lockedCM[index].graphFactor;
    }
    else{
      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "#65a5ef";
      this.lockedCM[index].locked = true;
      this.curveFactorLocked += this.lockedCM[index].graphFactor;
    }

    this.socket.sendLock("done",index);

    

  }
  resize(){
    console.log("resize");
    console.log("maximize", this.elRef.nativeElement.querySelectorAll('.cell'));
    let cellClass = this.elRef.nativeElement.querySelectorAll('.cell');
    for (let index = 0; index < cellClass.length; index++) {
      cellClass[index].style.flex= "0 0 0%";
      cellClass[index].style.height= "0px";
      
    }
    this.elRef.nativeElement.querySelector('.example-list-right').style.minHeight = "0px";
    this.mainChart.nativeElement.style.flex= "0 0 100%";
    this.socket.sendMaximized(true);
  }

  ngAfterViewInit() {
    
  }

}