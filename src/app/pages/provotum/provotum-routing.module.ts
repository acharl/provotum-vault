import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProvotumPage } from './provotum.page';

const routes: Routes = [
  {
    path: '',
    component: ProvotumPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProvotumPageRoutingModule {}
