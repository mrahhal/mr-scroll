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

  get position() { return this._scroll.position; }

  get state() { return this._scroll.state; }

  ngOnInit() {
    this._scroll = new Scroll(this._el.nativeElement, this._content.nativeElement, {
      mode: this.mode,
      showOnHover: this.showOnHover,
      topThreshold: this.topThreshold,
      bottomThreshold: this.bottomThreshold,
    });

    // Events that will normally trigger change detection.
    const delegatedEvents = ['topReached', 'bottomReached', 'positionChanged', 'stateChanged'];
    // Events that won't trigger change detection. Change detection should be handled by the consumer.
    const delegatedEventsOutsideNgZone = ['scrolled'];

    for (const eventName of delegatedEvents) {
      (this._scroll[eventName]).subscribe((x: any) => {
        const e = this[eventName] as EventEmitter<any>;
        // Avoid calling zone.run if there are no subscribers to avoid triggering change detection
        if (e.observers.length) {
          this._zone.run(() => {
            e.emit(x);
          });
        }
      });
    }

    for (const eventName of delegatedEventsOutsideNgZone) {
      (this._scroll[eventName]).subscribe((x: any) => {
        const e = this[eventName] as EventEmitter<any>;
        e.emit(x);
      });
    }
  }

  ngAfterViewInit() {
    this._zone.runOutsideAngular(() => {
      this._scroll.initialize();
    });
  }

  ngOnDestroy() {
    this._scroll.destroy();
  }
}
