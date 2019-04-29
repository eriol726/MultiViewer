import { Component, AfterViewInit, Input, ViewChildren, OnInit, ViewEncapsulation, ElementRef, ViewChild, QueryList, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { AppComponent} from "../app.component";
import { Injectable } from '@angular/core';
import { LeftComponent } from "../left/left.component";
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IExpansionPanelEventArgs, IgxExpansionPanelComponent } from "igniteui-angular";
import { NavigationStart } from '@angular/router';

@Component({
  selector: 'app-right',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})

export class RightComponent implements OnInit, AfterViewInit {
  // @Input() tasks: string;
  @ViewChildren('iframe') iframes: QueryList<any>;
  openPanelIndex: number;
  @ViewChildren(IgxExpansionPanelComponent) public accordion: QueryList<IgxExpansionPanelComponent>;

  @ViewChildren('panel') panel;
  @ViewChild('panelRight') panelRight;
  @ViewChildren('panelHeader') panelheader: QueryList<any>;
  open: any = [];

  done1 = [];

  private panelOpenState = false;
  public isExpanded: number  = -1;
  public hideChart: boolean = true;
  public hidePanel: boolean = false;
  public panelHeight2: string =  "0px";
  private initPanelItemHeight: string = "0px";

  constructor(private actionService : ActionService, private display : WebsocketService, private elRef:ElementRef, private cdRef:ChangeDetectorRef) {
  }

  show(index){
    if(this.panel._results[index].expanded == false){
      this.panel._results[index].expanded = true;
    }
    else{
      this.panel._results[index].expanded = false;
    }
    
    console.log("index: ", index , " " , this.panel._results[index]);
  }

  loadIframe(index){

      console.log("i: ", index)


      if(document.getElementById('mat-expansion-panel-header-0')){
        let initPanelHeightNmbr = document.getElementById('mat-expansion-panel-header-0').offsetHeight;
        console.log("initPanelHeightNmbr: ", initPanelHeightNmbr);
        this.initPanelItemHeight =  initPanelHeightNmbr+"px";
      }
      
      //let numberOne: number = 1;
      //let CM1 = document.getElementById('1');
      
    
  }

  ngOnChanges() {
    
  }

  ngAfterViewInit(){
    this.display.reloadPage().subscribe(reload =>{
      console.log("reload");
      if (event instanceof NavigationStart) {
        window.location.reload();
      }
      
    })

    this.iframes.changes.subscribe(result =>{
      //console.log("result: ", result._results[0].nativeElement)
    })
    
    this.display.expandItem().subscribe(data=>{
      
      // this.elRef.nativeElement.querySelector('#mat-expansion-panel-header-0').style.height = "216px";
      
      this.isExpanded = data.state;
      this.openPanelIndex = data.closedIndex;

      this.panelHeight2 = this.initPanelItemHeight;
      
      
      let expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+(this.openPanelIndex));

      if(data.state != -1){
        this.panelOpenState = true;
        
        // set the first card background to gray
        this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' +0).contentWindow.document.children[0].style.background = "#f4f4f4";
        
        
        
      
        for (let i = 0; i < this.done1.length; i++) {
          if(i == data.closedIndex){
            console.log("mainSvg: ", expandedPanelItemLeft);
            expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "hidden");
          }
          
          // remove all exept from the opened
          if(i != data.closedIndex ){
            let closedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+i);
            closedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
            this.elRef.nativeElement.querySelector('#panel_'+i).style.height = "0px";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.flex = "0";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.setProperty('margin-bottom', '0px', 'important');
          }

          //show the item under clicked item
          if(i == data.closedIndex+1){
            this.elRef.nativeElement.querySelector('#panel_'+i).style.height = "100%";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.flex = "0.25";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.setProperty('margin-bottom', '20px', 'important');
          }

          if(data.closedIndex == this.done1.length-1){
            
            this.elRef.nativeElement.querySelector('#panel_'+(this.done1.length-2)).style.height = "100%";
            this.elRef.nativeElement.querySelector('#panel_'+(this.done1.length-2)).style.flex = "0.25";
            this.elRef.nativeElement.querySelector('#panel_'+(this.done1.length-2)).style.setProperty('margin-bottom', '20px', 'important');
          }
        }

      }
      else{
        // get back to normal panel state
        this.panelOpenState = false;
        expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
        for (let i = 0; i < this.done1.length; i++) {
            this.elRef.nativeElement.querySelector('#panel_'+i).style.height = "100%";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.flex = "1";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.setProperty('margin-bottom', '20px', 'important');
        }
      }  
  
        
    });
    
    this.display.moveItem().subscribe(data=>{
      console.log("data: ", data.currentIndex);
      this.elRef.nativeElement.querySelector("#iframeOverlay_right_"+data.currentIndex).style.backgroundColor = "rgba(217,217,217,0.68)";
      this.isExpanded = -1;
      this.panelOpenState = false;
      let expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+(this.openPanelIndex));
        expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
        for (let i = 0; i < this.done1.length; i++) {
            this.elRef.nativeElement.querySelector('#panel_'+i).style.height = "100%";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.flex = "1";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.setProperty('margin-bottom', '20px', 'important');
        }
    });

    this.display.maximizeChart().subscribe(data=>{
      if(!this.hidePanel){
        this.hideChart = false;
        this.hidePanel = true;
      }
      else{
        this.hideChart = true;
        this.hidePanel = false;
      }
      
    })

    this.display.swipeCM().subscribe(currentCardIndex =>{
      // changing background for swiped card
      console.log("swipe index: ", this.done1);

      for (let cardIndex = 0; cardIndex < this.done1[this.openPanelIndex].cards; cardIndex++) {
        if(currentCardIndex == cardIndex){
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + currentCardIndex).contentWindow.document.firstChild.style.background = "#f4f4f4";
        }
        else{
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + cardIndex).contentWindow.document.firstChild.style.background = "";
        }
        
      }
 
    })

    this.display.lockItem().subscribe(data =>{
      console.log("index: ", data);
      if(data.type){
        this.elRef.nativeElement.querySelector('#panel_'+data.state).style.background = "#dce5ea";
      }
      else{
        this.elRef.nativeElement.querySelector('#panel_'+data.state).style.background = "";
      }
      
      
    })

    
      
    
  }

  expandTaskPanel(index){


    
  }

  ngAfterViewChecked()
  {
    // this.cdRef.detectChanges();
  }

  ngOnInit(){

    const CMmeasures = this.actionService.getCountermeasures();
    CMmeasures.subscribe(doneData => {
      this.done1 = doneData;
      console.log("this.done: ", this.done1);
    })
    
    
  }

  createRange(number){
    var items: number[] = [];
    for(var i = 1; i <= number; i++){
       items.push(i);
    }
    return items;
  }

  

}