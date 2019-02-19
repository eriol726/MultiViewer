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
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { HttpClient } from '@angular/common/http';
import { TEMPERATURES } from '../../data/temperatures';

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
 // @Input() private data: Array<any>;
  //private margin: any = { top: 20, bottom: 20, left: 20, right: 20};
  private chart: any;
  //private width: number;
  //private height: number;
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
  //data = [];

  expand = [false,false,false,false];

  messageState : number = 0;
  panelIndex : number = 0;
  currentState : boolean = false

  data: any;

    svg: any;
    margin = {top: 20, right: 80, bottom: 30, left: 50};
    g: any;
    width: number;
    height: number;
    x;
    y;
    z;
    line;

    
  
 
  public thePanel;

  constructor(private actionService : ActionService, private chat : WebsocketService, private http: HttpClient) { 
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
  //   this.data = [];
  //   for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
  //   this.data.push([
  //   `Index ${i}`,
  //   Math.floor(Math.random() * 100)
  //   ]);
  //  }
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

    this.data = TEMPERATURES.map((v) => v.values.map((v) => v.date ))[0];
    //this.basicChart('#ab63fa');
    const tasksObservable = this.actionService.getActions();
    tasksObservable.subscribe(tasksData => {
      this.tasks = tasksData;
    })
    const doneObservable = this.actionService.getCountermeasures();
    doneObservable.subscribe(doneData => {
      this.done = doneData; 
    })

    var margin = {top: 20, right: 30, bottom: 0, left: 10},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv", function(err, data){
    //   console.log("data: " , data);
    // });

    this.initChart();
   // this.drawAxis();
   // this.drawPath();
            
    // this.createChart();
    // if (this.data) {
    //   this.updateChart();
    // }
  }

  private initChart(): void {
    this.svg = d3.select('svg');

    this.margin = {top: 10, right: 30, bottom: 30, left: 50};
    this.width = 460 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    // append the svg object to the body of the page
    this.svg = d3.select('svg')
    .append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + this.margin.left + "," + this.margin.top + ")");

    // this.width = this.svg.attr('width') - this.margin.left - this.margin.right;
    // this.height = this.svg.attr('height') - this.margin.top - this.margin.bottom;

    // this.g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // this.x = d3Scale.scaleTime().range([0, this.width]);
    // this.y = d3Scale.scaleLinear().range([this.height, 0]);
    // this.z = d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);

    // set the dimensions and margins of the graph

    // get the data

    console.log("data: ", TEMPERATURES[0].values[0]);
    
    this.x = d3.scaleTime()
      .domain(d3.extent(this.data, (d: Date) => d ))
      .range([ 0, this.width ]);
      this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x));
      console.log("this.data: ",this.svg);
     // Add Y axis
     this.y = d3.scaleLinear()
      .domain([0, d3.max(TEMPERATURES, function(c) { return d3Array.max(c.values, function(d) { return d.temperature; }); }) ])
      .range([ this.height, 0 ]);
      this.svg.append("g")
      .call(d3.axisLeft(this.y))

      console.log("(d=>) : ", (d: any) => d.date);
      // Add the area
    this.svg.append("path")
    .datum(TEMPERATURES[0].values)
    .attr("fill", "#cce5df")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 2.5)
    .attr("class", "area")
    .attr("d", d3.area()
      .x((d: any) => this.x(d.date) )
      .y0(this.height)
      .y1((d: any) => this.y(d.temperature))
      )
    /*

    this.line = d3Shape.line()
        .curve(d3Shape.curveBasis)
        .x( (d: any) => this.x(d.date) )
        .y( (d: any) => this.y(d.temperature) );

    this.x.domain(d3Array.extent(this.data, (d: Date) => d ));

    this.y.domain([
        d3Array.min(TEMPERATURES, function(c) { return d3Array.min(c.values, function(d) { return d.temperature; }); }),
        d3Array.max(TEMPERATURES, function(c) { return d3Array.max(c.values, function(d) { return d.temperature; }); })
    ]);

    this.z.domain(TEMPERATURES.map(function(c) { return c.id; }));*/
}

private drawAxis(): void {
    this.g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(d3Axis.axisBottom(this.x));

    this.g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3Axis.axisLeft(this.y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('fill', '#000')
        .text('Temperature, ºF');
}

private drawPath(): void {
    let city = this.g.selectAll('.city')
        .data(TEMPERATURES)
        .enter().append('g')
        .attr('class', 'city');

    city.append('path')
        .attr('class', 'line')
        .attr('d', (d) => this.line(d.values) )
        .style('stroke', (d) => this.z(d.id) );

    city.append('text')
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr('transform', (d) => 'translate(' + this.x(d.value.date) + ',' + this.y(d.value.temperature) + ')' )
        .attr('x', 3)
        .attr('dy', '0.35em')
        .style('font', '10px sans-serif')
        .text(function(d) { return d.id; });
}

  ngOnChanges() {

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
