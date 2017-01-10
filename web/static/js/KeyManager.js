// @flow
import _ from 'lodash';

const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWM = 40;
const dirMap = {
  [LEFT]: {x: -1, y: 0},
  [UP]: {x: 0, y: -1},
  [DOWM]: {x: 0, y: 1},
  [RIGHT]: {x: 1, y: 0},
};

class KeyManager {
  static dirStrMap = {
    [LEFT]: 'left',
    [UP]: 'up',
    [DOWM]: 'down',
    [RIGHT]: 'right',
  };

  _isPressed = {};
  _update: Function;

  constructor({update}: {update: Function}) {
    this._update = update;
    $(window).keydown((e: Object) => {
      const d = dirMap[e.keyCode];
      if (!d) {
        return;
      }
      e.preventDefault();
      this._isPressed[e.keyCode] = true;
      this._onUpdate();
    });
    $(window).keyup((e: Object) => {
      const d = dirMap[e.keyCode];
      if (!d) {
        return;
      }
      e.preventDefault();
      delete this._isPressed[e.keyCode];
      this._onUpdate();
    });
  }
  
  getDirections() {
    return _.reduce(this._isPressed, (acc, _v, key) => {
      const d = dirMap[key];
      return {x: acc.x + d.x, y: acc.y + d.y};
    }, {x: 0, y: 0});
  }

  _onUpdate() {
    const dir = _.isEmpty(this._isPressed) ? -1 : parseInt(_.first(_.keys(this._isPressed)), 10);
    this._update(dir);
  }
}

export default KeyManager;
