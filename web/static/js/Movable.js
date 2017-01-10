// @flow
import World from './World';

class Movable {
  _svg: Object;
  _x: number;
  _y: number;
  _world: World;
  _el: Object;
  _$el: Object;

  constructor({svg, world}: {svg: Object, world: World}) {
    this._svg = svg;
    this._world = world;
  }

  move(_progress: number) {
    console.assert(false);
  }

  getPosition() {
    return {x: this._x, y: this._y};
  }

  destroy() {
    if (this._el) {
      this._el.remove();
    }
    if (this._$el) {
      this._$el.remove();
    }
  }
}

export default Movable;
