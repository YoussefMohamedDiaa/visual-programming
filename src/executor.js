let cat = null
function execute(code, catSp, dialogController) {
    cat = catSp
    //console.log('Executing:')
    //console.log(code)
    //console.log("#############")
    const codeLines = getCodeLines(code)
    //console.log(eval('(!(!(2<3)) && (2==2)) && (4<6 && ((3<1)||(1<3)))'));
    //console.log(eval('2>3'));
    //console.log(evaluateUnitCondition(["(x=50)"]))
    //console.log(codeLines)
    //console.log("#############")
    //const line = getLineNumber(codeLines,0)
    //console.log(getBlockType(line))
    //executeLooksCommand(line,dialogController)
    //executeMotionCommand(line, cat)
    executeSequenceOfCommands(codeLines, dialogController)
}

async function executeSequenceOfCommands(codeLines, dialogController) {
    for (let i = 0; i < codeLines.length; i++) {
        //added 1 sec delay for visability
        const currentCommand = getLineNumber(codeLines, i)
        const currentCommandType = getBlockType(currentCommand)
        //console.log(currentCommandType)
        //console.log(currentCommand)
        switch (currentCommandType) {
            case 'Motion':
                await sleep(1)
                await executeMotionCommand(currentCommand)
                break
            case 'Looks':
                await executeLooksCommand(currentCommand, dialogController)
                break
            case 'Control':
                var startOfControl = i
                var endOfControl = getEndOfControlBlock(codeLines, i)

                var elseBlock = []
                var endOfElseControl = -1
                var elseFound = false
                if (codeLines.length > endOfControl) {
                    const nextCommand = getLineNumber(codeLines, endOfControl)
                    if (nextCommand[0] == 'ELSE') {
                        endOfElseControl = getEndOfControlBlock(
                            codeLines,
                            endOfControl
                        )
                        elseBlock = codeLines.slice(
                            endOfControl,
                            endOfElseControl
                        )
                        console.log(elseBlock)
                        elseFound = true
                    }
                }

                //var startOfElseControl = endOfControl

                if (!elseFound) i = endOfControl - 1
                else i = endOfElseControl - 1

                console.log(i)
                //   console.log(codeLines.slice(startOfControl, endOfControl))
                //   console.log(elseBlock)
                if (currentCommand[0] !== 'WAIT') {
                    await executeControlCommands(
                        codeLines.slice(startOfControl, endOfControl),
                        dialogController,
                        elseBlock
                    )
                } else {
                    i = endOfControl - 2
                    console.log(codeLines[i])
                    await executeControlCommands(
                        codeLines.slice(startOfControl, endOfControl - 1),
                        dialogController,
                        elseBlock
                    )
                }

                break
            default:
                break
        }
    }
}

function getBlockType(command) {
    if (
        (command[0] === 'Move') |
        (command[0] === 'Turn') |
        (command[0] === 'Go') |
        (command[0] === 'Change') |
        (command[0] === 'Set')
    )
        return 'Motion'
    else if ((command[0] === 'Say') | (command[0] === 'Think')) return 'Looks'
    else return 'Control'
}

function getEndOfControlBlock(codeLines, idx) {
    var beginCount = 0
    for (let i = idx + 1; i < codeLines.length; i++) {
        const currentCommand = getLineNumber(codeLines, i)
        if (currentCommand[0] === 'WAIT') return i - 1
        if (currentCommand[0] === 'END') beginCount--
        if (currentCommand[0] === 'BEGIN') beginCount++
        if (beginCount === 0) return i + 1
    }
    return -1
}

async function executeControlCommands(codeLines, dialogController, elseBlock) {
    console.log(codeLines)
    const firstCommand = getLineNumber(codeLines, 0)
    switch (firstCommand[0]) {
        case 'REPEAT':
            if (firstCommand[1] === 'UNTIL') {
                var condition = firstCommand
                    .slice(2, firstCommand.length)
                    .join(' ')
                while (!evaluateCondition(condition)) {
                    await executeSequenceOfCommands(
                        codeLines.slice(2, codeLines.length - 1),
                        dialogController
                    )
                }
            } else {
                for (var i = 0; i < parseInt(firstCommand[1]); i++) {
                    await executeSequenceOfCommands(
                        codeLines.slice(2, codeLines.length - 1),
                        dialogController
                    )
                }
            }
            break
        case 'FOREVER':
            while (true) {
                await executeSequenceOfCommands(
                    codeLines.slice(2, codeLines.length - 1),
                    dialogController
                )
            }
            break
        case 'WAIT':
            if (firstCommand[1] === 'UNTIL') {
                var condition = firstCommand
                    .slice(2, firstCommand.length)
                    .join(' ')
                while (!evaluateCondition(condition)) {
                    await sleep(1)
                }
            } else {
                //this one below specifcally not tested
                await sleep(parseInt(firstCommand[1]))
            }
            break
        case 'IF':
            var condition = firstCommand.slice(1, firstCommand.length).join(' ')
            if (evaluateCondition(condition))
                await executeSequenceOfCommands(
                    codeLines.slice(2, codeLines.length - 1),
                    dialogController
                )
            else if (elseBlock.length > 0) {
                await executeSequenceOfCommands(
                    elseBlock.slice(2, elseBlock.length - 1),
                    dialogController
                )
            }

            break
        default:
            break
    }
}

function evaluateCondition(condition) {
    condition = condition.replace(
        'Direction',
        (cat.rotation * 180) / Math.PI + ''
    )
    condition = condition.replace('x', cat.x + '')
    condition = condition.replace('y', cat.y + '')
    condition = condition.replace('AND', '&&')
    condition = condition.replace('OR', '||')
    condition = condition.replace('NOT', '!')
    return eval(condition)
}

async function executeLooksCommand(command, dialogController) {
    if (command[command.length - 2] === 'For') {
        //times looks command
        if (command[0] === 'Say')
            dialogController.say(command.slice(1, command.length - 2).join(' '))
        if (command[0] === 'Think')
            dialogController.think(
                command.slice(1, command.length - 2).join(' ')
            )

        await sleep(parseInt(command[command.length - 1]))
        dialogController.clear()
    } else {
        if (command[0] === 'Say')
            dialogController.say(command.slice(1, command.length - 2).join(' '))
        if (command[0] === 'Think')
            dialogController.think(
                command.slice(1, command.length - 2).join(' ')
            )
    }
}

function executeMotionCommand(command) {
    switch (command[0]) {
        case 'Move':
            //cat.x += parseInt(command[1])
            cat.x += parseInt(command[1]) * Math.cos(cat.rotation)
            cat.y += parseInt(command[1]) * Math.sin(cat.rotation)
            break
        case 'Turn':
            if (command[1] === 'right')
                cat.rotation += (parseInt(command[2]) / 360) * 2 * Math.PI
            else cat.rotation -= (parseInt(command[2]) / 360) * 2 * Math.PI
            break
        case 'Change':
            if (command[1] === 'X') cat.x += parseInt(command[3])
            else cat.y += parseInt(command[3])
            break
        case 'Set':
            if (command[1] === 'X') cat.x = parseInt(command[3])
            else cat.y = parseInt(command[3])
            break
        case 'Go':
            cat.x = parseInt(command[2].split(',')[0])
            cat.y = parseInt(command[2].split(',')[1])
            break
        default:
            break
    }
}

function evaluateUnitCondition(condition) {
    const pureCondition = condition[0].substring(1, condition[0].length - 1)
    var operator = ''
    if (pureCondition.includes('<')) {
        operator = '<'
    } else if (pureCondition.includes('>')) {
        operator = '>'
    } else if (pureCondition.includes('=')) {
        operator = '='
    }
    var leftHand
    var rightHand
    if (pureCondition.split(operator)[0] === 'x') {
        leftHand = cat.x
        rightHand = parseInt(pureCondition.split(operator)[1])
    } else if (pureCondition.split(operator)[0] === 'y') {
        leftHand = cat.y
        rightHand = parseInt(pureCondition.split(operator)[1])
    } else if (pureCondition.split(operator)[1] === 'x') {
        leftHand = parseInt(pureCondition.split(operator)[0])
        rightHand = cat.x
    } else if (pureCondition.split(operator)[1] === 'y') {
        leftHand = parseInt(pureCondition.split(operator)[0])
        rightHand = cat.y
    }

    if (pureCondition.includes('<')) {
        return leftHand < rightHand
    } else if (pureCondition.includes('>')) {
        return leftHand > rightHand
    } else if (pureCondition.includes('=')) {
        return leftHand === rightHand
    }
}

function sleep(s) {
    let ms = s * 1000
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function getCodeLines(code) {
    const codeLines = code.split('\n')
    return codeLines
}

function getLineNumber(codeLines, idx) {
    return codeLines[idx].trim().split(' ')
}

export default execute
