import { Component, DoCheck, ViewEncapsulation } from '@angular/core';
import { getCurrentTheme, getTheme, initializeTheming, setTheme } from 'css-theming';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-root',
  },
})
export class AppComponent implements DoCheck {
  values: number[] = [];

  constructor() {
    // css-theming stuff
    initializeTheming();
    document.addEventListener('keypress', e => {
      if (e.defaultPrevented) return;

      if (e.key === 't') {
        const previousTheme = getCurrentTheme();
        const newTheme = previousTheme.name == 'default' ? 'default-dark' : 'default';
        setTheme(getTheme(newTheme));
      }
    });
    //-------------------

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
