import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActionService {

  actions = { "content" : [
      {"text": "task 0", "color":"rgb(38, 143, 85)"},
      {"text": "task 1", "color":"rgb(59, 253, 91)"},
      {"text": "task 2", "color":"rgb(59, 253, 91)"},
      {"text": "task 3", "color":"rgb(237, 253, 6)"}
    ]
  };

  countermeasures = { "content" : [
      {"text": "done 0", "color":"rgb(3, 37, 231)"},
      {"text": "done 1", "color":"rgb(3, 37, 231)"}
    ]
  };

  constructor() { }

  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  
  // Service message commands
  emitChange(change: any) {
      this.emitChangeSource.next(change);
  }


  getActions(){
    return this.actions;
  }

  getCountermeasures(){
    return this.countermeasures;
  }
}
