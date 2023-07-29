const nodes = [
    {id: 'dynamical_systems', group: 1},
    {id: 'information_theory', group: 1},
    {id: 'neurobiology', group: 1},
    {id: 'data_analysis', group: 1},
    {id: 'theorist', group: 2},
    {id: 'experimentalist', group: 2},
];

const links = [
    {source: 'dynamical_systems', target: 'theorist'},
    {source: 'information_theory', target: 'theorist'},
    {source: 'neurobiology', target: 'experimentalist'},
    {source: 'data_analysis', target: 'experimentalist'},
];

module.exports = { nodes, links };