const { ipcRenderer } = require('electron')
const { nodes, links } = require('./data');

function toDOT(nodes, links) {
  let dot = "digraph {\n";

  nodes.forEach(node => {
    dot += `  ${node.id} [group=${node.group}];\n`;
  });

  links.forEach(link => {
    dot += `  ${link.source} -> ${link.target};\n`;
  });

  dot += "}";
  return dot;
}

document.getElementById('editor').value = toDOT(nodes, links);

document.getElementById('submit').addEventListener('click', () => {
  const code = document.getElementById('editor').value;
  ipcRenderer.send('graphviz-code', code);
});
