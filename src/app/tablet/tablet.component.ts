import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Inject, Renderer2 } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { ActionService } from '../action.service';
import * as d3 from 'd3';

import { DragulaService } from 'ng2-dragula';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SwiperConfigInterface, SwiperPaginationInterface, SwiperComponent } from 'ngx-swiper-wrapper';
import { SwiperModule } from 'awesome-swiper';
import { Route, ActivatedRoute } from '@angular/router';

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
      spaceBetween: 30
  };

  

  @ViewChildren('panel') panel: ElementRef;
  @ViewChildren('cell') cell: ElementRef;
  @ViewChildren('chart1') chart1: any;
  @ViewChild('chart2', {static: false}) chart2: any;
  @ViewChildren('cardList') cardList: ElementRef;
  @ViewChild('chart', { static: false }) mainChart: ElementRef;
  @ViewChild('dropZone', { read: ViewContainerRef, static: false }) dropZone: ViewContainerRef;
  @ViewChild('usefulSwiper2', { static: false }) usefulSwiper: SwiperComponent;

  private lockedCM = [{"locked": false, "graphFactor": 5},
                      {"locked": false, "graphFactor": 20},
                      {"locked": false, "graphFactor": 10},
                      {"locked": false, "graphFactor": 15}];
  
  public COUNTERMEASURES: CMstruct[];
  public ACTIONPLAN: CMstruct[];

  public collapseArray: Array<string> = ["collapseOne", "collapseTwo","collapseThree","collapseFour"];
  public headingArray: Array<string> = ["headingOne", "headingTwo","headingThree","headingFour","headingFive","headingSix"]
 
  public tja:string ="hello";
  public panelOpenState = false;
  public isExpanded: number  = -1;
  public isFullScreen: boolean = false;
  //public panelItemHeight: string = "auto";
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
  private scaleY:number = 1;
  private scaleX:number = 1;
  private scale:number = 1;
  private initGraphY :number = 0;

  middleTopMargin: any;
  private isDone: boolean = false;

  constructor(@Inject(DOCUMENT) private document: any,
              private actionService : ActionService, 
              private socketService : WebsocketService, 
              private elRef:ElementRef,
              public dragulaService: DragulaService,
              public sanitizer: DomSanitizer,
              private cdRef:ChangeDetectorRef,
              private activeRoute : ActivatedRoute,
              private render: Renderer2) { 

      if(!dragulaService.find('COPYABLE')){
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
              this.lockedCM[taskIndex].locked=true;
              this.socketService.sendMove(taskIndex,this.COUNTERMEASURES[taskIndex]);
              
              // we must change the name of the copied elements so we now which background color we will change
              el.id = "panel_item_copy_"+taskIndex;
              console.log("taskIndex: ", taskIndex);
              console.log("#panel_item_: ", el.querySelector('#panel_item_'+(taskIndex)));
              //el.querySelector('#'+this.collapseArray[taskIndex]).style.height = this.initPanelItemHeight;
              
              el.querySelector('#'+this.collapseArray[taskIndex]).id = this.collapseArray[taskIndex]+"-copy";
              let collapsedClass = el.querySelector('#'+this.collapseArray[taskIndex]+"-copy");

              collapsedClass.setAttribute("aria-labelledby", this.headingArray[taskIndex]+"-copy");
              collapsedClass.setAttribute("data-parent", "#left");
              el.querySelector('#cm_svg_'+taskIndex).id = "cm_svg_"+taskIndex+"-copy";
              let ctrl = el.querySelector('#controller-'+taskIndex);
              
              ctrl.setAttribute("data-target", "#"+this.collapseArray[taskIndex]+"-copy");
              ctrl.setAttribute("aria-controls", this.collapseArray[taskIndex]+"-copy");
  
              ctrl.id = "controller-"+taskIndex+"-copy";
           
              //el.querySelector('[data-target="collapseOne"]')
              //el.querySelector('#mat-expansion-panel-header-'+(taskIndex)+'-copy').style.height = this.initPanelItemHeight;
              
              //el.querySelector("#iframeOverlay_"+taskIndex).id = "iframeOverlay_"+taskIndex+"_copy";
              // gray out when CM is chosen
              this.elRef.nativeElement.querySelector('#panel_item_'+taskIndex).style.backgroundColor = "rgba(217,217,217,0.68)";
  
              //el.querySelector('#cm_header_'+taskIndex).id = "cm_header_copy_"+taskIndex;
            }
  
            // resize all right panel items when a expanded panel item is droped
            // for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
            //   this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
            //   this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
            //   this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '10px', 'important');
              
            // }
  
            let mainSvg = this.elRef.nativeElement.querySelector("#cm_svg_"+(taskIndex));
            mainSvg.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
            mainSvg.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
            mainSvg.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "visible");
            
            //update infobox 
            this.centralBarInfo = this.COUNTERMEASURES[taskIndex].text + " APPLIED";
            this.elRef.nativeElement.querySelector('.applied-box').style.backgroundColor = "#40bd73";
          }
            
        }.bind(this));
      }
      

     
  }

  switch(){
    console.log("switch");
    let mainSvg = this.elRef.nativeElement.querySelector("#card_3_2");
      
    if(mainSvg != null){
      let cardSwitch = mainSvg.contentWindow.document.getElementById("card_3_1_switch");
      console.log("cardSwitch: ", cardSwitch);
      console.log("getBoundingClientRect: ", cardSwitch.getBoundingClientRect());
    }
    let cardSvg = this.elRef.nativeElement.querySelector("#card_3_2");
    let cardSwitch = cardSvg.contentWindow.document.getElementById("card_3_1_switch");

    if(!this.prioritize){
      cardSwitch.setAttribute("transform", "translate(30,0)")
      cardSwitch.setAttribute("fill", "rgb(64, 189, 115)")
      this.prioritize = true;
      //this.socket.sendMessage(5,3);
    }else{
      cardSwitch.setAttribute("transform", "translate(0,0)")
      cardSwitch.setAttribute("fill", "#b3b3b3")
      this.prioritize = false;
      //this.socket.sendMessage(5,99);
    }
    this.socketService.sendPriorotize(this.prioritize);
  }


  closeLeftPanel(elementRef){
    for (let index = 0; index < this.ACTIONPLAN.length; index++) {
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.height = "0px";
      this.elRef.nativeElement.querySelector('.example-list-left').children[index].children[1].style.visibility = "hidden";
    }
  }

  expandTaskPanel(index){
    let iframeEl = this.elRef.nativeElement.querySelector("#cm_svg_"+(index));

    let cm_panel = this.elRef.nativeElement.querySelector("#"+this.collapseArray[index]);
    if(cm_panel.className == "collapse show"){
      this.panelOpenState = false;
    }
    else{
      this.panelOpenState = true;
    }
    if(this.panelOpenState){
      // set the central info text and color
      this.centralBarInfo = this.COUNTERMEASURES[index].text + " PREVIEW";
      this.elRef.nativeElement.querySelector(".applied-box").style.backgroundColor = "yellow";
      
      this.isExpanded = index;
      
      this.socketService.sendExpand(index,index,this.lockedCM);
      console.log("send index: ", index);
      
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "rgb(64, 189, 115)");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(30,0)");
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "hidden");

      this.elRef.nativeElement.querySelector('#panel_item_'+index).style.flex = "initial";
      for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
        // close all exept from the opened
        if(i != index ){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.visibility = "hidden";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "initial";

          let closedPanelItem = this.elRef.nativeElement.querySelector("#cm_svg_"+(i));

          closedPanelItem.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
          closedPanelItem.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
        }
        //show the panel item under clicked item
        if(i == index+1){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.visibility = "visible";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0 0 16%";
        }
        if(i < index && i != this.COUNTERMEASURES.length-2){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '0px', 'important');
        }
      }
      // if last panel item is expanded show panel item above
      if(index == this.COUNTERMEASURES.length-1){
        this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.height = "auto";
        this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.flex = "0 0 16%";
        this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.visibility = "visible";
      }
    }
    else{
      // set the central info text
      this.centralBarInfo = "Tap on a countermeasure to preview the effects";
      this.elRef.nativeElement.querySelector(".applied-box").style.backgroundColor = "#e3f0fc";

      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "visible");

      this.socketService.sendExpand(-1,index,this.lockedCM);
      console.log("send index: ", index);

      // go back closed panel items
      for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "auto";
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.visibility = "visible";
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '10px', 'important');
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
    this.socketService.sendLock(this.lockedCM[index].locked,index);
  }

  loadCardIframe(i){
      // get the switch element
    if(i == 5){
      let mainSvg = this.elRef.nativeElement.querySelector("#card_3_2");

      let cardSwitch = mainSvg.contentWindow.document.getElementById("card_3_1_switch");

      this.switchLeft = cardSwitch.getBoundingClientRect().x;
      this.switchTop = cardSwitch.getBoundingClientRect().y;

      setTimeout(()=>{
        this.collapseArray.forEach(item =>{
          let collapseElm = this.elRef.nativeElement.querySelector("#"+item);
          collapseElm.className = "collapse";
        })
      },1000);
    }
      
  }

  rescaleCollisionPattern(){
    this.focus = d3.select(".focus");

    // .attr('id', "hash4_6")
    //   .attr('width', "4") 
    //   .attr('height',"4")
    //   .attr('patternUnits',"userSpaceOnUse") 
    //   .attr('patternTransform', "rotate(45)")
    //   .append("rect")
    //   .attr("id","diagonalRect")
    //   .attr("width","0.6")
    //   .attr("height", "4")
    //   .attr("transform", "translate(0,0)")
    //   .attr("fill", "#000")

    this.focus.select("#hash4_6").attr("width", "1")
    this.focus.select("#hash4_6").attr("height", "1")
    this.focus.select("#hash4_6").attr("patternTransform", "rotate(70)")
    this.focus.select("#diagonalRect").attr("width", "1");
    this.focus.select("#diagonalRect").attr("height", "0.5");
    
    //this.focus.attr('transform', 'translate(' + (-1270) + ',' + 50 + ') scale(4,1)');
  }

  appendInitCMtoLeft(){

    let panelItem = this.elRef.nativeElement.querySelector("#panel_item_0");
    // panelItem.children[1].style.visibility = "visible";

    let dropZone = this.elRef.nativeElement.querySelector("#left");

    let cln = panelItem.cloneNode(true);
    cln.querySelector('#iframeOverlay_0').style.backgroundColor = "";
    cln.querySelector('#card_0_0').src ="assets/Tablet/Right/r_0_0_Tablet_start.svg";
    // cln.querySelector('#cdk-accordion-child-2').style.height = "100%"; 
    cln.style.height = "auto";

    let taskIndex = 0;
    cln.id = "panel_item_copy_"+taskIndex;
    //el.querySelector('#'+this.collapseArray[taskIndex]).style.height = this.initPanelItemHeight;

    cln.querySelector('#'+this.collapseArray[taskIndex]).id = this.collapseArray[taskIndex]+"-copy";
    let collapsedClass = cln.querySelector('#'+this.collapseArray[taskIndex]+"-copy");

    collapsedClass.setAttribute("aria-labelledby", this.headingArray[taskIndex]+"-copy");
    collapsedClass.setAttribute("data-parent", "#left");
    cln.querySelector('#cm_svg_'+taskIndex).id = "cm_svg_"+taskIndex+"-copy";
    let ctrl = cln.querySelector('#controller-'+taskIndex);

    ctrl.setAttribute("data-target", "#"+this.collapseArray[taskIndex]+"-copy");
    ctrl.setAttribute("aria-controls", this.collapseArray[taskIndex]+"-copy");

    ctrl.id = "controller-"+taskIndex+"-copy";

    dropZone.appendChild(cln);
  }
  

  ngAfterViewInit() {
    this.loadCMgraphics();

    this.appendInitCMtoLeft();

    this.focus = d3.select(".focus");
    console.log("graphMeasures.height: ", this.focus._groups[0][0].getBoundingClientRect().height);
  }

  loadCMgraphics(){

    //this.initPanelItemHeight = this.elRef.nativeElement.querySelector('#panel_item_5').getBoundingClientRect().height+"px";
    this.focus = d3.select(".focus");

    this.cdRef.detectChanges();

    this.cellOffsetWidth = this.elRef.nativeElement.querySelector("#graph-cell").offsetWidth;
    this.cellOffsetHeight = this.elRef.nativeElement.querySelector("#graph-cell").offsetHeight;
    let middleCellHeader = this.elRef.nativeElement.querySelector("#middle-cell-header").offsetHeight;
    let middleCellAppliedbox = this.elRef.nativeElement.querySelector("#middle-cell-appliedbox").offsetHeight;
    
    this.middleTopMargin = middleCellHeader+middleCellAppliedbox;
    this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+this.cellOffsetWidth+" "+this.cellOffsetHeight);
    
    this.elRef.nativeElement.querySelector('#chart1').style.height = this.cellOffsetHeight+"px";
    this.elRef.nativeElement.querySelector('#chart1').style.width = this.cellOffsetWidth+1+"px";
    this.elRef.nativeElement.querySelector('#chart1').style.top = this.middleTopMargin+"px"; 
    this.elRef.nativeElement.querySelector('#chart1').style.left = this.cellOffsetWidth+5+"px"; 
    
    
    //this.focus.attr('transform', 'translate(-430,150) scale(1.4,0.7)');
    let graphMeasures = this.focus._groups[0][0].getBoundingClientRect();
    this.scaleY = (this.cellOffsetHeight / graphMeasures.height)*1.4;
    this.scaleX = (this.cellOffsetWidth / graphMeasures.width)*3.5;
    let cellMeasures = this.elRef.nativeElement.querySelector("#graph-cell").getBoundingClientRect();
    //-250(hardcode) should not be necessary
    this.initGraphY = 200+cellMeasures.bottom-(graphMeasures.bottom)*this.scaleY;
    //translate the graph on it's right position
    this.focus.attr("transform", "translate("+-30+this.scaleX+","+(this.initGraphY  )+") scale("+this.scaleX +","+( this.scaleY)+")");
  }


  changeCard(index: number) {
    this.socketService.sendCardIndex(index);
  }

  resize(){
    
    if(!this.hideTabletPanels){
      this.hideTabletPanels = true;
      
      this.socketService.sendMaximized(true);

      setTimeout(()=>{
        let chartBackground = this.elRef.nativeElement.querySelector('#chartBackground');
        chartBackground.contentWindow.document.querySelector('#Scale').style.visibility = "visible";
        this.focus = d3.select(".focus");

        this.focus.attr("transform", "scale(1,1)");

        let chartAreaWidth = chartBackground.contentWindow.document.querySelector('#Layer_3').getBoundingClientRect().width;
        let chartAreaHeight = chartBackground.contentWindow.document.querySelector('#Layer_3').getBoundingClientRect().height;
        this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+chartAreaWidth+" "+window.innerHeight);
        this.elRef.nativeElement.querySelector('#chart1').style.width = "100%";
        this.elRef.nativeElement.querySelector('#chart1').style.height = "100%";
        this.elRef.nativeElement.querySelector('#chart1').style.left = "0px";
        this.elRef.nativeElement.querySelector('#chart1').style.top = "0px"; 

        let bottomLineMeasurs = chartBackground.contentWindow.document.getElementById("Bottom_line").getBoundingClientRect();
        let iconHeaderMeasurs = chartBackground.contentWindow.document.getElementById("icon-header").getBoundingClientRect();

        let graphMeasures = this.focus._groups[0][0].getBoundingClientRect();
        let gapHeight = bottomLineMeasurs.top-iconHeaderMeasurs.bottom;
        
        if(!this.isDone){
          this.scale = ( gapHeight / graphMeasures.height)*0.90;
          this.isDone = true;
        }

        //put the graph on it's right position
        this.focus.attr("transform", "translate(0,"+(bottomLineMeasurs.top-graphMeasures.bottom*(this.scale))+") scale(1,"+(this.scale)+")");
      },200)
    }
    else{
      console.log("minimize ");

      this.chart1._results[0].mainChart.nativeElement.setAttribute("viewBox", "0 0 "+this.cellOffsetWidth+" "+this.cellOffsetHeight);

      this.elRef.nativeElement.querySelector('#chart1').style.top = this.middleTopMargin+"px";
      this.elRef.nativeElement.querySelector('#chart1').style.left = this.cellOffsetWidth+5+"px";
      this.elRef.nativeElement.querySelector('#chart1').style.width = this.cellOffsetWidth+1+"px"; 
      this.elRef.nativeElement.querySelector('#chart1').style.height = this.cellOffsetHeight+"px";

      this.focus = d3.select(".focus");
      //hårdkodat
      this.focus.attr("transform", "translate("+-80+this.scaleX+","+(this.initGraphY  )+") scale("+this.scaleX +","+( this.scaleY)+")");
      
      this.hideTabletPanels = false;
      this.socketService.sendMaximized(false);

    }
  }

  reload(){
    this.socketService.sendReloadPage(true);
    window.location.reload();
  }

  nextMessage(){
    
    switch (++this.nextMessageIndex) {
      case 1:
        this.socketService.sendMessage(0,this.nextMessageIndex);

        this.elRef.nativeElement.querySelector("#panel_item_copy_0").remove();

        this.messageNumber = 1;
        this.elRef.nativeElement.querySelector('#iframeOverlay_0').style.backgroundColor = "";
        this.elRef.nativeElement.querySelector("#card_header_0").src = "assets/Tablet/Right/cm_header_0.svg";
        this.elRef.nativeElement.querySelector("#panel_item_1").style.visibility = "visible";
        this.elRef.nativeElement.querySelector("#panel_item_2").style.visibility = "visible";
        this.elRef.nativeElement.querySelector("#panel_item_3").style.visibility = "visible";

        let svg_time_scale = this.elRef.nativeElement.querySelector("#svg_time_scale");

        svg_time_scale.contentWindow.document.getElementById("timeText0").innerHTML = "17:00";
        svg_time_scale.contentWindow.document.getElementById("timeText1").innerHTML = "18:00";
        svg_time_scale.contentWindow.document.getElementById("timeText2").innerHTML = "19:00";
        svg_time_scale.contentWindow.document.getElementById("timeText3").innerHTML = "20:00";

        this.focus = d3.select(".focus");
        this.focus.attr("transform", "translate("+-80+this.scaleX+","+(this.initGraphY  )+") scale("+this.scaleX +","+( this.scaleY)+")");

        
        break;
      case 2:
          this.socketService.sendMessage(5,this.nextMessageIndex);
          this.messageNumber = 2;
        break;
      default:
        break;
    }

  }

  openFullscreen() {
    this.isFullScreen = true;
    console.log("sendFullscreen");
    this.socketService.sendFullscreen(true);
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
    this.socketService.sendFullscreen(false);
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