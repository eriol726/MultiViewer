import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material/material.module';
import { PlotlyModule } from 'angular-plotly.js';
import { ChatService } from './chat.service';
import { WebsocketService } from './websocket.service';


import { LeftComponent } from "./left/left.component";
import { RightComponent } from './right/right.component';
import { MiddleComponent } from './middle/middle.component';
import { TabletComponent } from './tablet/tablet.component';
import { ActionService } from './action.service';

@NgModule({
  declarations: [
    AppComponent,
    LeftComponent,
    RightComponent,
    MiddleComponent,
    TabletComponent
    
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    PlotlyModule
  ],
  providers: [
    AppComponent,
    ChatService,
    WebsocketService,
    LeftComponent,
    TabletComponent,
    ActionService
  ],
    
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
