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
import * as greinerHormann from 'greiner-hormann';
import * as clipperLib from 'js-angusj-clipper/web';

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
  private x3: any;
  private x4: any;
  private y: any;
  private y2: any;
  private y3: any;

  private xAxis: any;
  private xAxis2: any;
  private yAxis: any;

  private context: any;
  private brush: any;
  private zoom: any;
  private area: any;
  private area2: any;
  private area3: any;
  private focus: any;

  private upperOuterArea: any;
  private innerArea: any;
  private lowerOuterArea: any;
  private upperOuterArea2: any;

  private focusIndexMin: any = 5000;
  private focusIndexMax: any = -5000;

  private zoomDate1: any;
  private zoomDate2: any;

  private panelOpenState = false;
  private intersectionArea: any;
    
  
 
  public thePanel;
  intersectionColor: d3.Area<[number, number]>;

  constructor(private actionService : ActionService, private socket : WebsocketService, private http: HttpClient) { 

    
  }

  expandTaskPanel(index){
    console.log("open ", this.panelOpenState );
    //this.tabletComp.handleLeftPanel(0);
    
    this.focusIndexMin= TEMPERATURES[1].values.findIndex((d: any) => {
      this.zoomDate1.setHours(2,0,0,0);
      d.date.setHours(2,0,0,0);
      return d.date.getTime() === this.zoomDate1.getTime()
    });

    this.focusIndexMax = TEMPERATURES[1].values.findIndex((d: any) => {
      this.zoomDate2.setHours(2,0,0,0);
      d.date.setHours(2,0,0,0);
      return d.date.getTime() === this.zoomDate2.getTime()
    });


    this.focus.select('.areaOuterUpper2')
    .attr("d", this.upperOuterArea.bind(this))
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

    this.initSvg();
    console.log("init");
    this.drawChart(TEMPERATURES);

  
  }

  private initSvg() {
    this.svg = d3.select('svg');
    this.margin = {top: 20, right: 20, bottom: 110, left: 40};
    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    this.height2 = +this.svg.attr("height") -this.margin2.top - this.margin2.bottom;

    // this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    // this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    // this.height2 = +this.svg.attr('height') - this.margin2.top - this.margin2.bottom;

    this.x = d3.scaleTime().range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.x4 = d3.scaleLinear().range([0, 1]);
    this.x3 = d3.scaleLinear().range([0, 1]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y3 = d3.scaleLinear().range([0, 1]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);


    this.xAxis = d3.axisBottom(this.x);
    this.xAxis2 = d3.axisBottom(this.x2);
    this.yAxis = d3.axisLeft(this.y);

    this.brush = d3.brushX()
        .extent([[0, 0], [this.width, this.height2]])
        .on('brush end', this.brushed.bind(this));

    this.zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [this.width, this.height]])
        .extent([[0, 0], [this.width, this.height]])
        .on('zoom', this.zoomed.bind(this));

    this.intersectionColor = d3.area()
      .curve(d3.curveBasis)
      .x((d: any, i: number) => {
       
        return this.x(d.date);

      })
      .y((d: any, i: number) => {
        if (this.y(d.temperature)  > this.y(TEMPERATURES[1].values[i].temperature)){
          return this.y(d.temperature);
        } else{
          return this.y(TEMPERATURES[1].values[i].temperature );
        }
      })
      // .y1((d: any, i: number) => {
      //   if (this.y(d.temperature)  < this.y(TEMPERATURES[1].values[i].temperature-10)){
      //     return this.y(30);
      //   } else{
      //     return this.y(30);
      //   }
      // })

    this.upperOuterArea = d3.area()
    .curve(d3.curveBasis)
    .x((d: any) => this.x(d.date))
    .y0((d: any, i: number) => {
      if(i> this.focusIndexMin+5 && i < this.focusIndexMax-5 && this.panelOpenState){
        return this.y(TEMPERATURES[1].values[i].temperature+1);
      }else{
        return this.y(d.temperature+10);
      }
    })
    .y1((d: any, i: number) => {
      return this.y(d.temperature)
    })


    // this.upperOuterArea = d3.area()
    //   .curve(d3.curveBasis)
    //   .x((d: any) => this.x(d.date))
    //   .y0((d: any) => this.y(d.temperature +10))
    //   .y1((d: any) => this.y(d.temperature ));

    // this.intersectionArea = d3.line()
    //   .x(function(d:any){
    //     return d.x;
    //   })
    //   .y(function(d:any){
    //     return d.y;
    //   });
    

    this.innerArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => {
        //console.log("this.x2: ",d.date);
        return this.x(d.date)} )
      .y0((d: any) => {
        //console.log("scale y: ", this.y(d.temperature ), " \n " , (d.temperature));
        return this.y(d.temperature )
      })
      .y1((d: any) => this.y(d.temperature -10));

    this.lowerOuterArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) )
      .y0((d: any) => this.y(d.temperature -10))
      .y1((d: any) => this.y(d.temperature -20));

    
      this.area2 = d3Shape.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x2(d.date))
      .y0((d: any) => this.y2(d.temperature)+5)
      .y1((d: any) => this.y2(d.temperature));

    this.area3 = d3Shape.area()
      .curve(d3.curveBasis)
      .x((d: any) => { 
          return this.x3(d.x);
      })
      .y0((d: any) => this.y3(d.y-10))
      .y1((d: any) => this.y3(d.y));

      

    this.svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height);

    this.focus = this.svg.append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        
    this.context = this.svg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(' + this.margin2.left + ',' + this.margin2.top + ')');

    
  }

  private brushed() {
    
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
    console.log("brushed");
    let s = d3.event.selection || this.x2.range();
    let s2 = d3.event.selection || this.x4.range();
    
    this.x.domain(s.map(this.x2.invert, this.x2));
    this.x3.domain(s.map(this.x4.invert, this.x4));
    this.focus.select('.areaOuterUpper').attr('d', this.upperOuterArea.bind(this));
    this.focus.select('.areaIntersection').attr('d', this.area3.bind(this));
    this.focus.select('.areaOuterUpper2').attr('d', this.upperOuterArea.bind(this));
    this.focus.select('.areaInner2').attr('d', this.innerArea.bind(this));
    this.focus.select('.areaInner').attr('d', this.innerArea.bind(this));
    this.focus.select('.areaOuterLower').attr('d', this.lowerOuterArea.bind(this));
    this.focus.select('.areaOuterLower2').attr('d', this.lowerOuterArea.bind(this));


    console.log("s: ", s);
    this.focus.select('.axis--x').call(this.xAxis);
    this.svg.select('.zoom').call(this.zoom.transform, d3.zoomIdentity
        .scale(this.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private zoomed() {
    

    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
    var t = d3.event.transform;

    this.zoomDate1 = t.rescaleX(this.x2).domain()[0];
    this.zoomDate2 = t.rescaleX(this.x2).domain()[1];

    this.x.domain(t.rescaleX(this.x2).domain());
    this.x3.domain([t.rescaleX(this.x4).domain()[0]*1,t.rescaleX(this.x4).domain()[1]*1]);
    console.log("this.intersectionArea: ", [t.rescaleX(this.x4).domain()[0]*10,t.rescaleX(this.x4).domain()[1]*10]);
    //this.intersectionArea.attr("transform", d3.event.transform);


    this.focus.select('.areaOuterUpper').attr('d', this.upperOuterArea.bind(this));
    this.focus.select('.areaIntersection').attr('d',  this.area3.bind(this));
    this.focus.select('.areaOuterUpper2').attr('d', this.upperOuterArea.bind(this));
    this.focus.select('.areaInner2').attr('d', this.innerArea.bind(this));
    this.focus.select('.areaInner').attr('d', this.innerArea.bind(this));
    this.focus.select('.areaOuterLower').attr('d', this.lowerOuterArea.bind(this));
    this.focus.select('.areaOuterLower2').attr('d', this.lowerOuterArea.bind(this));
    
    this.focus.select('.axis--x').call(this.xAxis.scale(t.rescaleX(this.x2)));
    this.context.select('.brush').call(this.brush.move, this.x.range().map(t.invertX, t));

    let brushT = {"k": t.k, "x": t.x, "y": t.y};
    
    this.socket.sendZoom(true, t.rescaleX(this.x2).domain()[0],t.rescaleX(this.x2).domain()[1],brushT);
  }

  ngOnChanges() {

  }

  paths2string(paths, scale) {
    var i, p, path, svgpath, _j, _len2, _len3;
    svgpath = '';
    if (!(scale != null)) scale = 1;
    for (_j = 0, _len2 = paths.length; _j < _len2; _j++) {
      path = paths[_j];
      for (i = 0, _len3 = path.length; i < _len3; i++) {
        p = path[i];
        if (i === 0) {
          svgpath += 'M';
        } else {
          svgpath += 'L';
        }
        svgpath += p.X / scale + ", " + p.Y / scale;
      }
      svgpath += 'Z';
    }
    if (svgpath === '') svgpath = 'M0,0';
    return svgpath;
  };


  private async drawChart(data) {

    this.x.domain(d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; }));
    this.y.domain([0, d3.max(TEMPERATURES[0].values, function(d:any) { return d.temperature; })]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());

    // this.x.domain(d3Array.extent(data[0].values, (d: any) => d.date));
    // this.y.domain([0, d3Array.max(data[0].values, (d: any) => d.temperature)]);
    // this.x2.domain(this.x.domain());
    // this.y2.domain(this.y.domain());

    // this.focus.append('path')
    // .datum(TEMPERATURES[0].values)
    // .attr('class', 'areaOuterUpper')
    // .attr('d',this.upperOuterArea)
    // .attr('clip-path', 'url(#rect-clip)');

    

    this.focus.append('path')
      .datum(TEMPERATURES[0].values)
      .attr('class', 'areaOuterUpper')
      .attr('d',this.upperOuterArea)
      .attr('clip-path', 'url(#rect-clip)');
      

    this.focus.append('path')
      .datum(TEMPERATURES[0].values)
      .attr('class', 'areaInner')
      .attr('d',this.innerArea)
      .attr('clip-path', 'url(#rect-clip)');
    
      

      
    this.focus.append('path')
      .datum(TEMPERATURES[0].values)
      .attr('class', 'areaOuterLower')
      .attr('d',this.lowerOuterArea)
      .attr('clip-path', 'url(#rect-clip)');

    //next line

    this.focus.append('path')
      .datum(TEMPERATURES[1].values)
      .attr('class', 'areaOuterUpper2')
      .attr('d',this.upperOuterArea)
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[1].values)
      .attr("stroke-opacity", 0)
      .attr("stroke-width", 10)
      .attr('class', 'areaInner2')
      .attr('d',this.innerArea)
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[1].values)
      .attr('class', 'areaOuterLower2')
      .attr('d',this.lowerOuterArea)
      .attr('clip-path', 'url(#rect-clip)');

    let xyArr = [];
    let xyArr2 = [];

    const poly1 = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];

    const poly2 = [{ x: 10, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 10 }, { x: 10, y: 10 }];

    TEMPERATURES[0].values.forEach(value => {
      xyArr.push({"x":this.x(value.date),"y":this.y(value.temperature)});
    })

    TEMPERATURES[1].values.forEach(value => {
      xyArr2.push({"x":this.x(value.date),"y":this.y(value.temperature-10)});
    })
    // create an instance of the library (usually only do this once in your app)
    const clipper = await clipperLib.loadNativeClipperLibInstanceAsync(
      // let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
      clipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
    );

    // get their union
  const polyResult = clipper.clipToPaths({
    clipType: clipperLib.ClipType.Intersection,

    subjectInputs: [{ data: xyArr, closed: true }],

    clipInputs: [{ data: xyArr2 }],

    subjectFillType: clipperLib.PolyFillType.EvenOdd
    
  });

    //create and instruct Clipper to work with the provided paths ###

    console.log("clipper: ", polyResult);

    this.intersectionArea = this.focus.append('path')
    .datum(polyResult[0])
    .attr('class', 'areaIntersection')
    .attr('d', this.area3)
    .attr('clip-path', 'url(#rect-clip)');


    this.focus.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + this.height + ')')
    .call(this.xAxis);

    this.focus.append('g')
    .attr('class', 'axis axis--y')
    .call(this.yAxis);

    this.context.append('path')
        .datum(TEMPERATURES[0].values)
        .attr('class', 'area')
        .attr('d', this.area2);

        
    
    // this.context.append('path')
    //     .datum(TEMPERATURES[1].values)
    //     .attr('class', 'area')
    //     .attr('d', this.area2);

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

   // this.context.select(".brush").call(this.brush.move, [TEMPERATURES[0].values[100].date, TEMPERATURES[0].values[120].date].map(this.x));
    
  }




  handleRightPanel(index){
    console.log("this.chartTablet: ", this.chartTablet);

    
    this.rightPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }






  ngAfterViewInit() {

  }

}