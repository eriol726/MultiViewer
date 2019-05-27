import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, ViewEncapsulation, ɵConsole, HostListener, ChangeDetectionStrategy, ViewContainerRef, AfterViewInit, NgZone, Renderer2, Injectable, RendererFactory2, Inject  } from '@angular/core';
import * as d3 from 'd3';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import { TEMPERATURES } from '../../data/temperatures';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebsocketService } from '../websocket.service';
import { BehaviorSubject } from 'rxjs';
import { DisplayContainerComponent } from 'igniteui-angular/lib/directives/for-of/display.container';
import { ActionService } from '../action.service';
import { NavigationStart } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Injectable()
class Service {
    private renderer: Renderer2;

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type MyType = {
  id: string;
  text: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-middle',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './middle.component.html',
  styleUrls: ['./middle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MiddleComponent implements OnInit, AfterViewInit {
  @ViewChild('areaChart') private areaChart: any;
  @ViewChild('row') private rowContainer: ElementRef;
  @ViewChild('contentPlaceholder', {read: ViewContainerRef}) viewContainerRef;
  @Input() private data: Array<any>;

  elem;

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

  CMs: MyType[];

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

  reloaded:boolean =  false;
  svgString;
  switchOn: boolean = false;

  constructor(@Inject(DOCUMENT) private document: any, private actionService : ActionService, private http: HttpClient, private display : WebsocketService, private elRef:ElementRef, private ngZone: NgZone) { 
    this.display.reloadPage().subscribe(reload =>{
      //window.location.reload();
    })
  }
  

  async ngOnInit() {
    this.elem = document.documentElement;
    const COUNTERMEASURESObservable = this.actionService.getActions();
    
    COUNTERMEASURESObservable.subscribe(COUNTERMEASURESData => {

      this.CMs = COUNTERMEASURESData;
    })

    const headers = new HttpHeaders();
    headers.set('Accept', 'image/svg+xml');
    // this.svgString =
    //   await this.http.get(`assets/Screen/Right/r_4_left_Screen.svg`, {headers, responseType: 'text'}).toPromise();

    // this.http.get('assets/Screen/Right/r_4_left_Screen.svg').subscribe(data => {
    //   console.log(data);
    // })
    
      
  }

  loadIframe(){
      
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
      this.elRef.nativeElement.querySelector("#history_layer_2").style.width = historyLayerWidth-3+"px";
      this.elRef.nativeElement.querySelector("#history_layer_2").style.height = historyLayerHeight+"px";

      this.elRef.nativeElement.querySelector("#message_1_elm").style.visibility = "hidden";
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
      //this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[0].style.fill = "red";
      //this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[1].style.fill = "red";
      //this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[2].style.fill = "red";

      for (let index = 0; index < this.CMs.length+1; index++) {
        this.chartBackground.contentWindow.document.getElementById("CM"+index+"_Icon").style.visibility = "hidden";
        this.chartBackground.contentWindow.document.getElementById("CM"+index+"_Bar").style.visibility = "hidden";  
      }
      // first icon will be visible
      this.chartBackground.contentWindow.document.getElementById("CM"+0+"_Icon").style.visibility = "visible";
      this.chartBackground.contentWindow.document.getElementById("CM"+0+"_Bar").style.visibility = "visible";  
      
      this.chartBackground.contentWindow.document.getElementById("Preview_Bar").style.visibility = "hidden";

      let screenWidth = window.innerWidth;
      let screenHeight = window.innerHeight;

      this.x = this.chartBackground.contentWindow.document.getElementById("first-line").getBoundingClientRect().x;
      let layer6Boundings = this.chartBackground.contentWindow.document.getElementById("Layer_6").getBoundingClientRect();
      this.chartPaddingRgiht = screenWidth - (layer6Boundings.width + layer6Boundings.x);

      let graphStartHeight = this.chartBackground.contentWindow.document.getElementById("buttom-line").getBoundingClientRect().y;
      
      
      // we cant use querySelector(.focus) because int is not rendered. Use a viewChild decorator instead
      let focusHeight = this.areaChart.focus._groups[0][0].getBoundingClientRect().height;

      let scaleGraphY = 0.7;

      console.log();
      let scaleHeightRest = focusHeight - focusHeight*scaleGraphY;

      this.elRef.nativeElement.querySelector("svg").setAttribute("viewBox", "0 0 "+screenWidth+" "+screenHeight);

      
      this.elRef.nativeElement.querySelector("#chart2").style.padding = "0px "+this.chartPaddingRgiht+"px 0px "+this.x+"px";
      
      //put the graph on it's right position
      this.areaChart.focus._groups[0][0].setAttribute("transform", "translate(0,"+(graphStartHeight-focusHeight+scaleHeightRest+45)+") scale(1,"+scaleGraphY+")");

  }

  ngAfterViewInit(){

    this.display.reloadPage().subscribe(reload =>{
      console.log("reload", reload);
      this.reloaded= reload;
      if (this.reloaded) {
        window.location.reload();
        this.reloaded=false;
      }
    })

    this.display.prioritize().subscribe(data =>{
      this.switchOn = data;
    })
    
    //hack to append a DOM element that has not been rendered
    let chart2  = this.elRef.nativeElement.querySelector("#chart2");


    this.display.changeMessage().subscribe(data =>{
      let chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      switch (data.swiperIndex) {
        case 1:
          this.elRef.nativeElement.querySelector("#message_1_elm").style.visibility = "visible";
          chartBackground.contentWindow.document.getElementById("late_passengers").style.visibility = "visible";
          break;
        case 2:
          this.elRef.nativeElement.querySelector("#message_1_elm").style.visibility = "hidden";
          this.elRef.nativeElement.querySelector("#message_2_elm").style.visibility = "visible";
          break;
      
        default:
          break;
      }
      

      chartBackground.contentWindow.document.getElementById("Transparent_Frame").style.visibility = "visible";
      chartBackground.contentWindow.document.getElementById("Transparent_Starting").style.visibility = "hidden";

      this.chartBackground.contentWindow.document.getElementById("CM"+0+"_Icon").style.visibility = "hidden";
      this.chartBackground.contentWindow.document.getElementById("CM"+0+"_Bar").style.visibility = "hidden";
      
      let CM4BisVisible = this.chartBackground.contentWindow.document.getElementById("CM"+4+"_Icon_B").style.visibility;
      console.log("CM4BisVisible: ", CM4BisVisible, "data.swiperIndex: ", data.swiperIndex);
      if(data.swiperIndex ==3 && CM4BisVisible == "hidden" ){
        this.chartBackground.contentWindow.document.getElementById("CM"+4+"_Icon").style.visibility = "hidden";
        this.chartBackground.contentWindow.document.getElementById("CM"+4+"_Bar").style.visibility = "hidden";
        this.chartBackground.contentWindow.document.getElementById("CM"+4+"_Icon_B").style.visibility = "visible";
        this.chartBackground.contentWindow.document.getElementById("CM"+4+"_Bar_B").style.visibility = "visible";
      }
      else if(data.swiperIndex ==99 && CM4BisVisible == "visible"){
        this.chartBackground.contentWindow.document.getElementById("CM"+4+"_Icon_B").style.visibility = "hidden";
        this.chartBackground.contentWindow.document.getElementById("CM"+4+"_Bar_B").style.visibility = "hidden";
      }
    })
    
    this.display.moveItem().subscribe(data =>{
      let chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");

      chartBackground.contentWindow.document.getElementById("CM"+(data.currentIndex+1)+"_Bar").childNodes[1].style.fill = "rgba(141,197,242,0.9)";
      chartBackground.contentWindow.document.getElementById("CM"+(data.currentIndex+1)+"_Icon").style.visibility = "visible";
      chartBackground.contentWindow.document.getElementById("CM"+(data.currentIndex+1)+"_Bar").style.visibility = "visible";
      chartBackground.contentWindow.document.getElementById("Preview_Bar").style.visibility = "visible";
      chartBackground.contentWindow.document.getElementById("Preview_Bar").children[0].style.fill = "rgb(64, 189, 115)";
      chartBackground.contentWindow.document.getElementById("Preview_Bar").getElementsByTagName("text")[0].innerHTML = this.CMs[data.currentIndex].text + " APPLIED";
    
      if(this.switchOn){
        console.log("this.switchOn: ", this.switchOn);
        console.log("bar color: ", chartBackground.contentWindow.document.getElementById("CM"+(data.currentIndex+1)+"_Bar_B"));
        chartBackground.contentWindow.document.getElementById("CM"+4+"_Bar_B").childNodes[1].style.fill = "rgba(141,197,242,0.9)";
        chartBackground.contentWindow.document.getElementById("CM"+4+"_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM"+4+"_Bar").style.visibility = "hidden";
      }
    
    });

    this.display.expandPanelItem().subscribe(data =>{
      this.elRef.nativeElement.querySelector("#message_2_elm").style.visibility = "hidden";
      let chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      chartBackground.contentWindow.document.getElementById("Preview_Bar").children[0].style.fill = "#ffeb00";
      if(data.isExpanded == -1 && !data.locked){
        // we set data.closedIndex+1 because icon/bar 0 is only visible in the begining
        chartBackground.contentWindow.document.getElementById("CM"+(data.panelIndex+1)+"_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM"+(data.panelIndex+1)+"_Bar").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("Preview_Bar").style.visibility = "hidden";
      }
      else if(data.isExpanded == 0){
        chartBackground.contentWindow.document.getElementById("CM"+(data.panelIndex+1)+"_Icon").style.visibility = "visible";
        chartBackground.contentWindow.document.getElementById("CM"+(data.panelIndex+1)+"_Bar").style.visibility = "visible";
        chartBackground.contentWindow.document.getElementById("Preview_Bar").style.visibility = "visible";
        chartBackground.contentWindow.document.getElementById("Preview_Bar").getElementsByTagName("text")[0].innerHTML = this.CMs[data.panelIndex].text  + " PREVIEW";
      }
      else{
        chartBackground.contentWindow.document.getElementById("CM"+(1)+"_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM"+(1)+"_Bar").style.visibility = "hidden";

        chartBackground.contentWindow.document.getElementById("CM"+(2)+"_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM"+(2)+"_Bar").style.visibility = "hidden";

        chartBackground.contentWindow.document.getElementById("CM"+(3)+"_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM"+(3)+"_Bar").style.visibility = "hidden";

        chartBackground.contentWindow.document.getElementById("CM"+(4)+"_Icon").style.visibility = "hidden";
        chartBackground.contentWindow.document.getElementById("CM"+(4)+"_Bar").style.visibility = "hidden";

        chartBackground.contentWindow.document.getElementById("CM"+(data.panelIndex+1)+"_Icon").style.visibility = "visible";
        chartBackground.contentWindow.document.getElementById("CM"+(data.panelIndex+1)+"_Bar").style.visibility = "visible";
        chartBackground.contentWindow.document.getElementById("Preview_Bar").style.visibility = "visible";
        chartBackground.contentWindow.document.getElementById("Preview_Bar").getElementsByTagName("text")[0].innerHTML = this.CMs[data.panelIndex].text  + " PREVIEW";
      }

      

      
    });
    
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

    this.chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
    this.display.maximizeChart().subscribe(data=>{
      
      if(!this.expanded1){
        //this.renderer.appendChild(this.rowContainer.nativeElement,this.areaChart.svg._groups[0][0] );
        console.log("Scale: ", this.chartBackground.contentWindow.document.getElementById("Scale"));
        this.elRef.nativeElement.querySelector("#chart2").style.padding = "0px "+0+"px 0px "+0+"px";
        this.chartBackground.contentWindow.document.getElementById("Scale").style.visibility = "hidden";
        //this.chartBackground.contentWindow.document.getElementById("blueHistoryLine").style.visibility = "hidden";
        //this.elRef.nativeElement.querySelector("#history_layer_2").style.visibility = "hidden";
        this.expanded1 = true;
        this.isExpandedEmitter$.next(this.expanded1);
        

      }
      else{
        this.elRef.nativeElement.querySelector("#chart2").style.padding = "0px "+this.chartPaddingRgiht+"px 0px "+this.x+"px";
        this.chartBackground.contentWindow.document.getElementById("Scale").style.visibility = "visible";
        this.elRef.nativeElement.querySelector("#history_layer_2").style.visibility = "visible";
        this.expanded1 = false;
        this.isExpandedEmitter$.next(this.expanded1);
        
      }
      console.log("expand", this.testvar);
    })

    this.display.setPlaneIcons().subscribe(planeIcons =>{
      if(planeIcons){
        this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[0].style.fill = "green";
        this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[1].style.fill = "green";
        this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[2].style.fill = "green";
      }
      else{
        this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[0].style.fill = "red";
        this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[1].style.fill = "red";
        this.chartBackground.contentWindow.document.getElementById("Plane_Icons").children[2].style.fill = "red";
      }
    })


  }

  goToCCP(){
    
    console.log("goToCCP: ");
    this.elRef.nativeElement.querySelector("#message_2_elm").style.visibility = "visible";
    this.elRef.nativeElement.querySelector("#message_1_elm").style.visibility = "hidden";

    this.display.sendMessage(5,1);
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }

  
  

  @HostListener('window:scroll', ['$event']) // for window scroll events
    onScroll(event) {
      console.log("scrolling")
    }

}