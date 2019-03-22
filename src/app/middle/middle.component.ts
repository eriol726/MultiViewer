import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, ViewEncapsulation, ɵConsole, HostListener  } from '@angular/core';
import * as Plotly from 'plotly.js';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import {event as currentEvent} from 'd3-selection';
import * as d3TimeFormat from 'd3-time-format';
import { csvToJson } from 'convert-csv-to-json/src/csvToJson.js';
import { TEMPERATURES } from '../../data/temperatures';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../websocket.service';
import { selectAll } from 'd3';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

@Component({
  selector: 'app-middle',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './middle.component.html',
  styleUrls: ['./middle.component.css']
})
export class MiddleComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @ViewChild('row') private rowContainer: ElementRef;
  @Input() private data: Array<any>;

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

  initZoomMax: Date;
  zoomFromTablet: boolean;
  zoomDate1: any;
  zoomDate2: any;

  constructor(private http: HttpClient, private display : WebsocketService) { }

  ngOnInit() {

    this.initSvg();

    this.drawChart(TEMPERATURES);
      
  }

  private initSvg() {
    this.svg = d3.select('svg');
    this.margin = {top: 20, right: 20, bottom: 110, left: 40};
    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    this.height2 = +this.svg.attr("height") -this.margin2.top - this.margin2.bottom;

    let bounds = this.svg.node().getBoundingClientRect();
    
    this.width = bounds.width - this.margin.left - this.margin.right,
    this.height = bounds.height - this.margin.top - this.margin.bottom;

    this.x = d3.scaleTime().range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);

    this.xAxis = d3.axisBottom(this.x).tickFormat(d3.timeFormat('%H:%M'));
    this.xAxis2 = d3.axisBottom(this.x2);
    this.yAxis = d3.axisLeft(this.y);

    this.brush = d3Brush.brushX()
        .extent([[0, 0], [this.width, this.height2]])
        .on('brush end', this.brushed.bind(this));
    
    this.brush2 = d3Brush.brushX()
    .extent([[0, 0], [this.width, 500]])
    .on('brush end', this.brushed.bind(this));

    this.zoom = d3Zoom.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [this.width, this.height]])
        .extent([[0, 0], [this.width, this.height]])
        .on('zoom', function() { 
          this.zoomed(false);
        }.bind(this));

    this.svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height);

    this.focus = this.svg.append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .attr('class', 'focus');

    this.context = this.svg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(' + this.margin2.left + ',' + this.margin2.top + ')');
  }

  private brushed(dragFromTablet,xDomainMin,xDomainMax,brushTransform) {
    
    if(!dragFromTablet){

      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom

      let s = d3.event.selection || this.x2.range();
    }

    this.focus.select('.axis--x').call(this.xAxis);

  }

  private zoomed(zoomFromTablet, xDomainMin, xDomainMax, brushTransform) {
    //var t = d3.event.transform;
    console.log("zoomFromTablet: ", zoomFromTablet);
    // this.zoomDate1 = t.rescaleX(this.x2).domain()[0];
    // this.zoomDate2 = t.rescaleX(this.x2).domain()[1];

    //this.x.domain(t.rescaleX(this.x2).domain());
    this.x.domain(d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; }));


    if(!zoomFromTablet){
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
      var t = d3.event.transform;
    }
    
    
    if(zoomFromTablet){
      this.focus.select(".brush").call(this.brush2.move, [xDomainMin, xDomainMax].map(this.x2));
    }
  }


  ngOnChanges() {
  }


  private drawChart(data) {

    this.x.domain(d3.extent(TEMPERATURES[0].values, function(d:any) { return d.date; }));
    this.y.domain([0, d3.max(TEMPERATURES[0].values, function(d:any) { return d.temperature; })]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());
    
    // append history line
    this.focus.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + this.height + ')')
    .call(this.xAxis)
    .append("rect")
    .attr("x", (d) => {
      let date = new Date(2018,1,1,6,0,0);
      console.log("date: ", this.x(date));
      return this.x(date);
    })
    .attr("y", -500)
    .attr("width", 2)
    .attr("height", 600 )
    .attr("fill", "black")

    this.focus.append('g')
    .attr('class', 'axis axis--y')
    .call(this.yAxis);

    this.focus.append('g')
        .attr('class', 'brush') 
        .call(this.brush2)
        .call(this.brush2.move, this.x2.range());

    this.svg.append('rect')
        .attr('class', 'zoom')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .call(this.zoom);

        this.context.select(".brush").call(this.brush.move, [TEMPERATURES[0].values[249].date, TEMPERATURES[0].values[331].date].map(this.x));

  }

  ngAfterViewInit(){
    this.display.zoomChart().subscribe(data =>{

        let minDate = new Date(data.xDomainMin);
        let maxDate = new Date(data.xDomainMax);
        this.zoomFromTablet = true;
        //console.log("x init1: ", [minDate, maxDate].map(this.x2));
        this.initZoomMax = data.xDomainMax;
        this.initZoomMax = data.xDomainMin;
        this.zoomed(true,minDate,maxDate,data.brushTransform);
        
    })
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    
    
  }
  
 
  


}
