// @flow
import _ from 'lodash';
import uuidLib from 'uuid';

import WorldTimer from './WorldTimer';
import Player from './Player';
import Enemy from './Enemy';
import EnemyChild from './EnemyChild';
import PlayerShot from './PlayerShot';
import EnemyShot from './EnemyShot';
import {Position} from './Types';

class World {
  _player: Object;
  _enemyMap: Object = {};
  _enemyChildMap: Object = {};
  _playerShotMap: Object = {};
  _enemyShotMap: Object = {};
  width: number;
  height: number;
  _timer: Object;
  _svg: Object;
  _killProcess: Function;
  _$el: Object;

  constructor({
    width,
    height,
    svg,
    killProcess,
    $el
  }: {
    width: number,
    height: number,
    svg: Object,
    killProcess: Function,
    $el: Object
  }) {
    this.width = width;
    this.height = height;
    this._timer = new WorldTimer(this._step);
    this._svg = svg;
    this._$el = $el;
    this._player = new Player({svg, world: this});
    this._killProcess = killProcess;
  }

  updateEnemies(processes: Array<Object>) {
    const newEnemyProcesses = _.filter(processes, (process) => {
      return Enemy.isName(process.name) && !this._enemyMap[process.id];
    });
    const newEnemyChildProcesses = _.filter(processes, (process) => {
      return EnemyChild.isName(process.name) && !this._enemyChildMap[process.id];
    });
    const deletionTargetEnemyIds = _.pullAll(_.keys(this._enemyMap), _.map(processes, 'id'));
    const deletionTargetEnemyChildIds = _.pullAll(_.keys(this._enemyChildMap), _.map(processes, 'id'));
    _.each(newEnemyProcesses, (process) => {
      const name = process.name;
      const id = process.id;
      this._enemyMap[id] = new Enemy({
        id,
        name,
        svg: this._svg,
        world: this,
        links: process.links,
      });
    });
    _.each(newEnemyChildProcesses, (process) => {
      const name = process.name;
      const id = process.id;
      console.assert(process.links.length === 1);
      const enemy = this._enemyMap[_.first(process.links)];
      if (enemy) {
        this._enemyChildMap[id] = enemy.createChild({
          id,
          name,
          links: process.links,
        });
      }
    });
    _.each(deletionTargetEnemyIds, (id) => this._destroyEnemy(id));
    _.each(deletionTargetEnemyChildIds, (id) => this._destroyEnemyChild(id));
  }

  createPlayerShot({x, y}: Position) {
    const id = uuidLib.v4();
    this._playerShotMap[id] = new PlayerShot({
      id,
      x: x,
      y: y,
      svg: this._svg,
      world: this,
    });
  }

  createEnemyShot({x, y}: Position) {
    const id = uuidLib.v4();
    this._enemyShotMap[id] = new EnemyShot({
      id,
      x: x,
      y: y,
      svg: this._svg,
      world: this,
      targetPos: this._player.getPosition(),
    });
  }

  _isOver({x, y}: Position) {
    return (x < 0 ||
            x > this.width ||
            y < 0 ||
            y > this.height);
  }

  checkPlayerShot(shot: PlayerShot) {
    const hit = _.some(_.assign({}, this._enemyMap, this._enemyChildMap), (target) => {
      if (shot.canDestroy(target.getPosition())) {
        this._killProcess(target.id);
        return true;
      }
    });
    if (hit || this._isOver(shot.getPosition())) {
      this._destroyPlayerShot(shot.id);
    }
  }

  checkEnemyShot(shot: EnemyShot) {
    if (shot.canDestroy(this._player.getPosition())) {
      this._player.destroy();
      return;
    }
    if (this._isOver(shot.getPosition())) {
      this._destroyEnemyShot(shot.id);
    }
  }

  addElement(el: Object) {
    this._$el.append(el);
  }

  _destroyEnemy(id: string) {
    this._enemyMap[id].destroy();
    delete this._enemyMap[id];
    console.log('_enemyMap size', _.size(this._enemyMap));
  }

  _destroyEnemyChild(id: string) {
    const child = this._enemyChildMap[id];
    child.destroy();
    const enemy = this._enemyMap[_.first(child.links)];
    if (enemy) {
      enemy.removeChild(id);
    }
    delete this._enemyChildMap[id];
    console.log('_enemyChildMap size', _.size(this._enemyChildMap));
  }

  _destroyPlayerShot(id: string) {
    this._playerShotMap[id].destroy();
    delete this._playerShotMap[id];
  }

  _destroyEnemyShot(id: string) {
    this._enemyShotMap[id].destroy();
    delete this._enemyShotMap[id];
  }

  _step = (progress: number) => {
    this._player.move(progress);
    _.each(this._enemyMap, (enemy: Object) => enemy.move(progress));
    _.each(this._playerShotMap, (shot: Object) => shot.move(progress));
    _.each(this._enemyShotMap, (shot: Object) => shot.move(progress));
  }
}


export default World;
