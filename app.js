const fs = require('fs');

const rawData = fs.readFileSync('./scratch-projects/demo-project/project.json');
const scratchProject = JSON.parse(rawData);

const targets = scratchProject.targets.filter(target => Object.keys(target.blocks).length > 0)
let blocks = {}
if(targets.length > 0)
    blocks = targets[0].blocks
console.log(blocks)
