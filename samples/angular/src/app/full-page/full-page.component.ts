import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

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
export class FullPageComponent implements OnInit {
  values: number[] = [];

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.values.push(i);
    }
  }

  ngOnInit() { }
}
