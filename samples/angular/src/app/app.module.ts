import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ScrollModule } from '@mr-scroll/angular';

import { AppComponent } from './app.component';
import { FULL_PAGE_DECLARATIONS } from './full-page';
import { GENERAL_DECLARATIONS } from './general';

@NgModule({
  declarations: [
    AppComponent,
    GENERAL_DECLARATIONS,
    FULL_PAGE_DECLARATIONS,
  ],
  imports: [
    BrowserModule,
    ScrollModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
