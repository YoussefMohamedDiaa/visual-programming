let cat = null
function execute(code, catSp, dialogController) {
    cat = catSp
    //console.log('Executing:')
    //console.log(code)
    //console.log("#############")
    const codeLines = getCodeLines(code)
    //console.log(codeLines)
    //console.log("#############")
    //const line = getLineNumber(codeLines,0)
    //console.log(getBlockType(line))
    //executeLooksCommand(line,dialogController)
    //executeMotionCommand(line, cat)
    executeSequenceOfCommands(codeLines, dialogController)
    
}

async function executeSequenceOfCommands(codeLines, dialogController){
    for (var i = 0; i < codeLines.length; i++) {
        //added 1 sec delay for visability
        await sleep(1)
        const currentCommand = getLineNumber(codeLines,i)
        const currentCommandType = getBlockType(currentCommand)
        console.log(currentCommandType)
        console.log(currentCommand)
        switch(currentCommandType){
          case "Motion":
              await executeMotionCommand(currentCommand)
              break;
          case "Looks":
              await executeLooksCommand(currentCommand,dialogController)
              break;
          case "Control":
              var startOfControl=i
              var endOfControl = getEndOfControlBlock(codeLines,i)
              i = endOfControl-1
              await executeControlCommands(codeLines.slice(startOfControl, endOfControl))
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

function getEndOfControlBlock(codeLines,idx){
    var beginCount = 0;
    for(var i=idx+1;i<codeLines.length;i++){
        const currentCommand = getLineNumber(codeLines,i)
        if(i==0 && currentCommand[0]=="WAIT")
           return i+1
        if(currentCommand[0]=="END")
           beginCount--;
        if(currentCommand[0]=="BEGIN")
           beginCount++;
        if(beginCount==0)
          return i+1      
    }
    return -1;
}

async function executeControlCommands(codeLines, dialogController){
   const firstCommand = getLineNumber(codeLines,0)
   switch(firstCommand[0]) {
    case "REPEAT":
      if(firstCommand[1]=="UNTIL"){

      }else{
        for(var i=0;i<parseInt(firstCommand[1]);i++){
            await executeSequenceOfCommands(codeLines.slice(2, codeLines.length-1), dialogController)
        }
      }
      break;
    case "FOREVER":
       while(true){
        await executeSequenceOfCommands(codeLines.slice(2, codeLines.length-1), dialogController)
       }
       break;
    case "WAIT":
        if(firstCommand[1]=="UNTIL"){

        }else{
            //this one below specifcally not tested
            await sleep(parseInt(firstCommand[1]));
        }
      break;          
    default:
      break;  
    }
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

function executeMotionCommand(command){
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
