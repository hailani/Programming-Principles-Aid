/*
This file contains several functions that are used by the Java interpreter.
The main one is the decode function, which is used to read over the code and produce instructions that can then be executed.
Beneath decode are several helper functions that are used within decode, within execute, or both.
Some functions are imported from executor.js and mips_instructions.js, and the Error class is imported as well.
*/
import { execute, validateBoolean, validateString } from "./executor.js"
import { isNumeric } from './mips_instructions.js'
import Error from './Error.js'
/*
The decode function below is the default export of this file.
Its parameters are the interpreter's registers object, the list of code blocks, the interpreter's instructions object, and the interpreter's output object.
*/
export default function decode(registers, blocks_list, instructions, output) {
    /*
    The following creates an array and stores it as kw_vals by applying an element-wise conditional statement on this object's blocks_list.
    If the element includes the text "System.out" then its corresponding element in kw_vals will be an array consisting of the String "print" and the original value of the element.
    Otherwise, the corresponding element in kw_vals becomes an array of elements, where each element in it is a "word" in the original element, and words are delimited by spaces.
    This is actually done somewhat incorrectly, as it only works properly if words are separated by one space only.
    I am uncertain if this will be an actual problem, since you should have control over how code blocks are formatted, but it's worth keeping in mind.
    Also worth keeping in mind is that it does not appear that the code makes any distinction between System.out.print or System.out.println.
    Uncertain if this will be an issue either, considering your control over what code can be submitted.
    */
    var kw_vals = blocks_list.map( x => {
        if (x.includes("System.out")) { // Marking stdout with a keyword for the decoder to read
            return ["print", x]
        }
        var arr = x.split(/\s/)
        console.log(arr)
        return arr
    })

    /*
    The following for loop that iterates over every value of kw_vals is the remainder of this entire function, and is quite large.
    It iterates over each element of kw_vals, creating an instruction in a way dependent on the keyword found in the current element and then calling the execute method on that instruction.
    */

    for (let i = 0; i < kw_vals.length; i++) {        // Go through each line given in the problem
        //A variable named keyword is set to equal the first word of the current line of code.
        var keyword=kw_vals[i][0]   // Keyword = first word on a line
        //A variable named line is set to equal the current line of code for convenience.
        let line = kw_vals[i]
        //A variable named instruction is initialized to an empty object.
        var instruction = {} 
        //This boolean is used to keep track of if a variable is a constant, meaning that the final keyword is used.
        let constant = false

        /*
        If the first word of the line is final, then this variable is indeed a constant.
        The shift method eliminates the first element from the current line, so the word final is removed.
        The keyword variable becomes the new first word, which should be int, double, and the like.
        Of course, writing something like "final x" is improper syntax and this code does not check for that.
        However, given that the web page should exercise some control over what code can be submitted to the interpreter, this should not be a problem.
        */
        if (keyword == 'final') {
            constant = true
            kw_vals[i].shift()
            keyword = kw_vals[i][0]
        }

        /*
        If this object's registers attribute has a property with the same name as the value of keyword, then keyword is set to have value "variable".
        This is used to represent that a previously declared variable name has been detected as the first word of the current element of kw_vals.
        */

        if (Object.prototype.hasOwnProperty.call(registers, keyword)) { 
            keyword = "variable"
        }

        /*
        These variables are declared for use later.
        new_blocks_list will contain statements to be executed within a for loop or if condition, if applicable.
        conditions will be used to store conditions found in between the parentheses of a for loop or if statement, if applicable.
        */

        let new_blocks_list;
        let conditions;

        /*
        This switch statement is nearly the rest of the entire function and is quite large.
        It creates an instruction in a way dependent on what keyword is.
        */

        switch (keyword) {

            //The following is done in the event that keyword is "int".
        
            case "int":    
                
                // For declaring a variable e.g. (int a;)
                /*
                The following is executed if this is an int variable being declared, but not initialized.
                Given the control that the web page should have over the code the user submits, there should be no need to ensure that the second words is not numeric, but it's not like this check is harmful.
                */
                if (line.length == 2 && !isNumeric(line[1])) {
                    /*
                    The clipSemicolon function eliminates the trailing semicolon from a string, then returns the result.
                    If there is no trailing semicolon it just returns the original string.
                    This flexibility may not be needed, given that the webpage should force semicolons to be in their proper place.
                    */
                    line[1] = clipSemicolon(line[1])

                    /*
                    If the interpreter already has a variable with same name as the new variable attempting to be declared, throw a duplicate declaration error.
                    Return to prevent further processing.
                    */

                    if (Object.prototype.hasOwnProperty.call(registers, line[1])) {
                        duplicateDeclarationMessage(line[1], output)
                        return
                    }

                    //The variable type is used to keep track of if this variable is a constant or not.

                    let type = null

                    if (constant) {
                        type = 'final int'
                    }
                    else {
                        type = 'int'
                    }

                    //The instruction is built with the variable name, no value, and the variable's type.

                    instruction = buildLWInstruction(line[1], null, type)
     
                }
                // For initializing a variable e.g. (int a = 5;)
                /* 
                The following is executed if this is an int variable being declared and initialized to a value.
                Any line with four words that starts with int will be recognized as such, so do keep that in mind.
                */
                else if (line.length == 4) {
                    /*
                    Just like before, if there is already a variable with the name that is to be used then the result should be an error.
                    This is essentially the same thing that was done before, it's just done in an alternate way.
                    This was a choice made by the preivous developers, most likely for felxibility that I do not believe will be needed.
                    */
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }
                    //The variable val is set to the value the variable is being initialized to.
                    var val = line[line.indexOf("=") + 1]
                    //The variable value is set to val with its semicolon eliminated if it has one, or just val if it does not.
                    var value = clipSemicolon(val)
                    /*
                    The substituteVariable method returns the value itself if it is a valid form to be just a value, the value of the variable that the value string refers to if one exists, or null if the previous two conditions are not satisfied.
                    Should this occur it is understood to be a reference to a variable that does not exist, so the appropriate error is thrown and processing is halted.
                    Semicolons within JavaScript code are optional here, so their presence or lack thereof is not meaningful.
                    */
                    console.log(value)
                    let res = substituteVariable(registers, value)
                    if (res === null) {
                        uninitializedVariableMessage(value, output)
                        return;
                    }

                    //This process is identical to the one done before, where a variable is only declared, except now res is stored as the value of the variable.

                    let type = null

                    if (constant) {
                        type = 'final int'
                    }
                    else {
                        type = 'int'
                    }

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], res, type)
                    
                }
                // For initializing a variable with the output of an expression e.g. (int a = 2 + 3; int a = b + c..)

                /*
                The following is executed if an int variable is being declared and initialized to the value of an expression.
                A lot of elements in this process and the ones that follow are similar to the ones done before, so I will avoid repetitive comments.
                It is certainly the case that code reuse should be employed to make things more efficient and readable, but this was not done now due to time constraints.
                If you can generalize repeated processes into functions then I highly recommend it.
                */

                else if (line.length > 4) {
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }

                    //The variable expression is set by first taking only the expression portion of the line using splice, and then eliminating the semicolon from the last element if one exists.

                    let expression = line.splice(3,line.length-3);
                    expression[expression.length - 1] = clipSemicolon(expression[expression.length - 1])

                    let type = null

                    if (constant) {
                        type = 'final int'
                    }
                    else {
                        type = 'int'
                    }

                    //On this occasion the variable's value is given as the expression for further processing.

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], expression, type)

                }
                break;

            /*
            The processes done for variables of type int are almost identical to those done for double, boolean, and String, the other data types currently supported by the interpreter.
            This is where code reuse should certainly be employed, both because all four data types use the same processes and because the processes have repeated elements within themselves, like how all if statement for int check for duplicate variable declaration.
            */

            case "double":
                if (line.length == 2 && !isNumeric(line[1])) {
        
                    line[1] = clipSemicolon(line[1])

                    if (Object.prototype.hasOwnProperty.call(registers, line[1])) {
                        duplicateDeclarationMessage(line[1], output)
                        return
                    }

                    let type = null

                    if (constant) {
                        type = 'final double'
                    }
                    else {
                        type = 'double'
                    }

                    instruction = buildLWInstruction(line[1], null, type)
     
                }

                else if (line.length == 4) {
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }

                    var val = line[line.indexOf("=") + 1]

                    var value = clipSemicolon(val)
    
                    let res = substituteVariable(registers, value)
                    if (res === null) {
                        uninitializedVariableMessage(value, output)
                        return;
                    }

                    let type = null

                    if (constant) {
                        type = 'final double'
                    }
                    else {
                        type = 'double'
                    }

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], res, type)
                    
                }

                else if (line.length > 4) {
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }

                    let expression = line.splice(3,line.length-3);
                    expression[expression.length - 1] = clipSemicolon(expression[expression.length - 1])

                    let type = null

                    if (constant) {
                        type = 'final double'
                    }
                    else {
                        type = 'double'
                    }

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], expression, type)

                }

                break;

            case "boolean":

                if (line.length == 2 && !isNumeric(line[1])) {

                    line[1] = clipSemicolon(line[1])

                    if (Object.prototype.hasOwnProperty.call(registers, line[1])) {
                        duplicateDeclarationMessage(line[1], output)
                        return
                    }

                    let type = null

                    if (constant) {
                        type = 'final boolean'
                    }
                    else {
                        type = 'boolean'
                    }

                    instruction = buildLWInstruction(line[1], null, type)
     
                }

                else if (line.length == 4) {
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }

                    var val = line[line.indexOf("=") + 1]
                   
                    var value = clipSemicolon(val)
                    
                    let res = substituteVariable(registers, value)
                    if (res === null) {
                        uninitializedVariableMessage(value, output)
                        return;
                    }

                    let type = null

                    if (constant) {
                        type = 'final boolean'
                    }
                    else {
                        type = 'boolean'
                    }

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], res, type)
                    
                }
 
                else if (line.length > 4) {
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }

                    let expression = line.splice(3,line.length-3);
                    expression[expression.length - 1] = clipSemicolon(expression[expression.length - 1])

                    let type = null

                    if (constant) {
                        type = 'final boolean'
                    }
                    else {
                        type = 'boolean'
                    }

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], expression, type)

                }
                break;

                case "String":  
                

                if (line.length == 2 && !isNumeric(line[1])) {
                   
                    line[1] = clipSemicolon(line[1])

                    if (Object.prototype.hasOwnProperty.call(registers, line[1])) {
                        duplicateDeclarationMessage(line[1], output)
                        return
                    }

                    let type = null

                    if (constant) {
                        type = 'final String'
                    }
                    else {
                        type = 'String'
                    }

                    instruction = buildLWInstruction(line[1], null, type)
     
                }
               
                else if (line.length == 4) {
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }
                    
                    var val = line[line.indexOf("=") + 1]
                    
                    var value = clipSemicolon(val)
                    
                    console.log(value)
                    let res = substituteVariable(registers, value)
                    if (res === null) {
                        uninitializedVariableMessage(value, output)
                        return;
                    }

                    let type = null

                    if (constant) {
                        type = 'final String'
                    }
                    else {
                        type = 'String'
                    }

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], res, type)
                    
                }
                
                else if (line.length > 4) {
                    if (Object.prototype.hasOwnProperty.call(registers, line[(line.indexOf("=")-1)])) {
                        duplicateDeclarationMessage(line[(line.indexOf("=")-1)], output)
                        return
                    }
                    
                    let expression = line.splice(3,line.length-3);
                    expression[expression.length - 1] = clipSemicolon(expression[expression.length - 1])

                    let type = null

                    if (constant) {
                        type = 'final String'
                    }
                    else {
                        type = 'String'
                    }

                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], expression, type)

                }
                break;

            /*
            The following is done in the event that the keyword is "variable".
            This keyword should not exist in normal Java code, rather it is set as the keyword on line 67 if this line begins with a variable name that exists as a variable within registers.
            The error case of a variable being set to a value when it has not yet been declared does not seem to be handled in this program, though to be fair it would not be handled at this time.
            */

            case "variable": // (c = a + b +....(+-*/))
                /*
                If the line has more than three words then it is understood to involve an expression.
                Like before, an the value is set to be the expression itself, with all semicolons removed.
                The type, as given to the instruction, is set as null to signal that a pre-existing variable is being manipulated.
                */
                if (line.length > 3) {
                    let expression = line.splice(2,line.length-2)
                    expression[expression.length - 1] = clipSemicolon(expression[expression.length - 1])
                    instruction = buildLWInstruction(line[(line.indexOf("=")-1)], expression, null)
                }
                /*
                Otherwise, if the line is three words long and has the word "+=" that is the second word, the following is done.
                If the variable being manipulated is a String or final String, the instruction is built with the value being an expression adding the two addends, and null being the type, like before.
                Otherwise the operation should be mathematical, so an appropriate instruction is created with the operation specified, the manipulated variable, and the two addends.
                */
                else if (line[1] == "+=" && line.length == 3) {  // Only works if line length == 3; ( num += 2 ) and ( num += num )
                    if (['String', 'final String'].includes(registers[line[0]].type)) {
                        instruction = buildLWInstruction(line[0], [line[0], '+', clipSemicolon(line[2])], null)
                    }
                    else {
                        instruction = buildMathInstruction("add", line[0], line[0], clipSemicolon(line[2]))
                    }
                }   
                /*
                The following is the exact same as what came earlier, just for a subtraction operation.
                String expressions do not use this operator, so they don't need to be checked for here.
                */
                else if (line[1] == "-=" && line.length == 3) {
                    instruction = buildMathInstruction("sub", line[0], line[0], clipSemicolon(line[2]))
                }
                //The following is the same, just for multiplication.
                else if (line[1] == "*=" && line.length == 3) {
                    instruction = buildMathInstruction("mult", line[0], line[0], clipSemicolon(line[2]))
                }
                //And this one's for division.
                else if (line[1] == "/=" && line.length == 3) {
                    instruction = buildMathInstruction("div", line[0], line[0], clipSemicolon(line[2]))
                }          
                /*
                Otherwise, if the second word is "=" and the line is three words long, the following is done.
                This is simply assigning a value to an already declared variable.
                An appropriate instruction is created.
                */
                else if (line[1] == "=" && line.length == 3) {  // Assigning a single value to a preexisting register (a = 5)
                    instruction = buildLWInstruction(line[0], clipSemicolon(line[2]), null)
                }
                //Otherwise there is presumed to be an error, and the line's contents are logged to the console with an error message.
                else  {
                    console.log("Error: " + line)
                }
                break;

            
            //The following is done if the keyword is "for".
            
            case "for":
                /*
                line is set to be a String consisting of all the words separated by spaces.
                This is so that the content within the parentheses can be retrieved.
                */
                line = line.join(' ')
                // Getting everything between the parentheses
                //The following retrieves the text between the parentheses and delimits each piece by semicolons, storing it in the conditions variable.
                conditions = line.split("(")[1].split(")")[0].split(";")
                console.log(conditions)
                /*
                The get_stack_scope method returns an object that contains information regarding the scope of the for loop.
                If it returns null then there is a missing bracket, so that error is thrown and processing halts.
                */
                let scope = get_stack_scope(kw_vals, "for")

                if (scope === null) {
                    missingBracketMessage(output)
                    return
                }

                /*
                new_blocks_list will become an array consisting of the lines involved in the for loop.
                This object's blocks_list will be modified to contain the lines that are not part of the for loop.
                kw_vals will now hold elements that are not part of the for loop.
                */
                new_blocks_list = blocks_list.splice(scope.start, scope.len + 1)
                kw_vals.splice(scope.start, scope.len + 1)

                // Need to stay on the same index for the next iteration
                //As the old comment says, now that lines have been removed from kw_vals, the current index is actually the next line to be read, so it needs to be decremented so it will not be skipped.
                i--; 
                //This line removes the first element from new_blocks_list.
                new_blocks_list.shift(); 
                //This line removes the last element from new_blocks_list.
                new_blocks_list.pop();

                //After the two statements above, new_blocks_list consists of only the statements executed within the for loop.

                /*
                An appropriate instruction is built with the blocks to be executed within the loop and the loop's conditions supplied as information.
                There is no need to format new_blocks_list as a string where elements are delimited by newlines if new_blocks_list does not have two or more elements.
                */

                instruction = buildForInstruction(new_blocks_list.length > 1 ? new_blocks_list.join("\n") : new_blocks_list[0], conditions)

                break;

            /*
            The following is done if the keyword is "if".
            */

            case "if":  // Decoding if statements
                /*
                line is set to be a String consisting of all the words separated by spaces.
                This is so that the content within the parentheses can be retrieved.
                */
                line = line.join(' ')
                // Getting everything between the parentheses
                //As the old comment says, conditions will hold the text retrieved from in between the parentheses.
                conditions = line.split("(")[1].split(")")[0]

                //Like before, get_stack_scope is used to retrieve scope information.

                let scopeStats = get_stack_scope(kw_vals, "if")

                if (scopeStats === null) {
                    missingBracketMessage(output)
                    return
                }

                new_blocks_list = blocks_list.splice(scopeStats.start, scopeStats.len + 1)
                kw_vals.splice(scopeStats.start, scopeStats.len + 1)
                
                // Getting rid of if statement and the closing bracket
                //Like the old comment says, the two statments below will eliminate the first and last elements of new_blocks_list, leaving only the statements inside the if block.
                new_blocks_list.shift(); 
                new_blocks_list.pop();

                //Much like before, an appropriate instruction is constructed using the gathered information.
                
                instruction = buildIfInstruction(new_blocks_list.length > 1 ? new_blocks_list.join("\n") : new_blocks_list[0], conditions)

                // Storing (else if())'s following a standard if statement
                //error:unexpected lexical decalration in case block (no-case-declaraton) 294-295
                /*
                Unsure of what the above comment is talking about right now, it originated from the previous team.
                else_container is used to store any instructions related to the blocks found in this process of storing any else-if or else statements that follow an if-statement.
                */
                let else_container = []

                let placeHolder = i

                /*
                The following loop executes while kw_vals's placeHolder indexed element is not undefined, so assuming we have not gone out of bounds, and the kw_vals entry at index placeHolder has "else" at index 0.
                Keep in mind that placeHolder and i should not be incremented, since when a block is removed from kw_vals, what takes its place in index i is the next line after it.
                */

                while (typeof(kw_vals[placeHolder]) !== 'undefined' && kw_vals[placeHolder].indexOf("else") == 0) {
                    // Else-if
                    /*
                    The following executes if the second element of the element of kw_vals indexed at i, so the current element, does not have a second element that is an opening curly brace.
                    This identifies it as an else if statement, as an else statement would have the openeing curly brace as its second word.
                    */
                    if (kw_vals[i][1] != "{") {
                        /*
                        The variable line is equal to kw_vals's ith element joined into a String, where elements are separated by spaces.
                        This is done in order to retrieve the conditions between the parentheses, which is done with the following statement.
                        */
                        let line = kw_vals[i].join(' ')
                        conditions = line.split("(")[1].split(")")[0]
                        //The scope object returned by the get_stack_scope method contains the calculated block start, block end, and length of the next block starting with "else", which in this case would be an else-if block.
                        let scope = get_stack_scope(kw_vals, "else")
                        if (scope === null) {
                            missingBracketMessage(output)
                            return
                        }
                        /*
                        Like before, the blocks_list will now be a version of itself without the else if block lines, as will kw_vals.
                        new_blocks_list will contain the lines of the else if block.
                        */
                        new_blocks_list = blocks_list.splice(scope.start, scope.len + 1)
                        kw_vals.splice(scope.start, scope.len + 1)
                        //Also like before, the first and last elements of new_blocks_list are removed, thus leaving the statements executed inside of the else if block.
                        new_blocks_list.shift(); 
                        new_blocks_list.pop();

                        //An instruction is created to represent the else-if.

                        let else_if_instruction = buildIfInstruction(new_blocks_list.length > 1 ? new_blocks_list.join("\n") : new_blocks_list[0], conditions)

                        //Add the else_if_instruction to the else_container.
                        else_container.push(else_if_instruction)

                        /*
                        The instruction's else-if property is set to else_container.
                        This effectively updates the property else-if to have the value of else_container with the new block added.
                        This is a bit wasteful, as this update can be done after all blocks found are pushed to else_container, so, after the loop is done executing.
                        */

                        instruction["else-if"] = else_container
                        
                    }
                    // Else
                    //This is executed if an else block was located.
                    else {
                        // //The scope object returned by the get_stack_scope method contains the calculated block start, block end, and length of the next block starting with "else", which in this case would be an else block.
                        let scope = get_stack_scope(kw_vals, "else")
                        if (scope === null) {
                            missingBracketMessage(output)
                            return
                        }
                        /*
                        Like before, the blocks_list will now be a version of itself without the else block lines, as will kw_vals.
                        new_blocks_list will contain the lines of the else block.
                        */
                        new_blocks_list = blocks_list.splice(scope.start, scope.len + 1)
                        kw_vals.splice(scope.start, scope.len + 1)
                        //Like before, the following two statements will remove the first and last elements from new_blocks_list, leaving only the statements executed within the else block.
                        new_blocks_list.shift(); 
                        new_blocks_list.pop();
                        //An instruction is built based on the information retrieved.
                        let else_instruction = buildElseInstruction(new_blocks_list.length > 1 ? new_blocks_list.join("\n") : new_blocks_list[0])

                        //Add else_instruction to else_container
                        else_container.push(else_instruction)
                        /*
                        instruction's else-if property is set to else_container
                        This loop is terminated, as an else statement was found.
                        */
                        instruction["else-if"] = else_container
                        break;
                    }
                    
                }

                    // Need to stay on the same index for the next iteration
                    //Like the old comment says, the index i must be the same after this iteration to account for where the next unread line is.
                i--;
                break;

            /*
            The following is done if the print keyword is found.
            This keyword should not be in any valid Java code, rather it is added in this program, if "System.out" is seen.
            */
            case "print":


                //The variable print_container is set to be the content in between the parentheses, or what is to be printed.    
                var print_container = line[1].split("(")[1].split(")")[0]
                //An instruction is then built with this information.
                instruction = buildPrintInstruction(print_container)
                break;

            //In the event that a closing bracket is found, one that has not been absorbed into an if statement or for loop, throw an error and halt processing.

            case "}":
                closingBracketMessage(output)
                return;

            /*
            The following is executed if no previous cases occurred.
            This is assumed to be indicative of a variable name being used that has not been initialized, so an error is thrown and processing is halted.
            */
            default:
                console.log("Couldn't read a keyword")
                uninitializedVariableMessage(keyword, output)
                return;
            }

        //Like the old comment says, this statement keeps a list of instructions.
        instructions.push(instruction) // Keeping log of instructions - not needed honestly
        //The instruction created from the previous case is executed.
        let res = execute(instruction, registers, output)

        //If execute returns 'quit' then that means that it threw an error, so processing should halt.

        if (res === 'quit') {
            return;
        }
    }
}

/*
This method returns an object that contains the line where a block of code starts, the line where a block of code ends, and the block length, which is the number of lines in a block excluding the line with the closing curly bracket.
kw_vals is the list of code statements that this method will scan through to determine block scope.
keyword will be the term that this method looks for when finding the start of the block.
*/
function get_stack_scope(kw_vals, keyword) {
    /*
    block_start and block_end are started at zero and will be used to hold information that needs to be returned.
    scope_stack will be used to keep track of block scope.
    */
    let block_start = 0
    let block_end = 0
    var scope_stack = [];

    //The following loop iterates over every index applicable to kw_vals

    for (let j in kw_vals) {

        //If the current line has the keyword and the scope_stack is empty, push an opening curly bracket to said scope_stack, record the block_start, and move on to the next index.

        if (kw_vals[j].includes(keyword) && scope_stack.length == 0) {
            scope_stack.push("{")
            block_start = parseInt(j)
            continue
        }

        //Otherwise, if the code block has been entered, which is indicated by scope_stack not being empty, do the following.

        else if(scope_stack.length > 0) {
            //The following loop iterates over every index applicable to the current line
            for (let k in kw_vals[j]) {
                //If the word is a closing curly bracket, remove an element from scope_stack, and if it is now empty, record the block_end and terminate execution of this loop.
                if (kw_vals[j][k] == "}") {    // } need their own line
                    //Like the above comment says, with this implementation, closing curly brackets must be on their own line, which is probably good for readability anyway.
                    scope_stack.pop()
                    if (scope_stack.length == 0) {
                        block_end = parseInt(j)
                        break;
                    }
                }
                //Otherwise, if an opening curly bracket is found, add one to the scope_stack
                else if (kw_vals[j][k]=="{"){
                    scope_stack.push("{")
                }
            }
        }

        //If block_end is greater than zero, meaning that the end has been found, terminate execution of this loop.

        if (block_end > 0) {
            break
        }
    }


    //If scope_stack is not empty, or if block_end was never found, return null to indicate a missing bracket. 


    if (scope_stack.length > 0 || block_end < 1) {
        console.log("ERROR -> decode -> for -> scope stack")
        return null
    }

    //Otherwise return an object that contains the block_start, block_end, and block length, which is block_end - block_start

    return {
        start: block_start,
        end: block_end,
        len: block_end - block_start
    }
}

//This function returns word without the semicolon at its end if it had one, and just returns word otherwise.

function clipSemicolon(word) {
    word = word.includes(';') ? word.slice(0,-1) : word
    return word
}

/*
This function builds a Load Word instruction.
A Load Word instruction is marked as "lw", whereas var1 is the name of the variable, value is the value to be saved to it, and type is the type of the variable.
*/

export function buildLWInstruction(var1, value, type) {
    let instruction = {
        func: "lw",      
        var1: var1,
        value: value,
        type: type   
    };
    return instruction;
}

/*
This function builds a Math instruction.
Its function, be that add, sub, mult, or div, is specified when it is called.
reg_val is the name of the variable that the result should be saved too.
var1 and var2 are the two operands.
*/

function buildMathInstruction(func, reg_val, var1, var2) {
    let instruction = {
        func: func,
        reg_val: reg_val,
        var1: var1,
        var2: var2
    };
    return instruction;
}

/*
This function builds a For instruction.
blocks_list is the list of code blocks in the for loop whereas conditions is the conditions of the for loop's execution.
*/

function buildForInstruction(blocks_list, conditions) {
    let instruction = {
        func: "for",
        blocks_list: blocks_list,
        conditions: conditions
    };
    return instruction;
}

//This is highly similar to buildForInstruction, but is for an If instruction instead.

function buildIfInstruction(blocks_list, conditions) {
    let instruction = {
        func: "if",
        blocks_list: blocks_list,
        conditions: conditions
    };
    return instruction;
}

//This is similar to what is above, but does not need conditions, since it builds an else instruction, as if instructions are used for if or else-if statements.

function buildElseInstruction(blocks_list) {
    let instruction = {
        func: "else",
        blocks_list: blocks_list
    };
    return instruction;
}

//This function builds a print instruction and takes in the information that is to be printed.

function buildPrintInstruction(print_container) {
    let instruction = {
        func: "print",
        value: print_container
    };
    return instruction;
}

/*
The following several methods are all very similar, so I will comment on them all here.
They all take in the intepreter's output object, as they need to remove all content from it and push an Error object.
Some take in more parameters in order to customize the error message for the situation at hand.
*/

export function uninitializedVariableMessage(keyword, output) {
    output.splice(0, output.length)
    output.push(new Error("Variable " + keyword + " is uninitialized.", 'uninitialized variable'))
}

export function mathExpressionSyntaxMessage(expression, output) {
    output.splice(0, output.length)
    output.push(new Error("Expression " + expression + " does not have proper syntax for a math expression.", 'math expression syntax'))
}

export function booleanSyntaxMessage(expression, output) {
    output.splice(0, output.length)
    output.push(new Error("Expression " + expression + " does not have proper syntax for a boolean.", 'boolean syntax'))
}

export function stringSyntaxMessage(expression, output) {
    output.splice(0, output.length)
    output.push(new Error("Expression " + expression + " does not have proper syntax for a String expression.", 'String expression syntax'))
}

export function divideByZeroMessage(expression, output) {
    output.splice(0, output.length)
    output.push(new Error("Expression " + expression + " attempts to divide by zero.", 'divide by zero'))
}

function closingBracketMessage(output) {
    output.splice(0, output.length)
    output.push(new Error("There exists a closing curly bracket that does not match up to an opening curly bracket.", 'closing bracket'))
}

function missingBracketMessage(output) {
    output.splice(0, output.length)
    output.push(new Error("There is a missing closing curly bracket.", 'missing closing bracket'))
}

export function duplicateDeclarationMessage(variable, output) {
    output.splice(0, output.length)
    output.push(new Error("Variable " + variable + " was already declared.", 'duplicate declaration'))
}

export function alterConstantMessage(variable, output) {
    output.splice(0, output.length)
    output.push(new Error("Variable " + variable + " is a constant and cannot be altered.", 'alter constant'))
}

export function invalidIntMessage(variable, value, output) {
    output.splice(0, output.length)
    output.push(new Error("Variable " + variable + " is an integer and cannot be assigned the value " + value, 'invalid int'))
}

export function invalidDoubleMessage(variable, value, output) {
    output.splice(0, output.length)
    output.push(new Error("Variable " + variable + " is a double and cannot be assigned the value " + value, 'invalid double'))
}

export function invalidBooleanMessage(variable, value, output) {
    output.splice(0, output.length)
    output.push(new Error("Variable " + variable + " is a boolean and cannot be assigned the value " + value, 'invalid boolean'))
}

export function invalidStringMessage(variable, value, output) {
    output.splice(0, output.length)
    output.push(new Error("Variable " + variable + " is a String and cannot be assigned the value " + value, 'invalid String'))
}

export function invalidOperationMessage(variable, output) {
    output.splice(0, output.length)
    output.push(new Error(variable + " is not numeric, so it cannot be operated on as specified.", 'invalid operation'))
}

/*
This function will return value if it is a simple value, or the value of the variable named value if there is one.
If value is numeric, is a valid boolean, or is a valid string, then it is a simple value and is returned.
Otherwise, if registers has a register named value, then that register's value is returned.
Otherwise return null to signify that this method has processed a variable that has not been initialized.
If a variable has been declared but not initialized then its value will be null, so that case is handled by the else-if statement while the case of a variable never being declared at all is handled by the else statement.
*/

export function substituteVariable(registers, value) {
    console.log(value)
    if (isNumeric(value) || validateBoolean(value) || validateString(value)) {
        return value;
    }
    else if (Object.prototype.hasOwnProperty.call(registers, value)) {
        return registers[value].value;
    }
    else {
        return null;
    }
}

/*
This function takes an array that represents an expression and collapses elements that together are a string into each other.
This is necessary because elements are seen as delimited by spaces, but "Hello world!" should only be one element, a String, despite containing a space.
"Hello and world!" would be two different elements at first, and this method fixes that.
*/

export function collapseStrings(expression) {
    /*
    string will contain the string that is currently being built from expression elements.
    building will specify if a string is currently being built or not.
    ret will be the array that is returned when this function concludes.
    */
    let string = null
    let building = false
    let ret = []
    //This loop iterates over all of the indices that can be used to access the elements of expression.
    for (let i = 0; i < expression.length; i++) {
        /*
        If the current element contains " , and the element is either one character long or it does not contain any more occurences of " , and a string is not currently being built, do the following.
        Set building to true, since a new string will be built.
        set string to equal the current element.
        */
        if (expression[i].includes('"') && (expression[i].length == 1 || !expression[i].substring(1).includes('"')) && !building) {
            building = true
            string = expression[i]
        }
        /*
        Otherwise, if a string is being built and the current element does not contain " , then this element is understood to be a part of the current string.
        Append a space to string followed by the current element.
        An example where this would occur would be "One two three", when two is found and string is currently "One , so the following should be done.
        */
        else if (building && !expression[i].includes('"')) {
            string += " "
            string += expression[i]
        }
        /*
        Otherwise, if a string is being built and the current element does containt " , do the following.
        Add the element to string in the same manner as before, but after that string will be complete, since the closing " has been found.
        Push string to ret before clearing the string variable and setting building to false, since the building process is now complete.
        */
        else if (building && expression[i].includes('"')) {
            string += " "
            string += expression[i]
            ret.push(string)
            string = null
            building = false
        }
        //Otherwise the current element is not part of a string that needs to be collapsed, so just push it to ret.
        else {
            ret.push(expression[i])
        }
    }

    //If ret is a single element long, just return that element.

    if (ret.length == 1) {
        console.log(ret)
        return ret[0]
    }

    //Otherwise, return ret as the array it is.

    else {
        return ret  
    }

}
