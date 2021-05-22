import { Scroll, ScrollMode, ScrollPosition, ScrollState } from '@mr-scroll/core';
import React from 'react';

interface Props {
  mode?: ScrollMode;
  topThreshold?: number;
  bottomThreshold?: number;
  leftThreshold?: number;
  rightThreshold?: number;
  showOnHover?: boolean;

  scrolled?: (e: { left: number; top: number }) => void;
  topReached?: () => void;
  bottomReached?: () => void;
  leftReached?: () => void;
  rightReached?: () => void;
  positionHChanged?: (e: ScrollPosition) => void;
  positionAbsoluteHChanged?: (e: ScrollPosition) => void;
  stateHChanged?: (e: ScrollState) => void;
  positionVChanged?: (e: ScrollPosition) => void;
  positionAbsoluteVChanged?: (e: ScrollPosition) => void;
  stateVChanged?: (e: ScrollState) => void;
}

export default class ScrollComponent extends React.Component<Props> {
  private _scroll: Scroll;
  private _hostRef: React.RefObject<HTMLDivElement>;
  private _contentRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this._contentRef = React.createRef();

    this.state = {
      didMountUniversal: false,
    };
  }

  componentDidMount() {
    this._scroll = new Scroll(this._hostRef.current!, this._contentRef.current!, {
      mode: this.props.mode,
      topThreshold: this.props.topThreshold,
      bottomThreshold: this.props.bottomThreshold,
      leftThreshold: this.props.leftThreshold,
      rightThreshold: this.props.rightThreshold,
      showOnHover: this.props.showOnHover,
    });

    const delegatedEvents = ['scrolled', 'topReached', 'bottomReached', 'leftReached', 'rightReached', 'positionHChanged', 'positionAbsoluteHChanged', 'stateHChanged', 'positionVChanged', 'positionAbsoluteVChanged', 'stateVChanged'];
    for (const eventName of delegatedEvents) {
      (this._scroll[eventName]).subscribe((x: any) => {
        const handler = this.props[eventName] as Function;
        if (handler) {
          handler(x);
        }
      });
    }
  }

  componentWillUnmount() {
    this._scroll.destroy();
  }

  render() {
    return (
      <div ref={this._hostRef}>
        <div ref={this._contentRef}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
