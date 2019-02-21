import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, ViewEncapsulation  } from '@angular/core';
import * as Plotly from 'plotly.js';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';
import { csvToJson } from 'convert-csv-to-json/src/csvToJson.js';
import { TEMPERATURES } from '../../data/temperatures';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-middle',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './middle.component.html',
  styleUrls: ['./middle.component.css']
})
export class MiddleComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
 // private margin: any = { top: 20, bottom: 20, left: 20, right: 20};
  private chart: any;
 // private width: number;
//  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;

  svg: any;
    margin;
    g: any;
    width: number;
    height: number;
    x;
    y;
    z;
    line;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    //this.createChart();
    var parseDate  = d3.timeParse('%Y-%m-%d');
    var jsonPromise = d3.json('assets/data.json');
    jsonPromise.then((rawData) =>{
      //console.log("jsonPromise: ", parseDate(rawData.lines.line1[0].date));
      //var tt = rawData[0].map((v) => {v.line.line1} );


      console.log("rawData.lines.line1: ", rawData );
      var line1 = rawData.lines.line1.map(function (d) {
        return {
          date:  parseDate(d.date),
          pct05: d.pct05 / 1500 ,
          // pct25: d.pct25 / 1000 +4,
          pct50: d.pct50 / 1500 ,
          pct75: d.pct75 / 1500 ,
          pct95: d.pct95 / 1800  
        };
      });
    
      var line2 = rawData.lines.line2.map(function (d) {
        return {
          date:  parseDate(d.date),
          pct05: d.pct50 / 2100,
          // pct25: d.pct25 / 2000,
          pct50: d.pct50 / 2000,
          pct75: d.pct75 / 2000,
          pct95: d.pct75 / 1900
        };
      });
    
      var markerPromise = d3.json('assets/markers.json');
      markerPromise.then(function(markerData){
        console.log("markerData: ", markerData);
        var markers = markerData.map(function (marker) {
          return {
            date: parseDate(marker.date),
            type: marker.type,
            version: marker.version
          };
        });
    
        this.makeChart(line1,line2, markers);
      }.bind(this));
    });
    // if (this.data) {
    //   this.updateChart();
    // }
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
  
  drawPaths (svg, data, x, y) {
    var upperOuterArea = d3.area()
      .x ((d: any) => x(d.date) || 1)
      .y0((d: any) => y(d.pct95))
      .y1((d: any) => y(d.pct75));

    var upperInnerArea = d3.area()
      .x ((d: any) => x(d.date) || 1)
      .y0((d: any) => y(d.pct75))
      .y1((d: any) => y(d.pct50));

    var medianLine = d3.line()
      .x((d: any) => x(d.date) || 1)
      .y((d: any) => y(d.pct50));
  
    // var lowerInnerArea = d3.svg.area()
    //   .interpolate('basis')
    //   .x (function (d) { return x(d.date) || 1; })
    //   .y0(function (d) { return y(d.pct50); })
    //   .y1(function (d) { return y(d.pct25); });
  
    var lowerOuterArea = d3.area()
      .x ((d: any) => x(d.date) || 1)
      .y0((d: any) => y(d.pct50))
      .y1((d: any) => y(d.pct05));

    console.log("svg: ", svg);
    svg.datum(data);
  
    svg.append('path')
      .attr('class', 'area upper outer')
      .attr('d', upperOuterArea)
      .attr('clip-path', 'url(#rect-clip)');
  
    svg.append('path')
      .attr('class', 'area lower outer')
      .attr('d', lowerOuterArea)
      .attr('clip-path', 'url(#rect-clip)');
  
    svg.append('path')
      .attr('class', 'area upper inner')
      .attr('d', upperInnerArea)
      .attr('clip-path', 'url(#rect-clip)');
  
    // svg.append('path')
    //   .attr('class', 'area lower inner')
    //   .attr('d', lowerInnerArea)
    //   .attr('clip-path', 'url(#rect-clip)');
  
    // svg.append('path')
    //   .attr('class', 'median-line')
    //   .attr('d', medianLine)
    //   .attr('clip-path', 'url(#rect-clip)');
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
  
  makeChart (data,data1, markers) {
    var svgWidth  = 960,
        svgHeight = 500,
        margin = { top: 20, right: 20, bottom: 40, left: 40 },
        chartWidth  = svgWidth  - margin.left - margin.right,
        chartHeight = svgHeight - margin.top  - margin.bottom;
  
    var x = d3.scaleTime().range([0, chartWidth])
                .domain(d3.extent(data, (d:Date) => d.date)),
              //.domain([new Date("January 1, 1940 00:00:00"), new Date("January 4, 1980 00:00:00")]),
              //.domain(d3.extent(data, (d:Date) => d)),
        y = d3.scaleLinear().range([chartHeight, 0])
              .domain([0, d3.max(data, (d: number) => d.pct95)]);
              //.domain(d3.extent(data, function (d) { return d.date; })),
              console.log("d3.extent(data, (d:Date) => d): ", d3.extent(data, (d:Date) => d.date));
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
    this.drawPaths(svg, data, x, y);
    this.drawPaths(svg, data1, x, y);
    this.startTransitions(svg, chartWidth, chartHeight, rectClip, markers, x);

    svg.append("rect")
    .attr("transform", "translate(0, " + (chartHeight + margin.bottom) + ")")
    .attr("class", "mover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", 40)
    .attr("width", Math.round(2 * chartWidth)/data.length)
    .attr("pointer-events", "all")
    .attr("cursor", "ew-resize")
    .call(d3.drag().on("drag", this.display));
    
  }
  
  display () {
    var x = parseInt(d3.select(this).attr("x")),
        nx = x + d3.event.dx,
        w = parseInt(d3.select(this).attr("width")),
        f, nf, new_data, rects;

    if ( nx < 0 || nx + w > width ) return;

    d3.select(this).attr("x", nx);

    f = displayed(x);
    nf = displayed(nx);

    if ( f === nf ) return;

    new_data = data.slice(nf, nf + numBars);

    xscale.domain(new_data.map(function (d) { return d.label; }));
    diagram.select(".x.axis").call(xAxis);

    rects = bars.selectAll("rect")
      .data(new_data, function (d) {return d.label; });

	 	rects.attr("x", function (d) { return xscale(d.label); });

// 	  rects.attr("transform", function(d) { return "translate(" + xscale(d.label) + ",0)"; })

    rects.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return xscale(d.label); })
      .attr("y", function (d) { return yscale(d.value); })
      .attr("width", xscale.rangeBand())
      .attr("height", function (d) { return height - yscale(d.value); });

    rects.exit().remove();
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
    this.xScale.domain(this.data.map(d => d[0]));
    this.yScale.domain([0, d3.max(this.data, d => d[1])]);
    this.colors.domain([0, this.data.length]);
    this.xAxis.transition().call(d3.axisBottom(this.xScale));
    this.yAxis.transition().call(d3.axisLeft(this.yScale));

    let update = this.chart.selectAll('.bar')
      .data(this.data);

    // remove exiting bars
    update.exit().remove();

    // update existing bars
    this.chart.selectAll('.bar').transition()
      .attr('x', d => this.xScale(d[0]))
      .attr('y', d => this.yScale(d[1]))
      .attr('width', d => this.xScale.bandwidth())
      .attr('height', d => this.height - this.yScale(d[1]))
      .style('fill', (d, i) => this.colors(i));

    // add new bars
    update
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.xScale(d[0]))
      .attr('y', d => this.yScale(0))
      .attr('width', this.xScale.bandwidth())
      .attr('height', 0)
      .style('fill', (d, i) => this.colors(i))
      .transition()
      .delay((d, i) => i * 10)
      .attr('y', d => this.yScale(d[1]))
      .attr('height', d => this.height - this.yScale(d[1]));
  }

}
