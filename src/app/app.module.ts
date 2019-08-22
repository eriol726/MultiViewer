import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material/material.module';
import { WebsocketService } from './websocket.service';
import { DragScrollModule } from 'ngx-drag-scroll';
import { DragulaModule } from 'ng2-dragula';

import { LeftComponent } from "./left/left.component";
import { RightComponent } from './right/right.component';
import { MiddleComponent } from './middle/middle.component';
import { TabletComponent } from './tablet/tablet.component';
import { ActionService } from './action.service';
import { AreaChartComponent } from './area-chart/area-chart.component';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { SafePipe } from './safe.pipe';
import { IgxIconModule, IgxExpansionPanelModule} from "igniteui-angular";

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto',
  observer: true
  
};


@NgModule({
  declarations: [
    AppComponent,
    LeftComponent,
    RightComponent,
    MiddleComponent,
    TabletComponent,
    AreaChartComponent,
    SafePipe
    
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
    SwiperModule,
    DragScrollModule,
    IgxIconModule,
    IgxExpansionPanelModule,
    DragulaModule.forRoot()
  ],
  providers: [
    AppComponent,
    WebsocketService,
    LeftComponent,
    MiddleComponent,
    TabletComponent,
    ActionService,
    AreaChartComponent
  ],
    
  bootstrap: [AppComponent]
})
export class AppModule { }
