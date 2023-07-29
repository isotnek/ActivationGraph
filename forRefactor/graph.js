const {resetNodes, resetLinks, findUpstreamNodes, highlightLinks} = require('../utils.js');
const d3 = require('d3');

function createNode(nodes, svg, drag, simulation, link) {
  let node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter().append('g')
    .on('click', function(event, d) {
      resetNodes(node);
      resetLinks(link);
      highlightLinks(d, link, node);
    })
    .on('dblclick', function(event, d) {
      d3.select(this).select('circle').attr('fill', 'black').attr('stroke', 'white');
      resetLinks(link);
    })
    .call(drag(simulation));

  node.append('circle')
    .attr('r', 20)
    .attr('fill', 'black');

  return node;
}

function createLink(links, svg) {
  let link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'link');

  return link;
}

function createSvg(width, height, node, link) {
  let svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  svg.on('click', function(event, d) {
    if (event.target.nodeName === 'svg') {
      resetNodes(node);
      resetLinks(link);
    }
  });

  return svg;
}

module.exports = { createSvg, createLink, createNode };
