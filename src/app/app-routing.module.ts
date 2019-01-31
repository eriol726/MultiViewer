import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeftDisplayComponent } from 'src/app/displays/left-display.component';

const routes: Routes = [
  { path: 'displayLeft', component: LeftDisplayComponent},
  { path: '', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
