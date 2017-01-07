import "phoenix_html"
import {Socket} from "phoenix"
import _ from 'lodash';
import * as d3 from "d3";

const socket = new Socket("/socket", {params: {token: window.userToken}})

const chatInput         = $("#chat-input")
const messagesContainer = $("#messages")

socket.connect()
const chan = socket.channel("room:game", {})

console.log(d3);

chatInput.on("keypress", event => {
  if(event.keyCode === 13){
    console.log(event)
    chan.push("new_msg", {body: chatInput.val()})
    // chan.push("kill", {body: chatInput.val()})
    chatInput.val("")
  }
})

chan.on("new_msg", payload => {
  console.log(payload)
  messagesContainer.append(`<br/>${JSON.stringify(payload.body)}`)
})

let nodes;
let links;
chan.on("processes", ({processes}) => {
  if (nodes) {
    return;
  }
  nodes = _.map(processes, (process) => {
    return {
      id: process.id,
      name: process.name,
    };
  });
  links = _.flatMap(processes, (process, i) => {
     const subLinks = _.map(process.links, (link) => {
      return {
        source: i,
        target: _.findIndex(nodes, (node) => node.id === link),
        weight: 1,
      };
    });
    return _.filter(subLinks, (link) => link.target !== -1)
  });
  console.log(_.map(links, (link) => link.target))
  update(nodes, links)
  // console.log(payload)
})

chan.join().receive("ok", chan => {
  console.log("Welcome to Phoenix Chat!")
})


var width = 2960,
    height = 2500;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width, height]);

function update(nodeModels, linkModels) {
  force
      .nodes(nodeModels)
      .links(linkModels)
      .start();

  var link = svg.selectAll(".link")
      .data(linkModels)
    .enter().append("line")
      .attr("class", "link")
    .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

  const selection = svg.selectAll(".node").data(nodeModels);
  var node = selection
    .enter()
      .append("g")
      .attr("class", "node")
      .on("click", (d) => {
        console.log(d);
        nodes = _.filter(nodes, (node) => {
          return node.id !== d.id;
        })
        links = _.filter(links, (link) => {
          return link.source !== d.id && link.target !== d.id;
          // return node.id !== d.id;
        })
        update(nodes, links);
        // chan.push("kill", {pid: node.id})
      })
      .call(force.drag)

  node.append("circle")
      .attr("r","5");

  node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

  selection.exit().remove();;
}
