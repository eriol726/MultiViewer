import { Component, OnInit, ElementRef, ViewChildren, ViewChild, Input, Renderer2 } from '@angular/core';
import { TEMPERATURES } from 'src/data/temperatures';
import * as d3 from 'd3';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import * as d3Shape from 'd3-shape';
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';

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
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.css']
})
export class AreaChartComponent implements OnInit {

  title = 'multiViewer';
  graphDataOriginal = 0;
  graphDataImproved  = 0;
  

  @ViewChild('chart') private mainChart: ElementRef;

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

  
  private margin: Margin;
  private margin2: Margin;

  private width: number = 0;
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
  private curveFactor = 0;

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
  svgMain: any;

  constructor(private actionService : ActionService, 
              private elRef:ElementRef,
              private renderer:Renderer2,
              private socket:WebsocketService ) { }

  closeLeftPanel(){
    console.log("length: ", this.elRef.nativeElement.querySelector('.example-list'));
    console.log("this.done.length: ", this.done.length);
    for (let index = 0; index < this.done.length; index++) {
      this.elRef.nativeElement.querySelector('.example-list').children[index].children[1].style.height = "0px";
      this.elRef.nativeElement.querySelector('.example-list').children[index].children[1].style.visibility = "hidden";
      
    }
    
    
  }

  expandTaskPanel(index){
    //this.tabletComp.handleLeftPanel(0);

    console.log("open: ", index);
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

    
      
    // }
    if(!this.panelOpenState ){
      
      this.curveFactor = this.curveFactorLocked;
    }else{
      this.curveFactor = this.lockedCM[index].graphFactor;
    }

    //this.focus.select('#hash4_5').attr("d", this.collisionArea.bind(this));
    if(this.panelOpenState){
      for (let i = 0; i < this.lockedCM.length; i++) {
        
        if(this.lockedCM[i].locked && i != index  ){
          console.log("unlock");
          this.curveFactor =  this.lockedCM[index].graphFactor + this.curveFactorLocked;
          break;
        }
        else{
          console.log("locked");
        }
      }
      
    }
    if(this.lockedCM[index].locked ){
      this.curveFactor =   this.curveFactorLocked;
    }
    
    
    //console.log("open", this.curveFactor);
    console.log("curveFactor: ", this.curveFactor);

    switch(index){
      case 0: {
        
          this.focus.select('.areaOuterUpper2').attr('d', this.outerUpperArea2.bind(this));
          this.focus.select('.areaOuterLower2').attr("d", this.outerLowerArea2.bind(this));
          this.focus.select('.areaInner2').attr("d", this.innerArea2.bind(this));
        

          this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {
            if(i> 249 && i < 331  ){
              return this.y(TEMPERATURES[7].values[i].temperature+this.curveFactor);
            }
            else{
              return this.y(TEMPERATURES[7].values[i].temperature);
            }
          }));
          this.focus.select('#hash4_5').attr('d', this.collisionArea.y1((d:any, i:number) => this.y(TEMPERATURES[0].values[i].temperature)).bind(this));

        
        break;
      }
      case 1: {

  
          this.focus.select('.areaOuterUpper2').attr('d', this.outerUpperArea2.bind(this));
          this.focus.select('.areaOuterLower2').attr("d", this.outerLowerArea2.bind(this));
          this.focus.select('.areaInner2').attr("d", this.innerArea2.bind(this));
        

          this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {
            if(i> 249 && i < 331  ){
              return this.y(TEMPERATURES[7].values[i].temperature+this.curveFactor);
            }
            else{
              return this.y(TEMPERATURES[7].values[i].temperature);
            }
          }));
          this.focus.select('#hash4_5').attr('d', this.collisionArea.y1((d:any, i:number) => this.y(TEMPERATURES[0].values[i].temperature)).bind(this));

        break;
      }
      case 2:{
          this.focus.select('.areaOuterUpper2').attr('d', this.outerUpperArea2.bind(this));
          this.focus.select('.areaOuterLower2').attr("d", this.outerLowerArea2.bind(this));
          this.focus.select('.areaInner2').attr("d", this.innerArea2.bind(this));
        

          this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {
            if(i> 249 && i < 331  ){
              return this.y(TEMPERATURES[7].values[i].temperature+this.curveFactor);
            }
            else{
              return this.y(TEMPERATURES[7].values[i].temperature);
            }
          }));
          this.focus.select('#hash4_5').attr('d', this.collisionArea.y1((d:any, i:number) => this.y(TEMPERATURES[0].values[i].temperature)).bind(this));
        break;
      }
      case 3:{
        console.log("open 3");
        this.focus.select('.areaOuterUpper2').attr('d', this.outerUpperArea2.bind(this));
        this.focus.select('.areaOuterLower2').attr("d", this.outerLowerArea2.bind(this));
        this.focus.select('.areaInner2').attr("d", this.innerArea2.bind(this));
        

        this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {
          if(i> 249 && i < 331  ){
            return this.y(TEMPERATURES[7].values[i].temperature+this.curveFactor);
          }
          else{
            return this.y(TEMPERATURES[7].values[i].temperature);
          }
        }));
        this.focus.select('#hash4_5').attr('d', this.collisionArea.y1((d:any, i:number) => this.y(TEMPERATURES[0].values[i].temperature)).bind(this));
        break;
      }
      default: {
        break;
      }
    }

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

    this.done = [];
    //d3.select('svg').append("g").attr("class", "test");
    //create the DOM element 
    
    this.svgMain = this.renderer.createElement('svg', 'svg');
    console.log("li: ",this.svg );
    this.svgMain .style.height = "500px";
    this.svgMain .style.width = "100%";
    //create text for the element
    const text = this.renderer.createText("tja");

    //append text to li element
    // this.renderer.appendChild(this.svgMain , text);
    
    //Now append the li tag to divMessages div
    //this.renderer.
    //this.renderer.appendChild(this.mainChart.nativeElement,this.svgMain );
    console.log("d3.select('svg'): ", this.svgMain);
    this.initSvg();
    this.drawChart(TEMPERATURES);

  
  }

  private initSvg() {
    this.svg = d3.select("svg");
    this.margin = {top: 20, right: 20, bottom: 110, left: 40};
    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};

    
    this.width = this.mainChart.nativeElement.offsetWidth;
    console.log("this.width: ", this.width);
    this.height = +500;// - this.margin.top - this.margin.bottom;
    this.height2 = +500 -this.margin2.top - this.margin2.bottom;

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
      .y0((d:any, i:number) => {
        if(i> 249 && i < 331 && this.panelOpenState){
          
          return this.y(TEMPERATURES[7].values[i].temperature);
          
        }else{
          return this.y(TEMPERATURES[7].values[i].temperature);
        }
      })
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
      .y0((d: any, i:number) => {
        if(i> 249 && i < 331  ){
          return this.y(d.temperature+this.curveFactor);
        }else{
          return this.y(d.temperature);
        }
      })
      .y1((d: any, i:number) => {
        if(i> 249 && i < 331  ){
          return this.y(TEMPERATURES[5].values[i].temperature+this.curveFactor);
        }else{
          return this.y(TEMPERATURES[5].values[i].temperature);
        }
      });

    this.innerArea2 = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date))
      .y0((d: any, i:number) => {
        if(i> 249 && i < 331  ){
          console.log("interval innerarea2");
          return this.y(d.temperature+this.curveFactor);
        }else{
          return this.y(d.temperature);
        }
      })
      .y1((d: any, i:number) => {
        if(i> 249 && i < 331  ){
          return this.y(TEMPERATURES[6].values[i].temperature+this.curveFactor);
        }else{
          return this.y(TEMPERATURES[6].values[i].temperature);
        }
      });
    
    this.outerLowerArea2 = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) )
      .y0((d: any, i:number) => {
        if(i> 249 && i < 331  ){
          return this.y(TEMPERATURES[6].values[i].temperature+this.curveFactor);
        }else{
          return this.y(TEMPERATURES[6].values[i].temperature);
        }
      })
      .y1((d: any, i:number) => {
        if(i> 249 && i < 331  ){
          return this.y(d.temperature+this.curveFactor);
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
    
    
    let svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    
    this.svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height)


    // translating down the graph to let the data stay in the foucs area when a extrem CM is selected
    this.focus = this.svg.append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate(' + 0 + ',' + 100 + ')');
        
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
          return this.y(TEMPERATURES[7].values[i].temperature+this.curveFactor);
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
    console.log("brushT: ", brushT);
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

    let svg = document.createElement('svg'); 

    this.renderer.appendChild(this.mainChart.nativeElement,this.svg._groups[0][0] );



    this.context.select(".brush").call(this.brush.move, [TEMPERATURES[0].values[249].date, TEMPERATURES[0].values[331].date].map(this.x));



    //let brushT = {"k": 4.365853658536583, "x": -1405.939024390243, "y": 0};
    //this.socket.sendZoom(true, TEMPERATURES[0].values[249],TEMPERATURES[0].values[331].date,brushT);
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

  }

  ngAfterViewInit(){
    this.socket.expandItem().subscribe(data=>{

      console.log("data: ", data);
      this.expandTaskPanel(data.state);
      this.isExpanded = data.state;
      
      
      if(data.type === "task"){
        if(this.panelOpenState == false){
          
          this.panelOpenState = true;
          
        }
        else{
          this.panelOpenState = false;
        }  
      }
        
    });
  }

}
