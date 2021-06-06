let cat = null

function execute(code, catSprite, dialogController) {
    cat = catSprite
    const codeLines = getCodeLines(code)
    executeSequenceOfCommands(codeLines, dialogController)
}

async function executeSequenceOfCommands(codeLines, dialogController) {
    for (let i = 0; i < codeLines.length; i++) {
        const currentCommand = getLineAt(codeLines, i)
        const currentCommandType = getBlockType(currentCommand)
        switch (currentCommandType) {
            case 'Motion':
                await executeMotionCommand(currentCommand)
                break
            case 'Looks':
                await executeLooksCommand(currentCommand, dialogController)
                break
            case 'Wait':
                await executeWaitCommand(currentCommand)
                break
            case 'Control':
                let startOfControl = i
                let endOfControl = getEndOfControlBlock(codeLines, i)

                let elseBlock = []
                let endOfElseControl = -1
                let elseFound = false
                if (endOfControl < codeLines.length) {
                    const nextCommand = getLineAt(codeLines, endOfControl)
                    if (nextCommand[0] === 'ELSE') {
                        endOfElseControl = getEndOfControlBlock(
                            codeLines,
                            endOfControl
                        )
                        elseBlock = codeLines.slice(
                            endOfControl,
                            endOfElseControl
                        )
                        elseFound = true
                    }
                }

                if (!elseFound) i = endOfControl - 1
                else i = endOfElseControl - 1

                await executeControlCommands(
                    codeLines.slice(startOfControl, endOfControl),
                    dialogController,
                    elseBlock
                )
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
    ) {
        return 'Motion'
    } else if ((command[0] === 'Say') | (command[0] === 'Think')) {
        return 'Looks'
    } else if (command[0] === 'WAIT') {
        return 'Wait'
    } else {
        return 'Control'
    }
}

function getEndOfControlBlock(codeLines, idx) {
    let beginCount = 0
    for (let i = idx + 1; i < codeLines.length; i++) {
        const currentCommand = getLineAt(codeLines, i)
        if (currentCommand[0] === 'BEGIN') beginCount++
        if (currentCommand[0] === 'END') beginCount--
        if (beginCount === 0) return i + 1
    }
    return -1
}

async function executeWaitCommand(command) {
    if (command[1] === 'UNTIL') {
        let condition = command.slice(2).join(' ')
        while (!evaluateCondition(condition)) await sleep(0.01)
    } else {
        await sleep(parseInt(command[1]))
    }
}

async function executeControlCommands(codeLines, dialogController, elseBlock) {
    const firstCommand = getLineAt(codeLines, 0)
    const insideBlocks = codeLines.slice(2, codeLines.length - 1)
    switch (firstCommand[0]) {
        case 'REPEAT':
            if (firstCommand[1] === 'UNTIL') {
                let condition = firstCommand
                    .slice(2, firstCommand.length)
                    .join(' ')
                while (!evaluateCondition(condition)) {
                    await executeSequenceOfCommands(
                        insideBlocks,
                        dialogController
                    )
                    sleep(0.01)
                }
            } else {
                for (let i = 0; i < parseInt(firstCommand[1]); i++) {
                    await executeSequenceOfCommands(
                        insideBlocks,
                        dialogController
                    )
                    sleep(0.01)
                }
            }
            break
        case 'FOREVER':
            while (true) {
                await executeSequenceOfCommands(insideBlocks, dialogController)
                sleep(0.01)
            }
        case 'IF':
            let condition = firstCommand.slice(1, firstCommand.length).join(' ')
            if (evaluateCondition(condition))
                await executeSequenceOfCommands(insideBlocks, dialogController)
            else if (elseBlock.length > 0) {
                await executeSequenceOfCommands(
                    elseBlock.slice(2, elseBlock.length - 1),
                    dialogController
                )
            }
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
            dialogController.say(command.slice(1, command.length).join(' '))
        if (command[0] === 'Think')
            dialogController.think(command.slice(1, command.length).join(' '))
    }
}

function executeMotionCommand(command) {
    switch (command[0]) {
        case 'Move':
            cat.x += parseInt(command[1]) * Math.cos(cat.rotation)
            cat.y += parseInt(command[1]) * Math.sin(cat.rotation)
            break
        case 'Turn':
            if (command[1] === 'right')
                cat.rotation += (parseInt(command[2]) / 180) * Math.PI
            else cat.rotation -= (parseInt(command[2]) / 180) * Math.PI
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

function getLineAt(codeLines, idx) {
    return codeLines[idx].trim().split(' ')
}

export default execute
