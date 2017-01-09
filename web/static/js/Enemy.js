// @flow
import _ from 'lodash';

import Movable from './Movable';
import World from './World';

class EnemyBase extends Movable {
  name: string;
  id: string;

  constructor({name, id, svg, world}: {name: string, id: string, svg: Object, world: World}) {
    super({svg, world});
    this.id = id;
    this.name = name;
  }
}

class Enemy extends EnemyBase {
  _speed: number =  0.1;

  constructor({name, id, svg, world}: {name: string, id: string, svg: Object, world: World}) {
    super({name, id, svg, world});
    this._x = _.random(this._world.width);
    this._y = _.random(this._world.height / 2);
    this._el = svg.circle(50)
      .addClass('enemy')
      .fill('#f00')
      .move(this._x, this._y);
    console.log('Enemy.created', this.name);
  }

  destroy() {
    this._el.fill('#ff0');
    setTimeout(() => {
      super.destroy();
      console.log('Enemy.destroyed', this.name);
    }, 800);
  }

  move(progress: number) {
    this._x += _.random(-this._speed * progress, this._speed * progress);
    this._y += _.random(-this._speed * progress, this._speed * progress);
    this._el.move(this._x, this._y);
  }

  static isEnemyName(name: string): boolean {
    return _.first(name.split('_')) === 'enemy';
  }

  static isEnemyChildName(name: string): boolean {
    return _.first(name.split('_')) === 'enemyChild';
  }
}

export default Enemy;
