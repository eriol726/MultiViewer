import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output  } from '@angular/core';
import * as Plotly from 'plotly.js';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';
import { csvToJson } from 'convert-csv-to-json/src/csvToJson.js';
import { TEMPERATURES } from '../../data/temperatures';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-middle',
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
    this.createChart();
    // if (this.data) {
    //   this.updateChart();
    // }
  }

  ngOnChanges() {
    // if (this.chart) {
    //   this.updateChart();
    // }
  }

  createChart() {

    var tempData = d3.csv("assets/5_OneCatSevNumOrdered_wide.csv", 
      function(d) {
        return d;//{ date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value };
      }
      
    );

    tempData.then(function(finalResult) {
      var dateData = finalResult.map((v) =>  v.year );

      var keys = finalResult.columns.slice(1)

      console.log("finalResult: ", finalResult);
      this.svg = d3.select('svg');

      this.margin = {top: 10, right: 30, bottom: 30, left: 50};
      this.width = 1400 - this.margin.left - this.margin.right;
      this.height = 500 - this.margin.top - this.margin.bottom;

      // append the svg object to the body of the page
      this.svg = d3.select('svg')
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform",
      "translate(" + this.margin.left + "," + this.margin.top + ")");

      console.log("data: ", TEMPERATURES[0].values[0]);
      
      var x = d3.scaleTime()
        .domain(d3.extent(dateData, (d: number) => d ))
        .range([ 0, this.width ]);
        this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x).ticks(5));
        console.log("this.data: ",this.svg);
      // Add Y axis
      // Add Y axis
        var y = d3.scaleLinear()
        .domain([-100000, 100000])
        .range([ this.height, 0 ]);
        this.svg.append("g")
        .call(d3.axisLeft(y));

        // color palette
        var color = d3.scaleOrdinal()
        .domain(keys)
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'])

      //stack the data?
      var stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (finalResult)

        console.log("stackedData: ", stackedData);
        // Add the area
        this.svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
          .style("fill", function(d) { return color(d.key); })
          .attr("d", d3.area()
          .x(function(d, i) { return x(d.data.year); })
          .y0(function(d) { return y(d[0]); })
          .y1(function(d) { return y(d[1]); })
        )

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
