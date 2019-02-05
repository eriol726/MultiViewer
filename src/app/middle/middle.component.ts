import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-middle',
  templateUrl: './middle.component.html',
  styleUrls: ['./middle.component.css']
})
export class MiddleComponent implements OnInit {

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

  getData(){
    return Math.random();
  }

  basicChart() {
    const chartElm = this.el.nativeElement

    const data = [{
      x: [1, 2, 3, 4, 5],
      y: [1, 2, 4, 8, 16]
    }]

    const style = {
      margin: { t: 0 }
    }

    Plotly.plot(chartElm,[{
      y:[this.getData()],
      type:"scatter"
    }]);
  
    var cnt = 0;
    setInterval(function(){
        Plotly.extendTraces(chartElm,{ y:[[this.getData()]]}, [0]);
        cnt++;
        if(cnt > 500) {
            Plotly.relayout(chartElm,{
                xaxis: {
                    range: [cnt-500,cnt]
                }
            });
        }
    }.bind(this),15);
  }

  // Plotly.plot('chart', [{
  //   y:[getData()],
  //   type:'line'
  // }]);

}
