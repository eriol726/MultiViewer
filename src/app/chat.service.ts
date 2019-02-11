import { Injectable, ViewChild } from '@angular/core';
import { WebsocketService} from './websocket.service';
import { Observable, Subject } from 'rxjs';
import { response } from 'express';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
import { LeftComponent } from './left/left.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  @ViewChild(LeftComponent) leftPanel: LeftComponent;
  messages: Subject<any>;
  hej: any;

  constructor(private wsService: WebsocketService) { 
    
    // this.messages = <Subject<any>>wsService
    //   .connect().pipe(
    //     map((response: any): any => {
    //       return response;
    //     })
    //   );
  }

  sendMsg(msg) {
    this.messages.next(msg);
  }
}
