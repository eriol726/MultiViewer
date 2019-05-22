import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Inject } from '@angular/core';
import { RightComponent } from '../right/right.component';
import { LeftComponent } from '../left/left.component';
import { MiddleComponent } from '../middle/middle.component';
import { WebsocketService } from '../websocket.service';
import { ActionService } from '../action.service';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { DragulaService } from 'ng2-dragula';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type MyType = {
  id: string ;
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

  public many = ['The', 'possibilities', 'are', 'endless!'];

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

  @ViewChild('dropZone', {read: ViewContainerRef}) dropZone: ViewContainerRef;

  @ViewChild('chart1', {read: ViewContainerRef}) viewContainerRef;


  private elem;
  public isFullScreen: boolean = false;
  private cellOffsetWidth: number = 0;
  private cellOffsetHeight: number = 0;

  @ViewChild('contentPlaceholder') set content(content: any) {
    this.otherContent = content;
  }
  @ViewChildren('cardList') cardList: ElementRef;
  @ViewChild('chart') private chartContainer: ElementRef;

  likes: any = 10;
  @Input() url: string = "app/right.display.component.html";
  @Input() ID: string;
  


  public tasks: MyType[];

  // we need to create a struct/type to point to the variable members from action service
  private done: MyType[];

  panelIndex : number = 0;
  currentState : boolean = false

  public hideChart: boolean = true;
  public hidePanel: boolean = false;
  
  private focus: any;
  public panelOpenState = false;

  private nextMessageIndex = 0;

  private lockedCM = [{"locked": false, "graphFactor": 5},
                      {"locked": false, "graphFactor": 20},
                      {"locked": false, "graphFactor": 10},
                      {"locked": false, "graphFactor": 15}];

  public isExpanded: number  = -1;
    
  private initPanelItemHeight: string = "0px";
  public panelItemHeight: string = "auto";
  panelItemHeightEmitter$ = new BehaviorSubject<string>(this.panelItemHeight);
 
  public thePanel;

  public cmText: string = "Tap on a countermeasure to preview the effects";
  intersectionColor: d3.Area<[number, number]>;

  curveFactorLocked: number = 0;
  isMaximized: boolean = false;

  public hideTabletPanels = false;

  messageNumber_1 = 1;
  messageNumber_0 = 0;

  cardSwitchFunction: any;
  switchTop;
  switchLeft;

  prioritize: boolean = false;

  loaded:boolean = false;

  constructor(@Inject(DOCUMENT) private document: any,
              private actionService : ActionService, 
              private socket : WebsocketService, 
              private http: HttpClient, 
              private elRef:ElementRef,
              private dragulaService: DragulaService,
              public sanitizer: DomSanitizer,
              private router: Router,
              private changeDetector : ChangeDetectorRef) { 

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

            el.querySelector('.mat-expansion-panel-header').style.height = this.panelItemHeight;

            console.log("this.panelItemHeight: " , this.panelItemHeight);

            el.querySelector('#mat-expansion-panel-header-'+(taskIndex+2)).id = 'mat-expansion-panel-header-'+taskIndex+'-copy';
            el.querySelector('#mat-expansion-panel-header-'+(taskIndex)+'-copy').style.height = this.panelItemHeight;
            // gray out when CM is chosen
            
            el.querySelector("#iframeOverlay_"+taskIndex).id = "iframeOverlay_"+taskIndex+"_copy";
            this.elRef.nativeElement.querySelector('#iframeOverlay_'+taskIndex).style.backgroundColor = "rgba(217,217,217,0.68)";

            let cards = el.querySelectorAll(".card");
            for (let index = 0; index < cards.length; index++) {
              el.querySelectorAll(".card")[index].id = "card_"+taskIndex+"_"+index+"_copy";
              
              this.elRef.nativeElement.querySelector('#card_'+taskIndex+"_"+index).style.backgroundColor = "rgba(217,217,217,0.68)";
            }
            
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
          
          this.cmText = this.tasks[taskIndex].text + " APPLIED";
          this.elRef.nativeElement.querySelector('.applied-box').style.backgroundColor = "#40bd73";
        }
          
      }.bind(this));
    
  }

  switch(){
    console.log("switch on")
    let mainSvg = this.elRef.nativeElement.querySelector("#card_3_2");
    let cardSwitch = mainSvg.contentWindow.document.getElementById("card_3_1_switch");

    if(!this.prioritize){
      cardSwitch.setAttribute("transform", "translate(30,0)")
      cardSwitch.setAttribute("fill", "rgb(64, 189, 115)")
      this.prioritize = true;
      this.socket.sendCCP(5,3);
    }else{
      cardSwitch.setAttribute("transform", "translate(0,0)")
      cardSwitch.setAttribute("fill", "#b3b3b3")
      this.prioritize = false;
      this.socket.sendCCP(5,99);
    }
    this.socket.sendPriorotize(this.prioritize);
  }


  closeLeftPanel(elementRef){
    for (let index = 0; index < this.done.length; index++) {
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.height = "0px";
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.visibility = "hidden";
    }
  }

  expandTaskPanel(index){
    let iframeEl = this.elRef.nativeElement.querySelector("#main_svg_"+(index));

    if(this.panelOpenState){
      // set the central info text and color
      this.cmText = this.tasks[index].text + " PREVIEW";
      this.elRef.nativeElement.querySelector(".applied-box").style.backgroundColor = "yellow";
      
      this.isExpanded = index;
      
      this.socket.sendExpand("task",index,index,this.lockedCM[index].locked);

      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "rgb(64, 189, 115)");
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

  ngOnInit(){
    this.elem = document.documentElement;

    const tasksObservable = this.actionService.getActions();

    this.done = [];
    tasksObservable.subscribe(tasksData => {
      this.tasks = tasksData;

    })
  }

  selectCard(index){
    
    let cards = this.elRef.nativeElement.querySelector("#panel_item_"+index).querySelectorAll(".card");

    let iframeEl = this.elRef.nativeElement.querySelector("#main_svg_"+index);
    if(this.lockedCM[index].locked){

      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "";
      this.lockedCM[index].locked = false;

      for (let i = 0; i < cards.length; i++) {
        this.elRef.nativeElement.querySelector('#card_'+index+"_"+i).style.backgroundColor = "#fff";
      }
      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.backgroundColor = "#fff";
    }
    else{

      for (let i = 0; i < cards.length; i++) {
        this.elRef.nativeElement.querySelector("#card_"+index+"_"+i).style.backgroundColor = "rgba(217,217,217,0.68)";
      }
      //gray
      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.backgroundColor = "rgba(217,217,217,0.68)";

      this.lockedCM[index].locked = true
    }

    this.socket.sendLock(this.lockedCM[index].locked,index);
  }

  loadCardIframe(){
      let mainSvg = this.elRef.nativeElement.querySelector("#card_3_2");
      let cardSwitch = mainSvg.contentWindow.document.getElementById("card_3_1_switch");
      
      this.switchLeft = cardSwitch.getBoundingClientRect().x;
      this.switchTop = cardSwitch.getBoundingClientRect().y;
  }

  rescaleCollisionPattern(){
    this.focus = d3.select(".focus");

    this.focus.select("#hash4_6").attr("width", "1")
    this.focus.select("#hash4_6").attr("height", "1")
    this.focus.select("#hash4_6").attr("patternTransform", "rotate(-80)")
    this.focus.select("#diagonalRect").attr("width", "1");
    this.focus.select("#diagonalRect").attr("height", "0.5");
    
    this.focus.attr('transform', 'translate(' + (-1270) + ',' + 50 + ') scale(4,1)');
  }

  ngAfterViewInit() {

    this.rescaleCollisionPattern();
    
    //appending cm to left panel
    setTimeout(()=>{
      let panelItem = this.elRef.nativeElement.querySelector("#panel_item_0");
      panelItem.children[1].style.visibility = "visible";
      panelItem.children[1].style.height = "auto";
      let dropZone = this.elRef.nativeElement.querySelector("#left");
      console.log("copy:: ", panelItem.querySelector('#iframeOverlay_0'));
      
      var cln = panelItem.cloneNode(true);
      cln.querySelector('#iframeOverlay_0').id = "iframeOverlay_0_copy";
      cln.querySelector('#card_0_0').id = "card_0_0_copy";
      cln.querySelector('#card_0_0_copy').src ="assets/Tablet/Right/r_0_0_Tablet_start.svg";
      dropZone.appendChild(cln);
      console.log("panelItem.children[1]: ", panelItem.children[1]);
    })
    
    //Send the width of the cell to middle screen
    let cellOffsetwdith = this.elRef.nativeElement.querySelector(".cell").offsetWidth;
    let cellOffsetHeght = this.elRef.nativeElement.querySelector("#chart1").offsetHeight;

    this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+cellOffsetwdith+" "+cellOffsetHeght);

    this.socket.switchCCP().subscribe(data =>{
      switch (data.swiperIndex) {
        case 1:
          this.elRef.nativeElement.querySelector("#panel_item_0").remove();

          this.messageNumber_0 = 1;
          this.messageNumber_1 = 2;
          this.elRef.nativeElement.querySelector('#iframeOverlay_0').style.backgroundColor = "";
          this.elRef.nativeElement.querySelector("#panel_item_1").style.visibility = "visible";
          this.elRef.nativeElement.querySelector("#panel_item_2").style.visibility = "visible";
          this.elRef.nativeElement.querySelector("#panel_item_3").style.visibility = "visible";

          let svg_time_scale = this.elRef.nativeElement.querySelector("#svg_time_scale");

          svg_time_scale.contentWindow.document.getElementById("timeText0").innerHTML = "17:00";
          svg_time_scale.contentWindow.document.getElementById("timeText1").innerHTML = "18:00";
          svg_time_scale.contentWindow.document.getElementById("timeText2").innerHTML = "19:00";
          svg_time_scale.contentWindow.document.getElementById("timeText3").innerHTML = "20:00";
          this.focus.attr('transform', 'translate(' + (-1290) + ',' + 100 + ') scale(5,1)');

          let iframePanelItem0 = this.elRef.nativeElement.querySelector("#main_svg_0");
          iframePanelItem0.src = "assets/r_4_Tablet.svg";
          break;
        case 2:
          this.messageNumber_0 = 2;
          this.messageNumber_1 = 3;
        break;
      
        default:
          break;
      }
    })
  }

  loadIframe(){
    if(!this.loaded){
      let initPanelHeightNmbr = this.elRef.nativeElement.querySelector('#iframeOverlay_0').getBoundingClientRect().height;

      this.initPanelItemHeight =  initPanelHeightNmbr+"px";
      this.panelItemHeight = this.initPanelItemHeight;
      this.panelItemHeightEmitter$.next(this.panelItemHeight);
      this.cellOffsetWidth = this.elRef.nativeElement.querySelector(".cell").offsetWidth;
      this.cellOffsetHeight = this.elRef.nativeElement.querySelector("#chart1").offsetHeight;
    
      this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+this.cellOffsetWidth+" "+this.cellOffsetHeight);

      this.focus = d3.select(".focus");
      this.focus.attr('transform', 'translate(' + (-500) + ',' + 100 + ') scale(5,1)');

      this.focus.select("#hash4_6").attr("width", "1")
      this.focus.select("#hash4_6").attr("height", "1")
      this.focus.select("#hash4_6").attr("patternTransform", "rotate(-80)")
      this.focus.select("#diagonalRect").attr("width", "1");
      this.focus.select("#diagonalRect").attr("height", "0.2");
      
      this.elRef.nativeElement.querySelector('#iframeOverlay_0').style.backgroundColor = "rgba(217,217,217,0.68)";
      this.elRef.nativeElement.querySelector("#panel_item_1").style.visibility = "hidden";
      this.elRef.nativeElement.querySelector("#panel_item_2").style.visibility = "hidden";
      this.elRef.nativeElement.querySelector("#panel_item_3").style.visibility = "hidden";
    }
    
    this.loaded = true;
  }

  onIndexChange(index: number) {
    console.log('Swiper index: ' + index);
    this.socket.sendSwipe(index);
  }

  resize(){
    if(!this.hideTabletPanels){
      this.hideTabletPanels = true;
      this.changeDetector.detectChanges();
      
      this.socket.sendMaximized(true);
    }
    else{
      this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+this.cellOffsetWidth+" "+this.cellOffsetHeight);
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
    this.nextMessageIndex++;
    if(this.nextMessageIndex>1){
      this.nextMessageIndex = 2;
      this.socket.sendCCP(5,this.nextMessageIndex);
    }
    else{
      this.socket.sendCCP(0,this.nextMessageIndex);
    }
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