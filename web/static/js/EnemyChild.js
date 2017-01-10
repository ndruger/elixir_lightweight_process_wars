// @flow
import _ from 'lodash';

import World from './World';
import EnemyBase from './EnemyBase';
import {Position} from './Types';

class EnemyChild extends EnemyBase {
  _speed: number =  0.1;
  _shotTimer: number;
 
  constructor({name, id, svg, world, parentPos, links}: {name: string, id: string, svg: Object, world: World, parentPos: Position, links: Array<string>}) {
    super({name, id, svg, world, links});
    const deg = _.random(0, 360);
    const r = 100;
    const x = Math.cos(deg * (Math.PI / 180)) * r;
    const y = Math.sin(deg * (Math.PI / 180)) * r;
    this._x = parentPos.x + x;
    this._y = parentPos.y + y;
    this._$el = $('<div>')
      .addClass('enemy-child');
    world.addElement(this._$el);
    this.draw();
  }

  static isName(name: string): boolean {
    return _.first(name.split('_')) === 'enemyChild';
  }
}

export default EnemyChild;
