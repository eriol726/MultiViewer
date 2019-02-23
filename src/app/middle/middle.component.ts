import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, ViewEncapsulation, ɵConsole  } from '@angular/core';
import * as Plotly from 'plotly.js';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import * as d3TimeFormat from 'd3-time-format';
import { csvToJson } from 'convert-csv-to-json/src/csvToJson.js';
import { TEMPERATURES } from '../../data/temperatures';
import { HttpClient } from '@angular/common/http';

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
  private zoom: any;
  private area: any;
  private area2: any;
  private focus: any;

  private upperOuterArea: any;
  private upperInnerArea: any;
  private lowerOuterArea: any;


    g: any;

    z;
    line;

  constructor(private http: HttpClient) { }

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

    this.zoom = d3Zoom.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [this.width, this.height]])
        .extent([[0, 0], [this.width, this.height]])
        .on('zoom', this.zoomed.bind(this));


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
    //this.x.domain(s.map(this.x2.invert, this.x2));
    // this.focus.selectAll('.areaOuterUpper').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
    // this.focus.selectAll('.areaInner').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
    // this.focus.selectAll('.areaOuterLower').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));
    
    //this.focus.select('.axis--x').call(this.xAxis);
    this.svg.select('.zoom').call(this.zoom.transform, d3Zoom.zoomIdentity
        .scale(this.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  private zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
      let t = d3.event.transform;
      this.x.domain(t.rescaleX(this.x2).domain());
      this.focus.selectAll('.areaOuterUpper').attr('d', function(d)  {return this.upperOuterArea(d.values)}.bind(this));
      this.focus.selectAll('.areaInner').attr('d', function(d)  {return this.upperInnerArea(d.values)}.bind(this));
      this.focus.selectAll('.areaOuterLower').attr('d', function(d)  {return this.lowerOuterArea(d.values)}.bind(this));
      
      this.focus.select('.axis--x').call(this.xAxis);
      this.context.select('.brush').call(this.brush.move, this.x.range().map(t.invertX, t));
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
        
    console.log("xPos: ", xPos);
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


    let cityGroup = this.focus.selectAll('.city')
        .data(TEMPERATURES)
        .enter().append("g")
        .attr('class', 'city')


    let cityArea = cityGroup.append('path')
        .attr('class', 'areaOuterUpper')
        .attr('d',function(d){
            console.log("d first: ", d);
            return this.upperOuterArea(d);
        }.bind(this))
        .attr('clip-path', 'url(#rect-clip)');

    let cityArea3 = cityGroup.append('path')
        .attr('class', 'areaInner')
        .attr('d',function(d){
            console.log("d second: ", d);
            return this.upperInnerArea(d);
        }.bind(this))
        .attr('clip-path', 'url(#rect-clip)');

    let cityArea2 = cityGroup.append('path')
        .attr('class', 'areaOuterLower')
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
  
  makeChart (data,data1, markers) {
    var svgWidth  = 960,
        svgHeight = 550,
        margin = { top: 20, right: 20, bottom: 40, left: 40 },
        chartWidth  = svgWidth  - margin.left - margin.right,
        chartHeight = svgHeight - margin.top  - margin.bottom;
    console.log("data: ", data);
    var x = d3.scaleTime().range([0, chartWidth])
                .domain(d3.extent(data[0], (d:any) => +d.date)),
              //.domain([new Date("January 1, 1940 00:00:00"), new Date("January 4, 1980 00:00:00")]),
              //.domain(d3.extent(data, (d:Date) => d)),
        y = d3.scaleLinear().range([chartHeight, 0])
              .domain([0, d3.max(data[0], (d: any) => +d.pct95)]);
              //.domain(d3.extent(data, function (d) { return d.date; })),
              //console.log("d3.extent(data, (d:Date) => d): ", d3.extent(data, (d:Date) => d.date));
    var xAxis = d3.axisBottom(x).scale(x)
                  .tickSizeInner(-chartHeight).tickSizeOuter(0).tickPadding(10),
        yAxis = d3.axisLeft(y)
                  .tickSizeInner(-chartWidth).tickSizeOuter(0).tickPadding(10);
  
    var svg = d3.select('svg')
      .attr('width',  svgWidth)
      .attr('height', svgHeight)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
    // clipping to start chart hidden and slide it in later
    var rectClip = svg.append('clipPath')
      .attr('id', 'rect-clip')
      .append('rect')
        .attr('width', 0)
        .attr('height', chartHeight);
    //console.log("x: ", x(data));
    this.addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
    //this.drawPaths(svg, data, x, y);
    //this.drawPaths(svg, data1, x, y);
    this.startTransitions(svg, chartWidth, chartHeight, rectClip, markers, x);
    
    console.log("svg: ", svg);
    d3.select('svg').append("rect")
    .attr("transform", "translate(0, " + (chartHeight + margin.bottom) + ")")
    .attr("class", "mover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", 40)
    .attr("width", 55)
    .attr("pointer-events", "all")
    .attr("cursor", "ew-resize")
    .call(d3.drag().on("drag", this.display));
    
  }
  
  display () {
//     var x = parseInt(d3.select(this).attr("x")),
//         nx = x + d3.event.dx,
//         w = parseInt(d3.select(this).attr("width")),
//         f, nf, new_data, rects;

//     if ( nx < 0 || nx + w > width ) return;

//     d3.select(this).attr("x", nx);

//     f = displayed(x);
//     nf = displayed(nx);

//     if ( f === nf ) return;

//     new_data = data.slice(nf, nf + numBars);

//     xscale.domain(new_data.map(function (d) { return d.label; }));
//     diagram.select(".x.axis").call(xAxis);

//     rects = bars.selectAll("rect")
//       .data(new_data, function (d) {return d.label; });

// 	 	rects.attr("x", function (d) { return xscale(d.label); });

// // 	  rects.attr("transform", function(d) { return "translate(" + xscale(d.label) + ",0)"; })

//     rects.enter().append("rect")
//       .attr("class", "bar")
//       .attr("x", function (d) { return xscale(d.label); })
//       .attr("y", function (d) { return yscale(d.value); })
//       .attr("width", xscale.rangeBand())
//       .attr("height", function (d) { return height - yscale(d.value); });

//     rects.exit().remove();
}
  

  createChart() {
    var tempData =  d3.json("assets/data.json" );
    // var tempData = d3.json("assets/data.json", 
    //   function(error, d) {
    //     if (error) {
    //       console.error(error);
    //       return;
    //     }
    //     //return d;//{ date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value };
    //   }
      
    // );


    tempData.then(function(finalResult) {

      console.log("finalResult: ", finalResult);

    }.bind(this));

    
   

    //this.data = TEMPERATURES.map((v) => v.values.map((v) => v.date ))[0];
    //console.log("this.data: ", this.data);

    


    /*
    let svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // define X & Y domains
    let xDomain = this.data.map(d => d[0]);
    let yDomain = [0, d3.max(this.data, d => d[1])];

    // create scales
    this.xScale = d3.scaleBand().padding(0.1).domain(xDomain).rangeRound([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

    // bar colors
    this.colors = d3.scaleLinear().domain([0, this.data.length]).range(<any[]>['red', 'blue']);

    // x & y axis
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(d3.axisBottom(this.xScale));
    this.yAxis = svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));
    */
  }

  updateChart() {
    // update scales & axis
    // this.xScale.domain(this.data.map(d => d[0]));
    // this.yScale.domain([0, d3.max(this.data, d => d[1])]);
    // this.colors.domain([0, this.data.length]);
    // this.xAxis.transition().call(d3.axisBottom(this.xScale));
    // this.yAxis.transition().call(d3.axisLeft(this.yScale));

    // let update = this.chart.selectAll('.bar')
    //   .data(this.data);

    // // remove exiting bars
    // update.exit().remove();

    // // update existing bars
    // this.chart.selectAll('.bar').transition()
    //   .attr('x', d => this.xScale(d[0]))
    //   .attr('y', d => this.yScale(d[1]))
    //   .attr('width', d => this.xScale.bandwidth())
    //   .attr('height', d => this.height - this.yScale(d[1]))
    //   .style('fill', (d, i) => this.colors(i));

    // // add new bars
    // update
    //   .enter()
    //   .append('rect')
    //   .attr('class', 'bar')
    //   .attr('x', d => this.xScale(d[0]))
    //   .attr('y', d => this.yScale(0))
    //   .attr('width', this.xScale.bandwidth())
    //   .attr('height', 0)
    //   .style('fill', (d, i) => this.colors(i))
    //   .transition()
    //   .delay((d, i) => i * 10)
    //   .attr('y', d => this.yScale(d[1]))
    //   .attr('height', d => this.height - this.yScale(d[1]));
  }

}
