function execute(code, cat, dialogController) {
    console.log('Executing:')
    console.log(code)
    console.log("#############")
    const codeLines = getCodeLines(code)
    console.log(codeLines)
    console.log("#############")
    const line = getLineNumber(codeLines,2)
    //executeMotionCommand(line, cat)

    //cat.x+=10
    //cat.y-=10
}

function executeMotionCommand(command, cat){
    console.log("command"+command[0])
    switch(command[0]) {
        case "Move":
          cat.x += parseInt(command[1]);
          break;
        case "Turn":
          if(command[1]=="right")
            cat.rotation +=parseInt(command[2]);
          else
            cat.rotation -=parseInt(command[2]);   
          break;
        case "Change":
          if(command[1]=="X")  
            cat.x += parseInt(command[3]);
          else
            cat.y += parseInt(command[3]);  
          break;
        case "Set":
          if(command[1]=="X")  
            cat.x = parseInt(command[3]);
          else
            cat.y = parseInt(command[3]);  
          break;
        case "Go":
            cat.x = parseInt(command[2].split(',')[0]);
            cat.y = parseInt(command[2].split(',')[1]);
            break;     
        default:
           break;
      }
}

function getCodeLines(code){
    const codeLines = code.split('\n')
    return codeLines
}

function getLineNumber(codeLines, idx){
    return codeLines[idx].trim().split(" ")
}

export default execute
