import { Component, DoCheck } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements DoCheck {
  values: number[] = [];

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.values.push(i);
    }
  }

  ngDoCheck() {
    // To test when change detection is being triggered
    console.log('ngDoCheck');
  }

  _onTopReached() {
    console.log('_onTopReached');
  }

  _onScrolled() {
    console.log('_onScrolled');

    // This event doesn't run inside angular on purpose for performance.
    // To trigger change detection you should call `zone.run()`.
  }
}
