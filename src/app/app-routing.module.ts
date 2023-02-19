import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';

import { SemesterResultComponent } from './semester-result/semester-result.component';


const routes: Routes = [
  {'path' : '' , 'component' : HomePageComponent},
  {'path' : 'semester-result' , 'component' : SemesterResultComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
