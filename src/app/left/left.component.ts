import { Component, ViewChildren, OnInit, Inject, AfterViewInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import * as d3 from 'd3';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-left',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})

export class LeftComponent implements OnInit, AfterViewInit {

  @ViewChild('chart') mainChart: ElementRef;

  private elem;

  private svg;
  private width;
  
  private x;
  private y;
  private g: any;

  public cm = "start";
  public hideChart: boolean = true;

  private xLinear: d3.ScaleLinear<number, number>;
  private xTime: d3.ScaleTime<number, number>;
  private margin: { top: number; right: number; bottom: number; left: number; };
  private height: number;
  
  private reloaded: boolean;
  private switchOn:boolean = false;
 
// https://stackoverflow.com/questions/45709725/angular-4-viewchild-component-is-undefined
  constructor(@Inject(DOCUMENT) private document: any, 
                                private socketService : WebsocketService, 
                                private elRef:ElementRef) {}

  ngOnInit() {
    this.elem = document.documentElement;
    
    this.svg = d3.select(".CMchart");

    this.margin = { top: 20, right: 0, bottom: 30, left: 0 };

    this.xLinear = d3.scaleLinear();
    this.xTime = d3.scaleTime();
    this.y = d3.scaleBand().padding(0.1);
  }

  draw(){
    let bounds = this.svg.node().getBoundingClientRect();
    
    this.width = bounds.width - this.margin.left - this.margin.right,
    this.height = bounds.height - this.margin.top - this.margin.bottom;

    this.xLinear.rangeRound([0, this.width]);
    this.xTime.rangeRound([0, this.width]);

    let startDate = new Date(2018,1,1,11,14,0);
    let endDate = new Date(2018,1,1,14,47,0);

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

  ngAfterViewInit(){

    this.socketService.reloadPage().subscribe(reload =>{
      this.reloaded= reload;
      if (this.reloaded) {
        window.location.reload();
        this.reloaded=false;
      }
    })

    this.socketService.changeMessage().subscribe(data =>{
      this.cm = "next";
    })

    this.socketService.moveItem().subscribe(data=>{
      switch (data.currentIndex) {
        case 0:
          this.cm = "cm0";
          break;
        case 3:
          if(this.switchOn){
            this.cm = "cm3_prioritized";
          }
          else{
            this.cm = "cm3";
          }
          break;
        default:
          break;
      }
    })

    this.socketService.prioritize().subscribe(data =>{
      this.switchOn = data;
    })

    this.socketService.maximizeChart().subscribe(data=>{
      if(!this.hideChart){
        this.hideChart = true;
      }
      else{
        this.hideChart = false;
      }
    })
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

}
