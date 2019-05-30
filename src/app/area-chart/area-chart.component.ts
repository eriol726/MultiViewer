import { Component, OnInit, ElementRef, ViewChildren, ViewChild, Input, Renderer2, Injectable } from '@angular/core';
import { BAGS } from 'src/data/bags';
import * as d3 from 'd3';
import { WebsocketService } from '../websocket.service';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.css']
})

// @Injectable()
export class AreaChartComponent implements OnInit {

  @ViewChild('chartContainer') private chartContainer: ElementRef;
  @ViewChild('chart') private mainChart: ElementRef;

  private panelIndex : number = 0;
  private margin2: Margin;

  private width: number = 0;
  private height: number;
  private height2: number;

  private svg: any;     // TODO replace all `any` by the right type

  private x: any;
  private x2: any;
  private y: any;
  private y2: any;

  private collisionArea: any;
  private focus: any;

  private outerUpperArea: any;
  private innerArea: any;
  private outerLowerArea: any;
  private outerUpperArea2: any;
  private outerLowerArea2: any;
  private innerArea2: any;

  private panelOpenState = true;
  private curveFactorBlue = -20;
  private curveFactorOrange = -20;

  private collisionStart = 200;
  private collisionFadeFrontStop = 220;

  private collisionFadeEndStart = 330;
  private collisionEnd = 340;

  //private curveFactor
  private lockedCM = [{"locked": false, "graphFactor": 25},
                      {"locked": false, "graphFactor": 88},
                      {"locked": false, "graphFactor": 65},
                      {"locked": false, "graphFactor": 60},
                      {"locked": false, "graphFactor": 10},
                      {"locked": false, "graphFactor": 20}];

  public isExpanded: number = -1;
  public thePanel;

  private curveFactorLocked: number = 0;
  private interpolationMethod= d3.curveCardinal;

  private fadeFrontNumbers = new Array();
  private fadeEndNumbers = new Array();

  constructor(private elRef:ElementRef,
              private renderer:Renderer2,
              private socketService:WebsocketService ) { }
  
  ngOnInit(){
    this.initSvg();
    this.drawChart();
  }

  changeCurveConflict(){
    this.focus.select('.areaOuterUpper2').attr('d', this.outerUpperArea2.bind(this));
    this.focus.select('.areaOuterLower2').attr("d", this.outerLowerArea2.bind(this));
    this.focus.select('.areaInner2').attr("d", this.innerArea2.bind(this));

    this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {

      if(i>= this.collisionStart && i <= this.collisionEnd  ){
        return this.y(BAGS[7].values[i].bags+this.curveFactorBlue);
      }
      else{
        return this.y(BAGS[0].values[i].bags);
      }
    }));
  }

  expandTaskPanel(index){

    this.curveFactorOrange = 0;
    this.createFadeFront(this.curveFactorOrange);
    this.createFadeEnd(this.curveFactorOrange);
    this.focus.select('.areaOuterUpper').attr('d', this.outerUpperArea.bind(this));
    this.focus.select('.areaInner').attr('d', this.innerArea.bind(this));
    this.focus.select('.areaOuterLower').attr('d', this.outerLowerArea.bind(this));

    if(!this.panelOpenState ){
      
      this.curveFactorBlue = this.curveFactorLocked;
    }else{
      this.curveFactorBlue = this.lockedCM[index].graphFactor;
    }

    if(this.panelOpenState){

      for (let i = 0; i < this.lockedCM.length; i++) {
        
        if(this.lockedCM[i].locked && i != index  ){
          console.log("unlock");
          this.curveFactorBlue =  this.lockedCM[index].graphFactor + this.curveFactorLocked;
          break;
        }
        else{
          console.log("locked");
        }
      }
      
    }
    if(this.lockedCM[index].locked ){
      this.curveFactorBlue =   this.curveFactorLocked;
    }

    this.createFadeFront(this.curveFactorBlue);
    this.createFadeEnd(this.curveFactorBlue);

    // set plane icons to green
    if(this.curveFactorBlue > 60 ){
      this.socketService.sendPlaneIcon(true);
    }
    else{
      this.socketService.sendPlaneIcon(false);
    }

    this.changeCurveConflict()

  }

  private createFadeFront(curveFactor){
    let size = this.collisionFadeFrontStop+1 -this.collisionStart;
    const a: number[] = [];
    this.fadeFrontNumbers = [];
    let step = curveFactor/size;
    let sumStep = 0;
    for (let index = 0; index < size; index++) {
      sumStep = sumStep + step;
      this.fadeFrontNumbers.push(sumStep); 
    }
    return this.fadeFrontNumbers;
  }

  private createFadeEnd(curveFactor){
    
    let size = this.collisionEnd+1-this.collisionFadeEndStart;
    const a: number[] = [];
    this.fadeEndNumbers = [];
    let step = curveFactor/size;
    let sumStep = curveFactor;
    for (let index = 0; index < size; index++) {
      sumStep = sumStep - step;
      this.fadeEndNumbers.push(sumStep); 
    }
    return this.fadeEndNumbers;
  }

  rampFunction(i,curveIndex,curveFactor){

    if(i> this.collisionStart && i < this.collisionFadeFrontStop  ){
      return this.y(BAGS[curveIndex].values[i].bags+this.fadeFrontNumbers[i-this.collisionStart]);
    }
    else if(i>= this.collisionFadeFrontStop && i <=  this.collisionFadeEndStart  ){
      return this.y(BAGS[curveIndex].values[i].bags+curveFactor);
    }
    else if(i> this.collisionFadeEndStart  && i < this.collisionEnd ){
      return this.y(BAGS[curveIndex].values[i].bags+ this.fadeEndNumbers[i-this.collisionFadeEndStart-1]);
    }
    else{
      return this.y(BAGS[curveIndex].values[i].bags);
    }
  }

  rampFunctionCollision(i,curveIndex,collisionFadeFront,collisionFadeEnd){
    if(i>= this.collisionStart && i < this.collisionFadeFrontStop  ){
      return this.y(BAGS[curveIndex].values[i].bags - collisionFadeFront[this.collisionFadeFrontStop-i-1] );
    }
    else if(i>= this.collisionFadeFrontStop && i <= this.collisionFadeEndStart && this.panelOpenState){
      return this.y(BAGS[curveIndex].values[i].bags);
    }
    else if(i> this.collisionFadeEndStart  && i <= this.collisionEnd ){
      return this.y(BAGS[curveIndex].values[i].bags - collisionFadeEnd[this.collisionEnd-i]);
    }
    else{
      return this.y(BAGS[0].values[i].bags);
    }
  }

  private initSvg() {
    this.svg = d3.select("svg");
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    this.svg.attr("viewBox", "0 0 "+screenWidth+" "+screenHeight)

    this.margin2 = {top: 430, right: 20, bottom: 30, left: 40};
    
    this.width = this.chartContainer.nativeElement.offsetWidth;
    this.height = +500;// - this.margin.top - this.margin.bottom;
    this.height2 = +500 -this.margin2.top - this.margin2.bottom;

    // this.x is a function, not a variable
    // this.x are bind to all area graph element
    // when we change the x domain all area elements will change
    this.x = d3.scaleTime().range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);

    let frontFadeMax = BAGS[0].values[this.collisionFadeFrontStop].bags;
    let frontFadeMin = BAGS[7].values[this.collisionFadeFrontStop].bags;
    let collisionFadeFront = this.createFadeFront(frontFadeMax-frontFadeMin);
    let endFadeMax = BAGS[0].values[this.collisionFadeEndStart].bags;
    let endFadeMin = BAGS[7].values[this.collisionFadeEndStart].bags;
    let collisionFadeEnd = this.createFadeEnd(endFadeMax-endFadeMin);

    // colission curve
    this.collisionArea = d3.area()
      .curve(this.interpolationMethod)
      .x((d:any) => this.x(d.date)-0)
      .y0((d:any, i:number) => {
        return this.rampFunctionCollision(i,7,collisionFadeFront,collisionFadeEnd);
      })
      .y1((d:any, i:number) => {
        return this.rampFunctionCollision(i,0,collisionFadeFront,collisionFadeEnd);
      });
    
    // first curve
    this.outerUpperArea = d3.area()
    .curve(this.interpolationMethod)
    .x((d: any) => this.x(d.date))
    .y0((d: any, i: number) => {
      return this.rampFunction(i,0,this.curveFactorOrange);
    })
    .y1((d: any, i: number) => {
      return this.rampFunction(i,1,this.curveFactorOrange);
    });

    this.innerArea = d3.area()
      .curve(this.interpolationMethod)
      .x(function(d: any){ 
        return this.x(d.date);
      }.bind(this))
      .y0((d: any, i:number) => {
        if(i < 90){
          // to fix the with of the tiny curve start 
          return this.y(d.bags)+7;
        }
        else{
          return this.rampFunction(i,1,this.curveFactorOrange);
        }
      })
      .y1((d: any, i:number) => {
        return this.rampFunction(i,2,this.curveFactorOrange);
      });

    this.outerLowerArea = d3.area()
      .curve(this.interpolationMethod)
      .x((d: any) => this.x(d.date) )
      .y0((d: any, i:number) => {
        return this.rampFunction(i,2,this.curveFactorOrange);
      })
      .y1((d: any, i:number) => {
        return this.rampFunction(i,3,this.curveFactorOrange);
      });


    //second curve
    this.outerUpperArea2 = d3.area()
      .curve(this.interpolationMethod)
      .x((d: any) => this.x(d.date) )
      .y0((d: any, i:number) => {
        return this.rampFunction(i,4,this.curveFactorBlue);
        
      })
      .y1((d: any, i:number) => {
        return this.rampFunction(i,5,this.curveFactorBlue);
      });

    this.innerArea2 = d3.area()
      .curve(this.interpolationMethod)
      .x((d: any) => this.x(d.date))
      .y0((d: any, i:number) => {
        if(i < 90){
          return this.y(d.bags)+7;
        }else{
          return this.rampFunction(i,5,this.curveFactorBlue);
        }
      })
      .y1((d: any, i:number) => {
        return this.rampFunction(i,6,this.curveFactorBlue);
      });
    
    this.outerLowerArea2 = d3.area()
      .curve(this.interpolationMethod)
      .x((d: any) => this.x(d.date) )
      .y0((d: any, i:number) => {
        return this.rampFunction(i,6,this.curveFactorBlue);
      })
      .y1((d: any, i:number) => {
        return this.rampFunction(i,7,this.curveFactorBlue);
      });
    
    this.svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height);

    // translating down the graph to let the data stay in the foucs area when a extrem CM is selected
    this.focus = this.svg.append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate(' + 0 + ',' + 0 + ')');
  }

  private async drawChart() {

    this.x.domain(d3.extent(BAGS[0].values, function(d:any) { return d.date; }));
    this.y.domain([0, d3.max(BAGS[0].values, function(d:any) { return d.bags; })]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());

    this.svg = d3.select("svg");

    // collision area
    this.curveFactorBlue = -62;
    this.focus.append("clipPath")
      .datum(BAGS[7].values)
      .attr("id", "clip-below")
      .append("path")
      .attr("class", "clip-below1");

    this.focus.append("clipPath")
      .datum(BAGS[0].values)
      .attr("id", "clip-above")
      .append("path")
      .attr("class", "clip-above1");

    this.focus.append("path")
      .datum(BAGS[0].values)
      .attr('id', 'hash4_5')
      .attr("x", 0)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#hash4_6)")
      .attr("clip-path", "url(#clip-above)")
      .attr("d", this.collisionArea)

    // line pattern
    this.focus.append("pattern")
      .attr('id', "hash4_6")
      .attr('width', "4") 
      .attr('height',"4")
      .attr('patternUnits',"userSpaceOnUse") 
      .attr('patternTransform', "rotate(45)")
      .append("rect")
      .attr("id","diagonalRect")
      .attr("width","0.6")
      .attr("height", "4")
      .attr("transform", "translate(0,0)")
      .attr("fill", "#000")

    // first curve
    this.curveFactorOrange = -62;
    this.createFadeFront(this.curveFactorOrange);
    this.createFadeEnd(this.curveFactorOrange);

    this.focus.append('path')
      .datum(BAGS[0].values)
      .attr('class', 'areaOuterUpper')
      .attr('d',this.outerUpperArea)
      .attr('clip-path', 'url(#rect-clip)');
      
    this.focus.append('path')
      .datum(BAGS[1].values)
      .attr('class', 'areaInner')
      .attr('d',this.innerArea)
      .attr('clip-path', 'url(#rect-clip)');
      
    this.focus.append('path')
      .datum(BAGS[3].values)
      .attr('class', 'areaOuterLower')
      .attr('d',this.outerLowerArea)
      .attr('clip-path', 'url(#rect-clip)');

    //next curve
    this.curveFactorBlue = 0;
    this.createFadeFront(this.curveFactorBlue);
    this.createFadeEnd(this.curveFactorBlue);

    this.focus.append('path')
      .datum(BAGS[4].values)
      .attr('class', 'areaOuterUpper2')
      .attr('d',this.outerUpperArea2)
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(BAGS[5].values)
      .attr('class', 'areaInner2')
      .attr('d',this.innerArea2)
      .attr('clip-path', 'url(#rect-clip)');

    this.focus.append('path')
      .datum(BAGS[7].values)
      .attr('class', 'areaOuterLower2')
      .attr('d',this.outerLowerArea2)
      .attr('clip-path', 'url(#rect-clip)');

    this.curveFactorBlue = 62;
    if(this.panelOpenState || this.lockedCM[0]){
      this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => {
        if(i>= this.collisionStart && i <= this.collisionEnd ){
          return this.y(BAGS[7].values[i].bags+this.curveFactorBlue);
        }
        else{
          return this.y(BAGS[0].values[i].bags);
        }
      }));
    }else{
      this.focus.select('#hash4_5').attr('d', this.collisionArea.y0((d:any, i:number) => this.y(BAGS[7].values[i].bags)).bind(this));
    }

    this.focus.select('.clip-below1').attr('d', this.collisionArea.y0(0).bind(this));
    this.focus.select('.clip-above1').attr('d', this.collisionArea.y0(this.height).bind(this));
  }


  lockCM(index){

    if(this.lockedCM[index].locked){
      this.lockedCM[index].locked = false;
      this.curveFactorLocked -= this.lockedCM[index].graphFactor;
    }
    else{
      this.lockedCM[index].locked = true;
      this.curveFactorLocked += this.lockedCM[index].graphFactor;  
    }
  }

  ngAfterViewInit(){

    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;
    //this.elRef.nativeElement.querySelector("svg").setAttribute("viewBox", "0 0 "+screenWidth+" "+screenHeight);

    this.socketService.expandPanelItem().subscribe(data=>{

      if(data.isExpanded != -1){
        this.panelOpenState = true;
        this.expandTaskPanel(data.isExpanded);
      }else{
        this.panelOpenState = false;
        this.expandTaskPanel(data.panelIndex);
      }
    });

    this.socketService.moveItem().subscribe(data=>{
      this.lockCM(data.currentIndex);
      this.expandTaskPanel(data.currentIndex);
    })

    this.socketService.lockCM().subscribe(data=>{
      this.lockCM(data.state);
    })

    this.socketService.changeMessage().subscribe(data=>{
      if(data.messageIndex ==2 || data.messageIndex == 1 ){
        
        this.panelOpenState = true;
        this.expandTaskPanel(data.graphFactor);
      }
    })
  }
}
