import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ScrollComponent } from './scroll.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ScrollComponent,
  ],
  exports: [
    ScrollComponent,
  ],
})
export class ScrollModule { }
