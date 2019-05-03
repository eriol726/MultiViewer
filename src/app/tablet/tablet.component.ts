import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation, TemplateRef, ContentChild, ChangeDetectorRef, ViewContainerRef, Injectable, Output, EventEmitter, Inject } from '@angular/core';
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
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';

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

declare var require: any;
@Component({
  selector: 'app-tablet',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tablet.component.html',
  styleUrls: ['./tablet.component.css']
})

export class TabletComponent implements OnInit, AfterViewInit {
  @Output() myEvent = new EventEmitter();

  config: any = {
    pagination: {
    el: '.swiper-pagination',
    },
    paginationClickable: true,
    navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
    },
    spaceBetween: 30
  };
  

  title = 'multiViewer';
  graphDataOriginal = 0;
  graphDataImproved  = 0;
  
  private otherContent: any;
  @ViewChildren('chartTablet') chartTablet;
  @ViewChildren('panelRight') panelRight;
  @ViewChildren('panelLeft') panelLeft;
  @ViewChild(RightComponent) rightPanel: RightComponent;
  @ViewChild(LeftComponent) leftPanel: LeftComponent;
  @ViewChild(MiddleComponent) middleComponent: MiddleComponent;
  @ViewChildren('panel') panel: ElementRef;
  @ViewChildren('cell') cell: ElementRef;
  @ViewChildren('chart1') chart1: any;
  @ViewChildren('cardSwitch_3_1') cardSwitch_3_1: any;
  @ViewChild('appCompButton') appCompButton;
  @ViewChild('chart') mainChart: ElementRef;

  @ViewChild('chart1', {read: ViewContainerRef}) viewContainerRef;
  chartBackground: any;
  swiperIndexCentral: number = 0;
  elem;
  isFullScreen: boolean = false;

  @ViewChild('contentPlaceholder') set content(content: any) {
    this.otherContent = content;
  }
  @ViewChildren('cardList') cardList: ElementRef;

  @ViewChild('chart') private chartContainer: ElementRef;

  likes: any = 10;
  private myTemplate: any = "";
  @Input() url: string = "app/right.display.component.html";
  @Input() ID: string;
  

  private svgPath = "../../assets/";
  tasks: MyType[];

  // we need to create a struct/type to point to the variable members from action service
  done: MyType[];

  

  chartData = [];
  //data = [];

  expand = [false,false,false,false];

  messageState : number = 0;
  panelIndex : number = 0;
  currentState : boolean = false

  data: any;

  public hideChart: boolean = true;
  public hidePanel: boolean = false;
  
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
    
  private initPanelItemHeight: string = "0px";
  public panelItemHeight: string = "22px";
  panelItemHeightEmitter$ = new BehaviorSubject<string>(this.panelItemHeight);
 
  public thePanel;

  public cmText: string = "Tap on a countermeasure to preview the effects";
  intersectionColor: d3.Area<[number, number]>;
  tasks2: any[];
  curveFactorLocked: number = 0;
  isMaximized: boolean = false;

  hideTabletPanels = false;

  messageNumber_1 = 1;
  messageNumber_0 = 0;

  cardSwitchFunction: any;
  switchTop;
  switchLeft;

  prioritize: boolean = true;

  constructor(@Inject(DOCUMENT) private document: any,
              private actionService : ActionService, 
              private socket : WebsocketService, 
              private http: HttpClient, 
              private elRef:ElementRef,
              private dragulaService: DragulaService,
              public sanitizer: DomSanitizer,
              private router: Router,
              private changeDetector : ChangeDetectorRef) { 

        
     
        // mySwiper = new Swiper('.swiper-container', {
        //   speed: 400,
        //   spaceBetween: 100
        // });

      dragulaService.createGroup('COPYABLE', {
        copy: (el, source) => { 
          console.log("source.id: ", source.id);
          console.log("el: ", el);
          
          return source.id === 'right';
        },
        accepts: (el, target, source, sibling) => {
          // To avoid dragging from left to right container
          //console.log("hej ", drake.drake.dragging);
          console.log("target.id: ", target.id);
          console.log("el.id: ", el.id);
          let isCopyAble = (target.id !== 'right');
          
          let taskIndex = el.id.toString()[el.id.toString().length-1];
          
          // if moved element exsist in this.done, dont copy it
          if (this.done.some((x,i) => x.id == taskIndex) ){
            isCopyAble = false;
          }
          return isCopyAble;
        }
      }).drake.on("drop", function(el,target, source){
        console.log("drop target", target, " el: ", el);
        if(target){
          
          // if CM is not in action plan push
          let taskIndex = parseInt(el.id.toString()[el.id.toString().length-1]);
          if (!this.done.some((x,i) => x.id == taskIndex) ){
            
            this.done.push(this.tasks[taskIndex]);
            //this.isExpanded = -1;
            this.socket.sendMove("change",0,taskIndex,this.tasks[taskIndex]);
   
            // we must change the name of the copied elements so we now which background color we will change
            el.id = "panel_item_copy_"+taskIndex;
            console.log("el: ", el);
            el.querySelector('.mat-expansion-panel-header').style.height = this.panelItemHeight;
            // gray out when CM is chosen
            
            el.querySelector("#iframeOverlay_"+taskIndex).id = "iframeOverlay_"+taskIndex+"_copy";
            this.elRef.nativeElement.querySelector('#iframeOverlay_'+taskIndex).style.backgroundColor = "rgba(217,217,217,0.68)";

            let cards = el.querySelectorAll(".card");
            for (let index = 0; index < cards.length; index++) {
              el.querySelectorAll(".card")[index].id = "card_"+taskIndex+"_"+index+"_copy";
              
              this.elRef.nativeElement.querySelector('#card_'+taskIndex+"_"+index).style.backgroundColor = "rgba(217,217,217,0.68)";
            }
            

            console.log("card: ", el.querySelectorAll(".card")[0].id);
            el.querySelector('#main_svg_'+taskIndex).id = "main_svg_copy_"+taskIndex;

          

          }

          // resize all right panel items when a expanded panel item is droped
          for (let i = 0; i < this.tasks.length; i++) {
            this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
            this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
            this.elRef.nativeElement.querySelector('#panel_item_5').style.height = "auto";
            this.elRef.nativeElement.querySelector('#panel_item_5').style.flex = "1";
          }
          let mainSvg = this.elRef.nativeElement.querySelector("#main_svg_"+(taskIndex));
          mainSvg.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
          mainSvg.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
          //mainSvg.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "visible");
          
          this.cmText = this.tasks[taskIndex].text + " APPLIED";
          this.elRef.nativeElement.querySelector('.applied-box').style.backgroundColor = "#40bd73";
        }
          
      }.bind(this));
    
  }

  switch(){
    this.socket.sendPriorotize(false);
    let mainSvg = this.elRef.nativeElement.querySelector("#card_3_1");
    let cardSwitch = mainSvg.contentWindow.document.getElementById("card_3_1_switch");

    if(this.prioritize){
      cardSwitch.setAttribute("transform", "translate(30,0)")
      cardSwitch.setAttribute("fill", "green")
      this.prioritize = false;
    }else{
      cardSwitch.setAttribute("transform", "translate(0,0)")
      cardSwitch.setAttribute("fill", "#b3b3b3")
      this.prioritize = true;
    }
    
  }


  closeLeftPanel(elementRef){
    console.log("index: ", parseInt(elementRef.id[elementRef.id.length-1]));
    let index = parseInt(elementRef.id[elementRef.id.length-1]);
    
    for (let index = 0; index < this.done.length; index++) {
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.height = "0px";
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.visibility = "hidden";
      
    }
    // let expandedPanelItem = this.elRef.nativeElement.querySelector("#panel_item_copy_"+index);
    // let newClassName = expandedPanelItem.className.replace("mat-expanded", "");
    // expandedPanelItem.children[0].className = newClassName;
    // expandedPanelItem.className = newClassName
   // console.log("newClassName: ", newClassName);
    
    
  }

  expandTaskPanel(index){
    //this.tabletComp.handleLeftPanel(0);

    // if(index > 0){
    //   this.elRef.nativeElement.querySelector('#panel_item_'+(index+1)).style.height = "auto";
    //   this.elRef.nativeElement.querySelector('#panel_item_'+(index+1)).style.flex = "1";
    // }

    console.log("clicked index: ", index);

    let iframeEl = this.elRef.nativeElement.querySelector("#main_svg_"+(index));

    if(this.panelOpenState){
      // set the central info text and color
      this.cmText = this.tasks[index].text + " PREVIEW";
      this.elRef.nativeElement.querySelector(".applied-box").style.backgroundColor = "yellow";
      
      this.isExpanded = index;
      
      this.socket.sendExpand("task",index,index,this.lockedCM[index].locked);
      console.log("switch: ", iframeEl.contentWindow.document.getElementById("switch"));
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "green");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(30,0)");
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "hidden");

      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.flex = "initial";
      for (let i = 0; i < this.tasks.length; i++) {
        // remove all exept from the opened
        if(i != index ){
          console.log("set to 0px, i:", i );
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "initial";

          let closedPanelItem = this.elRef.nativeElement.querySelector("#main_svg_"+(i));

          closedPanelItem.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
          closedPanelItem.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
        }
        //show the panel item under clicked item
        if(i == index+1){
          console.log("#panel_item_+i).style.height = auto");
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0 0 16%";
        }
      }
      // if last panel item is expanded show panel item above
      if(index == this.tasks.length-1){
        this.elRef.nativeElement.querySelector('#panel_item_'+(this.tasks.length-2)).style.height = "auto";
        this.elRef.nativeElement.querySelector('#panel_item_'+(this.tasks.length-2)).style.flex = "0 0 16%";
      }
      
    }
    else{
      // set the central info text
      this.cmText = "Tap on a countermeasure to preview the effects";
      this.elRef.nativeElement.querySelector(".applied-box").style.backgroundColor = "#e3f0fc";

      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "visible");

      this.socket.sendExpand("task",-1,index,this.lockedCM[index].locked);

      for (let i = 0; i < this.tasks.length; i++) {
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
        this.elRef.nativeElement.querySelector('#panel_item_5').style.height = "auto";

      }
    }

    


  }

  expandDonePanel(index){
    //this.tabletComp.handleLeftPanel(0);
    this.socket.sendExpand("done",index,index,this.lockedCM[index].locked);
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
    this.elem = document.documentElement;
    this.generateData();

    //this.data = TEMPERATURES.map((v) => v.values.map((v) => v.date ))[0];
    //this.basicChart('#ab63fa');
    const tasksObservable = this.actionService.getActions();

    tasksObservable.subscribe(tasksData => {

      this.tasks = tasksData;
    })

    this.done = [];
    
    //this.initSvg();
    //this.drawChart(TEMPERATURES);

  
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

  private zoomed(isMaximized) {

    if(isMaximized){
      this.focus.attr("transform", "translate(0,100) scale(3,1)");
    }
    else{
      this.focus.attr("transform", "translate(0,100) scale(1,1)");
    }
    

  }

  ngOnChanges() {

  }


  private async drawChart(data) {

    //this.x.domain(d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; }));
    //this.y.domain([0, d3.max(TEMPERATURES[0].values, function(d:any) { return d.temperature; })]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());


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
    
  }




  handleRightPanel(index){
    console.log("this.chartTablet: ", this.chartTablet);

    
    this.rightPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  selectCard(index){
    
    console.log("index: ", index, "locked: ", this.selectedCM[index]);
    let cards = this.elRef.nativeElement.querySelector("#panel_item_"+index).querySelectorAll(".card");
    console.log("cards: ", cards);
    let iframeEl = this.elRef.nativeElement.querySelector("#main_svg_"+index);
    if(this.lockedCM[index].locked){
      console.log("unlock");
      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "";
      this.lockedCM[index].locked = false;

      for (let i = 0; i < cards.length; i++) {
        this.elRef.nativeElement.querySelector('#card_'+index+"_"+i).style.backgroundColor = "#fff";
      }
      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.backgroundColor = "#fff";
    }
    else{
      console.log("locked: ", this.elRef.nativeElement.querySelectorAll('.card'));
      for (let i = 0; i < cards.length; i++) {
        console.log("card: ", this.elRef.nativeElement.querySelector("#card_"+index+"_"+i));
        this.elRef.nativeElement.querySelector("#card_"+index+"_"+i).style.backgroundColor = "#dce5ea";
      }
      //gray
      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.backgroundColor = "#dce5ea";


      this.lockedCM[index].locked = true
    }

    this.socket.sendLock(this.lockedCM[index].locked,index);
    
  }
  
  status(event: CdkDragStart){
    console.log("exit: ", event);
    // setTimeout(() => { this.tasks= { "content" : [
    //   {"text": "task 0", "color":"rgb(38, 143, 85)"},
    //   {"text": "task 1", "color":"rgb(38, 143, 85)"},
    //   {"text": "task 2", "color":"rgb(38, 143, 85)"},
    // ] } }, 2000); 
  }

  loadCardIframe(){
    setTimeout(()=>{
      let mainSvg = this.elRef.nativeElement.querySelector("#card_3_1");
      let cardSwitch = mainSvg.contentWindow.document.getElementById("card_3_1_switch");
      
      this.switchLeft = cardSwitch.getBoundingClientRect().x;
      this.switchTop = cardSwitch.getBoundingClientRect().y;
      console.log("cardSwitch: ", this.cardSwitchFunction);
      console.log("this.cardSwitch_3_1._results[0]: ", this.cardSwitch_3_1._results[0].nativeElement);
    },1000)
  }


  ngAfterViewInit() {




    

    this.svg = d3.select('svg');
    this.focus = d3.select(".focus");
    this.context = d3.select(".context");

    this.focus.select("#hash4_6").attr("width", "1")
    this.focus.select("#hash4_6").attr("height", "1")
    this.focus.select("#hash4_6").attr("patternTransform", "rotate(-80)")
    this.focus.select("#diagonalRect").attr("width", "1");
    this.focus.select("#diagonalRect").attr("height", "0.5");
    
    //this.initSvg();
    console.log();
    this.focus.attr('transform', 'translate(' + (-1270) + ',' + 50 + ') scale(5,1)');
    //this.context.select(".brush").call(this.brush.move, [TEMPERATURES[0].values[249].date,TEMPERATURES[0].values[331].date].map(this.x));

    //Send the width of the cell to middle screen
    let cellOffsetwdith = this.elRef.nativeElement.querySelector(".cell").offsetWidth;
    let cellOffsetHeght = this.elRef.nativeElement.querySelector("#chart1").offsetHeight;

    this.socket.sendANumber(cellOffsetwdith);
    
    console.log("chart1 ", this.chart1._results[0].mainChart.nativeElement);
    this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+cellOffsetwdith+" "+cellOffsetHeght);
    
    console.log("cardlist: ", this.cardList);
    console.log("switch: ", this.elRef.nativeElement.querySelector(".swiper-container"));
    console.log("switch: ", this.elRef.nativeElement.querySelector(".svgCM"));
    console.log("switch: ", this.elRef.nativeElement.querySelector(".cell"));
    console.log("switch: ", d3.select('.switch'));

    this.socket.switchCCP().subscribe(data =>{
      console.log("swipe central");
      this.messageNumber_1 = 2;
      this.messageNumber_0 = 1;
      //this.swiperIndexCentral = data.swiperIndex;
    })
    
    
  }

  loadIframe(){
    setTimeout(() => {
      let initPanelHeightNmbr = this.elRef.nativeElement.querySelector('mat-expansion-panel-header').offsetHeight;
      console.log("offsetHeight nativeElement: ", this.elRef.nativeElement.querySelector('mat-expansion-panel-header').offsetHeight);
      this.initPanelItemHeight =  initPanelHeightNmbr+"px";
      this.panelItemHeight = this.initPanelItemHeight;
      this.panelItemHeightEmitter$.next(this.panelItemHeight);
      let cellOffsetwdith = this.elRef.nativeElement.querySelector(".cell").offsetWidth;
      let cellOffsetHeght = this.elRef.nativeElement.querySelector("#chart1").offsetHeight;
    
      this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+cellOffsetwdith+" "+cellOffsetHeght);

      this.focus = d3.select(".focus");
      this.focus.attr('transform', 'translate(' + (-1270) + ',' + 100 + ') scale(5,1)');

      this.focus.select("#hash4_6").attr("width", "1")
      this.focus.select("#hash4_6").attr("height", "1")
      this.focus.select("#hash4_6").attr("patternTransform", "rotate(-80)")
      this.focus.select("#diagonalRect").attr("width", "1");
      this.focus.select("#diagonalRect").attr("height", "0.2");

      
    }, 100);
    
  }

  onIndexChange(index: number) {
    console.log('Swiper index: ' + index);
    this.socket.sendSwipe(index);
  }

  CCP_activation(index: number) {
    console.log('Swiper index: ' + index);
    //this.socket.sendExpand("task",index+4,0,this.lockedCM[index].locked);
    //this.socket.sendCCP(1);
  }

  middleSwipe(){
    console.log("click");
  }

  loadIframe2(){
    this.chartBackground = this.elRef.nativeElement.querySelector("#chartBackground");
      console.log("this.chartBackground: ", this.chartBackground.contentWindow.document.getElementById("scaleY50"));

      let screenWidth = window.innerWidth;
      let screenHeight = window.innerHeight;

      
      let graphStartHeight = this.chartBackground.contentWindow.document.getElementById("scaleY50").getBoundingClientRect().y;
      
      let focusHeight = this.elRef.nativeElement.querySelector(".focus").getBoundingClientRect().height;

      let scaleGraphY = 0.5;

      let scaleHeightRest = focusHeight - focusHeight*scaleGraphY;


      this.elRef.nativeElement.querySelector("svg").setAttribute("viewBox", "0 0 "+screenWidth+" "+screenHeight);

      //put the graph on it's right position
      this.elRef.nativeElement.querySelector(".focus").setAttribute("transform", "translate(0,"+(graphStartHeight-focusHeight+scaleHeightRest)+") scale(1,"+scaleGraphY+")");

      this.chartBackground.contentWindow.document.getElementById("Scale").style.visibility = "hidden";
  }

  resize(){
    

    if(!this.hideTabletPanels){
      this.hideTabletPanels = true;
      this.changeDetector.detectChanges();
      console.log();
      
      this.socket.sendMaximized(true);

    }
    else{
      console.log("scale back graph", this.focus);
      console.log("chart1", this.elRef.nativeElement.querySelector("#chart1"));
      console.log("chart1: ", this.viewContainerRef._data.renderElement.querySelector(".focus")); 
      console.log("mainChart: ", this.viewContainerRef); 
      //let cellOffsetwdith = this.elRef.nativeElement.querySelector(".cell").offsetWidth;
      //let cellOffsetHeght = this.elRef.nativeElement.querySelector("#chart1").offsetHeight;

      this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+468+" "+487);
      this.focus = d3.select(".focus");
      this.focus.attr('transform', 'translate(' + (-1270) + ',' + 100 + ') scale(5,1)');
      this.hideTabletPanels = false;
      this.socket.sendMaximized(false);
    }
  }

  reload(){
    this.socket.sendReloadPage(true);
    window.location.reload();
    
  }

  goToCCP(){
   // this.myEvent.emit(null);
    //this.middleComponent.goToCCP();
    this.socket.sendCCP(5,1);
  }

  openFullscreen() {
    this.isFullScreen = true;
    console.log("sendFullscreen");
    this.socket.sendFullscreen(true);
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
    this.socket.sendFullscreen(false);
    this.isFullScreen = false;
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

  createRange(number){
    var items: number[] = [];
    for(var i = 1; i <= number; i++){
       items.push(i);
    }
    return items;
  }

}