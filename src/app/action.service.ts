import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Actions} from './action.model'

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  public selectedCategoryName: string = '';

  actions = [
      {"id": "0", "text": "RESCHEDULING CHARGING", "color":"rgb(38, 143, 85)","startDate": new Date(2018,1,1,12,0,0), "endDate": new Date(2018,1,1,13,0,0), "cards": 3},
      {"id": "1", "text": "WEAR AND TEAR MODE", "color":"rgb(59, 253, 91)","startDate": new Date(2018,1,1,11,30,0), "endDate": new Date(2018,1,1,14,0,0), "cards": 4},
      {"id": "2", "text": "MANUAL X-RAY CHECK", "color":"rgb(59, 253, 91)","startDate": new Date(2018,1,1,12,0,0), "endDate": new Date(2018,1,1,13,0,0), "cards": 3},
      {"id": "3", "text": "PRIORITIZING FLIGHTS", "color":"rgb(237, 253, 6)","startDate": new Date(2018,1,1,12,0,0), "endDate": new Date(2018,1,1,13,0,0), "cards": 4}
    ]

  public getActions() : any{
    console.log("this.actions: ", this.actions);
    const data = new Observable(observer => {

        
        observer.next(this.actions);

    });

    return data;
  }

  public getCountermeasures() : any{
    const data = new Observable(observer => {

        observer.next(this.actions);

    } )
    return data;

  }
}
