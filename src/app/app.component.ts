import { Component, ViewChildren, ViewChild, Input } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PusherService } from './pusher.service';
import {HttpClientModule} from '@angular/common/http';
import { RightComponent } from './right/right.component';
import { LeftDisplayComponent } from './displays/left-display.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'multiViewer';

  @ViewChildren('panel') linkRefs;
  @ViewChild(RightComponent) child: RightComponent;
  @ViewChild(LeftDisplayComponent) leftDisplay: LeftDisplayComponent;

  likes: any = 10;
  private myTemplate: any = "";
  @Input() url: string = "app/right.display.component.html";

  tasks = { "content" : [
      {"text": "task 0", "color":"rgb(38, 143, 85)"},
      {"text": "task 1", "color":"rgb(59, 253, 91)"},
      {"text": "task 2", "color":"rgb(59, 253, 91)"},
      {"text": "task 3", "color":"rgb(237, 253, 6)"}
    ]
  };

  expand = [false,false,false,false];

  done = { "content" : [
    {"text": "done 0", "color":"rgb(3, 37, 231)"},
    {"text": "done 1", "color":"rgb(3, 37, 231)"}
  ]
};

  constructor(private pusherService: PusherService) {
    this.myTemplate = this.url;
    console.log(this.tasks.content);           
  } 

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

  ngOnInit(){
    console.log("linkRefs: ", this.linkRefs);
    this.pusherService.channel.bind('new-like', data => {
      //this.expand = [false,false,false,false];
      this.likes = data.likes;
    });
  }

  show(index){
    console.log("index: ", index);
    this.child.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  handleLeftPanel(index){
    console.log("index: ", index);
    this.leftDisplay.show(index);
    //console.log("linkRefs: ", this.linkRefs._results[index].toggle());
  }

  // add to the number of likes to the server
  liked(index) {
    index = 0;
    this.expand[0]=true;
    this.likes = parseInt(this.likes, 10) + 1;
    console.log("index: ", index);
    //this.pusherService.like(this.likes);
    // if(this.steps[index]){
    //   console.log("close");
    //   this.steps[index]=false;
    // }
    // else{
    //   console.log("open");
    //   this.steps[index]=true;
    // }
    // ..
  }

  ngAfterViewInit() {
    //this.child.show(0);
  }
  //https://blog.angularindepth.com/exploring-drag-and-drop-with-the-angular-material-cdk-2e0237857290
}
