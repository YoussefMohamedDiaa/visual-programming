function execute(code, cat, dialogController) {
    console.log('Executing:')
    console.log(code)
    console.log("#############")
    const codeLines = getCodeLines(code)
    console.log(codeLines)
    console.log("#############")
    //const line = getLineNumber(codeLines,0)
    //console.log(getBlockType(line))
    //executeLooksCommand(line,dialogController)
    //executeMotionCommand(line, cat)
    executeSequenceOfCommands(codeLines,cat, dialogController)
    
}

async function executeSequenceOfCommands(codeLines, cat, dialogController){
    for (var i = 0; i < codeLines.length; i++) {
        //added 1 sec delay for visability
        await sleep(1)
        const currentCommand = getLineNumber(codeLines,i)
        console.log(currentCommand)
        const currentCommandType = getBlockType(currentCommand)
        switch(currentCommandType){
          case "Motion":
              executeMotionCommand(currentCommand, cat)
              break;
          case "Looks":
              executeLooksCommand(currentCommand,dialogController)
              break;
          case "Control":
              console.log("control")
              break;    
          default:
                break;    
        }
      }
}

function getBlockType(command){
    if(command[0]=="Move"|command[0]=="Turn"|command[0]=="Go"|command[0]=="Change"|command[0]=="Set")
       return "Motion"
    else if(command[0]=="Say"|command[0]=="Think")
       return "Looks"
    else
        return "Control"   
    
       
}

async function executeLooksCommand(command, dialogController){
   if(command[command.length-2]=='For'){
    //times looks command
    if(command[0]=="Say")
       dialogController.say(command.slice(1, command.length-2).join(" "))
    if(command[0]=="Think")
       dialogController.think(command.slice(1, command.length-2).join(" "))   
    
    await sleep(parseInt(command[command.length-1]));
    dialogController.clear()
    
   }else{
    if(command[0]=="Say")
       dialogController.say(command.slice(1, command.length-2).join(" "))
    if(command[0]=="Think")
       dialogController.think(command.slice(1, command.length-2).join(" "))   
   }
}

function executeMotionCommand(command, cat){
    
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


function sleep(s) {
    let ms = s*1000
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function getCodeLines(code){
    const codeLines = code.split('\n')
    return codeLines
}

function getLineNumber(codeLines, idx){
    return codeLines[idx].trim().split(" ")
}

export default execute
