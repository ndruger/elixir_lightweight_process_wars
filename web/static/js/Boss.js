// @flow
import _ from 'lodash';
import * as d3 from 'd3';

export function boss(chan) {

  function toSafeId(id) {
    return id.replace(/\./g, '_').replace(/[\<\>]/g, '');
    // return id;
  }
  function toId(safeId) {
    return `<${safeId.replace(/_/g, '.')}>`;
  }
  let nodes;
  let links;

  chan.on('processes', ({processes}) => {
    // if (nodes) {
    //   return;
    // }

    const newNodes = _.map(processes, (process) => {
      return {
        id: toSafeId(process.id),
        name: process.name,
      };
    });

    // const els = _.map(processes, (process) => {
    //   return $('<div>')
    //     .text(process.name);
    // });

    const newLinks = _.flatMap(processes, (process,) => {
      const subLinks = _.map(process.links, (link) => {
        return {
          // source: i,
          // source: toSafeId(process.id),
          source: _.find(newNodes, {id: toSafeId(process.id)}),
          sourceId: toSafeId(process.id),
          // target: _.findIndex(newNodes, (node) => node.id === link),
          // target: toSafeId(link),
          target: _.find(newNodes, {id: toSafeId(link)}),
          targetId: toSafeId(link),
          weight: 1,
        };
      });
      return _.filter(subLinks, (link) => link.target !== undefined);
    });
    if (nodes) {
      const createdNodes = _.pullAllBy(_.clone(newNodes), nodes, 'id');
      const remainedNodes = _.intersectionBy(_.clone(nodes), newNodes, 'id');
      const createdLinks = _.pullAllBy(_.clone(newLinks), links, (link) => _.pick(link, ['sourceId', 'taregetId']));
      const remainedLinks = _.pullAllBy(_.clone(links), newLinks, (link) => _.pick(link, ['sourceId', 'taregetId']));
      console.log(_.difference(nodes, remainedNodes));
      nodes = remainedNodes.concat(createdNodes);
      // links = remainedLinks.concat(createdLinks);
      // nodes = remainedNodes;
      // links = remainedLinks;
      // console.log(remainedLinks)
      // nodes = remainedNodes;
    } else {
      nodes = newNodes;
      links = newLinks;
    }
    update(nodes, links);
    // console.log(payload)
  });



  var width = $( window ).width(),
    height = $( window ).height();

  var svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height);

  var force = d3.layout.force()
      .gravity(.05)
      .distance(100)
      .charge(-100)
      .size([width, height]);

    // force
    //     .nodes(nodeModels)
    //     .links(linkModels)
    //     .start();

  function update(nodeModels, linkModels) {
    // force
    //     .nodes(nodeModels)
    //     .links(linkModels)
    //     .start();


    const selection = svg.selectAll('.node')
      // .data(nodeModels, function(d) {return d.id;});
      .data(nodeModels);
    selection.exit().remove();
    var entered = selection
      .enter()
        .append('g')
        .attr('class', 'node')
        .on('click', (d) => {
          // console.log(d);
          // nodes = _.filter(nodes, (node) => {
          //   return node.id !== d.id;
          // });
          // // links = _.filter(links, (link) => {
          // //   return link.source.id !== d.id && link.target.id !== d.id;
          // //   // return node.id !== d.id;
          // // });
          // nodes.push({
          //   id: Math.random() + '',
          //   name: Math.random() + '',
          // });
          // update(nodes, links);
          console.log(d.id);
          chan.push('kill', {pid: toId(d.id)});
        })
        .call(force.drag);

    entered.append('circle')
      .attr('r','5');
      // .style("fill", function(d) { return '#'+Math.random().toString(16).substr(-6); })

    entered.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text(function(d) { return d.name; });

    var link = svg.selectAll('.link')
        .data(linkModels);
        // .data(linkModels, function(d) {return `${d.source.id}_${d.target.id}`;});
    link.exit().remove();

    link.enter().append('line')
        .attr('class', 'link')
      .style('stroke-width', function(d) { return Math.sqrt(d.weight); });

    // force.start();
    force
        .nodes(nodeModels)
        .links(linkModels)
        .start();

    force.on('tick', function() {
      link.attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

    // entered.attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; })
      selection.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    });
  }
};
