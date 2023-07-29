const d3 = require('d3');
function resetNodes(node) {
    node.each(function() {
      d3.select(this).select('circle').attr('fill', 'black').attr('stroke', 'white');
    });
  }
  
function resetLinks(link) {
    link.style('stroke', 'red');
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

function highlightLinks(clickedNode, link, node) {
  let upstreamNodes = findUpstreamNodes(clickedNode.id, link);
  upstreamNodes.push(clickedNode.id);
  link.style('stroke', function(l) {
    if (upstreamNodes.includes(l.source.id) && upstreamNodes.includes(l.target.id))
      return 'yellow';
    else
      return 'red';
  });
}  

module.exports = {resetNodes, resetLinks, findUpstreamNodes, highlightLinks}