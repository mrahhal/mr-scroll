import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

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
export class StylingComponent implements OnInit {
  values: number[] = [];

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.values.push(i);
    }
  }

  ngOnInit() { }
}
