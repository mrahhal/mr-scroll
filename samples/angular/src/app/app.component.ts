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
  page: 'general' | 'full-page' | 'styling' = 'general';
  theme: string;

  constructor() {
    // css-theming stuff
    initializeTheming();
    this.theme = getCurrentTheme().name;

    document.addEventListener('keypress', e => {
      if (e.defaultPrevented) return;

      if (e.key === 't') {
        const previousTheme = getCurrentTheme();
        const newTheme = previousTheme.name == 'default' ? 'default-dark' : 'default';
        this._setTheme(newTheme);
      }
    });
    //------------------
  }

  ngDoCheck() {
    // To test when change detection is being triggered
    console.log('ngDoCheck');
  }

  setPage(page: 'general' | 'full-page' | 'styling') {
    this.page = page;
  }

  _setTheme(theme: string) {
    setTheme(getTheme(theme));
    this.theme = theme;
  }
}
