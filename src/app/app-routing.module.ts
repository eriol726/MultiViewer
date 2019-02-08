import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeftComponent } from "./left/left.component";
import { TabletComponent } from "./tablet/tablet.component";
import { RightComponent } from "./right/right.component";
import { MiddleComponent } from "./middle/middle.component";


const routes: Routes = [
  { path: 'displayLeft', component: LeftComponent},
  { path: 'displayRight', component: RightComponent},
  { path: 'displayMiddle', component: MiddleComponent},
  { path: '', component: TabletComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
