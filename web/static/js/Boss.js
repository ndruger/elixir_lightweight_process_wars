// @flow
import _ from 'lodash';
import * as d3 from 'd3';

function toSafeId(id: string) {
  return id.replace(/\./g, '_').replace(/[\<\>]/g, '');
}

function fromSafeId(safeId: string) {
  return `<${safeId.replace(/_/g, '.')}>`;
}

export default class Boss {
  _chan: Object;
  _svg: Object;
  _force: Object;
  _nodes: Array<Object>;
  _links: Array<Object>;

  constructor(chan: Object) {
    this._chan = chan;
    this._chan.on('processes', this._onUpdate);
    this._init();
  }

  _init() {
    const width = $(window).width();
    const height = $(window).height();

    this._svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height);

    this._force = d3.layout.force()
      .gravity(.05)
      .distance(100)
      .charge(-100)
      .size([width, height]);
  }

  _onUpdate = ({processes}: {processes: Array<Object>}) => {
    const newNodes = _.map(processes, (process: Object) => {
      return {
        id: toSafeId(process.id),
        name: process.name,
      };
    });

    const newLinks = _.flatMap(processes, (process: Object) => {
      const subLinks = _.map(process.links, (link: string) => {
        return {
          source: _.find(newNodes, {id: toSafeId(process.id)}),
          sourceId: toSafeId(process.id),
          target: _.find(newNodes, {id: toSafeId(link)}),
          targetId: toSafeId(link),
          weight: 1,
        };
      });
      return _.filter(subLinks, (link) => link.target !== undefined);
    });

    if (this._nodes) {
      const createdNodes = _.pullAllBy(_.clone(newNodes), this._nodes, 'id');
      const remainedNodes = _.intersectionBy(_.clone(this._nodes), newNodes, 'id');
      // const createdLinks = _.pullAllBy(_.clone(newLinks), this._links, (link) => _.pick(link, ['sourceId', 'taregetId']));
      // const remainedLinks = _.pullAllBy(_.clone(this._links), newLinks, (link) => _.pick(link, ['sourceId', 'taregetId']));
      // console.log(_.difference(this._nodes, remainedNodes));
      this._nodes = remainedNodes.concat(createdNodes);
      // this._links = remainedLinks.concat(createdLinks);
      // this._nodes = remainedNodes;
      // this._links = remainedLinks;
      // this._nodes = remainedNodes;
    } else {
      this._nodes = newNodes;
      this._links = newLinks;
    }
    this._updateView(this._nodes, this._links);
  }

  _updateView(nodeModels: Array<Object>, linkModels: Array<Object>) {
    const selection = this._svg
      .selectAll('.node')
      .data(nodeModels);
    selection.exit().remove();
    const entered = selection
      .enter()
      .append('g')
      .attr('class', 'node')
      .on('click', (d) => {
        this._chan.push('kill', {pid: fromSafeId(d.id)});
      })
      .call(this._force.drag);

    entered.append('circle')
      .attr('r','5');
      // .style('fill', function() '#'+Math.random().toString(16).substr(-6));

    entered.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text((d) => d.name)
        .style('fill', () => '#'+Math.random().toString(16).substr(-6));

    const link = this._svg
      .selectAll('.link')
      .data(linkModels);
      // .data(linkModels, (d) => {return `${d.source.id}_${d.target.id}`;});
    link.exit().remove();

    link.enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke-width', (d) => Math.sqrt(d.weight));

    this._force
      .nodes(nodeModels)
      .links(linkModels)
      .start();

    this._force.on('tick', function() {
      link.attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

      selection.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
    });
  }
}
