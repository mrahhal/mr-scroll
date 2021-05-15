import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ScrollComponent } from './scroll.component';

const exportedDeclarations = [
  ScrollComponent,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: exportedDeclarations,
  exports: exportedDeclarations,
})
export class ScrollModule { }
