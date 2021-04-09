const fs = require('fs');

const rawData = fs.readFileSync('projectTest2.json');
const scratchProject = JSON.parse(rawData);

const targets = scratchProject.targets.filter(target => Object.keys(target.blocks).length > 0)
let blocks = {}
if(targets.length > 0)
    blocks = targets[0].blocks

console.log(getName('GY0|]+]3o~kDK|*eQMS3',blocks))

function getName(blockId, blocks) {
    const block = blocks[blockId]

    switch(block.opcode) {
        case 'event_whenflagclicked':
            return 'When Green Flage Clicked'
        case 'motion_movesteps':
            return 'Move ' + block.inputs.STEPS[1][1] + " Steps"
        case 'motion_turnright':
            return 'Turn right ' + block.inputs.DEGREES[1][1] + " Degrees"
        case 'motion_turnleft':
            return 'Turn left ' + block.inputs.DEGREES[1][1] + " Degrees"
        case 'motion_gotoxy':
            return 'Go to ' + block.inputs.X[1][1] + "," + block.inputs.Y[1][1]
        case 'motion_setx':
            return 'Set X to ' + block.inputs.X[1][1]
        case 'motion_changexby':
            return 'Change X by ' + block.inputs.DX[1][1]
        case 'motion_sety':
            return 'Set Y to ' + block.inputs.Y[1][1]
        case 'motion_changeyby':
            return 'Change Y by ' + block.inputs.DY[1][1]
        case 'looks_say':
            return 'Say ' + block.inputs.MESSAGE[1][1]
        case 'looks_sayforsecs':
            return 'Say ' + block.inputs.MESSAGE[1][1] + 'For ' + block.inputs.SECS[1][1]
        case 'looks_think':
            return 'Think ' + block.inputs.MESSAGE[1][1]
        case 'looks_thinkforsecs':
            return 'Think ' + block.inputs.MESSAGE[1][1] + 'For ' + block.inputs.SECS[1][1]
        case 'event_whenkeypressed':
            return 'When ' + block.fields.KEY_OPTION[0] + ' pressed'
        case 'control_forever':
            return 'Forever ' + getName(block.inputs.SUBSTACK[1],blocks)
        //if
        case 'control_if':
            
      }
}
