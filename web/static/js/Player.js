// @flow
import _ from 'lodash';

import Movable from './Movable';
import KeyManager from './KeyManager';
import World from './World';

const WIDTH = 36;
const HEIGHT = 32;

class Player extends Movable {
  _keyManager: KeyManager;
  _speed: number = 0.5;
  _$el: Object;

  constructor({svg, world}: {svg: Object, world: World}) {
    super({svg, world});
    this._x = this._world.width / 2;
    this._y = this._world.height - 100;
    this._$el = $('<div>')
      .addClass('player');
    world.addElement(this._$el);
    this.draw();
    this._keyManager = new KeyManager({update: (dir) => {
      this.updateDir(dir);
    }});
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
    this.draw();
  }

  draw() {
    this._$el.css({
      top: `${this._y - HEIGHT / 2}px`,
      left: `${this._x - WIDTH / 2}px`,
    });
  }

  updateDir(dir: number) {
    const dirStr = dir === -1 ? '' : KeyManager.dirStrMap[dir];
    $(this._el)
      .removeClass(_.values(KeyManager.dirStrMap).join(' '))
      .addClass(dirStr);
  }

  destroy() {
    this._$el.addClass('explosion');
    setTimeout(() => {
      super.destroy();
      console.log('Player.destroyed');
    }, 800);
  }
}

export default Player;
