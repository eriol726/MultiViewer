import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output  } from '@angular/core';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-middle',
  templateUrl: './middle.component.html',
  styleUrls: ['./middle.component.css']
})
export class MiddleComponent implements OnInit {
  @Output() childEvent = new EventEmitter();
  @Input() graphDataOriginal;
  @Input() graphDataImproved;  
  @ViewChild('chart') el: ElementRef;

  public graph = {
    data: [
        { x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', mode: 'lines+points', marker: {color: 'red'} },
        { x: [1, 2, 3], y: [2, 5, 3], type: 'bar' },
    ],
    layout: {width: 320, height: 240, title: 'A Fancy Plot'}
  };

  constructor() { }

  ngOnInit() {
    this.basicChart();
  }

  changeColor(style){
    Plotly.restyle('chart', style, [0]);
  }

  basicChart() {
    var grayColor = '#ab63fa';
    Plotly.plot('chart',[
      {
        y:[this.graphDataOriginal],
        type:"scatter",
        fill: 'tozeroy',
        fillcolor: '#ab63fa',
        line: {
          color: '#ab63fa'
        }

      },
      {
        y:[this.graphDataImproved],
        type:"scatter",
        fill: 'tozeroy',
        fillcolor: '#ab63fa',
        line: {
          color: '#ab63fa'
        }
      }
    ]);

    var cnt = 0;
    setInterval(function(){
        Plotly.extendTraces('chart',{ y:[[this.graphDataOriginal], [this.graphDataImproved]]} , [0,1]);
        cnt++;

        Plotly.relayout('chart',{
            xaxis: {
                range: [cnt-50,cnt]
            },
            yaxis: {
                range: [-0.2,1]
            }
        });
 
    }.bind(this),15);
  }

  // Plotly.plot('chart', [{
  //   y:[getData()],
  //   type:'line'
  // }]);

}
