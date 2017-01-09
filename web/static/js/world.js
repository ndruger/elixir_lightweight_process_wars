// @flow
import _ from 'lodash';
import uuidLib from 'uuid';

import WorldTimer from './WorldTimer';
import Player from './Player';
import Enemy from './Enemy';
import PlayerShot from './PlayerShot';
import {Position} from './Types';

class World {
  _player: Object;
  _enemyMap: Object = {};
  _playerShotMap: Object = {};
  width: number;
  height: number;
  _timer: Object;
  _svg: Object;
  _killProcess: Function;

  constructor({
    width, height, svg, killProcess
  }: {
    width: number, height: number, svg: Object, killProcess: Function
  }) {
    this.width = width;
    this.height = height;
    this._timer = new WorldTimer(this._step);
    this._svg = svg;
    this._player = new Player({svg, world: this});
    this._killProcess = killProcess;
  }

  updateEnemies(processes: Array<Object>) {
    const newEnemyProcesses = _.filter(processes, (process) => {
      const name = process.name;
      return Enemy.isEnemyName(name) && !this._enemyMap[name];
    });
    const deletionTargetNames = _.pullAll(_.keys(this._enemyMap), _.map(processes, 'name'));
    _.each(newEnemyProcesses, (process) => {
      const name = process.name;
      this._enemyMap[name] = new Enemy({
        id: process.id,
        name: name,
        svg: this._svg,
        world: this,
      });
    });
    _.each(deletionTargetNames, (name) => this._destroyEnemy(name));
  }

  createPlayerShot({x, y}: Position) {
    const name = uuidLib.v4();
    this._playerShotMap[name] = new PlayerShot({
      name,
      x: x,
      y: y,
      svg: this._svg,
      world: this,
    });
  }

  _isOver({x, y}: Position) {
    return (x < 0 ||
            x > this.width ||
            y < 0 ||
            y > this.height);
  }

  checkPlayerShot(shot: PlayerShot) {
    _.each(this._enemyMap, (enemy) => {
      if (shot.canDestroy(enemy.getPosition())) {
        this._killProcess(enemy.id);
      }
    });
    if (this._isOver(shot.getPosition())) {
      this._destroyPlayerShot(shot.name);
    }
  }

  _destroyEnemy(name: string) {
    this._enemyMap[name].destroy();
    delete this._enemyMap[name];
  }

  _destroyPlayerShot(name: string) {
    this._playerShotMap[name].destroy();
    delete this._playerShotMap[name];
  }

  _step = (progress: number) => {
    this._player.move(progress);
    _.each(this._enemyMap, (enemy: Object) => enemy.move(progress));
    _.each(this._playerShotMap, (shot: Object) => shot.move(progress));
  }
}


export default World;
