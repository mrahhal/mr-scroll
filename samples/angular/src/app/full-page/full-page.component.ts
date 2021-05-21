import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'full-page',
  templateUrl: './full-page.html',
  styleUrls: ['./full-page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'full-page',
  },
})
export class FullPageComponent {
  items = _.range(1, 31);
}
