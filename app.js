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

function convertBlockCommand(blockId, blocks) {
    if (isControlBlock(blocks[blockId])) {
        if (isWaitBlock(blocks[blockId])) return "WAIT";
        return "CONTROL";
    }
    return "COMMAND";
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
