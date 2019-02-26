import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation } from '@angular/core';
import * as Plotly from 'plotly.js';
import { RightComponent } from '../right/right.component';
import { LeftComponent } from '../left/left.component';
import { MiddleComponent } from '../middle/middle.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { WebsocketService } from '../websocket.service';
import { ActionService } from '../action.service';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import { HttpClient } from '@angular/common/http';
import { TEMPERATURES } from '../../data/temperatures';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
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
  @ViewChildren('rightPanel') rightPanelTablet;
  @ViewChild(RightComponent) rightPanel: RightComponent;
  @ViewChild(LeftComponent) leftPanel: LeftComponent;
  @ViewChild(MiddleComponent) middlePanel: MiddleComponent;
  @ViewChildren('panel') panel;
  @ViewChild('appCompButton') appCompButton;

  @ViewChild('chart') private chartContainer: ElementRef;

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

  
  private margin: Margin;
  private margin2: Margin;

  private width: number;
  private height: number;
  private height2: number;

  private svg: any;     // TODO replace all `any` by the right type

  private x: any;
  private x2: any;
  private y: any;
  private y2: any;

  private xAxis: any;
  private xAxis2: any;
  private yAxis: any;

  private context: any;
  private brush: any;
  private zoom: any;
  private area: any;
  private area2: any;
  private focus: any;

  private upperOuterArea: any;
  private upperInnerArea: any;
  private lowerOuterArea: any;

    
  
 
  public thePanel;

  constructor(private actionService : ActionService, private socket : WebsocketService, private http: HttpClient) { 

    
  }

  expandTaskPanel(index){
    //this.tabletComp.handleLeftPanel(0);
    this.socket.sendExpand("task",index);
  }

  expandDonePanel(index){
    //this.tabletComp.handleLeftPanel(0);
    this.socket.sendExpand("done",index);
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

    this.initMargins();
    this.initSvg();

    this.drawChart(TEMPERATURES);

  
  }

  private initMargins() {
    this.margin = {top: 20, right: 20, bottom: 110, left: 40};
    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};
  }

  private initSvg() {
    this.svg = d3.select('svg');

    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.height2 = +this.svg.attr('height') - this.margin2.top - this.margin2.bottom;

    this.x = d3.scaleTime().
    domain([TEMPERATURES[0].values[100].date, TEMPERATURES[0].values[120].date])    
    .range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);

    this.xAxis = d3Axis.axisBottom(this.x);
    this.xAxis2 = d3Axis.axisBottom(this.x2);
    this.yAxis = d3Axis.axisLeft(this.y);

    this.brush = d3Brush.brushX()
        .extent([[0, 0], [this.width, this.height2]])
        .on('brush end', this.brushed.bind(this));

    this.zoom = d3Zoom.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [this.width, this.height]])
        .extent([[0, 0], [this.width, this.height]])
        .on('zoom', this.zoomed.bind(this));


    this.upperOuterArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) || 1)
      .y0((d: any) => this.y(d.temperature )+20)
      .y1((d: any) => this.y(d.temperature )+10);

    this.upperInnerArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) || 1)
      .y0((d: any) => this.y(d.temperature )+10)
      .y1((d: any) => this.y(d.temperature )+0);

    this.lowerOuterArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) || 1)
      .y0((d: any) => this.y(d.temperature )+0)
      .y1((d: any) => this.y(d.temperature )-Math.floor(Math.random() * (10 - 0 + 1)) + 0);


    this.area2 = d3Shape.area()
      .curve(d3Shape.curveMonotoneX)
      .x((d: any) => this.x2(d.date))
      .y0((d: any) => this.y2(d.temperature)+5)
      .y1((d: any) => this.y2(d.temperature));

    this.svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height);

    this.focus = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .attr('class', 'focus');

    this.context = this.svg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(' + this.margin2.left + ',' + this.margin2.top + ')');
  }

  private brushed() {
    
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom

    let dateInit1 = TEMPERATURES[0].values[100].date;
    let dateInit2 = TEMPERATURES[0].values[120].date;
    let s = d3.event.selection || this.x.range();

    if(d3.event.sourceEvent){
      s = d3.event.selection;
      // s[0] = s[0]+this.x(dateInit1);
      // s[1] = s[1]-this.x(dateInit2);
    }else{
      s = [this.x(dateInit1),this.x(dateInit2)];
    }
    console.log("brushed: ", s);
    
    //s = [this.x(dateInit1),this.x(dateInit2)];
    //this.x.domain(s.map(this.x2.invert, this.x2));
    // this.focus.selectAll('.areaOuterUpper').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
    // this.focus.selectAll('.areaInner').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
    // this.focus.selectAll('.areaOuterLower').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));

    //this.focus.select('.axis--x').call(this.xAxis);
    this.svg.select('.zoom').call(this.zoom.transform, d3Zoom.zoomIdentity
        .scale(this.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private zoomed() {
    let t = d3.event.transform;
    let zoomDate1 = t.rescaleX(this.x2).domain()[0];
    let zoomDate2 = t.rescaleX(this.x2).domain()[1];
    let index1= TEMPERATURES[0].values.findIndex((d: any) => {

      zoomDate1.setHours(2,0,0,0);
      d.date.setHours(2,0,0,0);

      if(d.date.getTime() === zoomDate1.getTime()){
        //console.log("zoomDate: ", zoomDate1);
      }
      return d.date.getTime() === zoomDate1.getTime()
    });

    let index2 = TEMPERATURES[0].values.findIndex((d: any) => {

      zoomDate2.setHours(2,0,0,0);
      d.date.setHours(2,0,0,0);

      if(d.date.getTime() === zoomDate2.getTime()){
        //console.log("zoomDate: ", zoomDate2);
      }
      return d.date.getTime() === zoomDate2.getTime()
    });

    //this.brush.extent([TEMPERATURES[0].values[index1].date,  TEMPERATURES[0].values[index2].date]);
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
    
    
    //TEMPERATURES[0].values.findIndex((d: any) => {d.date === t.rescaleX(this.x2).domain()[0]});
    
    let zoomBoundaries = t.rescaleX(this.x2).domain();
    let dateVariable1 = TEMPERATURES[0].values[100].date;
    let dateVariable2 = TEMPERATURES[1].values[120].date;

    
    let dateInitX1 = this.x(dateVariable1);
    let dateInitX2 = this.x(dateVariable2);
    let s = [dateInitX1,dateInitX2];

    //this.x.domain([dateInit1,dateInit2]);
    //console.log("brush: ", this.brush.empty());
    // let t2 = d3.zoomTransform( this.svg.node()); 
    // console.log("t2: ", t2);
    console.log("t: ", t.rescaleX(this.x2));
    
    var newX = d3.event.transform.rescaleX(this.x);
    //this.xAxis.call(d3.axisBottom(newX));

    
    
    
    
    this.x.domain([t.rescaleX(this.x2).domain()[0].getTime(), t.rescaleX(this.x2).domain()[1].getTime()]);



    this.focus.selectAll('.areaOuterUpper').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
    this.focus.selectAll('.areaInner2').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
    this.focus.selectAll('.areaInner').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
    this.focus.selectAll('.areaOuterLower').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));
    this.focus.selectAll('.areaOuterLower2').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));

    this.focus.selectAll('.areaOuterUpper2').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
    
    this.focus.select('.axis--x').call(this.xAxis.scale(t.rescaleX(this.x2)));

    // https://bl.ocks.org/mbostock/431a331294d2b5ddd33f947cf4c81319

   // this.focus.selectAll('.areaOuterUpper').attr("transform", d3.event.transform)
    let brushTransform = {'x':t.x,
                          'y':t.y,
                          'k':t.k };
    //this.context.select('.brush').call(this.brush.move,[this.x(dateInitX1), this.x(dateInitX2)]);
    
    
    this.context.select('.brush').call(this.brush.move, this.x.range().map(t.invertX, t));
    //this.x = d3.scaleTime().range([0, this.width]);

    // this.context.select('.brush').call(this.brush.move, this.x.range().map(function(x){
    //     console.log("x: ", x)
    //     console.log("t.x", t.x );
    //     console.log("this.x", this.x );
    //     return (x-t.x)/t.k
    //   },t
    // ));
    
    //this.socket.sendZoom(true, t.rescaleX(this.x2).domain()[0],t.rescaleX(this.x2).domain()[1],brushTransform);
  }

  

  ngOnChanges() {

  }

  addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
    var legendWidth  = 200,
        legendHeight = 100;
  
    // clipping to make sure nothing appears behind legend
    svg.append('clipPath')
      .attr('id', 'axes-clip')
      .append('polygon')
        .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                        (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                        (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                        (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                        (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                        (-margin.left)                 + ',' + (chartHeight + margin.bottom));
  
    var axes = svg.append('g')
      .attr('clip-path', 'url(#axes-clip)');
  
    axes.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(xAxis);
  
    axes.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Time (s)');
  
    var legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');
  
    legend.append('rect')
      .attr('class', 'legend-bg')
      .attr('width',  legendWidth)
      .attr('height', legendHeight);
  
    legend.append('rect')
      .attr('class', 'outer')
      .attr('width',  75)
      .attr('height', 20)
      .attr('x', 10)
      .attr('y', 10);
  
    legend.append('text')
      .attr('x', 115)
      .attr('y', 25)
      .text('5% - 95%');
  
    legend.append('rect')
      .attr('class', 'inner')
      .attr('width',  75)
      .attr('height', 20)
      .attr('x', 10)
      .attr('y', 40);
  
    legend.append('text')
      .attr('x', 115)
      .attr('y', 55)
      .text('25% - 75%');
  
    legend.append('path')
      .attr('class', 'median-line')
      .attr('d', 'M10,80L85,80');
  
    legend.append('text')
      .attr('x', 115)
      .attr('y', 85)
      .text('Median');
  }

  private drawChart(data) {

    this.x.domain(d3Array.extent(data[0].values, (d: any) => d.date));
    this.y.domain([0, d3Array.max(data[0].values, (d: any) => d.temperature)]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());


    this.focus.append('path')
      .datum(TEMPERATURES[0])
      .attr('class', 'areaOuterUpper')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[0])
      .attr('class', 'areaInner')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperInnerArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[0])
      .attr('class', 'areaOuterLower')
      .attr('d',function(d){
          console.log("d second: ", d);
          return this.lowerOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    //next line

    this.focus.append('path')
      .datum(TEMPERATURES[1])
      .attr('class', 'areaOuterUpper2')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[1])
      .attr('class', 'areaInner2')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperInnerArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[1])
      .attr('class', 'areaOuterLower2')
      .attr('d',function(d){
          console.log("d second: ", d);
          return this.lowerOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');
    

    this.focus.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + this.height + ')');
    //.call(this.xAxis);

    this.focus.append('g')
    .attr('class', 'axis axis--y')
    .call(this.yAxis);

    this.context.append('path')
        .datum(TEMPERATURES[0].values)
        .attr('class', 'area')
        .attr('d', this.area2);
    
    this.context.append('path')
        .datum(TEMPERATURES[1].values)
        .attr('class', 'area')
        .attr('d', this.area2);

    this.context.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + this.height2 + ')')
        .call(this.xAxis2);

    this.context.append('g')
        .attr('class', 'brush') 
        .call(this.brush)
        .call(this.brush.move, this.x.range());

    this.svg.append('rect')
        .attr('class', 'zoom')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .call(this.zoom);
  }




  handleRightPanel(index){
    console.log("this.chartTablet: ", this.chartTablet);

    
    this.rightPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }






  ngAfterViewInit() {

  }

}