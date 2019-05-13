import { Component, AfterViewInit, Input, ViewChildren, OnInit, ViewEncapsulation, ElementRef, ViewChild, QueryList, ChangeDetectorRef, AfterContentChecked, Inject, Renderer2 } from '@angular/core';
import { AppComponent} from "../app.component";
import { Injectable } from '@angular/core';
import { LeftComponent } from "../left/left.component";
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IExpansionPanelEventArgs, IgxExpansionPanelComponent } from "igniteui-angular";
import { NavigationStart } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-right',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})

export class RightComponent implements OnInit, AfterViewInit {
  // @Input() tasks: string;
  @ViewChildren('iframe') iframes;
  openPanelIndex: number;
  @ViewChildren(IgxExpansionPanelComponent) public accordion: QueryList<IgxExpansionPanelComponent>;

  @ViewChildren('panel') panel;
  @ViewChild('panelRight') panelRight;
  @ViewChild('firstItemIframe') firstItemIframe: ElementRef;
  @ViewChildren('panelHeader') panelheader: QueryList<any>;
  open: any = [];

  done1 = [];

  private panelOpenState = false;
  public isExpanded: number  = -1;
  public hideChart: boolean = true;
  public hidePanel: boolean = false;
  public panelHeight2: string =  "100%";
  private initPanelItemHeight: string = "0px";
  expandedPanelItemLeft;
  elem;
  reloaded: boolean;
  svgString;
  isLoaded=false;

  current_url = ""

  constructor(@Inject(DOCUMENT) private document:any, 
                                private sanitizer: DomSanitizer, 
                                private http: HttpClient, 
                                private renderer: Renderer2, 
                                private actionService : ActionService, 
                                private display : WebsocketService, 
                                private elRef:ElementRef, 
                                private cdRef:ChangeDetectorRef) {}

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
    setTimeout(()=>{
      if (!this.isLoaded){
      
        let panelItem_0_left = this.elRef.nativeElement.querySelector("#cm_left_"+0);
        let panelItem_0_right = this.elRef.nativeElement.querySelector("#cm_right_"+0);

        panelItem_0_left.src="assets/Screen/Right/r_0_left_Screen_start.svg";
        panelItem_0_right.src="assets/Screen/Right/r_0_right_Screen_start.svg";
  
  
        if(document.getElementById('mat-expansion-panel-header-0')){
          let initPanelHeightNmbr = document.getElementById('mat-expansion-panel-header-0').offsetHeight;

          this.initPanelItemHeight =  initPanelHeightNmbr+"px";
          console.log("this.initPanelItemHeight: ", this.initPanelItemHeight);
          //this.panelHeight2 = this.initPanelItemHeight;
        }
        this.isLoaded =true;
      }
    },1000)
      
      //let numberOne: number = 1;
      //let CM1 = document.getElementById('1');
      
    
  }

  ngOnChanges() {
    
  }

  switch(){
    console.log("heeeeeej");
  }

  ngAfterViewInit(){

    this.expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+0);

    this.display.prioritize().subscribe(data =>{
      let card1= this.elRef.nativeElement.querySelector("#card3_1");
      let card0= this.elRef.nativeElement.querySelector("#card3_0");
      let cardSwitch_0 =  card0.contentWindow.document.getElementById("card_switch_circle_0");
      let cardSwitch_1 =  card1.contentWindow.document.getElementById("card_switch_circle_1");

      if(data){
        cardSwitch_1.setAttribute("transform", "translate(30,0)")
        cardSwitch_1.setAttribute("fill", "green")

        cardSwitch_0.setAttribute("transform", "translate(-30,0)")
        cardSwitch_0.setAttribute("fill", "#b3b3b3")
      }
      else{
        cardSwitch_1.setAttribute("transform", "translate(0,0)")
        cardSwitch_1.setAttribute("fill", "#b3b3b3")

        cardSwitch_0.setAttribute("transform", "translate(0,0)")
        cardSwitch_0.setAttribute("fill", "green")
      }
    })
    

    setTimeout(()=>{
      let mainSvg = this.elRef.nativeElement.querySelector("#card3_1");
      let cardSwitch =   mainSvg.contentWindow.document.getElementById("card_1_switch");
      const p: HTMLDivElement = this.renderer.createElement('div');
      p.insertAdjacentHTML('beforeend', '<div class="two" (click)="switch()">two</div>');
      this.renderer.appendChild(cardSwitch, p)
      
      this.panelHeight2 = this.initPanelItemHeight;
      this.elRef.nativeElement.querySelector("#iframeOverlay_right_"+0).style.backgroundColor = "rgba(217,217,217,0.68)";
      this.elRef.nativeElement.querySelector("#panel_item_1").style.visibility ="hidden";
      this.elRef.nativeElement.querySelector("#panel_item_2").style.visibility ="hidden";
      this.elRef.nativeElement.querySelector("#panel_item_3").style.visibility ="hidden";
    },1000)

    
    
    this.display.reloadPage().subscribe(reload =>{
      this.reloaded= reload;
      if (this.reloaded) {
        window.location.reload();
        this.reloaded=false;
      }
      
    })

    this.display.switchCCP().subscribe(data =>{
      let panelItem_0_left = this.elRef.nativeElement.querySelector("#cm_left_"+0);
      let panelItem_0_right = this.elRef.nativeElement.querySelector("#cm_right_"+0);
      let doc =  this.iframes._results[0].nativeElement.contentDocument || this.iframes._results[0].nativeElement.contentWindow;
     
      panelItem_0_left.src="assets/Screen/Right/r_0_left_Screen.svg";
      panelItem_0_right.src="assets/Screen/Right/r_0_right_Screen.svg";

      this.elRef.nativeElement.querySelector("#iframeOverlay_right_"+0).style.backgroundColor = "";
      this.elRef.nativeElement.querySelector("#panel_item_1").style.visibility ="visible";
      this.elRef.nativeElement.querySelector("#panel_item_2").style.visibility ="visible";
      this.elRef.nativeElement.querySelector("#panel_item_3").style.visibility ="visible";
    });

    this.iframes.changes.subscribe(result =>{
      //console.log("result: ", result._results[0].nativeElement)
    })
    
    this.display.expandItem().subscribe(data=>{
      
      // this.elRef.nativeElement.querySelector('#mat-expansion-panel-header-0').style.height = "216px";
      
      this.panelManager(data);
      
        
    });
    
    this.display.moveItem().subscribe(data=>{
      console.log("data: ", data.currentIndex);
      this.elRef.nativeElement.querySelector("#iframeOverlay_right_"+data.currentIndex).style.backgroundColor = "rgba(217,217,217,0.68)";
      this.isExpanded = -1;
      this.panelOpenState = false;
      let expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+(this.openPanelIndex));
        expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
        for (let i = 0; i < this.done1.length; i++) {
            this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "100%";
            this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
            this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '20px', 'important');
        }
    });

    this.display.maximizeChart().subscribe(data=>{
      if(!this.hidePanel){
        this.elRef.nativeElement.querySelector(".row").style.height = "calc(100vh - 20px)";
        //this.elRef.nativeElement.querySelector(".row").style.padding = "0px";

        this.hideChart = false;
        this.hidePanel = true;
      }
      else{
        let data = {state: this.isExpanded, closedIndex: this.isExpanded};
        
        this.panelManager(data);
        
        this.hideChart = true;
        this.hidePanel = false;
      }
      
    })


    this.display.swipeCM().subscribe(currentCardIndex =>{
      // changing background for swiped card
      
      currentCardIndex = currentCardIndex-1;
      console.log("swipe index: ", currentCardIndex);
      for (let cardIndex = 0; cardIndex < this.done1[this.openPanelIndex].cards; cardIndex++) {
        if(currentCardIndex == cardIndex ){
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + currentCardIndex).contentWindow.document.firstChild.style.background = "#f4f4f4";
        }
        else if(currentCardIndex == -1){
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + 0).contentWindow.document.firstChild.style.background = "";
        }
        else{
          this.elRef.nativeElement.querySelector('#card'+this.openPanelIndex + '_' + cardIndex).contentWindow.document.firstChild.style.background = "";
        }
        
      }
 
    })

    this.display.lockItem().subscribe(data =>{
      console.log("index: ", data);
      if(data.type){
        this.elRef.nativeElement.querySelector('#panel_item_'+data.state).style.background = "#dce5ea";
      }
      else{
        this.elRef.nativeElement.querySelector('#panel_item_'+data.state).style.background = "";
      }
      
      
    })

    

    
      
    
  }

  expandTaskPanel(index){

  }

  ngAfterViewChecked()
  {
    // this.cdRef.detectChanges();
  }

  async ngOnInit(){
    
    this.elem = document.documentElement;
    
    const CMmeasures = this.actionService.getCountermeasures();
    CMmeasures.subscribe(doneData => {
      this.done1 = doneData;
      console.log("this.done: ", this.done1);
    })

    
  }

  openFullscreen() {

  }

  panelManager(data){
    // -1 when some is closed eighter the index
    this.isExpanded = data.state;
    // always the index no matter if closed/open
    this.openPanelIndex = data.closedIndex;

    this.panelHeight2 = this.initPanelItemHeight;
    
    console.log("this.openPanelIndex: ", data.closedIndex);
    console.log("this.state: ", data.state);
    this.expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+(this.openPanelIndex));
    
    if(data.closedIndex == -1){
      this.openPanelIndex = -1;
      this.expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+0);
    }

    if(data.state != -1){
      this.elRef.nativeElement.querySelector("#panel_item_"+data.closedIndex).firstChild.style.marginBottom  = "-25px";
      this.panelOpenState = true;
      this.elRef.nativeElement.querySelector("#panel_item_"+data.closedIndex)
      
      for (let i = 0; i < this.done1.length; i++) {
        if(i == data.closedIndex){
          console.log("mainSvg: ", this.expandedPanelItemLeft);
          this.expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "hidden");
        }
        
        // remove all exept from the opened
        if(i != data.closedIndex ){
          let closedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+i);
          console.log("closedPanelItemLeft: ", closedPanelItemLeft);
          closedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '0px', 'important');
        }

        //show the item under clicked item
        if(i == data.closedIndex+1){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0.25";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '20px', 'important');
        }

        if(data.closedIndex == this.done1.length-1){
          
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.done1.length-2)).style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.done1.length-2)).style.flex = "0.25";
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.done1.length-2)).style.setProperty('margin-bottom', '20px', 'important');
        }
      }

    }
    else{
      // get back to normal panel state
      
      this.panelOpenState = false;
      this.expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
      for (let i = 0; i < this.done1.length; i++) {
          this.elRef.nativeElement.querySelector("#panel_item_"+i).firstChild.style.marginBottom  = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '20px', 'important');
      }
    }  
  }

  createRange(number){
    var items: number[] = [];
    for(var i = 1; i <= number; i++){
       items.push(i);
    }
    return items;
  }

  

}