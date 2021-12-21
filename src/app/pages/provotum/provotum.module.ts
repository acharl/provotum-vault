import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { ProvotumPage } from './provotum.page'
import { AirGapAngularCoreModule, ComponentsModule, PipesModule } from '@airgap/angular-core'
import { RouterModule, Routes } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'

const routes: Routes = [
  {
    path: '',
    component: ProvotumPage
  }
]
@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    PipesModule,
    AirGapAngularCoreModule
  ],
  declarations: [ProvotumPage]
})
export class ProvotumPageModule {}
