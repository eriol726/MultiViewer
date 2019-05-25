import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Inject } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { ActionService } from '../action.service';
import * as d3 from 'd3';

import { DragulaService } from 'ng2-dragula';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

type CMstruct = {
  id: string ;
  text: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-tablet',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tablet.component.html',
  styleUrls: ['./tablet.component.css']
})

export class TabletComponent implements OnInit, AfterViewInit {
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

  @ViewChildren('panel') panel: ElementRef;
  @ViewChildren('cell') cell: ElementRef;
  @ViewChildren('chart1') chart1: any;
  @ViewChildren('cardList') cardList: ElementRef;
  @ViewChild('chart') mainChart: ElementRef;
  @ViewChild('dropZone', {read: ViewContainerRef}) dropZone: ViewContainerRef;

  private lockedCM = [{"locked": false, "graphFactor": 5},
                      {"locked": false, "graphFactor": 20},
                      {"locked": false, "graphFactor": 10},
                      {"locked": false, "graphFactor": 15}];
  
  public COUNTERMEASURES: CMstruct[];
  public ACTIONPLAN: CMstruct[];

  public panelOpenState = false;
  public isExpanded: number  = -1;
  public isFullScreen: boolean = false;
  public panelItemHeight: string = "auto";
  public thePanel;
  public centralBarInfo: string = "Tap on a countermeasure to preview the effects";
  public switchTop:number;
  public switchLeft:number;
  public hideTabletPanels:boolean = false;
  public messageNumber: number = 0;

  private elem;
  private cellOffsetWidth: number = 0;
  private cellOffsetHeight: number = 0;
  private focus: any;
  private nextMessageIndex = 0;
  private prioritize: boolean = false;
  private loaded:boolean = false;
  private initPanelItemHeight: string = "auto";

  constructor(@Inject(DOCUMENT) private document: any,
              private actionService : ActionService, 
              private socket : WebsocketService, 
              private elRef:ElementRef,
              public dragulaService: DragulaService,
              public sanitizer: DomSanitizer) { 

      dragulaService.createGroup('COPYABLE', {
        copy: (el, source) => { 
          return source.id === 'right';
        },
        accepts: (el, target, source, sibling) => {
          // To avoid dragging from left to right container
          let isCopyAble = (target.id !== 'right');
          
          let taskIndex = el.id.toString()[el.id.toString().length-1];
          
          // if moved element exsist in this.ACTIONPLAN, dont copy it
          if (this.ACTIONPLAN.some((x,i) => x.id == taskIndex) ){
            isCopyAble = false;
          }
          return isCopyAble;
        }
      }).drake.on("drop", function(el,target, source){
        console.log("drop target", target, " el: ", el);
        if(target){
          
          // if CM is not in action plan push it to the ACTIONPLAN array
          let taskIndex = parseInt(el.id.toString()[el.id.toString().length-1]);
          if (!this.ACTIONPLAN.some((x,i) => x.id == taskIndex) ){
            
            this.ACTIONPLAN.push(this.COUNTERMEASURES[taskIndex]);
            this.socket.sendMove(taskIndex,this.COUNTERMEASURES[taskIndex]);
   
            // we must change the name of the copied elements so we now which background color we will change
            el.id = "panel_item_copy_"+taskIndex;

            el.querySelector('.mat-expansion-panel-header').style.height = this.initPanelItemHeight;
            el.querySelector('#mat-expansion-panel-header-'+(taskIndex+2)).id = 'mat-expansion-panel-header-'+taskIndex+'-copy';
            el.querySelector('#mat-expansion-panel-header-'+(taskIndex)+'-copy').style.height = this.initPanelItemHeight;
            
            el.querySelector("#iframeOverlay_"+taskIndex).id = "iframeOverlay_"+taskIndex+"_copy";
            // gray out when CM is chosen
            //this.elRef.nativeElement.querySelector('#iframeOverlay_'+taskIndex).style.backgroundColor = "rgba(217,217,217,0.68)";

            let cards = el.querySelectorAll(".card");
            this.elRef.nativeElement.querySelector('#panel_item_'+taskIndex).style.backgroundColor = "rgba(217,217,217,0.68)";
            // for (let index = 0; index < cards.length; index++) {
            //   el.querySelectorAll(".card")[index].id = "card_"+taskIndex+"_"+index+"_copy";
              
            //   this.elRef.nativeElement.querySelector('#card_'+taskIndex+"_"+index).style.backgroundColor = "rgba(217,217,217,0.68)";
            // }
            el.querySelector('#cm_header_'+taskIndex).id = "cm_header_copy_"+taskIndex;
          }

          // resize all right panel items when a expanded panel item is droped
          for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
            this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
            this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
          }

          let mainSvg = this.elRef.nativeElement.querySelector("#cm_header_"+(taskIndex));
          mainSvg.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
          mainSvg.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
          
          //update infobox 
          this.centralBarInfo = this.COUNTERMEASURES[taskIndex].text + " APPLIED";
          this.elRef.nativeElement.querySelector('.applied-box').style.backgroundColor = "#40bd73";
        }
          
      }.bind(this));
  }

  switch(){
    let cardSvg = this.elRef.nativeElement.querySelector("#card_3_2");
    let cardSwitch = cardSvg.contentWindow.document.getElementById("card_3_1_switch");

    if(!this.prioritize){
      cardSwitch.setAttribute("transform", "translate(30,0)")
      cardSwitch.setAttribute("fill", "rgb(64, 189, 115)")
      this.prioritize = true;
      this.socket.sendMessage(5,3);
    }else{
      cardSwitch.setAttribute("transform", "translate(0,0)")
      cardSwitch.setAttribute("fill", "#b3b3b3")
      this.prioritize = false;
      this.socket.sendMessage(5,99);
    }
    this.socket.sendPriorotize(this.prioritize);
  }


  closeLeftPanel(elementRef){
    for (let index = 0; index < this.ACTIONPLAN.length; index++) {
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.height = "0px";
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.visibility = "hidden";
    }
  }

  expandTaskPanel(index){
    let iframeEl = this.elRef.nativeElement.querySelector("#cm_header_"+(index));

    if(this.panelOpenState){
      // set the central info text and color
      this.centralBarInfo = this.COUNTERMEASURES[index].text + " PREVIEW";
      this.elRef.nativeElement.querySelector(".applied-box").style.backgroundColor = "yellow";
      
      this.isExpanded = index;
      
      this.socket.sendExpand(index,index,this.lockedCM[index].locked);

      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "rgb(64, 189, 115)");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(30,0)");
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "hidden");

      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.flex = "initial";
      for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
        // remove all exept from the opened
        if(i != index ){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "initial";

          let closedPanelItem = this.elRef.nativeElement.querySelector("#cm_header_"+(i));

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
      if(index == this.COUNTERMEASURES.length-1){
        this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.height = "auto";
        this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.flex = "0 0 16%";
      }
      
    }
    else{
      // set the central info text
      this.centralBarInfo = "Tap on a countermeasure to preview the effects";
      this.elRef.nativeElement.querySelector(".applied-box").style.backgroundColor = "#e3f0fc";

      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "visible");

      this.socket.sendExpand(-1,index,this.lockedCM[index].locked);

      for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
        this.elRef.nativeElement.querySelector('#panel_item_5').style.height = "auto";
      }
    }
  }

  ngOnInit(){
    this.elem = document.documentElement;

    const observableCM = this.actionService.getActions();

    this.ACTIONPLAN = [];
    observableCM.subscribe(CMdata => {
      this.COUNTERMEASURES = CMdata;
    })
  }

  selectCard(index){

    if(this.lockedCM[index].locked){
      // set the CM background to white
      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "";

      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.backgroundColor = "none";

      this.lockedCM[index].locked = false;
    }
    else{
      // gray out the background
      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.backgroundColor = "rgba(217,217,217,0.68)";

      this.lockedCM[index].locked = true
    }
    this.socket.sendLock(this.lockedCM[index].locked,index);
  }

  loadCardIframe(){
      // get the switch element
      let mainSvg = this.elRef.nativeElement.querySelector("#card_3_2");
      let cardSwitch = mainSvg.contentWindow.document.getElementById("card_3_1_switch");
      
      // position an overlay box to interact with the user
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

  appendInitCMtoLeft(){
    setTimeout(()=>{
      let panelItem = this.elRef.nativeElement.querySelector("#panel_item_0");
      panelItem.children[1].style.visibility = "visible";

      let dropZone = this.elRef.nativeElement.querySelector("#left");
      
      let cln = panelItem.cloneNode(true);
      cln.querySelector('#iframeOverlay_0').style.backgroundColor = "";
      cln.querySelector('#card_0_0').src ="assets/Tablet/Right/r_0_0_Tablet_start.svg";
      cln.querySelector('#cdk-accordion-child-2').style.height = "100%"; 
      cln.style.height = "auto";

      dropZone.appendChild(cln);

    })
  }

  ngAfterViewInit() {

    this.rescaleCollisionPattern();

  }

  loadCMgraphics(){
    if(!this.loaded){
      this.initPanelItemHeight = this.elRef.nativeElement.querySelector('#panel_item_5').getBoundingClientRect().height+"px";

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

      this.appendInitCMtoLeft();
    }
    
    this.loaded = true;
  }


  changeCard(index: number) {
    this.socket.sendCardIndex(index);
  }

  resize(){
    if(!this.hideTabletPanels){
      this.hideTabletPanels = true;
      let chartBackground = this.elRef.nativeElement.querySelector('#chartBackground');
      console.log("chartBackground: ", chartBackground);
      chartBackground.contentWindow.document.getElementById('history-layer').style.opacity = "1";
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

  nextMessage(){
    
    switch (++this.nextMessageIndex) {
      case 1:
        this.socket.sendMessage(0,this.nextMessageIndex);

        this.elRef.nativeElement.querySelector("#panel_item_0").remove();

        

        this.messageNumber = 1;
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

        this.elRef.nativeElement.querySelector("#cm_header_0").src = "assets/r_4_Tablet.svg";
        break;
      case 2:
          this.socket.sendMessage(5,this.nextMessageIndex);
          this.messageNumber = 2;
        break;
      default:
        break;
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