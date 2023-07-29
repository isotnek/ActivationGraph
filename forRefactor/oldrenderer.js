const { createSvg, createLink, createNode } = require('./graph');
const { resetNodes, resetLinks, drag } = require('../utils');
const { nodes, links } = require('./graphData.js');

var width = 800;
var height = 600;

let svg = createSvg(width, height);  // createSvg does not need node and link

var link = createLink(links, svg);

var node = createNode(nodes, svg, drag, simulation, link);
