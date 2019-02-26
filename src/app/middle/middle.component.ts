import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, ViewEncapsulation, ɵConsole  } from '@angular/core';
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
 // private margin: any = { top: 20, bottom: 20, left: 20, right: 20};
  private chart: any;
 // private width: number;
//  private height: number;

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
  private area: any;
  private area2: any;
  private focus: any;

  private upperOuterArea: any;
  private upperInnerArea: any;
  private lowerOuterArea: any;

  private zoomFromTablet : boolean = false;


    g: any;

    z;
    line;

  constructor(private http: HttpClient, private display : WebsocketService) { }

  ngOnInit() {
    //this.createChart();
    var parseDate  = d3.timeParse('%Y-%m-%d');
    var jsonPromise = d3.json('assets/data.json');
    jsonPromise.then((rawData : any) =>{
      //console.log("jsonPromise: ", parseDate(rawData.lines.line1[0].date));
      //var tt = rawData[0].map((v) => {v.line.line1} );

    });
    this.initMargins();
    this.initSvg();

    this.drawChart(TEMPERATURES);
      
  }

  private initMargins() {
    this.margin = {top: 20, right: 20, bottom: 110, left: 40};
    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};
  }

  private initSvg() {
    this.svg = d3.select('svg');

    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.height2 = +this.svg.attr('height') - this.margin2.top - this.margin2.bottom;

    this.x = d3.scaleTime().range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);

    this.xAxis = d3Axis.axisBottom(this.x);
    this.xAxis2 = d3Axis.axisBottom(this.x2);
    this.yAxis = d3Axis.axisLeft(this.y);

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


    this.upperOuterArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) || 1)
      .y0((d: any) => this.y(d.temperature )+20)
      .y1((d: any) => this.y(d.temperature )+10);

    this.upperInnerArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) || 1)
      .y0((d: any) => this.y(d.temperature )+10)
      .y1((d: any) => this.y(d.temperature )+0);

    this.lowerOuterArea = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) => this.x(d.date) || 1)
      .y0((d: any) => this.y(d.temperature )+0)
      .y1((d: any) => this.y(d.temperature )-10);


    this.area2 = d3Shape.area()
      .curve(d3Shape.curveMonotoneX)
      .x((d: any) => this.x2(d.date))
      .y0((d: any) => this.y2(d.temperature)+5)
      .y1((d: any) => this.y2(d.temperature));

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

  private brushed() {
    
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
    
    let s = d3.event.selection || this.x2.range();

    let dateInit1 = TEMPERATURES[0].values[100].date;
    let dateInit2 = TEMPERATURES[0].values[120].date;
    
    //s = [this.x(dateInit1),this.x(dateInit2)];
    console.log("s: ", s);
    //this.x.domain(s.map(this.x2.invert, this.x2));
    // this.focus.selectAll('.areaOuterUpper').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
    // this.focus.selectAll('.areaInner').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
    // this.focus.selectAll('.areaOuterLower').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));
    
    //this.focus.select('.axis--x').call(this.xAxis);
    this.svg.select('.zoom').call(this.zoom.transform, d3Zoom.zoomIdentity
        .scale(this.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private zoomed(zoomFromTablet, xDomainMin, xDomainMax, brushT) {
  
    console.log("zoomFromTablet: ", zoomFromTablet, " \n " , xDomainMin);
    this.focus.selectAll('.areaOuterUpper').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
    this.focus.selectAll('.areaInner2').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
    this.focus.selectAll('.areaInner').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
    this.focus.selectAll('.areaOuterLower').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));
    this.focus.selectAll('.areaOuterLower2').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));
    this.focus.selectAll('.areaOuterUpper2').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
    
    let t = d3.event.transform;
    let dateInit1 = TEMPERATURES[0].values[100].date;
    let dateInit2 = TEMPERATURES[0].values[120].date;

    this.context.select('.brush').call(this.brush.move, this.x.range().map(t.invertX, t));
    this.focus.select('.brush').call(this.brush.move, [this.x(dateInit1),this.x(dateInit2)]);
    if(zoomFromTablet && currentEvent){
      if (currentEvent.sourceEvent && currentEvent.sourceEvent.type === 'brush') return; // ignore zoom-by-brush

      
      
      // this.svg.selectAll("focus")
      // .attr("transform", {k: 2.000000000000001,
      //   x: -83.39590298432509,
      //   y: -88.48355090140652})
      //   console.log("d3: ", d3.event.transform);

      //this.x.domain(t.rescaleX(this.x2).domain());
     // this.x.domain([TEMPERATURES[0].values[10].date, TEMPERATURES[0].values[20].date]);
     
     
     //s = [this.x(dateInit1),this.x(dateInit2)];
      console.log("t: ", t);
      this.focus.select('.axis--x').call(this.xAxis);
      this.context.select('.brush').call(this.brush.move, this.x.range().map(t.invertX, t));
      //this.context.select('.brush').call(this.brush.move, [this.x(dateInit1),this.x(dateInit2)]);
    }
    if(zoomFromTablet){
      this.x.domain([xDomainMin, xDomainMax]);
      this.focus.select('.axis--x').call(this.xAxis);
      this.focus.select('.brush').call(this.brush2.move, this.x.range().map(function(x){
        return (x-brushT.x)/brushT.k},0));
      console.log("brushT: ", this.x.range());
      //this.context.select('.brush').call(this.brush.move, this.x.range().map(t.invertX, t));
    }

    

    
  }


  ngOnChanges() {
    // if (this.chart) {
    //   this.updateChart();
    // }
  }

  addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
    var legendWidth  = 200,
        legendHeight = 100;
  
    // clipping to make sure nothing appears behind legend
    svg.append('clipPath')
      .attr('id', 'axes-clip')
      .append('polygon')
        .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                        (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                        (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                        (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                        (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                        (-margin.left)                 + ',' + (chartHeight + margin.bottom));
  
    var axes = svg.append('g')
      .attr('clip-path', 'url(#axes-clip)');
  
    axes.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(xAxis);
  
    axes.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Time (s)');
  
    var legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');
  
    legend.append('rect')
      .attr('class', 'legend-bg')
      .attr('width',  legendWidth)
      .attr('height', legendHeight);
  
    legend.append('rect')
      .attr('class', 'outer')
      .attr('width',  75)
      .attr('height', 20)
      .attr('x', 10)
      .attr('y', 10);
  
    legend.append('text')
      .attr('x', 115)
      .attr('y', 25)
      .text('5% - 95%');
  
    legend.append('rect')
      .attr('class', 'inner')
      .attr('width',  75)
      .attr('height', 20)
      .attr('x', 10)
      .attr('y', 40);
  
    legend.append('text')
      .attr('x', 115)
      .attr('y', 55)
      .text('25% - 75%');
  
    legend.append('path')
      .attr('class', 'median-line')
      .attr('d', 'M10,80L85,80');
  
    legend.append('text')
      .attr('x', 115)
      .attr('y', 85)
      .text('Median');
  }
 
  
  addMarker(marker, svg, chartHeight, x) {
    var radius = 32,
        xPos = x(marker.date) - radius - 3,
        yPosStart = chartHeight - radius - 3,
        yPosEnd = (marker.type === 'Client' ? 80 : 160) + radius - 3;
        
    var markerG = svg.append('g')
      .attr('class', 'marker '+marker.type.toLowerCase())
      .attr('transform', 'translate(' + xPos + ', ' + yPosStart + ')')
      .attr('opacity', 0);
  
    markerG.transition()
      .duration(1000)
      .attr('transform', 'translate(' + xPos + ', ' + yPosEnd + ')')
      .attr('opacity', 1);
  
    markerG.append('path')
      .attr('d', 'M' + radius + ',' + (chartHeight-yPosStart) + 'L' + radius + ',' + (chartHeight-yPosStart))
      .transition()
        .duration(1000)
        .attr('d', 'M' + radius + ',' + (chartHeight-yPosEnd) + 'L' + radius + ',' + (radius*2));
  
    markerG.append('circle')
      .attr('class', 'marker-bg')
      .attr('cx', radius)
      .attr('cy', radius)
      .attr('r', radius);
  
    markerG.append('text')
      .attr('x', radius)
      .attr('y', radius*0.9)
      .text(marker.type);
  
    markerG.append('text')
      .attr('x', radius)
      .attr('y', radius*1.5)
      .text(marker.version);
  }
  
  startTransitions (svg, chartWidth, chartHeight, rectClip, markers, x) {
    rectClip.transition()
      .duration(1000*markers.length)
      .attr('width', chartWidth);
  
    markers.forEach((marker, i) => {
      setTimeout(() =>{
        this.addMarker(marker, svg, chartHeight, x);
      }, 1000 + 500*i);
    });
  }

  private drawChart(data) {

    this.x.domain(d3Array.extent(data[0].values, (d: any) => d.date));
    this.y.domain([0, d3Array.max(data[0].values, (d: any) => d.temperature)]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());


    this.focus.append('path')
      .datum(TEMPERATURES[0])
      .attr('class', 'areaOuterUpper')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[0])
      .attr('class', 'areaInner')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperInnerArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[0])
      .attr('class', 'areaOuterLower')
      .attr('d',function(d){
          console.log("d second: ", d);
          return this.lowerOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    //next line

    this.focus.append('path')
      .datum(TEMPERATURES[1])
      .attr('class', 'areaOuterUpper2')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[1])
      .attr('class', 'areaInner2')
      .attr('d',function(d){
          console.log("d first: ", d);
          return this.upperInnerArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(TEMPERATURES[1])
      .attr('class', 'areaOuterLower2')
      .attr('d',function(d){
          console.log("d second: ", d);
          return this.lowerOuterArea(d);
      }.bind(this))
      .attr('clip-path', 'url(#rect-clip)');
    

    this.focus.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + this.height + ')');
    //.call(this.xAxis);

    this.focus.append('g')
    .attr('class', 'axis axis--y')
    .call(this.yAxis);
    
    //brush2
    this.focus.append('g')
    .attr('class', 'brush')
    .call(this.brush2, this.x.range());
   // .call(this.brush2.move, [500,700]);

    console.log("range: ", this.x.range());

    this.context.append('path')
        .datum(TEMPERATURES[0].values)
        .attr('class', 'area')
        .attr('d', this.area2);
    
    this.context.append('path')
        .datum(TEMPERATURES[1].values)
        .attr('class', 'area')
        .attr('d', this.area2);

    this.context.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + this.height2 + ')')
        .call(this.xAxis2);

    this.context.append('g')
        .attr('class', 'brush')
        .call(this.brush)
        .call(this.brush.move, this.x.range());

    this.svg.append('rect')
        .attr('class', 'zoom')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .call(this.zoom);
  }

  ngAfterViewInit(){
    this.display.zoomChart().subscribe(data =>{
      console.log("zoom: ", data);
        let minDate = new Date(data.xDomainMin);
        let maxDate = new Date(data.xDomainMax);
        this.zoomFromTablet = true;
        this.zoomed(data.state,minDate,maxDate,data.brushTransform);
 
    })
  
  }
  
 
  


}
