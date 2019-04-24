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
  graphScale: number = 0;
  tabletCellWidth: number;
  outerUpperArea2: d3.Area<[number, number]>;
  innerArea: any;

  zoomKey: boolean = false;
  zoom2: any;
  gElem: any;
  chartPaddingRgiht: number;

  constructor(private http: HttpClient, private display : WebsocketService, private elRef:ElementRef, private ngZone: NgZone) { }

  ngOnInit() {
    
      
  }

  private initSvg() {
    //this.svg = d3.select('svg');
    this.margin = {top: 20, right: 20, bottom: 110, left: 40};
    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    this.height2 = +this.svg.attr("height") -this.margin2.top - this.margin2.bottom;

    let bounds = this.svg.node().getBoundingClientRect();
    
    this.width = bounds.width - this.margin.left - this.margin.right,
    this.height = bounds.height - this.margin.top - this.margin.bottom;

  }





  loadIframe(){
    setTimeout(() => {
      
      this.chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      
      this.message1_X = this.chartBackground.contentWindow.document.getElementById("Message_1").getBoundingClientRect().x;
      this.message1_Y = this.chartBackground.contentWindow.document.getElementById("Message_1").getBoundingClientRect().y;
      let message1_height = this.chartBackground.contentWindow.document.getElementById("Message_1").getBoundingClientRect().height;
      let message1_width = this.chartBackground.contentWindow.document.getElementById("Message_1").getBoundingClientRect().width;
      let historyLayerX = this.chartBackground.contentWindow.document.getElementById("history-layer").getBoundingClientRect().x;
      let historyLayerY = this.chartBackground.contentWindow.document.getElementById("history-layer").getBoundingClientRect().y;
      let historyLayerWidth = this.chartBackground.contentWindow.document.getElementById("history-layer").getBoundingClientRect().width;
      let historyLayerHeight = this.chartBackground.contentWindow.document.getElementById("history-layer").getBoundingClientRect().height;
      let historyLayer = this.chartBackground.contentWindow.document.getElementById("history-layer");
      historyLayer.style.opacity = 0.0;

      this.elRef.nativeElement.querySelector("#history_layer_2").style.top = historyLayerY+"px";
      this.elRef.nativeElement.querySelector("#history_layer_2").style.left = historyLayerX+"px";
      this.elRef.nativeElement.querySelector("#history_layer_2").style.width = historyLayerWidth+"px";
      this.elRef.nativeElement.querySelector("#history_layer_2").style.height = historyLayerHeight+"px";

      this.elRef.nativeElement.querySelector("#message_1_elm").style.visibility = "visible";
      this.elRef.nativeElement.querySelector("#message_1_elm").style.top = this.message1_Y+"px";
      this.elRef.nativeElement.querySelector("#message_1_elm").style.left = this.message1_X+"px";
      this.elRef.nativeElement.querySelector("#message_1_elm").style.width = message1_width+"px";
      this.elRef.nativeElement.querySelector("#message_1_elm").style.height = message1_height+"px";

      this.elRef.nativeElement.querySelector("#message_2_elm").style.visibility = "hidden";
      this.elRef.nativeElement.querySelector("#message_2_elm").style.top = this.message1_Y+"px";
      this.elRef.nativeElement.querySelector("#message_2_elm").style.left = this.message1_X+"px";
      this.elRef.nativeElement.querySelector("#message_2_elm").style.width = message1_width+"px";

      this.chartBackground.contentWindow.document.getElementById("Message_1").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("Message_2").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[0].style.fill = "red";
      this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[1].style.fill = "red";
      this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[2].style.fill = "red";
      this.chartBackground.contentWindow.document.getElementById("CM0_Icon").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("CM3_Icon").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("CM0_Bar").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("CM3_Bar").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("Preview_Bar").style.visibility = "hidden";

      let screenWidth = window.innerWidth;
      let screenHeight = window.innerHeight;

      this.x = this.chartBackground.contentWindow.document.getElementById("first-line").getBoundingClientRect().x;
      let layer6Boundings = this.chartBackground.contentWindow.document.getElementById("Layer_6").getBoundingClientRect();
      this.chartPaddingRgiht = screenWidth - (layer6Boundings.width + layer6Boundings.x);

      let graphStartHeight = this.chartBackground.contentWindow.document.getElementById("scaleY50").getBoundingClientRect().y;
      
      let focusHeight = this.elRef.nativeElement.querySelector(".focus").getBoundingClientRect().height;

      let scaleGraphY = 0.8;

      let scaleHeightRest = focusHeight - focusHeight*scaleGraphY;

      this.elRef.nativeElement.querySelector("svg").setAttribute("viewBox", "0 0 "+screenWidth+" "+screenHeight);

      this.elRef.nativeElement.querySelector("#chart2").style.padding = "0px "+this.chartPaddingRgiht+"px 0px "+this.x+"px";

      //put the graph on it's right position
      this.elRef.nativeElement.querySelector(".focus").setAttribute("transform", "translate(0,"+(graphStartHeight-focusHeight+scaleHeightRest)+") scale(1,"+scaleGraphY+")");

    },1000);
  }

  ngAfterViewInit(){
    console.log("chart2", this.elRef.nativeElement.querySelector("#chart2"));
    setTimeout(()=>{
      this.display.sendCCP(5);
      this.elRef.nativeElement.querySelector("#message_2_elm").style.visibility = "visible";
      this.elRef.nativeElement.querySelector("#message_1_elm").style.visibility = "hidden";
    },15000)
    

    this.display.moveItem().subscribe(data =>{
      let chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      switch (data.currentIndex) {
        case 0:
          chartBackground.contentWindow.document.getElementById("CM0_Bar").childNodes[1].style.fill = "rgba(141,197,242,0.9)";
          chartBackground.contentWindow.document.getElementById("CM0_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM0_Bar").style.visibility = "visible";
        break;

        case 3:
          chartBackground.contentWindow.document.getElementById("CM3_Bar").childNodes[1].style.fill = "rgba(141,197,242,0.9)";
          chartBackground.contentWindow.document.getElementById("CM3_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM3_Bar").style.visibility = "visible";
        break;
      
        default:
          break;
      }
    });

    this.display.expandItem().subscribe(data =>{
      let chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      data.locked
      if(data.state == -1 && !data.locked){
        console.log("hidden: ", chartBackground.contentWindow.document.getElementById("CM"+(data.closedIndex+1)+"_Bar"));
        chartBackground.contentWindow.document.getElementById("CM"+(data.closedIndex)+"_Bar").childNodes[1].style.fill = "rgba(255,235,0,0.9)";
        chartBackground.contentWindow.document.getElementById("CM"+(data.closedIndex)+"_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM"+(data.closedIndex)+"_Bar").style.visibility = "hidden";
      }else{
        if(data.closedIndex == 0){
          chartBackground.contentWindow.document.getElementById("CM0_Bar").childNodes[1].style.fill = "rgba(255,235,0,0.9)";
          chartBackground.contentWindow.document.getElementById("CM0_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM0_Bar").style.visibility = "visible";
        }
        if(data.closedIndex == 3){
          chartBackground.contentWindow.document.getElementById("CM3_Bar").childNodes[1].style.fill = "rgba(255,235,0,0.9)";
          chartBackground.contentWindow.document.getElementById("CM3_Icon").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("CM3_Bar").style.visibility = "visible";
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
        
      console.log("zoomChart() data: ", data);
      let minDate = new Date(data.xDomainMin);
      let maxDate = new Date(data.xDomainMax);
      this.zoomFromTablet = true;
      //console.log("x init1: ", [minDate, maxDate].map(this.x2));
      this.initZoomMax = data.xDomainMax;
      this.initZoomMax = data.xDomainMin;


    })


    this.display.maximizeChart().subscribe(data=>{
      this.chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      if(!this.expanded1){
        console.log("Scale: ", this.chartBackground.contentWindow.document.getElementById("Scale"));
        this.elRef.nativeElement.querySelector("#chart2").style.padding = "0px "+0+"px 0px "+0+"px";
        this.chartBackground.contentWindow.document.getElementById("Scale").style.visibility = "hidden";
        this.chartBackground.contentWindow.document.getElementById("blueHistoryLine").style.visibility = "hidden";
        this.elRef.nativeElement.querySelector("#history_layer_2").style.visibility = "hidden";
        this.expanded1 = true;
        this.isExpandedEmitter$.next(this.expanded1);
        

      }
      else{
        this.elRef.nativeElement.querySelector("#chart2").style.padding = "0px "+this.chartPaddingRgiht+"px 0px "+this.x+"px";
        this.chartBackground.contentWindow.document.getElementById("Scale").style.visibility = "visible";
        this.elRef.nativeElement.querySelector("#history_layer_2").style.visibility = "visible";
        this.chartBackground.contentWindow.document.getElementById("blueHistoryLine").style.visibility = "visible";
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

    this.display.getANumber().subscribe(cellWidth =>{
      this.tabletCellWidth = cellWidth;
    })


  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
    onScroll(event) {
      console.log("scrolling")
    }

}