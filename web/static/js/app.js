// @flow
import 'phoenix_html';
import {Socket} from 'phoenix';
import _ from 'lodash';

import World from './World';
import Pid from './Pid';
import {boss} from './Boss';

const socket = new Socket('/socket', {params: {token: window.userToken}});

const MAIN_WIDTH = 1000;
const MAIN_HEIGHT = 600;

socket.connect();
const chan = socket.channel('room:game', {});

$(() => {
  if (!location.search.includes('debug')) {
    $('body').starfield({
      seedMovement: true
    });
  }
  if (location.search.includes('danger')) {
    $('.enemy-creation-button.hidden').removeClass('hidden');
  }

  $('.enemy-creation-button').click((e: Object) => {
    chan.push('create_enemy', {type: $(e.target).data('enemyType')});
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

    chan.on('processes', ({processes, atomMemory}: {processes: Array<Object>}) => {
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

boss(chan);
