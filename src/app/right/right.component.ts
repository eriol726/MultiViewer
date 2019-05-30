import { Component, AfterViewInit, Input, ViewChildren, OnInit, ViewEncapsulation, ElementRef, ViewChild, QueryList, ChangeDetectorRef, AfterContentChecked, Inject, Renderer2 } from '@angular/core';
import { ActionService } from '../action.service';
import { WebsocketService } from '../websocket.service';
import { IgxExpansionPanelComponent } from "igniteui-angular";

type PanelParamsType = {isExpanded:number, panelIndex:number, locked:boolean};


@Component({
  selector: 'app-right',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})

export class RightComponent implements OnInit, AfterViewInit {
  // @Input() COUNTERMEASURES: string;
  @ViewChildren('iframe') iframes;
  
  @ViewChildren(IgxExpansionPanelComponent) public accordion: QueryList<IgxExpansionPanelComponent>;

  @ViewChildren('panel') panel;
  @ViewChild('panelRight') panelRight;
  @ViewChild('firstItemIframe') firstItemIframe: ElementRef;
  @ViewChildren('panelHeader') panelheader: QueryList<any>;


  public COUNTERMEASURES = [];
  public isExpanded: number  = -1;
  public hidePanel: boolean = false;
  public panelHeight2: string =  "100%";

  private openPanelIndex: number;
  private panelOpenState = false;
  private initPanelItemHeight: string = "0px";
  private expandedPanelItemLeft;
  private elem;
  private reloaded: boolean;
  private isLoaded=false;
  private panelParams: PanelParamsType = {isExpanded:0, panelIndex:0, locked:false};


  constructor(private actionService : ActionService, 
              private display : WebsocketService, 
              private elRef:ElementRef) {}


  loadIframe(index){
      if (!this.isLoaded){
        let initPanelHeightNmbr = document.getElementById('mat-expansion-panel-header-0').offsetHeight;
        this.initPanelItemHeight =  initPanelHeightNmbr+"px";
      
        let panelItem_0_left = this.elRef.nativeElement.querySelector("#cm_left_"+0);
        let panelItem_0_right = this.elRef.nativeElement.querySelector("#cm_right_"+0);

        panelItem_0_left.src="assets/Screen/Right/r_0_left_Screen_start.svg";
        panelItem_0_right.src="assets/Screen/Right/r_0_right_Screen_start.svg";
  
        this.elRef.nativeElement.querySelector("#iframeOverlay_right_"+0).style.backgroundColor = "rgba(217,217,217,0.68)";
        this.elRef.nativeElement.querySelector("#panel_item_1").style.visibility ="hidden";
        this.elRef.nativeElement.querySelector("#panel_item_2").style.visibility ="hidden";
        this.elRef.nativeElement.querySelector("#panel_item_3").style.visibility ="hidden";
      }

      this.isLoaded =true;
  }

  ngAfterViewInit(){

    this.expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+0);

    this.display.prioritize().subscribe(isPrioritized =>{
      let card1= this.elRef.nativeElement.querySelector("#card3_1");
      let card0= this.elRef.nativeElement.querySelector("#card3_0");
      let cardSwitch_0 =  card0.contentWindow.document.getElementById("card_switch_circle_0");
      let cardSwitch_1 =  card1.contentWindow.document.getElementById("card_switch_circle_1");

      if(isPrioritized){
        cardSwitch_1.setAttribute("transform", "translate(30,0)")
        cardSwitch_1.setAttribute("fill", "rgb(64, 189, 115)")

        cardSwitch_0.setAttribute("transform", "translate(-30,0)")
        cardSwitch_0.setAttribute("fill", "#b3b3b3")
      }
      else{
        cardSwitch_1.setAttribute("transform", "translate(0,0)")
        cardSwitch_1.setAttribute("fill", "#b3b3b3")

        cardSwitch_0.setAttribute("transform", "translate(0,0)")
        cardSwitch_0.setAttribute("fill", "rgb(64, 189, 115)")
      }
    })
    
    this.display.reloadPage().subscribe(reload =>{
      this.reloaded= reload;
      if (this.reloaded) {
        window.location.reload();
        this.reloaded=false;
      }
      
    })

    this.display.changeMessage().subscribe(data =>{
      this.expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+0);
      let panelItem_0_left = this.elRef.nativeElement.querySelector("#cm_left_"+0);
      let panelItem_0_right = this.elRef.nativeElement.querySelector("#cm_right_"+0);
     
      panelItem_0_left.src="assets/Screen/Right/r_0_left_Screen.svg";
      panelItem_0_right.src="assets/Screen/Right/r_0_right_Screen.svg";

      this.elRef.nativeElement.querySelector("#iframeOverlay_right_"+0).style.backgroundColor = "";
      this.elRef.nativeElement.querySelector("#panel_item_1").style.visibility ="visible";
      this.elRef.nativeElement.querySelector("#panel_item_2").style.visibility ="visible";
      this.elRef.nativeElement.querySelector("#panel_item_3").style.visibility ="visible";
    });

    
    this.display.expandPanelItem().subscribe(data=>{
      this.panelManager(data);
    });
    
    this.display.moveItem().subscribe(data=>{

      this.elRef.nativeElement.querySelector('#panel_item_'+data.currentIndex).style.backgroundColor = "rgba(217,217,217,0.68)";
      //this.elRef.nativeElement.querySelector("#iframeOverlay_right_"+data.currentIndex).style.backgroundColor = "rgba(217,217,217,0.68)";
      this.isExpanded = -1;
      this.panelOpenState = false;

      // Go back to normal state
      this.panelOpenState = false;
      this.expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
      for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
          this.elRef.nativeElement.querySelector("#panel_item_"+i).firstChild.style.marginBottom  = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "1";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '20px', 'important');
      }
    });

    this.display.maximizeChart().subscribe(data=>{
      if(!this.hidePanel){
        this.elRef.nativeElement.querySelector(".row").style.height = "calc(100vh)";
        this.elRef.nativeElement.querySelector(".row").style.padding = "0px";

        this.hidePanel = true;
      }
      else{
        this.elRef.nativeElement.querySelector(".row").style.height = "calc(100vh - 20px)";
        this.elRef.nativeElement.querySelector(".row").style.padding = "2px 10px 5px 10px";
        this.panelParams.isExpanded = this.isExpanded;
        this.panelParams.panelIndex = 0;
        
        //this.panelManager(this.panelParams);
        
        this.hidePanel = false;
      }
    })


    this.display.changeCard().subscribe(currentCardIndex =>{
      // changing background for swiped card
      
      currentCardIndex = currentCardIndex-1;

      for (let cardIndex = 0; cardIndex < this.COUNTERMEASURES[this.openPanelIndex].cards; cardIndex++) {
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

    this.display.lockCM().subscribe(data =>{
      if(data.type){
        this.elRef.nativeElement.querySelector('#panel_item_'+data.state).style.background = "rgba(217,217,217,0.68)";
      }
      else{
        this.elRef.nativeElement.querySelector('#panel_item_'+data.state).style.background = "";
      }
    })
  }

  ngOnInit(){

    this.elem = document.documentElement;  
    
    const CMmeasures = this.actionService.getCountermeasures();
    CMmeasures.subscribe(CMdata => {
      this.COUNTERMEASURES = CMdata;
    })
  }

  panelManager(data: PanelParamsType){
    // -1 when some is closed eighter the index
    this.isExpanded = data.isExpanded;
    // always the index no matter if closed/open
    this.openPanelIndex = data.panelIndex;
    
    this.expandedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+(this.openPanelIndex));
    
    if(data.isExpanded != -1){
      this.elRef.nativeElement.querySelector("#panel_item_"+data.panelIndex).firstChild.style.marginBottom  = "-25px";
      this.panelOpenState = true;
      this.elRef.nativeElement.querySelector("#panel_item_"+data.panelIndex)
      
      for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
        if(i == data.panelIndex){
          this.expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "hidden");
        }
        
        // hide all exept from the opened
        if(i != data.panelIndex ){
          let closedPanelItemLeft = this.elRef.nativeElement.querySelector("#cm_left_"+i);

          closedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '0px', 'important');
        }

        //show the item under clicked item
        if(i == data.panelIndex+1){
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = this.initPanelItemHeight;
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0.25";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.setProperty('margin-bottom', '20px', 'important');
        }

        // when the last cm is opened
        if(data.panelIndex == this.COUNTERMEASURES.length-1){
          
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.height = this.initPanelItemHeight;
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.flex = "1";
          this.elRef.nativeElement.querySelector('#panel_item_'+(this.COUNTERMEASURES.length-2)).style.setProperty('margin-bottom', '20px', 'important');
        }
      }
    }
    else{
      // get back to normal panel state
      this.panelOpenState = false;
      this.expandedPanelItemLeft.contentWindow.document.getElementById("Clock_Layer").setAttribute("visibility" , "visible");
      for (let i = 0; i < this.COUNTERMEASURES.length; i++) {
          this.elRef.nativeElement.querySelector("#panel_item_"+i).firstChild.style.marginBottom  = "0px";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.height = "100%";
          this.elRef.nativeElement.querySelector('#panel_item_'+i).style.flex = "0.25";
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