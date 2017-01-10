// @flow
import _ from 'lodash';

import World from './World';
import EnemyBase from './EnemyBase';
import EnemyChild from './EnemyChild';

class Enemy extends EnemyBase {
  _speed: number =  0.1;
  _shotTimer: number;
  _childMap: Object = {};
  _linkEls: Object = {};
 
  constructor({name, id, svg, world, links}: {name: string, id: string, svg: Object, world: World, links: Array<string>}) {
    super({name, id, svg, world, links});
    this._x = _.random(this._world.width);
    this._y = _.random(this._world.height / 2);
    this._$el = $('<div>')
      .addClass('enemy');
    world.addElement(this._$el);
    this.draw();
  }

  destroy() {
    _.each(this._childMap, (_v, id) => {
      this.removeChild(id);
    });
    super.destroy();
  }

  createChild({name, id, links}: {name: string, id: string, links: Array<string>}) {
    const child = new EnemyChild({
      name,
      id,
      svg: this._svg,
      world: this._world,
      links,
      parentPos: {x: this._x, y: this._y},
    });
    this._childMap[id] = child;
    const plot = this._getLinkPlot(id);
    const linkEl = this._svg
      .line(...plot)
      .stroke({
        color: '#ff0',
        width: 5,
      });
    this._linkEls[id] = linkEl;
    this.draw();
    return child;
  }

  _getLinkPlot(id: string): Array<number> | void {
    const child = this._childMap[id];
    if (!child) {
      return undefined;
    }
    const {x, y} = child.getPosition();
    return [this._x, this._y, x, y];
  }

  _removeLinkEl(id: string) {
    this._linkEls[id].remove();
    delete this._linkEls[id];
  }

  draw() {
    super.draw();
    _.each(this._linkEls, (el, id) => {
      const plot = this._getLinkPlot(id);
      if (plot) {
        el.plot(...plot);
      }
    });
  }

  removeChild(id: string) {
    delete this._childMap[id];
    this._removeLinkEl(id);
  }

  static isName(name: string): boolean {
    return _.first(name.split('_')) === 'enemy';
  }
}

export default Enemy;
