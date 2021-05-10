import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ScrollModule } from '@mr-scroll/angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ScrollModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
