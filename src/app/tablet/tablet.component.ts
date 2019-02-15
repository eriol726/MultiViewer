import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import * as Plotly from 'plotly.js';
import { RightComponent } from '../right/right.component';
import { LeftComponent } from '../left/left.component';
import { MiddleComponent } from '../middle/middle.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChatService} from '../chat.service';
import { WebsocketService } from '../websocket.service';
import { ActionService } from '../action.service';
import * as d3 from 'd3';

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

  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  private margin: any = { top: 20, bottom: 20, left: 20, right: 20};
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;

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

  chartData = [];

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

  generateData() {
    this.data = [];
    for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
    this.data.push([
    `Index ${i}`,
    Math.floor(Math.random() * 100)
    ]);
   }
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
    this.generateData();
    //this.basicChart('#ab63fa');
    const tasksObservable = this.actionService.getActions();
    tasksObservable.subscribe(tasksData => {
      this.tasks = tasksData;
    })
    const doneObservable = this.actionService.getCountermeasures();
    doneObservable.subscribe(doneData => {
      this.done = doneData; 
    })

    this.createChart();
    if (this.data) {
      this.updateChart();
    }
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }



  createChart() {
    let element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    this.height = 500;
    this.width = 300;
    let svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', '600px');

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    
    

    // define X & Y domains
    let xDomain = this.data.map(d => d[0]);
    let yDomain = [0, d3.max(this.data, d => d[1])];

    // create scales
    this.xScale = d3.scaleBand().padding(0.1).domain(xDomain).rangeRound([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

    // bar colors
    this.colors = d3.scaleLinear().domain([0, this.data.length]).range(<any[]>['red', 'blue']);

    // x & y axis
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(d3.axisBottom(this.xScale));
    this.yAxis = svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));
  }

  updateChart() {
    // update scales & axis
    this.xScale.domain(this.data.map(d => d[0]));
    this.yScale.domain([0, d3.max(this.data, d => d[1])]);
    this.colors.domain([0, this.data.length]);
    this.xAxis.transition().call(d3.axisBottom(this.xScale));
    this.yAxis.transition().call(d3.axisLeft(this.yScale));

    let update = this.chart.selectAll('.bar')
      .data(this.data);

    // remove exiting bars
    update.exit().remove();

    // update existing bars
    this.chart.selectAll('.bar').transition()
      .attr('x', d => this.xScale(d[0]))
      .attr('y', d => this.yScale(d[1]))
      .attr('width', d => this.xScale.bandwidth())
      .attr('height', d => this.height - this.yScale(d[1]))
      .style('fill', (d, i) => this.colors(i));

    // add new bars
    update
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.xScale(d[0]))
      .attr('y', d => this.yScale(0))
      .attr('width', this.xScale.bandwidth())
      .attr('height', 0)
      .style('fill', (d, i) => this.colors(i))
      .transition()
      .delay((d, i) => i * 10)
      .attr('y', d => this.yScale(d[1]))
      .attr('height', d => this.height - this.yScale(d[1]));
  }

  handleRightPanel(index){
    console.log("this.chartTablet: ", this.chartTablet);

    
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
