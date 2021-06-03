function execute(code, cat, dialogController) {
    console.log('Executing:')
    console.log(code)
    console.log("#############")
    const codeLines = getCodeLines(code)
    console.log(codeLines)
    console.log("#############")
    console.log(getLineNumber(codeLines,3))
    //cat.x+=10
    //cat.y-=10
}

function getCodeLines(code){
    const codeLines = code.split('\n')
    return codeLines
}

function getLineNumber(codeLines, idx){
    return codeLines[idx].trim().split(" ")
}

export default execute
