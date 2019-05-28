import { Component, ViewChildren, OnInit, Input, Inject, AfterViewInit, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as d3 from 'd3';
import { TEMPERATURES } from '../../data/temperatures';
import { AreaChartComponent } from '../area-chart/area-chart.component';
import { Subject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';

type MyType = {
  text: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-left',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})


export class LeftComponent implements OnInit, AfterViewInit {
 // @Input() COUNTERMEASURES;
  @Input() expand;
  @ViewChildren('panel') panel;
  @ViewChild('chart') mainChart: ElementRef;

  elem;
  COUNTERMEASURES2: {};

  private innerWidth: number;
  svg ;
  private width;
  x;
  y;

  public cm = 0;

  data2: MyType[] = [];
  barHeigt: number;
  xLinear: d3.ScaleLinear<number, number>;
  xTime: d3.ScaleTime<number, number>;
  margin: { top: number; right: number; bottom: number; left: number; };
  height: number;
  g: any;

  hideChart: boolean = true;
  hideCM: boolean= false;
  testVar: number =55;
  reloaded: boolean;
  prevCm: number = 0;

  switchOn:boolean = false;

 
// https://stackoverflow.com/questions/45709725/angular-4-viewchild-component-is-undefined
  constructor(@Inject(DOCUMENT) private document: any, private actionService : ActionService, private display : WebsocketService, private elRef:ElementRef) {

  }

  onClick(){
    console.log("click");
    this.actionService.emitChange('Data from child');
  
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

  show(index){
    console.log("index: ", index , " " , this.panel);
    // if(this.panel._results[index].expanded == false){
    //   this.panel._results[index].expanded = true;
    // }
    // else{
    //   this.panel._results[index].expanded = false;
    // }
    
    
  }

  ngOnInit() {
    this.elem = document.documentElement;
    console.log("ngInit");
  
    // this.areaChart.renderContent.subscribe(value =>
    //   {
    //     this.getContent();
    //   })
    
    this.svg = d3.select(".CMchart");
    console.log("this.svg: ", this.svg);
    this.margin = { top: 20, right: 0, bottom: 30, left: 0 };

    this.xLinear = d3.scaleLinear();
    this.xTime = d3.scaleTime();
    this.y = d3.scaleBand().padding(0.1);

    // this.g = this.svg.append("g")
    //   .attr("transform", "translate(" + 0 + "," + 0 + ")")
    //   .attr("class", "CMhistory");

    // add the x Axis
    // this.g.append("g").
    // attr("class", "axis axis--x");

    // append history line
    // this.g.select(".axis--x").append("rect")
    // .attr("class", "historyLine")
    // .attr("width", 2)
    // .attr("height", "100%" )
    // .attr("fill", "black")

    //this.draw();

    //this.update(this.data2);

  }

  draw(){
    
    let bounds = this.svg.node().getBoundingClientRect();
    
    this.width = bounds.width - this.margin.left - this.margin.right,
    this.height = bounds.height - this.margin.top - this.margin.bottom;

    this.xLinear.rangeRound([0, this.width]);
    this.xTime.rangeRound([0, this.width]);

    let index = -1;
    let startDate = new Date(2018,1,1,11,14,0);
    let endDate = new Date(2018,1,1,14,47,0);
    //let filteredObj = TEMPERATURES[0].values.findIndex(item => item.date === startDate);


    this.xTime.domain([startDate,endDate]);
    this.y.domain([0,5]);
    
    this.g.select(".axis--x")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(this.xTime)
    .tickFormat(d3.timeFormat('%H:%M')));
    
    let date = new Date(2018,1,1,12,0,0);
    let x = this.xTime(date);

    this.g.select(".historyLine")
    .attr("transform", "translate(" + x +"," + -this.height + ")"); 
    
  }



  update(data){

    let bars = this.g.selectAll(".bar")
      .data(data)
     
    bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .merge(bars)
    .transition()							//Initiate a transition on all elements in the update selection (all rects)
          .duration(500)
          .attr("x", function(d, i) {				//Set new x position, based on the updated xScale
            let startDate = new Date(d.startDate);
            console.log("startDate: ", startDate);
            return this.xTime(startDate);
          }.bind(this))
          .attr("y", function(d, i) {				//Set new y position, based on the updated yScale
            return 25*i+100;
          }.bind(this))
          .attr("width",  function(d) {
            console.log("this.xTime(d.endDate): ", this.xTime(d.endDate));
            let startDate = new Date(d.startDate);
            let endDate = new Date(d.endDate);
            
            this.xTime(d.startDate)
            return this.xTime(endDate)-this.xTime(startDate); 
          }.bind(this))		//Set new width value, based on the updated xScale
          .attr("height", function(d) {			//Set new height value, based on the updated yScale
            return 20;
          }.bind(this));
    
    //Create labels
    bars
      .enter()
      .append("text")
      .text(function(d) {
          return d.text;
      }.bind(this))
      .attr("text-anchor", "middle")
      .attr("x", function(d, i) {
        let startDate = new Date(d.startDate);
        return this.xTime(startDate)+this.margin.right+20;
      }.bind(this))
      .attr("y", function(d, i) {
          return 25*i+15+100;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", "white");
  }

  iframeLoad(){
    
  }

  ngAfterViewInit(){

    this.display.fullScreen().subscribe(data =>{
      console.log("fullscreen: ", data);
      if(data){
        //this.openFullscreen();
      }
      else{
        //this.closeFullscreen();
      }
    })

    this.display.reloadPage().subscribe(reload =>{
      console.log("reload " , reload )
      this.reloaded= reload;
      if (this.reloaded) {
        window.location.reload();
        this.reloaded=false;
      }
      
    })

    this.display.changeMessage().subscribe(data =>{
      this.cm = 99;
    })

    this.display.moveItem().subscribe(data=>{
      switch (data.currentIndex) {
        case 0:
          this.cm = 1;
          break;
        case 3:
          if(this.switchOn){
            this.cm = 5;
          }
          else{
            this.cm = 4;
          }
          break;
        default:
          break;
      }
      this.prevCm = this.cm;
    })

    this.display.prioritize().subscribe(data =>{
      this.switchOn = data;
    })

    

    this.display.maximizeChart().subscribe(data=>{
      if(!this.hideChart){
        this.hideChart = true;
        this.hideCM = false;
        this.testVar = 66;
        console.log("show CMchart");
      }
      else{
        console.log("hide CMchart");
        this.hideChart = false;
        this.hideCM = true;
        this.testVar = 99;
      }
      
    })
  }

  private getContent(){
    console.log("tja");
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


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    
    //this.draw();
    
  }



}
