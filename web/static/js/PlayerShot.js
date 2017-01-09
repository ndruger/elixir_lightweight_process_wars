// @flow

import Movable from './Movable';
import World from './World';
import {Position} from './Types';

class PlayerShot extends Movable {
  _speed: number = 0.5;
  name: string;

  constructor({name, x, y, svg, world}: {name: string, x: number, y: number, svg: Object, world: World}) {
    super({svg, world});
    this._x = x;
    this._y = y;
    this.name = name;
    this._el = svg.circle(5)
      .addClass('playerShot')
      .fill('#0ff')
      .move(this._x, this._y);
  }

  canDestroy({x, y}: Position): boolean {
    return ((this._x - x) ** 2 + (this._y - y) ** 2) < 50 ** 2;
  }

  move(progress: number) {
    this._y -= this._speed * progress;
    this._el.move(this._x, this._y);
    this._world.checkPlayerShot(this);
  }
}

export default PlayerShot;
