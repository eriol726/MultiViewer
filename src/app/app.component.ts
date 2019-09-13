import { Component } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Router} from '@angular/router';

export let browserRefresh = false;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})


export class AppComponent {
  constructor(private router: Router, private socket: WebsocketService  ) {
  }
}


