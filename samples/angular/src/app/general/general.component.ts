import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';

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
  items = _.range(1, 11);
  items3 = _.range(1, 4);
  items24 = _.range(1, 25);

  _onTopReached() {
    console.log('_onTopReached');
  }

  _onLeftReached() {
    console.log('_onLeftReached');
  }

  _onRightReached() {
    console.log('_onRightReached');
  }

  _onScrolled() {
    // This event doesn't trigger change detection on purpose for performance reasons.
    // To trigger change detection you should call `NgZone.run()`.

    console.log('_onScrolled');
  }
}
