import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation } from '@angular/core';
import * as Plotly from 'plotly.js';
import { RightComponent } from '../right/right.component';
import { LeftComponent } from '../left/left.component';
import { MiddleComponent } from '../middle/middle.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
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
import { DragulaService } from 'ng2-dragula';

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

  private area2: any;

  private collisionArea: any;
  private collisionArea2: any;
  private focus: any;

  private outerUpperArea: any;
  private innerArea: any;
  private outerLowerArea: any;
  private outerUpperArea2: any;
  private outerLowerArea2: any;
  private innerArea2: any;

  private focusIndexMin: any = 5000;
  private focusIndexMax: any = -5000;

  private zoomDate1: any;
  private zoomDate2: any;

  private panelOpenState = false;

  private selectedCM = [false,false,false,false];
  private lockedCM = [false, false, false, false];

  public isExpanded: number  = -1;
    
  
 
  public thePanel;
  intersectionColor: d3.Area<[number, number]>;
  tasks2: any[];

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
          //console.log("hej ", drake.drake.dragging);

          let isCopyAble = (target.id !== 'right');
          if (this.done.content.some((x) => x.text == el.querySelector("#title").innerHTML) ){
            isCopyAble = false;
          }else{
            
            //console.log("added: ", this.elRef.nativeElement.querySelector("[id='1']"));
            console.log("added: ", this.elRef.nativeElement.querySelector(`#${CSS.escape(el.id)}`).style.backgroundColor);
            
            //el.children[0].style.backgroundColor = "blue";
          }

          return isCopyAble;
        },
        invalid: function (el, handle) {
          let prevent = false;
          if(Number.isInteger(parseInt(el.id))){
            //el.className += " mat-expanded";
            //this.elRef.nativeElement.querySelector('.example-list').children[el.id].children[1];
      
            //prevent = true;
            //console.log("this.isExpanded: ", this.elRef.nativeElement.querySelector('.example-list').children[el.id].children);
          }
          
          return false; // don't prevent any drags from initiating by default
        }.bind(this),
        

      }).drake.on("drop", function(el,target, source){
        console.log("target: ", target);
        console.log("source: ", source);
        if(target){
          if (!this.done.content.some((x) => x.text == el.querySelector("#title").innerHTML) ){
            this.done.content.push(this.tasks.content[el.id]);
            console.log("el.id ", el);
            console.log("chldren ", this.elRef.nativeElement.querySelector('.example-list-right').children[el.id]);
            //el.style.backgroundColor = "gray";
            //this.isExpanded = false; 
            this.isExpanded = -1;//parseInt(el.id);
            //this.isExpanded = parseInt(el.id) == this.isExpanded ? -1 : parseInt(el.id);
   
            el.style.backgroundColor = "yellow";
            this.elRef.nativeElement.querySelector('.example-list-right').children[el.id].style.backgroundColor = "gray";

          }
        }
          
      }.bind(this));
      
      
 
    
  }

  closeLeftPanel(){
    for (let index = 0; index < this.done.content.length; index++) {
      this.elRef.nativeElement.querySelector('.example-list').children[index].children[1].style.height = "0px";
      this.elRef.nativeElement.querySelector('.example-list').children[index].children[1].style.visibility = "hidden";
      
    }
    console.log("length: ", this.elRef.nativeElement.querySelector('.example-list'));
    
  }

  expandTaskPanel(index){
    console.log("open ", this.panelOpenState );
    //this.tabletComp.handleLeftPanel(0);
    if(this.panelOpenState){
      this.isExpanded = index;
    }
    
    // rescale the minutes to be comparable with the database 
    for (let index = 0; index < 56; index++) {
      if(this.zoomDate2.getMinutes() > index*4 && this.zoomDate2.getMinutes() < index*4+4){
        this.zoomDate2.setHours(this.zoomDate2.getHours(),index*4+4,0,0);
        this.zoomDate1.setHours(this.zoomDate1.getHours(),index*4+4,0,0);
      }
    }

    
    this.focusIndexMin = TEMPERATURES[6].values.findIndex((d: any) => {
      return d.date.getTime() === this.zoomDate1.getTime()
    });

    this.focusIndexMax = TEMPERATURES[6].values.findIndex((d: any) => {
      return d.date.getTime() === this.zoomDate2.getTime()
    });

    

    //this.focus.select('#hash4_5').attr('d', this.collisionArea);
    // this.focus.select('.clip-below1').attr('d', this.collisionArea.y0(0).bind(this));
    // this.focus.select('.clip-above1').attr('d', this.collisionArea.y0(this.height).bind(this));

    //this.focus.select('#hash4_5').attr("d", this.collisionArea.bind(this));
    switch(index){
      case 0: {
        if(!this.lockedCM[index]){
          this.focus.select('.areaOuterLower2').attr("d", this.outerLowerArea2.bind(this));
        }
        
        if(this.panelOpenState || this.lockedCM[index]){
          this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {
            if(i> 249 && i < 331  ){
              return this.y(TEMPERATURES[6].values[i].temperature);
            }
            else{
              return this.y(TEMPERATURES[7].values[i].temperature);
            }
          }));
          this.focus.select('#hash4_5').attr('d', this.collisionArea.y1((d:any, i:number) => this.y(TEMPERATURES[0].values[i].temperature)).bind(this));
        }else{
          this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => this.y(TEMPERATURES[7].values[i].temperature)).bind(this));
          this.focus.select('#hash4_5').attr('d', this.collisionArea.y1((d:any, i:number) => this.y(TEMPERATURES[0].values[i].temperature)).bind(this));
          
        }
        break;
      }
      case 1: {
        break;
      }
      default: {
        break;
      }
    }
    

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
    console.log("inside selected cm");

    



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

  private getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
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

    
    this.width = this.mainChart.nativeElement.offsetWidth;
    console.log("this.width: ", this.elRef.nativeElement.querySelector(".cell").offsetWidth);
    this.height = +this.svg.attr("height");// - this.margin.top - this.margin.bottom;
    this.height2 = +this.svg.attr("height") -this.margin2.top - this.margin2.bottom;

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


    this.collisionArea = d3.area()
      .curve(d3.curveBasis)
      .x((d:any) => this.x(d.date))
      .y0((d:any, i:number) => this.y(TEMPERATURES[7].values[i].temperature))
      .y1((d:any, i:number) => {
        if(i> 249 && i < 331 && this.panelOpenState){
          
          return this.y(TEMPERATURES[0].values[i].temperature);
          
        }else{
          return this.y(TEMPERATURES[0].values[i].temperature);
        }
      });

    // first curve
    this.outerUpperArea = d3.area()
    .curve(d3.curveBasis)
    .x((d: any) => this.x(d.date))
    .y0((d: any, i: number) => this.y(d.temperature))
    .y1((d: any, i: number) => this.y(TEMPERATURES[1].values[i].temperature))

    this.innerArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date))
      .y0((d: any) => this.y(d.temperature ))
      .y1((d: any, i:number) => this.y(TEMPERATURES[2].values[i].temperature));

    this.outerLowerArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) )
      .y0((d: any, i:number) => this.y(TEMPERATURES[2].values[i].temperature))
      .y1((d: any, i:number) => this.y(d.temperature));

    //second curve
    this.outerUpperArea2 = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) )
      .y0((d: any, i:number) => this.y(d.temperature))
      .y1((d: any, i:number) => this.y(TEMPERATURES[5].values[i].temperature));

    this.innerArea2 = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date))
      .y0((d: any) => this.y(d.temperature ))
      .y1((d: any, i:number) => this.y(TEMPERATURES[6].values[i].temperature));
    
    this.outerLowerArea2 = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) )
      .y0((d: any, i:number) => this.y(TEMPERATURES[6].values[i].temperature))
      .y1((d: any, i:number) => {
        if(i> 249 && i < 331 && this.panelOpenState || this.lockedCM[0]){
          return this.y(TEMPERATURES[6].values[i].temperature+1);
        }else{
          return this.y(d.temperature);
        }
      });

    // brush area
     this.area2 = d3Shape.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x2(d.date))
      .y0((d: any) => this.y2(d.temperature)+5)
      .y1((d: any) => this.y2(d.temperature));
      
    this.svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height)
        

    this.focus = this.svg.append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate(' + 0 + ',' + this.margin.top + ')');
        
    this.context = this.svg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(' + 0 + ',' + this.margin2.top + ')');

    
  }

  private brushed() {
    
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
    console.log("brushed");
    let s = d3.event.selection || this.x2.range();
    let s2 = d3.event.selection || this.x4.range();
    
    this.x.domain(s.map(this.x2.invert, this.x2));
 
    this.focus.select('.areaOuterUpper').attr('d', this.outerUpperArea.bind(this));
    this.focus.select('.areaInner').attr('d', this.innerArea.bind(this));
    this.focus.select('.areaOuterLower').attr('d', this.outerLowerArea.bind(this));

    this.focus.select('.areaOuterUpper2').attr('d', this.outerUpperArea2.bind(this));
    this.focus.select('.areaInner2').attr('d', this.innerArea2.bind(this));
    this.focus.select('.areaOuterLower2').attr('d', this.outerLowerArea2.bind(this));

    // this.focus.select('#hash4_5').attr('d', this.collisionArea.bind(this));
    // this.focus.select('.clip-below1').attr('d', this.collisionArea.y0(0).bind(this));
    // this.focus.select('.clip-above1').attr('d', this.collisionArea.y0(this.height).bind(this));


    console.log("s: ", s);
    this.focus.select('.axis--x').call(this.xAxis);
    this.svg.select('.zoom').call(this.zoom.transform, d3.zoomIdentity
        .scale(this.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private zoomed() {
    console.log("zoom");

    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
    var t = d3.event.transform;

    this.zoomDate1 = t.rescaleX(this.x2).domain()[0];
    this.zoomDate2 = t.rescaleX(this.x2).domain()[1];

    this.x.domain(t.rescaleX(this.x2).domain());

    this.focus.select('.areaOuterUpper').attr('d', this.outerUpperArea.bind(this));
    this.focus.select('.areaInner').attr('d', this.innerArea.bind(this));
    this.focus.select('.areaOuterLower').attr('d', this.outerLowerArea.bind(this));

    this.focus.select('.areaOuterUpper2').attr('d', this.outerUpperArea2.bind(this));
    this.focus.select('.areaInner2').attr('d', this.innerArea2.bind(this));
    this.focus.select('.areaOuterLower2').attr('d', this.outerLowerArea2.bind(this));

    // if(!this.lockedCM[0]){
    //   this.focus.select('.areaOuterLower2').attr("d", this.outerLowerArea2.bind(this));
    // }

    //this.focus.select('#hash4_5').attr('d', this.collisionArea);
    //this.focus.select('#hash4_5').attr('d', this.collisionArea.bind(this));
    
    if(this.panelOpenState || this.lockedCM[0]){
      this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {
        if(i> 249 && i < 331 ){
          return this.y(TEMPERATURES[6].values[i].temperature);
        }
        else{
          return this.y(TEMPERATURES[7].values[i].temperature);
        }
      }));
    //this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => this.y(TEMPERATURES[0].values[i].temperature)).bind(this));
    }else{
      this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => this.y(TEMPERATURES[7].values[i].temperature)).bind(this));
    }


    this.focus.select('.clip-below1').attr('d', this.collisionArea.y0(0).bind(this));
    this.focus.select('.clip-above1').attr('d', this.collisionArea.y0(this.height).bind(this));
    
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

    let data1 = TEMPERATURES[0].values;

    data1.forEach(function(d,i) {
      d["aboveData"] = d.temperature;
      d["belowData"] = TEMPERATURES[7].values[i].temperature;
    }.bind(this));

    

    // first curve
    this.focus.append('path')
      .datum(TEMPERATURES[0].values)
      .attr('class', 'areaOuterUpper')
      .attr('d',this.outerUpperArea)
      .attr('clip-path', 'url(#rect-clip)');
      

    this.focus.append('path')
      .datum(TEMPERATURES[1].values)
      .attr('class', 'areaInner')
      .attr('d',this.innerArea)
      .attr('clip-path', 'url(#rect-clip)');
    

      
    this.focus.append('path')
      .datum(TEMPERATURES[3].values)
      .attr('class', 'areaOuterLower')
      .attr('d',this.outerLowerArea)
      .attr('clip-path', 'url(#rect-clip)');

    //next curve

    this.focus.append('path')
      .datum(TEMPERATURES[4].values)
      .attr('class', 'areaOuterUpper2')
      .attr('d',this.outerUpperArea2)
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[5].values)
      .attr('class', 'areaInner2')
      .attr('d',this.innerArea2)
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[7].values)
      .attr('class', 'areaOuterLower2')
      .attr('d',this.outerLowerArea2)
      .attr('clip-path', 'url(#rect-clip)');

    // line pattern
    this.focus.append("clipPath")
      .datum(TEMPERATURES[7].values)
      .attr("id", "clip-below")
      .append("path")
      .attr("class", "clip-below1");

    this.focus.append("clipPath")
      .datum(TEMPERATURES[0].values)
      .attr("id", "clip-above")
      .append("path")
      .attr("class", "clip-above1");

    this.focus.append("pattern")
      .attr('id', "hash4_6")
      .attr('width', "4") 
      .attr('height',"4")
      .attr('patternUnits',"userSpaceOnUse") 
      .attr('patternTransform', "rotate(45)")
      .append("rect")
      .attr("width","2")
      .attr("height", "4")
      .attr("transform", "translate(0,0)")
      .attr("fill", "#000")

    this.focus.append("path")
      .datum(TEMPERATURES[0].values)
      .attr('id', 'hash4_5')
      .attr("x", 0)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#hash4_6)")
      .attr("clip-path", "url(#clip-above)")
      .attr("d", this.collisionArea)

    // axis
    // this.focus.append('g')
    // .attr('class', 'axis axis--x')
    // .attr('transform', 'translate(0,' + this.height + ')')
    // .call(this.xAxis);

    // this.focus.append('g')
    // .attr('class', 'axis axis--y')
    // .call(this.yAxis);

    
    // this.context.append('path')
    //     .datum(TEMPERATURES[0].values)
    //     .attr('class', 'area')
    //     .attr('d', this.area2);

    // this.context.append('g')
    //     .attr('class', 'axis axis--x')
    //     .attr('transform', 'translate(0,' + this.height2 + ')')
    //     .call(this.xAxis2);

    this.context.append('g')
        .attr('class', 'brush')
        .attr('visibility', 'hidden') 
        .call(this.brush)
        .call(this.brush.move, this.x.range());

    this.svg.append('rect')
        .attr('class', 'zoom')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .call(this.zoom);

    this.context.select(".brush").call(this.brush.move, [TEMPERATURES[0].values[249].date, TEMPERATURES[0].values[331].date].map(this.x));

    //this.socket.sendZoom(true, TEMPERATURES[0].values[249],TEMPERATURES[0].values[331].date,brushT);
  }




  handleRightPanel(index){
    console.log("this.chartTablet: ", this.chartTablet);

    
    this.rightPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  selectCard(index){
    this.selectedCM[index] = true;
    
    console.log("index: ", index);
    if(this.lockedCM[index]){
      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "";
      this.lockedCM[index] = false;
    }
    else{
      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "#65a5ef";
      this.lockedCM[index] = true;
    }
    
    //this.elRef.nativeElement.querySelector('.mat-expansion-panel').style.backgroundColor = "#65a5ef";
    //this.panelRight._results[index]._body.nativeElement.style.backgroundColor = "#65a5ef"
    //this.elRef.nativeElement.querySelector('.mat-expanded').style.backgroundColor = "#65a5ef";
  }
  
  status(event: CdkDragStart){
    console.log("exit: ", event);
    // setTimeout(() => { this.tasks= { "content" : [
    //   {"text": "task 0", "color":"rgb(38, 143, 85)"},
    //   {"text": "task 1", "color":"rgb(38, 143, 85)"},
    //   {"text": "task 2", "color":"rgb(38, 143, 85)"},
    // ] } }, 2000); 
  }


  ngAfterViewInit() {
    console.log(" this.panel ", this.panel.nativeElement);
    console.log("panel2: ", (document.querySelector('.mat-expansion-panel') as HTMLElement))
    //this.panel._results[2]._body.style.marginBottom = "1px";
    
    
  }

}