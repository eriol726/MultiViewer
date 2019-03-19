import { Component, ViewChildren, OnInit, Input, Inject, AfterViewInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { forwardRef } from '@angular/core';
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as d3 from 'd3';
import { TEMPERATURES } from '../../data/temperatures';

type MyType = {
  text: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})


export class LeftComponent implements OnInit, AfterViewInit {
 // @Input() tasks;
  @Input() expand;
  @ViewChildren('panel') panel;
  @ViewChild('chart') mainChart: ElementRef;

  tasks2: {};
  tasks3 = { "content" : [
    {"text": "task 0", "color":"rgb(38, 143, 85)"},
  ]};

  private innerWidth: number;
  svg ;
  private width;
  x;
  y;

  data2: MyType[] = [{"text": "task 0", "color":"rgb(38, 143, 85)","startDate": new Date(2018,1,1,0,10,0), "endDate": new Date(2018,1,1,0,55,0)}];
  barHeigt: number;
  xLinear: d3.ScaleLinear<number, number>;
  xTime: d3.ScaleTime<number, number>;


  constructor(private actionService : ActionService, private display : WebsocketService, private elRef:ElementRef) {

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
    console.log("ngInit");

    this.draw();

    this.update(this.data2);

     



    // add the y Axis
    // this.svg.append("g")
    // .call(d3.axisLeft(this.y));

    //this.width = this.mainChart.nativeElement.offsetWidth;
    this.innerWidth = window.innerWidth;

  }

  draw(){
    // set the ranges
    this.width = this.mainChart.nativeElement.offsetWidth;
    var margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.width = this.mainChart.nativeElement.offsetWidth - margin.left - margin.right;
    //width = 1500 - margin.left - margin.right;
    //let height = 600 - margin.top - margin.bottom;
    this.barHeigt = 50;

    this.svg = d3.select("svg");
    var bounds = this.svg.node().getBoundingClientRect();

    let width = bounds.width - margin.left - margin.right,
    height = bounds.height - margin.top - margin.bottom;
    this.svg
    .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

    this.xLinear = d3.scaleLinear()
             .range([0, width]);

    this.xTime = d3.scaleTime().range([0, width]);

    this.y = d3.scaleBand()
          .range([this.barHeigt, 0])
          .padding(0.1);



    // add the x Axis
    this.svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(this.xTime)
    .tickFormat(d3.timeFormat('%H:%M')));
  }



  update(data){
    // set the dimensions and margins of the graph

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    

    // format the data
    // data.forEach(function(d) {
    // d.sales = +d.sales;
    // });
    console.log("data: ", data);
    // Scale the range of the data in the domains
    this.xTime.domain([TEMPERATURES[0].values[90].date,TEMPERATURES[0].values[148].date]);
    this.y.domain([0,5]);
    //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

    // append the rectangles for the bar chart
    let bars = this.svg.selectAll(".bar")
      .data(data)

    
    
    bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    //.attr("x", function(d) { return x(d.sales); })
    .attr("y", function(d:any) { return this.y(d.text); }.bind(this))
    .attr("height", this.y.bandwidth())
    .merge(bars)
    .transition()							//Initiate a transition on all elements in the update selection (all rects)
          .duration(500)
          .attr("x", function(d, i) {				//Set new x position, based on the updated xScale
            return 0;
          }.bind(this))
          .attr("y", function(d, i) {				//Set new y position, based on the updated yScale
            return 25*i;
          }.bind(this))
          .attr("width",  function(d) {
            console.log("d: ", d);
            let startDate = new Date(d.startDate);
            let endDate = new Date(d.endDate);
            console.log("endDate: ", endDate);
            let timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
            console.log("timeDiff: ", timeDiff*0.0000001);
            return this.xLinear(timeDiff*0.0000002); 
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
          return 20;
      })
      .attr("y", function(d, i) {
          return 25*i+15;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", "white");
      
      
    
  }

  ngAfterViewInit(){
    this.display.expandItem().subscribe(data=>{
      if(data.type === "task"){
      }
    });

    this.display.moveItem().subscribe(data=>{
      if(data.type === "change"){
        
        console.log("data.containerData: ", data.containerData);
        this.data2.push(data.containerData);
        this.update(this.data2);
        
        
        
      }else if(data.type === "remove"){
        transferArrayItem(this.tasks3.content,
          [],
          data.previousIndex,
          data.currentIndex);
      }
      
    })

    
  }

  appendBar(data){
    var bars = this.svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")

        //append rects
        bars.append("rect")
            .attr("class", "bar")
            .attr("y", function (d) {
                return this.y(d.name);
            })
            .attr("height", this.y.rangeBand())
            .attr("x", 0)
            .attr("width", function (d) {
                return this.x(d.value);
            });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log(" this.svg: ",  window.innerWidth);

    //this.draw();
    this.innerWidth = window.innerWidth;
    
  }


}
