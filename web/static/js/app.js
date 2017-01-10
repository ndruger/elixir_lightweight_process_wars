// @flow
import 'phoenix_html';
import {Socket} from 'phoenix';
import _ from 'lodash';
// import * as d3 from 'd3';

import World from './World';
import Pid from './Pid';

const socket = new Socket('/socket', {params: {token: window.userToken}});

const MAIN_WIDTH = 1000;
const MAIN_HEIGHT = 600;

const chatInput = $('#chat-input');
const messagesContainer = $('#messages');

socket.connect();
const chan = socket.channel('room:game', {});

// chatInput.on('keypress', (e: Object) => {
//   if(e.keyCode === 13){
//     chan.push('create_enemy', {type: 'simple_one_for_one'});
//     // chan.push("kill", {body: chatInput.val()})
//     // chan.push("kill", {body: chatInput.val()})
//     chatInput.val('');
//   }
// });

chan.on('new_msg', (payload: Object) => {
  console.log(payload);
  messagesContainer.append(`<br/>${JSON.stringify(payload.body)}`);
});


// function toSafeId(id) {
//   return id.replace(/\./g, '_').replace(/[\<\>]/g, '');
//   // return id;
// }
// function toId(safeId) {
//   return `<${safeId.replace(/_/g, '.')}>`;
// }



$(() => {
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
   
    $('.enemy-creation-button').click((e: Object) => {
      chan.push('create_enemy', {type: $(e.target).data('enemyType')});
    });


    // let oldProcesses = [];
    chan.on('processes', ({processes, atomMemory}: {processes: Array<Object>}) => {
      const atomMemoryPercent = atomMemory / 51658249 * 30;
      $('.atom-memory-bar').css({width: `${atomMemoryPercent}%`});
      // console.log(JSON.stringify(_.differenceBy(processes, oldProcesses, 'id')));
      // oldProcesses = processes;
      // const enemyProcesses = _.filter(processes, (process) => {
      //   return _.startsWith(process.name, 'enemy');
      // });
      // console.log(enemyProcesses);
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

  if (!location.search.includes('debug')) {
    $('body').starfield({
      seedMovement: true
    });
  }
  if (location.search.includes('danger')) {
    $('.enemy-creation-button.hidden').removeClass('hidden');
  }
});

// let nodes;
// let links;
// chan.on('processes', ({processes}) => {
//   // if (nodes) {
//   //   return;
//   // }

//   const newNodes = _.map(processes, (process) => {
//     return {
//       id: toSafeId(process.id),
//       name: process.name,
//     };
//   });

//   const els = _.map(processes, (process) => {
//     return $('<div>')
//       .text(process.name);
//   });

//   messagesContainer.html(els);
//   const newLinks = _.flatMap(processes, (process,) => {
//     const subLinks = _.map(process.links, (link) => {
//       return {
//         // source: i,
//         // source: toSafeId(process.id),
//         source: _.find(newNodes, {id: toSafeId(process.id)}),
//         sourceId: toSafeId(process.id),
//         // target: _.findIndex(newNodes, (node) => node.id === link),
//         // target: toSafeId(link),
//         target: _.find(newNodes, {id: toSafeId(link)}),
//         targetId: toSafeId(link),
//         weight: 1,
//       };
//     });
//     return _.filter(subLinks, (link) => link.target !== undefined);
//   });
//   if (nodes) {
//     const createdNodes = _.pullAllBy(_.clone(newNodes), nodes, 'id');
//     const remainedNodes = _.intersectionBy(_.clone(nodes), newNodes, 'id');
//     const createdLinks = _.pullAllBy(_.clone(newLinks), links, (link) => _.pick(link, ['sourceId', 'taregetId']));
//     const remainedLinks = _.pullAllBy(_.clone(links), newLinks, (link) => _.pick(link, ['sourceId', 'taregetId']));
//     console.log(_.difference(nodes, remainedNodes));
//     nodes = remainedNodes.concat(createdNodes);
//     // links = remainedLinks.concat(createdLinks);
//     // nodes = remainedNodes;
//     // links = remainedLinks;
//     // console.log(remainedLinks)
//     // nodes = remainedNodes;
//   } else {
//     nodes = newNodes;
//     links = newLinks;
//   }
//   update(nodes, links);
//   // console.log(payload)
// });



// var width = 2960,
//   height = 2500;

// var svg = d3.select('body').append('svg')
//     .attr('width', width)
//     .attr('height', height);

// var force = d3.layout.force()
//     .gravity(.05)
//     .distance(100)
//     .charge(-100)
//     .size([width, height]);

//   // force
//   //     .nodes(nodeModels)
//   //     .links(linkModels)
//   //     .start();

// function update(nodeModels, linkModels) {
//   // force
//   //     .nodes(nodeModels)
//   //     .links(linkModels)
//   //     .start();


//   const selection = svg.selectAll('.node')
//     // .data(nodeModels, function(d) {return d.id;});
//     .data(nodeModels);
//   selection.exit().remove();
//   var entered = selection
//     .enter()
//       .append('g')
//       .attr('class', 'node')
//       .on('click', (d) => {
//         // console.log(d);
//         // nodes = _.filter(nodes, (node) => {
//         //   return node.id !== d.id;
//         // });
//         // // links = _.filter(links, (link) => {
//         // //   return link.source.id !== d.id && link.target.id !== d.id;
//         // //   // return node.id !== d.id;
//         // // });
//         // nodes.push({
//         //   id: Math.random() + '',
//         //   name: Math.random() + '',
//         // });
//         // update(nodes, links);
//         console.log(d.id);
//         chan.push('kill', {pid: toId(d.id)});
//       })
//       .call(force.drag);

//   entered.append('circle')
//     .attr('r','5');

//   entered.append('text')
//       .attr('dx', 12)
//       .attr('dy', '.35em')
//       .text(function(d) { return d.name; });

//   var link = svg.selectAll('.link')
//       .data(linkModels);
//       // .data(linkModels, function(d) {return `${d.source.id}_${d.target.id}`;});
//   link.exit().remove();

//   link.enter().append('line')
//       .attr('class', 'link')
//     .style('stroke-width', function(d) { return Math.sqrt(d.weight); });

//   // force.start();
//   force
//       .nodes(nodeModels)
//       .links(linkModels)
//       .start();

//   force.on('tick', function() {
//     link.attr('x1', function(d) { return d.source.x; })
//         .attr('y1', function(d) { return d.source.y; })
//         .attr('x2', function(d) { return d.target.x; })
//         .attr('y2', function(d) { return d.target.y; });

//   // entered.attr("cx", function(d) { return d.x; })
//   //     .attr("cy", function(d) { return d.y; })
//     selection.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
//   });


// }
