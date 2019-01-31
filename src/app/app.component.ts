import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, 
transferArrayItem, CdkDragEnter, CdkDragExit, 
CdkDragStart, CdkDrag } from 
'@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'multiViewer';

  newItems = [
    'Item 0',
    'Item 1',
    'Item 2',
    'Item 3',
  ]
  //https://blog.angularindepth.com/exploring-drag-and-drop-with-the-angular-material-cdk-2e0237857290
}
