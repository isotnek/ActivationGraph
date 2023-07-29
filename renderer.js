const { nodes, links } = require('./data.js');
const { ipcRenderer } = require('electron');

// Function to highlight links
function highlightLinks(clickedNode) {
  let upstreamNodes = findUpstreamNodes(clickedNode.id, links);
  upstreamNodes.push(clickedNode.id);
  link.style('stroke', function (l) {
    if (upstreamNodes.includes(l.source.id) && upstreamNodes.includes(l.target.id))
      return 'yellow';
    else
      return 'red';
  });
}

// Function to reset links
function resetLinks() {
  link.style('stroke', 'red');
}

function resetNodes() {
  node.each(function () {
    d3.select(this).select('circle').attr('fill', 'black').attr('stroke', 'white');
  });
}

function findUpstreamNodes(nodeId, links) {
  let upstreamNodes = [];
  let nodesToSearch = [nodeId];

  while (nodesToSearch.length > 0) {
    let currentNode = nodesToSearch.pop();

    links.forEach(link => {
      if (link.target.id === currentNode && !upstreamNodes.includes(link.source.id)) {
        upstreamNodes.push(link.source.id);
        nodesToSearch.push(link.source.id);
      }
    });
  }

  return upstreamNodes;
}

// Define the svg dimensions
var width = window.innerWidth;
var height = window.innerHeight;

// Create the svg
var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

window.addEventListener("resize", function () {
  width = window.innerWidth;
  height = window.innerHeight;

  svg.attr("width", window.innerWidth);
  svg.attr("height", window.innerHeight);

  simulation
    .force('x', d3.forceX().x(function (d) {
      // position nodes from left to right based on the group
      return width / 5 * d.group;
    }).strength(2)) // increase strength for a tighter layout
    .force('y', d3.forceY(height / 2).strength(0.05)) // Align nodes vertically in the middle
    .force('collide', d3.forceCollide(40)); // Increase collision radius to prevent overlap
  simulation.alpha(1).restart();
});

svg.on('click', function (event, d) {
  if (event.target.nodeName === 'svg') {
    resetNodes();
    resetLinks();
  }
});

// Get all unique group ids from the nodes
var groupIds = [...new Set(nodes.map(node => node.group))];

// Map groupIds to a continuous range
var groupScale = d3.scaleOrdinal()
  .domain(groupIds)
  .range(d3.range(groupIds.length));

var xScale = d3.scaleBand()
    .domain(d3.range(groupIds.length)) // This domain is now a continuous range from 0 to the number of groups
    .range([width * 0.1, width * 0.9]) 
    .padding(0.1);

// Create a force simulation
var simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('x', d3.forceX().x(function (d) {
    // Use the groupScale to convert the group to a continuous range, then use the xScale to determine the x-coordinate
    return xScale(groupScale(d.group));  
  }).strength(6)) 
  .force('y', d3.forceY(height / 2).strength(0.05))
  .force('collide', d3.forceCollide(20));

// Create the link lines
var link = svg.append('g')
  .attr('class', 'links')
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('class', 'link');

// Create the nodes as group elements
var node = svg.append('g')
  .attr('class', 'nodes')
  .selectAll('g')
  .data(nodes)
  .enter().append('g')
  .on('click', function (event, d) {
    resetNodes();
    resetLinks();
    let upstreamNodes = findUpstreamNodes(d.id, links);
    upstreamNodes.push(d.id);  // add the clicked node
    node.each(function (n) {
      if (upstreamNodes.includes(n.id)) {
        d3.select(this).select('circle').attr('fill', 'yellow').attr('stroke', 'black');
      }
    });
    highlightLinks(d);
  })
  .on('dblclick', function (event, d) {
    d3.select(this).select('circle').attr('fill', 'black').attr('stroke', 'white');
    resetLinks();
  })
  .call(drag(simulation));

// Add circles to the node groups
node.append('circle')
  .attr('r', 20)
  .attr('fill', 'black');

// Add labels to the node groups
node.append('text')
  .text(d => d.id)
  .attr('x', 6)
  .attr('y', -30)
  .style('fill', '#39ff14');

// Update the positions of the nodes and links
simulation.on('tick', () => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  node
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
});

// Define a drag behavior
function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

// Function to handle export
function exportSVG() {
    simulation.stop();
    let serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg.node());

    //add name spaces
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    ipcRenderer.send('save-svg', source);
}

d3.select('body').append('button')
  .text('Export Graph')
  .attr('style', 'position: fixed; top: 10px; left: 10px; z-index: 1000;')  // This places the button at the top left corner of the window, above everything else.
  .style('background', 'transparent')  // Make the button transparent
  .style('border', '2px solid #39ff14')  // Add a border
  .style('color', '#39ff14')  // Change the text color
  .style('padding', '10px')  // Add some padding for better appearance
  .on('click', exportSVG);
