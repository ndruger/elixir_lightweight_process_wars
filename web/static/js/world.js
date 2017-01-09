// @flow
import _ from 'lodash';

class WorldTimer {
  _enemies: Array<Object> = [];
  _cb: Function;
  _start: number;

  constructor(cb: Function) {
    this._cb = cb;
  }

  _step = (timestamp: number) => {
    if (!this._start) {
      this._start = timestamp;
    }
    var progress = timestamp - this._start;
    this._cb(progress);
    window.requestAnimationFrame(this._step);
  }

  _start() {
    window.requestAnimationFrame(this._step);
  }
}

class World {
  _enemies: Array<Object> = [];

  constructor() {
    this._timer = new WorldTimer(this._step);
  }

  _step = (progress: number) => {
    _.each(this._enemies, (enemy: Object) => {
      enemy.move(progress);
    });
  }
}

export default World;
