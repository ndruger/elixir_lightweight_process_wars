// @flow
import 'phoenix_html';
import {Socket} from 'phoenix';
import _ from 'lodash';

import World from './World';
import Pid from './Pid';
import Boss from './Boss';

const socket = new Socket('/socket', {params: {token: window.userToken}});

const MAIN_WIDTH = 1000;
const MAIN_HEIGHT = 600;

socket.connect();
const chan = socket.channel('room:game', {});

$(() => {
  let boss;

  if (!location.search.includes('debug')) {
    $('body').starfield({
      seedMovement: true
    });
  }
  if (location.search.includes('danger')) {
    $('.enemy-creation-button.hidden').removeClass('hidden');
  }

  $('.enemy-creation-button').click((e: Object) => {
    const type = $(e.target).data('enemyType');
    if (type === 'boss') {
      if (boss) {
        return;
      }
      boss = new Boss(chan);
      return;
    }
    chan.push('create_enemy', {type});
  });

  chan.join().receive('ok', () => {
    console.log('joined');
    chan.push('reset', {});

    var svg = SVG('svg-main').size(MAIN_WIDTH, MAIN_HEIGHT);

    const world = new World({
      width: MAIN_WIDTH,
      height: MAIN_HEIGHT,
      svg: svg,
      killProcess: (safeId: string) => {
        chan.push('kill', {pid: Pid.toUnSafe(safeId)});
      },
      $el: $('#main'),
    });

    chan.on('processes', ({processes, atomMemory}: {processes: Array<Object>, atomMemory: number}) => {
      const atomMemoryPercent = atomMemory / 51658249 * 30;
      $('.atom-memory-bar').css({width: `${atomMemoryPercent}%`});
      const safeProcesses = _.map(processes, (process) => {
        return {
          ...process,
          id: Pid.toSafe(process.id),
          links: _.map(process.links, (id) => Pid.toSafe(id)),
        };
      });
      world.updateEnemies(safeProcesses);
    });
  });
});
