import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, ViewEncapsulation, ɵConsole, HostListener, ChangeDetectionStrategy, ViewContainerRef, AfterViewInit, NgZone  } from '@angular/core';
import * as d3 from 'd3';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import { TEMPERATURES } from '../../data/temperatures';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../websocket.service';
import { BehaviorSubject } from 'rxjs';
import { DisplayContainerComponent } from 'igniteui-angular/lib/directives/for-of/display.container';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

@Component({
  selector: 'app-middle',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './middle.component.html',
  styleUrls: ['./middle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiddleComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @ViewChild('row') private rowContainer: ElementRef;
  @ViewChild('contentPlaceholder', {read: ViewContainerRef}) viewContainerRef;
  @Input() private data: Array<any>;

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
  private brush2: any;
  private zoom: any;

  private focus: any;

  initZoomMax: Date;
  zoomFromTablet: boolean;
  zoomDate1: any;
  zoomDate2: any;
  allreadySet: boolean = false;
  hideChart: boolean;
  expanded1: boolean = false;
  testvar: number = 55; 
  isExpandedEmitter$ = new BehaviorSubject<boolean>(this.expanded1);
  
  message1_X: number = 0;
  message1_Y: number = 0;

  message2_X: number = 0;
  message2_Y: number = 0;

  public expandedCentralSVG: string = "assets/Screen/Central/CentralScreen_noGraph_expanded.svg";
  graphEmitter$ = new BehaviorSubject<string>(this.expandedCentralSVG);
  chartBackground: any;


  constructor(private http: HttpClient, private display : WebsocketService, private elRef:ElementRef, private ngZone: NgZone) { }

  ngOnInit() {
    
      
  }

  private initSvg() {
    this.svg = d3.select('svg');
    this.margin = {top: 20, right: 20, bottom: 110, left: 40};
    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    this.height2 = +this.svg.attr("height") -this.margin2.top - this.margin2.bottom;

    let bounds = this.svg.node().getBoundingClientRect();
    
    this.width = bounds.width - this.margin.left - this.margin.right,
    this.height = bounds.height - this.margin.top - this.margin.bottom;

    this.x = d3.scaleTime().range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);

    this.xAxis = d3.axisBottom(this.x).tickFormat(d3.timeFormat('%H:%M'));
    this.xAxis2 = d3.axisBottom(this.x2);
    this.yAxis = d3.axisLeft(this.y);

    this.brush = d3Brush.brushX()
        .extent([[0, 0], [this.width, this.height2]])
        .on('brush end', this.brushed.bind(this));
    
    this.brush2 = d3Brush.brushX()
    .extent([[0, 0], [this.width, 500]])
    .on('brush end', this.brushed.bind(this));

    this.zoom = d3Zoom.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [this.width, this.height]])
        .extent([[0, 0], [this.width, this.height]])
        .on('zoom', function() { 
          this.zoomed(false);
        }.bind(this));
      
    // this.svg.append('defs').append('clipPath')
    //     .attr('id', 'clip')
    //     .append('rect')
    //     .attr('width', this.width)
    //     .attr('height', this.height);
    
    this.focus = d3.select(".focus");
    this.focus.attr("transform", "translate(0, 20 )");
    console.log("this.focus: ", d3.select(".focus"));
    

    // this.focus = this.svg.append('g')
    //     .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    //     .attr('class', 'focus');

    // this.context = this.svg.append('g')
    //     .attr('class', 'context')
    //     .attr('transform', 'translate(' + this.margin2.left + ',' + this.margin2.top + ')');
  }

  private brushed(dragFromTablet,xDomainMin,xDomainMax,brushTransform) {
    
    if(!dragFromTablet){

      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom

      let s = d3.event.selection || this.x2.range();
    }

    this.focus.select('.axis--x').call(this.xAxis);

  }

  private zoomed(zoomFromTablet, xDomainMin, xDomainMax, brushTransform) {
    //var t = d3.event.transform;

    // this.zoomDate1 = t.rescaleX(this.x2).domain()[0];
    // this.zoomDate2 = t.rescaleX(this.x2).domain()[1];
    console.log("brushTransform.x :", brushTransform.x );
    
    
    //this.x.domain(t.rescaleX(this.x2).domain());
    //this.x.domain(d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; }));
    if(!this.allreadySet){
      console.log("brushTransform.x :", brushTransform.x );
      let transX = brushTransform.x*-1;
      let scaleX = 0.230;

    
      this.focus.select(".areaInner").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterUpper").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterLower").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");

      this.focus.select(".areaInner2").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterUpper2").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterLower2").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select("#hash4_5").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select("#hash4_6").attr('patternTransform', "rotate(80) scale(1.3)");
    }

    if(!zoomFromTablet){
      let transX = 10;
      let scaleX = 1;

    
      this.focus.select(".areaInner").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterUpper").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterLower").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");

      this.focus.select(".areaInner2").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterUpper2").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select(".areaOuterLower2").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select("#hash4_5").attr("transform", "scale("+scaleX+",1) translate("+transX+", 100 )");
      this.focus.select("#hash4_6").attr('patternTransform', "rotate(80) scale(1.3)");
    }
    

    this.allreadySet = true;
    
   // this.focus.select(".clip-above1").attr("transform", "scale(0.2,1) translate(7400, 100 )");

    // if(!zoomFromTablet){
    //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
    //   var t = d3.event.transform;
    // }
    
    // this moves the brush in the middleDisplay via the tablet component
    // it's not zooming!
    this.focus.select(".brush").call(this.brush2.move, [xDomainMin, xDomainMax].map(this.x2));

  }


  ngOnChanges() {
  }


  private drawChart(data) {

    this.x.domain(d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; }));
    this.y.domain([0, 150]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());
    
    console.log("this.focus: ", this.focus);
    // append history line
    // this.focus.append('g')
    // .attr('class', 'axis axis--x')
    // .attr('transform', 'translate(0,' + this.height + ')')
    // .call(this.xAxis)
    // .append("rect")
    // .attr("x", (d) => {
    //   let date = new Date(2018,1,1,6,0,0);
    //   return this.x(date);
    // })
    // .attr("y", -500)
    // .attr("width", 2)
    // .attr("height", 600 )
    // .attr("fill", "black")

    
    // this.focus.append('g')
    // .attr('class', 'axis axis--y')
    // .call(this.yAxis);

    //append brush
    // this.focus.append('g')
    //     .attr('class', 'brush top') 
    //     .call(this.brush2)
    //     .call(this.brush2.move, this.x2.range());

    // this.svg.append('rect')
    //     .attr('class', 'zoom')
    //     .attr('width', this.width)
    //     .attr('height', this.height)
    //     .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    //     .call(this.zoom);

       // this.context.select(".brush").call(this.brush.move, [TEMPERATURES[0].values[249].date, TEMPERATURES[0].values[331].date].map(this.x));

  }

  loadIframe(){
    setTimeout(() => {
      
      this.chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      
      this.message1_X = this.chartBackground.contentWindow.document.getElementById("Message_1").getBoundingClientRect().x;
      this.message1_Y = this.chartBackground.contentWindow.document.getElementById("Message_1").getBoundingClientRect().y;


      console.log("message elm: ", this.elRef.nativeElement.querySelector("#message_1_elm"));
      this.elRef.nativeElement.querySelector("#message_1_elm").style.top = this.message1_Y+"px";
      this.elRef.nativeElement.querySelector("#message_1_elm").style.left = this.message1_X+"px";

      this.elRef.nativeElement.querySelector("#message_2_elm").style.visibility = "hidden";
      this.elRef.nativeElement.querySelector("#message_2_elm").style.top = this.message1_Y+"px";
      this.elRef.nativeElement.querySelector("#message_2_elm").style.left = this.message1_X+"px";

      this.chartBackground.contentWindow.document.getElementById("Message_1").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("Message_2").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[0].style.fill = "red";
      this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[1].style.fill = "red";
      this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[2].style.fill = "red";
      this.chartBackground.contentWindow.document.getElementById("CM1_Icon").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("CM2_Icon").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("CM1_Bar").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("CM2_Bar").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("Preview_Bar").style.visibility = "hidden";

      let x = this.chartBackground.contentWindow.document.getElementById("first-line").getBoundingClientRect().x;
      let width = this.chartBackground.contentWindow.document.getElementById("Layer_2-2").getBoundingClientRect().width;
      //this.viewContainerRef._data.renderElement.style.width= width+x+"px";
      // the height of the entire screen
      let height = this.viewContainerRef._data.renderElement.offsetHeight;
      console.log( "x: " , x);

      this.viewContainerRef._data.renderElement.querySelector('.focus').setAttribute("transform", "translate("+x+","+height*0.25+"), scale(0.90)" );

    },1000);
  }

  ngAfterViewInit(){

    setTimeout(()=>{
      this.elRef.nativeElement.querySelector("#message_2_elm").style.visibility = "visible";
      this.elRef.nativeElement.querySelector("#message_1_elm").style.visibility = "hidden";
    },15000)
    

    this.display.moveItem().subscribe(data =>{
      let chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      switch (data.currentIndex) {
        case 0:
          chartBackground.contentWindow.document.getElementById("CM1_Bar").firstChild.style.fill = "rgba(141,197,242,0.9)";
          chartBackground.contentWindow.document.getElementById("CM1_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM1_Bar").style.visibility = "visible";
        break;

        case 3:
          chartBackground.contentWindow.document.getElementById("CM2_Bar").firstChild.style.fill = "rgba(141,197,242,0.9)";
          chartBackground.contentWindow.document.getElementById("CM2_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM2_Bar").style.visibility = "visible";
        break;
      
        default:
          break;
      }
    });

    this.display.expandItem().subscribe(data =>{
      let chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      console.log("data: ", data);
      if(data.state == -1){
        console.log("hidden: ");
        chartBackground.contentWindow.document.getElementById("CM1_Bar").firstChild.style.fill = "rgba(255,235,0,0.9)";
        chartBackground.contentWindow.document.getElementById("CM1_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM1_Bar").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM2_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM2_Bar").style.visibility = "hidden";
      }else{
        if(data.closedIndex == 0){
          chartBackground.contentWindow.document.getElementById("CM1_Bar").firstChild.style.fill = "rgba(255,235,0,0.9)";
          chartBackground.contentWindow.document.getElementById("CM1_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM1_Bar").style.visibility = "visible";
        }
        if(data.closedIndex == 3){
          chartBackground.contentWindow.document.getElementById("CM2_Bar").firstChild.style.fill = "rgba(255,235,0,0.9)";
          chartBackground.contentWindow.document.getElementById("CM2_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM2_Bar").style.visibility = "visible";
        }
      }
      
    })
    
    this.display.zoomChart().subscribe(data =>{
      if(this.expanded1){
        if(data.brushTransform.x >  -900){
        
          console.log("change graph", data.brushTransform.x);
          this.expandedCentralSVG =  "assets/Screen/Central/central_screen_nograph_ccp_activated.svg";
          this.graphEmitter$.next(this.expandedCentralSVG);
        }
        if(data.brushTransform.x < -900 && data.brushTransform.x > -2000){
        
          console.log("change graph", data.brushTransform.x);
          this.expandedCentralSVG =  "assets/Expanded_View_RightScreen.svg";
          this.graphEmitter$.next(this.expandedCentralSVG);
        }
        else if(data.brushTransform.x < -2000 && data.brushTransform.x > -900){
    
        }
        else if(data.brushTransform.x < -9000){
    
        }
      }
        

      let minDate = new Date(data.xDomainMin);
      let maxDate = new Date(data.xDomainMax);
      this.zoomFromTablet = true;
      //console.log("x init1: ", [minDate, maxDate].map(this.x2));
      this.initZoomMax = data.xDomainMax;
      this.initZoomMax = data.xDomainMin;

      //console.log("data.brushTransform: ",data.brushTransform );

      this.zoomed(true,minDate,maxDate,data.brushTransform);
    })
    //this.viewContainerRef._data.renderElement.firstChild.style.height = "";
    //this.viewContainerRef._data.renderElement.firstChild.style.paddingTop = "150px";
    console.log("this.viewContainerRef._data.renderElement: ", this.viewContainerRef._data.renderElement.querySelector('.focus'));
    //this.placeholder.nativeElement.firstChild.style.paddingTop = "150px";

    

    this.initSvg();

    //this.drawChart(TEMPERATURES);

    this.display.maximizeChart().subscribe(data=>{
      this.zoomed(false,0,0,0);
      if(!this.expanded1){
        this.expanded1 = true;
        this.isExpandedEmitter$.next(this.expanded1);

      }
      else{
        this.expanded1 = false;
        this.isExpandedEmitter$.next(this.expanded1);
        
      }
      console.log("expand", this.testvar);
    })
    
    this.display.switchCCP().subscribe(data =>{
      let mainSvg = this.elRef.nativeElement.querySelector("#chartBackground");
      console.log("append line: ", mainSvg.contentWindow.document.getElementById("lineAppend"));
          //var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'assets/Screen/Central/m_2_Screen.svg');
         // mainSvg.contentWindow.document.getElementById("lineAppend").appendCild(newElement);
      //lineAppend 1320.75
    })
    // let initDates = d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; })
    // this.x.domain(initDates);
    //this.zoomed(true,initDates[0],initDates[1],{k: 1, x: 0, y: 0});
  }

}