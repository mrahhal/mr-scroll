import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'general',
  templateUrl: './general.html',
  styleUrls: ['./general.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'general',
  },
})
export class GeneralComponent {
  values: number[] = [];

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.values.push(i);
    }
  }

  _onTopReached() {
    console.log('_onTopReached');
  }

  _onScrolled() {
    console.log('_onScrolled');

    // This event doesn't trigger change detection on purpose for performance reasons.
    // To trigger change detection you should call `NgZone.run()`.
  }
}
