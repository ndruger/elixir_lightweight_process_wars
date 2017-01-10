// @flow

import Movable from './Movable';
import World from './World';
import type {Position} from './Types';

class EnemyShot extends Movable {
  _speed: number = 0.3;
  id: string;
  _dx: number;
  _dy: number;

  constructor({id, x, y, svg, world, targetPos}: {id: string, x: number, y: number, svg: Object, world: World, targetPos: Position}) {
    super({svg, world});
    this._x = x;
    this._y = y;
    this.id = id;
    this._el = svg.circle(10)
      .addClass('enemy-shot')
      .fill('#ff0')
      .move(this._x, this._y);
    const d = Math.sqrt((targetPos.x - x) ** 2 + (targetPos.y - y) ** 2);
    this._dx = (targetPos.x - x) / d;
    this._dy = (targetPos.y - y) / d;
  }

  canDestroy({x, y}: Position): boolean {
    return ((this._x - x) ** 2 + (this._y - y) ** 2) < 3 ** 2;
  }

  move(progress: number) {
    this._x += this._speed * this._dx * progress;
    this._y += this._speed * this._dy * progress;
    this._el.move(this._x, this._y);
    this._world.checkEnemyShot(this);
  }
}

export default EnemyShot;
