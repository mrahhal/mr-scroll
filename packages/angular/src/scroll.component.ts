import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Scroll, ScrollMode, ScrollPosition, ScrollState } from '@mr-scroll/core';

@Component({
  selector: 'mr-scroll',
  templateUrl: './scroll.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollComponent implements OnInit, AfterViewInit, OnDestroy {
  private _scroll: Scroll;

  @Input() mode?: ScrollMode;

  @Input() showOnHover?: boolean;

  @Input() scrolledDebounce?: number;

  @Input() topThreshold?: number;

  @Input() bottomThreshold?: number;

  @Output() scrolled = new EventEmitter<number>();

  @Output() scrolledRaw = new EventEmitter<number>();

  @Output() topReached = new EventEmitter<void>();

  @Output() bottomReached = new EventEmitter<void>();

  @Output() positionChanged = new EventEmitter<ScrollPosition>();

  @Output() stateChanged = new EventEmitter<ScrollState>();

  @ViewChild('content', { static: true }) _content: ElementRef<HTMLElement>;

  constructor(
    private _el: ElementRef<HTMLElement>,
    private _zone: NgZone,
  ) { }

  ngOnInit() {
    this._scroll = new Scroll(this._el.nativeElement, this._content.nativeElement, {
      mode: this.mode,
      showOnHover: this.showOnHover,
      scrolledDebounce: this.scrolledDebounce,
      topThreshold: this.topThreshold,
      bottomThreshold: this.bottomThreshold,
    });

    const delegatedEvents = ['scrolled', 'scrolledRaw', 'topReached', 'bottomReached', 'positionChanged', 'stateChanged'];
    for (const e of delegatedEvents) {
      (this._scroll[e]).subscribe((x: any) => {
        this._zone.run(() => {
          this[e].emit(x);
        });
      });
    }
  }

  ngAfterViewInit() {
    this._zone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        this._scroll.initialize();
      });
    });
  }

  ngOnDestroy() {
    this._scroll.destroy();
  }
}
