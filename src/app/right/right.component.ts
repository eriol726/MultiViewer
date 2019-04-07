import { Component, AfterViewInit, Input, ViewChildren, OnInit, ViewEncapsulation, ElementRef, ViewChild, QueryList, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { AppComponent} from "../app.component";
import { Injectable } from '@angular/core';
import { LeftComponent } from "../left/left.component";
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IExpansionPanelEventArgs, IgxExpansionPanelComponent } from "igniteui-angular";

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
      if(index>0){
        let CM = this.elRef.nativeElement.querySelector("[id=" + CSS.escape(index.toString()) +"]");
        CM.contentWindow.document.getElementsByClassName("arrow")[0].setAttribute("visibility" , "hidden");
        CM.contentWindow.document.getElementsByClassName("preview")[0].setAttribute("visibility" , "hidden");
        CM.contentWindow.document.getElementById("switch").setAttribute("visibility" , "hidden");
        CM.contentWindow.document.getElementById("switch-background").setAttribute("visibility" , "hidden");
        CM.contentWindow.document.getElementsByTagName("image")[0].style.visibility = "hidden";
      }

      let fixedHeaderheigh = this.elRef.nativeElement.querySelector('.mat-expansion-panel-header').offsetHeight;
      let fixedHeaderheigh0 = this.elRef.nativeElement.querySelector('#mat-expansion-panel-header-0').offsetHeight;
      let fixedHeaderheigh1 = this.elRef.nativeElement.querySelector('[id="mat-expansion-panel-header-0"]').offsetHeight;
      let initPanelHeightNmbr = document.getElementById('mat-expansion-panel-header-0').offsetHeight;
      console.log("initPanelHeightNmbr: ", initPanelHeightNmbr);
      this.initPanelItemHeight =  initPanelHeightNmbr+"px";
      //let numberOne: number = 1;
      //let CM1 = document.getElementById('1');
      
    
  }

  ngOnChanges() {
    
  }

  ngAfterViewInit(){
    

    this.iframes.changes.subscribe(result =>{
      //console.log("result: ", result._results[0].nativeElement)
    })
    
    this.display.expandItem().subscribe(data=>{
      
      
      // this.elRef.nativeElement.querySelector('#mat-expansion-panel-header-0').style.height = "216px";
      
      this.isExpanded = data.state;
      this.openPanelIndex = data.closedIndex;


      this.panelHeight2 = this.initPanelItemHeight;
      
      

      if(this.panelOpenState == false){
        this.panelOpenState = true;
        console.log("open panel: ", this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' +0));
        this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' +0).contentWindow.document.firstChild.style.background = "#f4f4f4"
        
        for (let i = 0; i < this.done1.length; i++) {
          // remove all exept from the opened
          if(i != data.closedIndex ){
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
          console.log("i: ", i, "this.done1.length :", this.done1.length);
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
        for (let i = 0; i < this.done1.length; i++) {
            this.elRef.nativeElement.querySelector('#panel_'+i).style.height = "100%";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.flex = "1";
            this.elRef.nativeElement.querySelector('#panel_'+i).style.setProperty('margin-bottom', '20px', 'important');
        }
      }  
  
        
    });
    
    this.display.moveItem().subscribe(data=>{
      if(data.type === "changeDone"){
        console.log("data.previousIndex: ", data.previousIndex, " \n data.currentIndex: ", data.currentIndex);
        moveItemInArray(this.done1, data.previousIndex, data.currentIndex);
      }
      else if(data.type === "add"){
        transferArrayItem(this.done1,
          [],
          data.previousIndex,
          data.currentIndex);

      } else if(data.type === "remove"){
        //this.done1.content = data.containerData;
      }
    });

    this.display.maximizeChart().subscribe(data=>{
      if(this.hideChart){
        this.hideChart = false;
        this.hidePanel = true;
      }
      else{
        this.hideChart = true;
        this.hidePanel = false;
      }
      
    })

    this.display.swipeCM().subscribe(index =>{
      
      console.log("swipe index: ", index);
      console.log("CM: ",this.elRef.nativeElement.querySelector('#card'+index));

      
      
      
      switch (index) {
        case 0:
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 0).contentWindow.document.firstChild.style.background = "#f4f4f4";
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 1).contentWindow.document.firstChild.style.background = "#fff";
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 2).contentWindow.document.firstChild.style.background = "#fff";
          break;
        case 1:
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 1).contentWindow.document.firstChild.style.background = "#f4f4f4";
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 0).contentWindow.document.firstChild.style.background = "#fff";
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 2).contentWindow.document.firstChild.style.background = "#fff";
          break;
        case 2:
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 2).contentWindow.document.firstChild.style.background = "#f4f4f4";
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 0).contentWindow.document.firstChild.style.background = "#fff";
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 1).contentWindow.document.firstChild.style.background = "#fff";
          break;
      
        default:
          break;
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

  

}
