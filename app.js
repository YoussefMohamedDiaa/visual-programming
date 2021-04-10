const fs = require("fs");

function parseScratchProject(path) {
    const rawData = fs.readFileSync(path);
    const scratchProject = JSON.parse(rawData);

    const targets = scratchProject.targets.filter(
        (target) => Object.keys(target.blocks).length > 0
    );
    let blocks = {};
    if (targets.length > 0) blocks = targets[0].blocks;

    return blocks;
}

function isControlBlock(block) {
    return block.opcode.startsWith("control");
}

function isEventBlock(block) {
    return block.opcode.startsWith("event");
}

function isWaitBlock(block) {
    return block.opcode.startsWith("control_wait");
}

function createIndentation(indentLevel) {
    let indentation = "";
    for (let i = 0; i < indentLevel; i++) indentation += " ";
    return indentation;
}

// function convertBlockCommand(blockId, blocks) {
//     if (isControlBlock(blocks[blockId])) {
//         if (isWaitBlock(blocks[blockId])) return "WAIT";
//         return "CONTROL";
//     }
//     return "COMMAND";
// }

function convertBlockCommand(blockId, blocks) {
  const block = blocks[blockId];

  switch (block.opcode) {
    case "event_whenflagclicked":
      return "When Green Flage Clicked";
    case "motion_movesteps":
      return "Move " + block.inputs.STEPS[1][1] + " Steps";
    case "motion_turnright":
      return "Turn right " + block.inputs.DEGREES[1][1] + " Degrees";
    case "motion_turnleft":
      return "Turn left " + block.inputs.DEGREES[1][1] + " Degrees";
    case "motion_gotoxy":
      return "Go to " + block.inputs.X[1][1] + "," + block.inputs.Y[1][1];
    case "motion_setx":
      return "Set X to " + block.inputs.X[1][1];
    case "motion_changexby":
      return "Change X by " + block.inputs.DX[1][1];
    case "motion_sety":
      return "Set Y to " + block.inputs.Y[1][1];
    case "motion_changeyby":
      return "Change Y by " + block.inputs.DY[1][1];
    case "looks_say":
      return "Say " + block.inputs.MESSAGE[1][1];
    case "looks_sayforsecs":
      return (
        "Say " + block.inputs.MESSAGE[1][1] + "For " + block.inputs.SECS[1][1]
      );
    case "looks_think":
      return "Think " + block.inputs.MESSAGE[1][1];
    case "looks_thinkforsecs":
      return (
        "Think " + block.inputs.MESSAGE[1][1] + "For " + block.inputs.SECS[1][1]
      );
    case "event_whenkeypressed":
      return "When " + block.fields.KEY_OPTION[0] + " pressed";
    case "control_forever":
      return "Forever " + convertBlockCommand(block.inputs.SUBSTACK[1], blocks);
    case "control_if":
      return (
        "If (" +
        convertBlockCommand(block.inputs.CONDITION[1], blocks) +
        ") Then: " +
        convertBlockCommand(block.inputs.SUBSTACK[1], blocks)
      );
    case "control_if_else":
      return (
        "If (" +
        convertBlockCommand(block.inputs.CONDITION[1], blocks) +
        ") Then: " +
        convertBlockCommand(block.inputs.SUBSTACK[1], blocks) +
        " Else: " +
        convertBlockCommand(block.inputs.SUBSTACK2[1], blocks)
      );
    case "control_repeat":
      return (
        "Repeat (" +
        convertBlockCommand(block.inputs.SUBSTACK[1], blocks) +
        ") " +
        block.inputs.TIMES[1][1] +
        " Times"
      );
    case "control_wait":
      return "Wait " + block.inputs.DURATION[1][1] + " seconds";
    case "control_wait_until":
      return (
        "Wait until " + convertBlockCommand(block.inputs.CONDITION[1], blocks)
      );
    case "operator_gt":
      return block.inputs.OPERAND1[1][1] + ">" + block.inputs.OPERAND2[1][1];
    case "control_repeat_until":
      return (
        "Repeat (" +
        convertBlockCommand(block.inputs.SUBSTACK[1], blocks) +
        ") until " +
        convertBlockCommand(block.inputs.CONDITION[1], blocks)
      );
  }
}

function addBeginCommandToPseudoCode(pseudoCode, indentLevel) {
    const indentation = createIndentation(indentLevel);
    pseudoCode.code += indentation + "BEGIN" + "\n";
}

function addEndCommandToPseudoCode(pseudoCode, indentLevel) {
    const indentation = createIndentation(indentLevel);
    pseudoCode.code += indentation + "END" + "\n";
}

function addBlockCommandToPseudoCode(blockId, pseudoCode, indentLevel, blocks) {
    const command = convertBlockCommand(blockId, blocks);
    const indentation = createIndentation(indentLevel);
    pseudoCode.code += indentation + command + "\n";
}

function getBlockInSubStackId(block) {
    return block.inputs.SUBSTACK[1];
}

function getTopOfSubStackId(blockInSubStackId, controlBlockId, blocks) {
    while (blocks[blockInSubStackId].parent !== controlBlockId)
        blockInSubStackId = blocks[blockInSubStackId].parent;
    return blockInSubStackId;
}

function convertBlocksSubtree(currentBlockId, pseudoCode, indentLevel, blocks) {
    if (currentBlockId === null) return;

    addBlockCommandToPseudoCode(
        currentBlockId,
        pseudoCode,
        indentLevel,
        blocks
    );

    const nextBlock = blocks[currentBlockId].next;

    if (
        isControlBlock(blocks[currentBlockId]) &&
        !isWaitBlock(blocks[currentBlockId])
    ) {
        const blockInSubStackId = getBlockInSubStackId(blocks[currentBlockId]);
        const topOfSubStackId = getTopOfSubStackId(
            blockInSubStackId,
            currentBlockId,
            blocks
        );

        addBeginCommandToPseudoCode(pseudoCode, indentLevel + 2);
        convertBlocksSubtree(
            topOfSubStackId,
            pseudoCode,
            indentLevel + 4,
            blocks
        );
        addEndCommandToPseudoCode(pseudoCode, indentLevel + 2);

        convertBlocksSubtree(nextBlock, pseudoCode, indentLevel, blocks);
    } else if (isEventBlock(blocks[currentBlockId])) {
        addBeginCommandToPseudoCode(pseudoCode, indentLevel + 2);
        convertBlocksSubtree(nextBlock, pseudoCode, indentLevel + 4, blocks);
        addEndCommandToPseudoCode(pseudoCode, indentLevel + 2);
    } else {
        convertBlocksSubtree(nextBlock, pseudoCode, indentLevel, blocks);
    }
}

function convertBlocksToPseudoCode(blocks) {
    const roots = {};
    for (const [key, value] of Object.entries(blocks))
        if (value.parent === null) roots[key] = value;

    pseudoCode = { code: "" };
    for (const subRoot of Object.keys(roots))
        convertBlocksSubtree(subRoot, pseudoCode, /*indentLevel=*/ 0, blocks);

    return pseudoCode.code;
}

function main() {
    const blocks = parseScratchProject(
        "./scratch-projects/nested-controls/project.json"
    );

    const pseudoCode = convertBlocksToPseudoCode(blocks);

    console.log(pseudoCode);
}

main();
