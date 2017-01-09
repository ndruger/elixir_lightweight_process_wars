// @flow

import Movable from './Movable';
import KeyManager from './KeyManager';
import World from './World';

class Player extends Movable {
  _keyManager: KeyManager;
  _speed: number = 0.5;

  constructor({svg, world}: {svg: Object, world: World}) {
    super({svg, world});
    this._x = this._world.width / 2;
    this._y = this._world.height - 100;
    this._el = svg.circle(50)
      .addClass('player')
      .fill('#fff')
      .move(this._x, this._y);
    this._keyManager = new KeyManager();
    $(window).keypress((e: Object) => {
      if (e.keyCode !== 32) {
        return;
      }
      e.preventDefault();
      this._world.createPlayerShot({x: this._x, y: this._y});
    });
  }

  move(progress: number) {
    const d = this._keyManager.getDirections();
    this._x += d.x * this._speed * progress;
    this._y += d.y * this._speed * progress;
    this._el.move(this._x, this._y);
  }
}

export default Player;
