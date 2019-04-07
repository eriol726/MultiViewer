import { Component, OnInit, ViewChildren, ViewChild, Input, AfterViewInit, ElementRef, ViewEncapsulation } from '@angular/core';
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

declare var require: any;
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
  @ViewChildren('cardList') cardList: ElementRef;

  @ViewChild('chart') private chartContainer: ElementRef;

  likes: any = 10;
  private myTemplate: any = "";
  @Input() url: string = "app/right.display.component.html";
  @Input() ID: string;

  private svgPath = "../../assets/";
  tasks: MyType[];

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
  public panelItemHeight: string = "20px";
 
  public thePanel;
  intersectionColor: d3.Area<[number, number]>;
  tasks2: any[];
  curveFactorLocked: number = 0;
  isMaximized: boolean = false;

  constructor(private actionService : ActionService, 
              private socket : WebsocketService, 
              private http: HttpClient, 
              private elRef:ElementRef,
              private dragulaService: DragulaService,
              public sanitizer: DomSanitizer) { 

       
        // mySwiper = new Swiper('.swiper-container', {
        //   speed: 400,
        //   spaceBetween: 100
        // });

      let drake = dragulaService.createGroup('COPYABLE', {
        copy: (el, source) => { 
          console.log("source.id: ", source.id);
          return source.id === 'right';
        },
        accepts: (el, target, source, sibling) => {
          // To avoid dragging from left to right container
          //console.log("hej ", drake.drake.dragging);

          let isCopyAble = (target.id !== 'right');

          if (this.done.some((x,i) => i.toString() == el.id) ){
            isCopyAble = false;
          }else{
            
            //console.log("added: ", this.elRef.nativeElement.querySelector("[id='1']"));
           
            
            //el.children[0].style.backgroundColor = "blue";
          }

          return isCopyAble;
        },
        invalid: function (el, handle) {
          let prevent = false;
          //console.log("el: ", el.querySelector(".cardList"));
          console.log("handle: ", handle.className);
          if(handle.className == "swiper-slide swiper-slide-active"){
            console.log("hej");
            //el.className += " mat-expanded";
            //this.elRef.nativeElement.querySelector('.example-list').children[el.id].children[1];
      
            // prevent = true;
            //console.log("this.isExpanded: ", this.elRef.nativeElement.querySelector('.example-list').children[el.id].children);
          }
          
          return prevent; // don't prevent any drags from initiating by default
        }.bind(this),
        

      }).drake.on("drop", function(el,target, source){
        if(target){
          // if CM is not in action plan push
          console.log("this.done: ", this.done);
          if (!this.done.some((x,i) => x.text == el.id) ){
            this.done.push(this.tasks[el.id]);
            this.isExpanded = -1;//parseInt(el.id);
            console.log("this.tasks: ", this.tasks);
            this.socket.sendMove("change",0,0,this.tasks[el.id]);
            //this.isExpanded = parseInt(el.id) == this.isExpanded ? -1 : parseInt(el.id);
   
            el.style.backgroundColor = "yellow";
            this.elRef.nativeElement.querySelector('.example-list-right').children[el.id].style.backgroundColor = "gray";

          }
        }
          
      }.bind(this));
      
      
 
    
  }

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

    let iframeEl = this.elRef.nativeElement.querySelector("#main_svg_"+(index));
    console.log("iframeEl: ", iframeEl, " i: ", index);
    console.log("card: ", iframeEl.contentWindow.document.getElementsByClassName("arrow"));
    
    console.log("this.initPanelItemHeight: ", this.initPanelItemHeight);
    if(this.panelOpenState){

      this.panelItemHeight = this.initPanelItemHeight;
      this.isExpanded = index;
      this.socket.sendExpand("task",index,index);
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "green");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(30,0)");
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "hidden");
      iframeEl.contentWindow.document.getElementsByTagName("image")[0].style.visibility = "hidden";
      if(index == 3){
        this.elRef.nativeElement.querySelector("#panel_item_0").style.height = "0px";
      }

      for (let i = 0; i < this.tasks.length; i++) {
        // remove all exept from the opened
        if(i != index ){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0";
          this.elRef.nativeElement.querySelector('#panel_item_5').style.height = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_5').style.flex = "0";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '0px', 'important');
        }
  
        //show the item under clicked item
        if(i == index+1){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0.25";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '0px', 'important');
        }
        console.log("i: ", i, "this.done1.length :", this.tasks.length);
        if(index == this.tasks.length-1){
          
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.tasks.length-2)).style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.tasks.length-2)).style.flex = "0.25";
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.tasks.length-2)).style.setProperty('margin-bottom', '0px', 'important');
        }
      }
      
    }
    else{
      
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("fill" , "#b3b3b3");
      iframeEl.contentWindow.document.getElementById("switch").setAttribute("transform", "translate(0,0)")
      iframeEl.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "visible");
      //iframeEl.contentWindow.document.getElementsByTagName("mat-expansion-panel-header")[0].style.backgroundColor = "#f4f4f4";
      console.log("close: ", iframeEl.contentWindow.document.getElementsByTagName("image")[0].style.visibility);
      iframeEl.contentWindow.document.getElementsByTagName("image")[0].style.visibility = "visible";
      this.elRef.nativeElement.querySelector("#panel_item_0").style.height = "100%";
      this.socket.sendExpand("task",-1,index);

      for (let i = 0; i < this.tasks.length; i++) {
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "100%";
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
        this.elRef.nativeElement.querySelector('#panel_item_5').style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_5').style.flex = "1";
        this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '0px', 'important');
      }
    }

    


  }

  expandDonePanel(index){
    //this.tabletComp.handleLeftPanel(0);
    this.socket.sendExpand("done",index,index);
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

    this.x.domain(d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; }));
    this.y.domain([0, d3.max(TEMPERATURES[0].values, function(d:any) { return d.temperature; })]);
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

    //let brushT = {"k": 4.365853658536583, "x": -1405.939024390243, "y": 0};
    //this.socket.sendZoom(true, TEMPERATURES[0].values[249],TEMPERATURES[0].values[331].date,brushT);
  }




  handleRightPanel(index){
    console.log("this.chartTablet: ", this.chartTablet);

    
    this.rightPanel.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  selectCard(index){
    
    console.log("index: ", index, "locked: ", this.selectedCM[index]);

    let iframeEl = this.elRef.nativeElement.querySelector("#main_svg_"+index);
    if(this.lockedCM[index].locked){
      console.log("unlock");
      this.elRef.nativeElement.querySelector('.example-list-right').children[index].style.backgroundColor = "";
      this.lockedCM[index].locked = false;
      this.elRef.nativeElement.querySelector('#card_'+index+"_0").style.backgroundColor = "#fff";
      this.elRef.nativeElement.querySelector('#card_'+index+"_1").style.backgroundColor = "#fff";
      this.elRef.nativeElement.querySelector('#card_'+index+"_2").style.backgroundColor = "#fff";
      iframeEl.contentWindow.document.getElementById('cm_rect_background').setAttribute("fill" , "#fff");
      iframeEl.style.backgroundColor = "#f4f4f4";
    }
    else{
      console.log("locked: ", this.elRef.nativeElement.querySelectorAll('.card'));
      this.elRef.nativeElement.querySelector('#card_'+index+"_0").style.backgroundColor = "yellow";
      this.elRef.nativeElement.querySelector('#card_'+index+"_1").style.backgroundColor = "yellow";
      this.elRef.nativeElement.querySelector('#card_'+index+"_2").style.backgroundColor = "yellow";
      iframeEl.style.backgroundColor = "yellow";
      console.log("rect: ", iframeEl.contentWindow.document.getElementsByClassName('cm_background')[0]);
      iframeEl.contentWindow.document.getElementById('cm_rect_background').setAttribute("fill" , "yellow");
      this.lockedCM[index].locked = true
    }

    this.socket.sendLock("done",index);
    
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
    
    this.focus = d3.select(".focus");
    console.log("cardlist: ", this.cardList);
    console.log("switch: ", this.elRef.nativeElement.querySelector(".swiper-container"));
    console.log("switch: ", this.elRef.nativeElement.querySelector(".svgCM"));
    console.log("switch: ", this.elRef.nativeElement.querySelector(".cell"));
    console.log("switch: ", d3.select('.switch'));
    
    
  }

  loadIframe(){
    let initPanelHeightNmbr = document.getElementById('mat-expansion-panel-header-0').offsetHeight;
    console.log("initPanelHeightNmbr: ", initPanelHeightNmbr);
    this.initPanelItemHeight =  initPanelHeightNmbr+"px";
    this.panelItemHeight = this.initPanelItemHeight;
  }

  onIndexChange(index: number) {
    console.log('Swiper index: ' + index);
    this.socket.sendSwipe(index);
  }

  resize(){
    if(this.hideChart){
      this.hideChart = false;
      this.hidePanel = true;
    }
    else{
      this.hideChart = true;
      this.hidePanel = false;
    }
    console.log("resize");
    console.log("maximize", this.elRef.nativeElement.querySelectorAll('.cell'));
    let cellClass = this.elRef.nativeElement.querySelectorAll('.cell');
    if(!this.isMaximized){
      this.isMaximized = true;
      for (let index = 0; index < cellClass.length; index++) {
        if(index != 4 && index != 7){
          cellClass[index].style.zIndex = "-20";
          cellClass[index].style.visibility = "hidden";
          cellClass[index].style.height = "0px"
          cellClass[index].style.flex = "0 0 0";
        }
        else if (index == 4){
          cellClass[index].style.flex = "0 0 100%";
        }
        
      }
      this.zoomed(true);
    }
    else{
      this.isMaximized = false;
      for (let index = 0; index < cellClass.length; index++) {
        
        if(index > 2 && index < 6){
          cellClass[index].style.zIndex = "2";
          cellClass[index].style.visibility = "visible";
          cellClass[index].style.height = "78vh";
          cellClass[index].style.flex = "0 0 33%";
        }
        else{
          cellClass[index].style.zIndex = "2";
          cellClass[index].style.visibility = "visible";
          cellClass[index].style.height = "10vh";
          cellClass[index].style.flex = "0 0 33%";
        }
        
      }
      this.zoomed(false);
    }
    
    this.socket.sendMaximized(true);

  }

}