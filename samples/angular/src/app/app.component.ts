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
  page: 'general' | 'full-page' = 'general';

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
    //------------------
  }

  ngDoCheck() {
    // To test when change detection is being triggered
    console.log('ngDoCheck');
  }

  setPage(page: 'general' | 'full-page') {
    this.page = page;
  }
}
