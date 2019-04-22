import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Actions} from './action.model'

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  public selectedCategoryName: string = '';
  private events = new BehaviorSubject<boolean>(false);

  actions = [
      {"id": "0", "text": "RESCHEDULING CHARGING PREVIEW", "color":"rgb(38, 143, 85)","startDate": new Date(2018,1,1,12,0,0), "endDate": new Date(2018,1,1,13,0,0), "cards": 3},
      {"id": "1", "text": "WEAR AND TEAR MODE", "color":"rgb(59, 253, 91)","startDate": new Date(2018,1,1,11,30,0), "endDate": new Date(2018,1,1,14,0,0), "cards": 4},
      {"id": "2", "text": "MANUAL X-RAY CHECK", "color":"rgb(59, 253, 91)","startDate": new Date(2018,1,1,12,0,0), "endDate": new Date(2018,1,1,13,0,0), "cards": 3},
      {"id": "3", "text": "PRIORITIZING FLIGHTS", "color":"rgb(237, 253, 6)","startDate": new Date(2018,1,1,12,0,0), "endDate": new Date(2018,1,1,13,0,0), "cards": 4}
    ]


  countermeasures =  [];
 

  constructor() { console.log("ActionService")}

  public expandPanel(){
    console.log("expand");
    this.events.next(true);
  }

  public closePanel(){
    this.events.next(false);
  }

  public get panelStatus() : Observable<boolean> {
    return this.events.asObservable();
  }

  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  
  // Service message commands
  emitChange(change: any) {
      this.emitChangeSource.next(change);
  }

  public setActions(actions){
    console.log("actions: ", actions);
    this.actions = actions;
  }


  public getActions() : any{
    console.log("this.actions: ", this.actions);
    const data = new Observable(observer => {
      setTimeout(() => {
        
        observer.next(this.actions);
      },1000);
    });

    return data;
  }

  public getCountermeasures() : any{
    const data = new Observable(observer => {
      setTimeout(() => {
        observer.next(this.actions);
      },1000)
    } )
    return data;

  }
}
