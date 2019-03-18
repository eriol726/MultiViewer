import { Component, ViewChildren, OnInit, Input, Inject, AfterViewInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { forwardRef } from '@angular/core';
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as d3 from 'd3';
import { TEMPERATURES } from '../../data/temperatures';

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

  data2 = [{"salesperson":"Bob","sales":33},{"salesperson":"Robin","sales":12}];
  barHeigt: number;


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
    const tasksObservable = this.actionService.getActions();
    tasksObservable.subscribe(tasksData => {
      this.tasks3 = tasksData;
      console.log("tasks: ", tasksData);
    })
    // set the ranges
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    this.barHeigt = 50;

    this.svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

    this.x = d3.scaleLinear()
             .range([0, width]);


    this.y = d3.scaleBand()
          .range([this.barHeigt, 0])
          .padding(0.1);

    this.update(this.data2);

    

    // add the x Axis
    this.svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(this.x));

  // add the y Axis
    // this.svg.append("g")
    // .call(d3.axisLeft(this.y));



    this.width = this.mainChart.nativeElement.offsetWidth;
    this.innerWidth = window.innerWidth;

    
    

  }

  update(data){
    // set the dimensions and margins of the graph
    

    

    
          
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    

    // format the data
    data.forEach(function(d) {
    d.sales = +d.sales;
    });

    // Scale the range of the data in the domains
    this.x.domain([0, d3.max(data, (d:any) => d.sales )]);
    this.y.domain(data.map((d) => d.salesperson));
    //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

    // append the rectangles for the bar chart
    let bars = this.svg.selectAll(".bar")
      .data(data)
    
    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      //.attr("x", function(d) { return x(d.sales); })
      .attr("width", function(d:any) {return this.x(d.sales); }.bind(this) )
      .attr("y", function(d:any) { return this.y(d.salesperson); }.bind(this))
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
						.attr("width",  function(d) {return this.x(d.sales); }.bind(this))		//Set new width value, based on the updated xScale
						.attr("height", function(d) {			//Set new height value, based on the updated yScale
							return 20;
            }.bind(this));
      
      //Create labels
      this.svg.selectAll("text")
      .data(this.data2)
      .enter()
      .append("text")
      .text(function(d) {
          return d.salesperson;
      })
      .attr("text-anchor", "middle")
      .attr("x", function(d, i) {
          return 20;
      }.bind(this))
      .attr("y", function(d,i) {
          return 20*i +20;
      }.bind(this))
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", "white");
      
    
  }

  ngAfterViewInit(){
    this.display.expandItem().subscribe(data=>{
      if(data.type === "task"){
        if(this.panel._results[data.state].expanded == false){
          this.panel._results[data.state].expanded = true;
        }
        else{
          this.panel._results[data.state].expanded = false;
        }
      }
    });

    this.display.moveItem().subscribe(data=>{
      if(data.type === "change"){
        
        this.data2.push({"salesperson":"Klas","sales":15});
        console.log("this.data: ", this.data2);
        this.update(this.data2);
      }else if(data.type === "remove"){
        transferArrayItem(this.tasks3.content,
          [],
          data.previousIndex,
          data.currentIndex);
      }
      
      console.log("this.tasks: ", this.tasks3, " \n currentData: ", data.containerData);
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


    this.innerWidth = window.innerWidth;
    
  }


}
