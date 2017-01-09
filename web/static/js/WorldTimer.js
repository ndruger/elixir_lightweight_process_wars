// @flow

class WorldTimer {
  _enemies: Array<Object> = [];
  _cb: Function;
  _before: number;

  constructor(cb: Function) {
    this._cb = cb;
    this._start();
  }

  _step = (timestamp: number) => {
    if (!this._before) {
      this._before = timestamp;
    }
    var progress = timestamp - this._before;
    this._cb(progress);
    this._before = timestamp;
    window.requestAnimationFrame(this._step);
  }

  _start() {
    window.requestAnimationFrame(this._step);
  }
}

export default WorldTimer;
