// @flow
import World from './World';

class Movable {
  _svg: Object;
  _x: number;
  _y: number;
  _world: World;
  _el: Object;

  constructor({svg, world}: {svg: Object, world: World}) {
    this._svg = svg;
    this._world = world;
  }

  move() {
    console.assert(false);
  }

  getPosition() {
    return {x: this._x, y: this._y};
  }

  destroy() {
    this._el.remove();
  }
}

export default Movable;
