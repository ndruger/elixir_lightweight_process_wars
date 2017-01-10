// @flow
import _ from 'lodash';

import Movable from './Movable';
import World from './World';

const WIDTH = 32;
const HEIGHT = 32;

class EnemyBase extends Movable {
  _speed: number =  0.1;
  _shotTimer: number;
  name: string;
  id: string;
  links: Array<string>;

  constructor({name, id, svg, world, links}: {name: string, id: string, svg: Object, world: World, links: Array<string>}) {
    super({svg, world});
    this.id = id;
    this.name = name;
    this.links = links;
    this._shotTimer = setInterval(this._shot, 5000);
  }

  destroy() {
    if (this._shotTimer) {
      clearInterval(this._shotTimer);
      this._shotTimer = 0;
    }
    this._$el.addClass('explosion');
    setTimeout(() => {
      super.destroy();
      console.log('destroyed', this.name);
    }, 800);
  }

  move(progress: number) {
    this._x += _.random(-this._speed * progress, this._speed * progress);
    this._y += _.random(-this._speed * progress, this._speed * progress);
    this.draw();
  }

  _shot = () => {
    this._world.createEnemyShot({x: this._x, y: this._y});
  }

  draw() {
    this._$el.css({
      top: `${this._y - HEIGHT / 2}px`,
      left: `${this._x - WIDTH / 2}px`,
    });
  }
}

export default EnemyBase;
