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
      return Enemy.isEnemyName(process.name) && !this._enemyMap[process.id];
    });
    const deletionTargetNames = _.pullAll(_.keys(this._enemyMap), _.map(processes, 'id'));
    _.each(newEnemyProcesses, (process) => {
      const name = process.name;
      const id = process.id;
      this._enemyMap[id] = new Enemy({
        id,
        name: name,
        svg: this._svg,
        world: this,
      });
    });
    _.each(deletionTargetNames, (name) => this._destroyEnemy(name));
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

  _isOver({x, y}: Position) {
    return (x < 0 ||
            x > this.width ||
            y < 0 ||
            y > this.height);
  }

  checkPlayerShot(shot: PlayerShot) {
    const hit = _.some(this._enemyMap, (enemy) => {
      if (shot.canDestroy(enemy.getPosition())) {
        this._killProcess(enemy.id);
        return true;
      }
    });
    if (hit || this._isOver(shot.getPosition())) {
      this._destroyPlayerShot(shot.id);
    }
  }

  _destroyEnemy(id: string) {
    this._enemyMap[id].destroy();
    delete this._enemyMap[id];
  }

  _destroyPlayerShot(id: string) {
    this._playerShotMap[id].destroy();
    delete this._playerShotMap[id];
  }

  _step = (progress: number) => {
    this._player.move(progress);
    _.each(this._enemyMap, (enemy: Object) => enemy.move(progress));
    _.each(this._playerShotMap, (shot: Object) => shot.move(progress));
  }
}


export default World;
