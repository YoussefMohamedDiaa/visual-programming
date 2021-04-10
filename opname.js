const fs = require('fs');

const rawData = fs.readFileSync('projectTest2.json');
const scratchProject = JSON.parse(rawData);

const targets = scratchProject.targets.filter(target => Object.keys(target.blocks).length > 0)
let blocks = {}
if(targets.length > 0)
    blocks = targets[0].blocks

//console.log(getName('/WHsUG9WJbjGA)7mw}Vf',blocks))

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
        case 'control_if':
            return 'If (' + getName(block.inputs.CONDITION[1],blocks)+') Then: '+getName(block.inputs.SUBSTACK[1],blocks)
        case 'control_if_else':
            return 'If (' + getName(block.inputs.CONDITION[1],blocks)
                    +') Then: '+getName(block.inputs.SUBSTACK[1],blocks)
                    +' Else: '+ getName(block.inputs.SUBSTACK2[1],blocks)
        case 'control_repeat':
            return 'Repeat ('+ getName(block.inputs.SUBSTACK[1],blocks) +') '+ block.inputs.TIMES[1][1] +' Times'
        case 'control_wait':
            return 'Wait '+ block.inputs.DURATION[1][1]+ ' seconds'
        case 'control_wait_until':
            return 'Wait until '+ getName(block.inputs.CONDITION[1],blocks)
        case 'operator_gt':
            return block.inputs.OPERAND1[1][1]+'>'+block.inputs.OPERAND2[1][1]
        case 'control_repeat_until':
            return 'Repeat ('+ getName(block.inputs.SUBSTACK[1],blocks) +') until '+getName(block.inputs.CONDITION[1],blocks)
      }
}
