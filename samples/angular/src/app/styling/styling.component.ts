import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'styling',
  templateUrl: './styling.html',
  styleUrls: ['./styling.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'styling',
  },
})
export class StylingComponent {
  items = _.range(1, 11);
}
