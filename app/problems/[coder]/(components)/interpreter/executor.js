/*
This file contains several functions that are used by the Java interpreter.
The main one is the execute function, which is used to execute a particular instruction.
The others are helper functions.
Some functions are imported from mips_instructions.js and decoder.js, and the Interpreter and Register classes are imported from their respective files as well.
*/
import * as mips from './mips_instructions.js'
import Interpreter from './interpreter.js';
import { buildLWInstruction, substituteVariable, uninitializedVariableMessage, mathExpressionSyntaxMessage, booleanSyntaxMessage, stringSyntaxMessage, divideByZeroMessage, duplicateDeclarationMessage, alterConstantMessage, invalidIntMessage, invalidDoubleMessage ,invalidBooleanMessage, invalidStringMessage, invalidOperationMessage, collapseStrings } from './decoder.js';
import Register from './Register.js';
// Instructions execute after each instruction is decoded, so it reads and executes code from top to bottom.
/*
Like the previous comment says, this method is run after each instruction is decoded.
It takes in the instruction, the interpreter's registers, and the interpreter's output as parameters.
*/
export function execute(instruction, registers, output) {
    //The variable key is set to equal instruction, this was likely done by the previous team for ease of use.
    let key = instruction
    //The following is done if func is "lw".
    if (key.func == "lw") {         // Loading value to registers

        //If the instruction's type is null, meaning that an already existing variable is being modified, and that variable is a constant, and that variable has already been initialized, throw an error and return 'quit' to halt processing.

        if (key.type === null && ['final int', 'final double', 'final boolean', 'final String'].includes(registers[key.var1].type) && registers[key.var1].value !== null) {
            alterConstantMessage(key.var1, output)
            return 'quit';
        }

        //If the instruction's type is null then an already existing variable is being modified, so key.type will now hold that variable's type for later.

        if (key.type === null) {
            key.type = registers[key.var1].type
        }

        //The value variable will be used to keep track of the value to save to the variable in question.

        let value = null

        
        //If the instruction's value is an array then collapse any strings that reside within it.

        if (Array.isArray(key.value)) {
            key.value = collapseStrings(key.value)
        }

        //If key.value is null, numeric, a valid boolean, or a valid string, then the value can just be set to it with no further modifications.

        if (key.value === null || mips.isNumeric(key.value) || validateString(key.value) || validateBoolean(key.value)) {
           value = key.value
        }
        
        /*
        Otherwise, key.value needs to be evaluated as an expression.
        evaluateGeneralExpression is used to do this, and if it returns null then it threw an error, so processing is stopped.
        */

        else {
        
            value = evaluateGeneralExpression(key.value, registers, output)

            if (value === null) {
                return 'quit'
            }

        } 

        //If value is not null then it needs to be checked to see if it matches the type of the variable it will be saved to, and an appropriate error is thrown if it does not.

        if (value !== null) {
            if (['int', 'final int'].includes(key.type)) {
                if (!validateInt(value)) {
                    invalidIntMessage(key.var1, value, output)
                    return 'quit'
                }
            }
    
            if (['double', 'final double'].includes(key.type)) {
                if (!mips.isNumeric(value)) {
                    invalidDoubleMessage(key.var1, value, output)
                    return 'quit'
                }
            }
    
            if (['boolean', 'final boolean'].includes(key.type)) {
                if (!validateBoolean(value)) {
                    invalidBooleanMessage(key.var1, value, output)
                    return 'quit'
                }
            }
    
            if (['String', 'final String'].includes(key.type)) {
                if (!validateString(value)) {
                    invalidStringMessage(key.var1, value, output)
                    return 'quit'
                }
            }
    
        }

        console.log(value)

        //value is saved to the variable with the name that was specified in the instructions.

        registers[key.var1] = new Register(key.type, value)

    }
    /*
    If func is "add", the following is done.
    First of all, if a constant is being altered, throw an error.
    Then use performMathOp to perform the addition operation.
    It returns null if an error was thrown, so processing is stopped in this case.
    Then an error is thrown if the type of the result and the variable it is to be saved to do not match.
    If there are no errors, the value is saved to the specified variable, and the type of the new Register is the same as the type of the pre-existing Register for the variable in question.
    */
    else if (key.func == "add") { 
        if (['final int', 'final double'].includes(registers[key.reg_val].type)) {
            alterConstantMessage(key.reg_val, output)
            return 'quit';
        }
        let res = performMathOp(registers, key.var1, key.var2, mips.add, output)
        if (res === null) {
            return 'quit';
        }
        if (registers[key.reg_val].type == 'int' && !validateInt(res)) {
            invalidIntMessage(key.reg_val, output)
            return 'quit';
        }
        if (registers[key.reg_val].type == 'double' && !mips.isNumeric(res)) {
            invalidDoubleMessage(key.reg_val, output)
            return 'quit';
        }
        registers[key.reg_val] = new Register(registers[key.reg_val].type, res)
    }
    //The following two else-if statements are exactly the same as the one above, except for subtraction and multiplication, so code reuse may be useful here.
    else if (key.func == "sub") {
        if (['final int', 'final double'].includes(registers[key.reg_val].type)) {
            alterConstantMessage(key.reg_val, output)
            return 'quit';
        }              
        let res = performMathOp(registers, key.var1, key.var2, mips.sub, output)
        if (res === null) {
            return 'quit';
        }
        if (registers[key.reg_val].type == 'int' && !validateInt(res)) {
            invalidIntMessage(key.reg_val, output)
            return 'quit';
        }
        if (registers[key.reg_val].type == 'double' && !mips.isNumeric(res)) {
            invalidDoubleMessage(key.reg_val, output)
            return 'quit';
        }
        registers[key.reg_val] = new Register(registers[key.reg_val].type, res)
    }
    else if (key.func == "mult") {
        if (['final int', 'final double'].includes(registers[key.reg_val].type)) {
            alterConstantMessage(key.reg_val, output)
            return 'quit';
        }
        let res = performMathOp(registers, key.var1, key.var2, mips.mult, output)
        if (res === null) {
            return 'quit';
        }
        if (registers[key.reg_val].type == 'int' && !validateInt(res)) {
            invalidIntMessage(key.reg_val, output)
            return 'quit';
        }
        if (registers[key.reg_val].type == 'double' && !mips.isNumeric(res)) {
            invalidDoubleMessage(key.reg_val, output)
            return 'quit';
        }
        registers[key.reg_val] = new Register(registers[key.reg_val].type, res)
    }
    //The following else-if statement is similar to the ones that came before it, but has some additional parts that I will comment on.
    else if (key.func == "div") {
        if (['final int', 'final double'].includes(registers[key.reg_val].type)) {
            alterConstantMessage(key.reg_val, output)
            return 'quit';
        }
        let res = performMathOp(registers, key.var1, key.var2, mips.div, output)
        if (res === null) {
            return 'quit';
        }
        //If a message indicating that a division by zero was attempted is recieved, an error is thrown.
        else if (res === "Error: division by zero") {
            divideByZeroMessage(key.reg_val + " /= 0", output)
            return 'quit';
        }

        //secondInt will keep track of if the divisor is an integer or not.

        let secondInt = false

        /*
        If key.var2 is a variable and it is an integer, or if key.var2 is not a variable but it is a valid integer, then secondInt is true.
        The check ensuring that key.var2 is not a variable before it is evaluated for validity as an integer may not be needed, as the webpage should be tasked with ensuring that only valid variable names are used.
        */
        if ((Object.prototype.hasOwnProperty.call(registers, key.var2) && ['int', 'final int'].includes(registers[key.var2].type)) || (!Object.prototype.hasOwnProperty.call(registers, key.var2) && validateInt(key.var2))) {
            secondInt = true
        }
        //If the dividend is an integer and secondInt is true, then integer division is being done, so the quotient is to be rounded down.
        if (registers[key.reg_val].type == 'int' && secondInt) {
            Math.floor(res)
        }

        if (registers[key.reg_val].type == 'int' && !validateInt(res)) {
            invalidIntMessage(key.reg_val, output)
            return 'quit';
        }
        if (registers[key.reg_val].type == 'double' && !mips.isNumeric(res)) {
            invalidDoubleMessage(key.reg_val, output)
            return 'quit';
        }
        registers[key.reg_val] = new Register(registers[key.reg_val].type, res)
    }

    //The following code piece is run if func is "for".
    else if (key.func == "for") {
        /*
        new_registers is created as a clone of registers, meaning that modifying new_registers will not alter registers
        A new interpreter is created with this instruction's blocks_list and its register array is set to be new_registers
        */
        let new_registers = cloneRegisters(registers)
        var for_interpreter = new Interpreter(key.blocks_list, new_registers)

        //The variable loop_variable is set to an array containing all the words in the first element of conditions, like "int" "i" "=" "4", for example.
        var loop_variable = key.conditions[0].split(" ");
        
        /*
        The following creates an instruction where var1 is the variable name and value is what it should be set to, so i and 4 respectively in my previous example.
        It should be noted that this process does not account for a loop that starts like for (; i < 5; i++) {
        Any duplicate declaration is checked for and an error is thrown if needed.
        substituteVariable is run on what lies after the = sign, and if the result is null then an error is thrown, since this indicates an uninitialized variable.
        */
        if (Object.prototype.hasOwnProperty.call(new_registers, loop_variable[loop_variable.indexOf("=")-1])) {
            duplicateDeclarationMessage(loop_variable[loop_variable.indexOf("=")-1], output)
            return 'quit'
        }
        let res = substituteVariable(registers, loop_variable[loop_variable.indexOf("=")+1])
        if (res === null) {
            uninitializedVariableMessage(loop_variable[loop_variable.indexOf("=")+1], output)
            return 'quit'
        }

        /*
        An instruction is built with the collected information in order to initialize the variable to the specified value.
        With the way this is implemented right now, this will only work if the variable used to iterate through the for loop is an integer, which is likely to be what the webpage will limit the user to.
        */

        instruction = buildLWInstruction(loop_variable[loop_variable.indexOf("=")-1], res, 'int')

        //This line executes the instruction using the for_interpreter, therefore setting the value to the variable in its copy of registers.
        for_interpreter.execute(instruction) // Loading looping variable to a register

        console.log(for_interpreter.registers[loop_variable[loop_variable.indexOf("=")-1]])
        
        //The following function, named incrementer, performs the logic present in the third part of conditions, so in an example of for (int i = 0; i < 10; i++), it would be i++.
        let incrementer = () => {

            /*
            If the third element of conditions contains "++", the following is done.
            changeByOne is used to add one to the variable specified.
            If changeByOne throws any errors it will return 'quit', which means that this function should also return 'quit' in that case.
            */

            if (key.conditions[2].includes("++")) {
                
                let res = changeByOne(key.conditions, for_interpreter.registers, mips.add, output)
                if (res === 'quit') {
                    return 'quit';
                }

            }
            //The following is almost identical to the previous code piece except it's for decrementing.
            else if (key.conditions[2].includes("--")) {
                
                let res = changeByOne(key.conditions, for_interpreter.registers, mips.sub, output)
                if (res === 'quit') {
                    return 'quit';
                }

            }
            /*
            If the third element of conditions includes "+=", the following is done.
            changeByMany is used to alter the variable by a certain amount.
            If it returns 'quit' then it has thrown an error, so this function should also return 'quit'.
            */
            else if (key.conditions[2].includes("+=")) {
                let res = changeByMany(key.conditions, for_interpreter.registers, mips.add, output)
                if (res === 'quit') {
                    return 'quit';
                }
            }
            /*
            If the third element of conditions includes "-=", the following is done.
            This is highly similar to the previous piece of code.
            */
            else if (key.conditions[2].includes("-=")) {
                let res = changeByMany(key.conditions, for_interpreter.registers, mips.sub, output)
                if (res === 'quit') {
                    return 'quit';
                }
            }

            //This is similar to the previous else-if statements, just for multiplication.

            else if (key.conditions[2].includes("*=")) {
                let res = changeByMany(key.conditions, for_interpreter.registers, mips.mult, output)
                if (res === 'quit') {
                    return 'quit';
                }
            }
            
            //This is similar to the previous else-if statements, just for division.

            else if (key.conditions[2].includes("/=")) {
                let res = changeByMany(key.conditions, for_interpreter.registers, mips.div, output)
                if (res === 'quit') {
                    return 'quit';
                }
            }
        }

        // Running the for loop here
        while (true) {
            /*
            A new interpreter is created with this instruction's blocks_list and the previously created copy of the main interpreter's registers.
            It should be noted that this leads to a form of recursion, if a nested for loop is found then the for_interpreter will perform this exact same process within itself.
            */
            for_interpreter = new Interpreter(key.blocks_list, new_registers)
            //The interpreter is then run to generate the output of the code within the for loop.
            for_interpreter.run()
            //If for_interpreter produced some output and the first output element has an errorType, meaning it is an error object, then clear the output that this interpreter has, add said error object, and return 'quit' to halt processing.
            if (for_interpreter.output.length > 0 && Object.prototype.hasOwnProperty.call(for_interpreter.output[0], 'errorType')) {
                output.splice(0, output.length)
                output.push(for_interpreter.output[0])
                return 'quit'
            }

            //All of the output generated from the for_interpreter is added to the output of the main interpreter, element by element.

            for (let i in for_interpreter.output) {
                output.push(for_interpreter.output[i])
            }
            /*
            The incrementer function is called in order to perform the logic of the third part of conditions.
            If an error is thrown within it, or rather within a function that is called within it, terminate processing.
            */
            if (incrementer() === 'quit') {
                return 'quit';
            }
            /*
            If the for loop should not continue executing, the loop is broken out of.
            Should branch throw an error and return null, processing is stopped.
            */
            let res = branch(key.conditions, for_interpreter.registers, 'for', output)
            if (res === null) {
                return 'quit';
            }
            console.log(res)
            if (!res) {
                break;
            }
            
        }
        //When a for loop is completed, a message is output to the console.
        console.log("END FOR LOOP")
        /*
        Now that the for loop is complete, callBackRegisters is called.
        This method does not add any new variables to registers, but it does ensure that if any variables in registers have a different value in new_registers then those changes make it back to registers.
        */
        callbackRegisters(registers, new_registers)

    }

    //The following is done if the instruction's func is "if".
    else if (key.func == "if") {
        //Much like before, branch is used to evaluate conditions, and processing is stopped if it returns null.
        let res = branch(key.conditions, registers, 'if', output)
        if (res === null) {
            return 'quit';
        }
        /*
        Much like before, a clone of registers is created and given to a new interpreter.
        The interpreter is then run and if its output is an error then it is processed accordingly.
        Otherwise the output is simply appended to the main interpreter's output, callbackRegisters is called, and the execute method returns to prevent any else-if or else statements from being executed.
        */
        if (res) {
            let new_registers = cloneRegisters(registers)
            let if_interpreter = new Interpreter(key.blocks_list, new_registers)
            if_interpreter.run()
            if (if_interpreter.output.length > 0 && Object.prototype.hasOwnProperty.call(if_interpreter.output[0], 'errorType')) {
                output.splice(0, output.length)
                output.push(if_interpreter.output[0])
                return 'quit'
            }
            for (let i in if_interpreter.output) {
                output.push(if_interpreter.output[i])
            }
            callbackRegisters(registers, new_registers)
            return
        }
        
        // Handling else-if and else
        //The following executes if the if condition was false and there exists one or more else-if conditions.
        else if (Object.prototype.hasOwnProperty.call(key, 'else-if')) {
            //The variable logic_chain is set to be the instruction's else-if object.
            let logic_chain = key['else-if']
            //Every element in logic_chain is iterated over.
            for(let i in logic_chain) {
                //The statement variable equals the element currently being iterated over.
                let statement = logic_chain[i]
                //The following is executed if the element corresponds to an else-if statement.
                if (statement.func == "if") {

                    //If that is the case and the condition of the else-if statement evaluates to true, the statement is executed.

                    console.log(statement.conditions)
                    let res = branch(statement.conditions, registers, 'if', output)
                    if (res === null) {
                        return 'quit';
                    }
                    if (res) {
                        return execute(statement, registers, output)
                    }
                }
                //If the element corresponds to an else statement then that means that no statements before it executed, therefore it is executed instead and is presumed to be the last element.
                else if (statement.func == "else") {
                    return execute(statement, registers, output)
                }
            }

        }
        
    }

    /*
    If the instruction has func "else", then it would only be sent to execute if it was appropriate for its code to run.
    Much like earlier, a new interpreter is created with this instruction's blocks_list and access to a copy of the main interpreter's registers.
    The interpreter is run and the processes done after that were previously seen, so I will avoid repetitive comments.
    */
    else if (key.func == "else") {
        let new_registers = cloneRegisters(registers)
        var else_interpreter = new Interpreter(key.blocks_list, new_registers)
        else_interpreter.run()
        if (else_interpreter.output.length > 0 && Object.prototype.hasOwnProperty.call(else_interpreter.output[0], 'errorType')) {
            output.splice(0, output.length)
            output.push(else_interpreter.output[0])
            return 'quit'
        }
        for (let i in else_interpreter.output) {
            output.push(else_interpreter.output[i])
        }

        callbackRegisters(registers, new_registers)

    }


    //The following is executed if the instruction's func is "print".
    else if (key.func == "print") {
        //A message is displayed to the console about what is being printed.
        console.log("Printing: " + key.value)
        //A variable called content is declared, and it will be used to hold what should be printed.
        let content;

        //If key.value is a valid string then content will be set to what lies between its double quotes.

        if (validateString(key.value)) {
            content = key.value.split(`"`)[1]
        }
        
        //Otherwise, if the value is numeric or a boolean, content is simply set to that value.
        else if (mips.isNumeric(key.value) || validateBoolean(key.value)) {
            content = key.value
        }

        /*
        Otherwise, if there is a variable named value, content become's that variable's value.
        Of course, in the case that the variable named value is a string, content will become the characters that are within the double quotes.
        */
        else if (Object.prototype.hasOwnProperty.call(registers, key.value)) {
            content = registers[key.value].value
            console.log(content)
            if (['String', 'final String'].includes(registers[key.value].type)) {
                content = content.split(`"`)[1]
            }
        }
        // For printing expressions
        /*
        Otherwise key.value is understood to be an expression.
        exp becomes an array where each element is a word in key.value, delimited by spaces.
        Any existing strings are collapsed.
        The expression is evaluated by evaluateGeneralExpression with the result stored in content, and if the result is null then processing ceases.
        If the result is a string then content becomes whatever is in between the double quotes.
        */
        else {
            let exp = key.value.split(' ')
            exp = collapseStrings(exp)
            console.log('exp = ' + exp)
            content = evaluateGeneralExpression(exp, registers, output)

            if (content === null) {
                return 'quit'
            }

            if (validateString(content)) {
                content = content.split(`"`)[1]
            }
        } 

        
        //Regardless of what content has become, it is added to the interpreter's output.
        
        output.push(content)
    }
}

/*
The function below is used to evaluate and return the result of a math expression.
It takes the expression as well as the calling interpreter's registers and output as parameters.
*/

function evaluateMathExpression(value, registers, output) {

    /*
    The expression array will be used to hold the expression after it undergoes some initial processing.
    The types array will be used to keep track of the types of the elements in the expression, in order to determine if division should be integer division or not.
    */

    let expression = []
    let types = []

    //This loop is used to iterate over all elements in value

    for (let i = 0; i < value.length; i++) {
        /*
        If the current element is a valid operator, it is simply pushed to expression and types
        It is pushed to types so that the indices within types remain analogous to the ones in expression.
        For example, if value is the expression 4.7 + 9 then expression will be 4.7, +, and 9, and types will be double, +, and int
        So, given that 9 has index 2 in expression, its type can be found by using index 2 into the types array.
        */
        if (['+', '-', '*', '/'].includes(value[i])) {
            expression.push(value[i])
            types.push(value[i])
        }
        //Otherwise, perform substituteVariable on the current element and perform the appropriate action if null is returned, returning null to signify that an error has been thrown.
        else {

            let res = substituteVariable(registers, value[i])
            if (res == null) {

                uninitializedVariableMessage(value[i], output)
                return null
            }
            //If the current element is a variable, add its type to types, with no need to distinguish between constants and non-constants here.
            if (Object.prototype.hasOwnProperty.call(registers, value[i])) {
                if (['int', 'final int'].includes(registers[value[i]].type)) {
                    types.push('int')
                }
                else if (['double', 'final double'].includes(registers[value[i]].type)) {
                    types.push('double')
                }
            }
            //Otherwise, if the current element is a valid integer value, push int to types.
            else if (validateInt(res)) {
                types.push('int')
            }
            //Otherwise, if the current element is numeric, push double to types.
            else if (mips.isNumeric(res)) {
                types.push('double')
            }
            //Push res that was obtained earlier to expression, which will work with the above code to make it so that expression will contain only numbers and operators.
            expression.push(res)
        }
    }

    /*
    The below regex that lies in between the forward slashes is somewhat complex.
    You can paste it into this site to get a comprehensive breakdown of what it does: https://regex101.com/
    (Note: The website requires a back slash before every forward slash to use as escape characters, while the working JavaScript here does not.)
    (Also keep in mind that this regex is being tested against a string representation of expression that lacks any spaces.)
    Essentially, this expression matches a valid math expression, which requires at least one operator, the appropriate number of numbers given the number of operators, for numbers and operators to be in the correct order, etc.
    If the string generated from expression does not match this regex, an error is thrown and null is returned.
    */

    if (!/^-?[\d]+(\.[\d]+)?[+\-*/]-?[\d]+(\.[\d]+)?([+\-*/]-?[\d]+(\.[\d]+)?)*$/.test(expression.join(''))) {
        mathExpressionSyntaxMessage(expression.join(' '), output)
        return null;
    }

    // Computing mult/div then add/sub
    /*
    The following two loops process the math expression.
    The first loop performs any multiplication and division while the second loop performs any addition and subtraction, in accordance with the order of operations.
    */
    for (let i = 0; i < expression.length; i++) {
        //x becomes the expression element being currently iterated over.
        let x = expression[i]
        /*
        If the multiplication sign is seen, then multiplication is performed on the numbers on either side.
        The result is then substituted into expression, replacing where the operands and multiplication symbol were.
        i is decremented so that it points to the next element after it is incremented when the loop reaches its next iteration, as well as to make it so that splice deletes the correct elements.
        If both operands were integers then the product is an integer as well, and its type replaces the types of the operands as well as the operator within types
        Otherwise, the product is marked as a double.
        This same process is done for division, addition, and subtraction.
        */
        if (x == "*") {
            let new_val = mips.mult(expression[i-1], expression[i+1])
            let first = types[i-1]
            let second = types[i+1]
            expression.splice(--i, 3, new_val)
            if (first === 'int' && second === 'int') {
                types.splice(i, 3, 'int')
            }
            else {
                types.splice(i, 3, 'double')
            }
        }
        /*
        The division process is similar, except it throws an error if dividing by zero is attempted.
        Additionally, the quotient is rounded down if both operands are integers.
        */
        else if (x == "/") {
            let res = mips.div(expression[i-1], expression[i+1]);
            if (res == "Error: division by zero") {
                divideByZeroMessage(expression.join(' '), output)
                return null;
            }
            let first = types[i-1]
            let second = types[i+1]
            if (first === 'int' && second === 'int') {
                types.splice(--i, 3, 'int')
                res = Math.floor(res)
            }
            else {
                types.splice(--i, 3, 'double')
            }

            let new_val = res

            expression.splice(i, 3, new_val)
            
        }
    }

    /*
    Within this loop, addition and subtraction are done in a similar fashion to addition and multiplication.
    types is not longer relevant at this point, since no more division is to be done.
    */

    for (let i = 0; i < expression.length; i++) {
        let x = expression[i]
        if (x == "+") {
            let new_val = mips.add(expression[i-1], expression[i+1])
            expression.splice(--i, 3, new_val)
        }
        else if (x == "-") {
            let new_val = mips.sub(expression[i-1], expression[i+1])
            expression.splice(--i, 3, new_val)
        } 
    }
    
    //The lone element remaining in expression is the final result, which is then returned.

    return expression.join()

} 

//The following function is similar to the one above, except it is tasked with evaluating boolean expressions.

function evaluateBooleanExpression(value, registers, output) {

    //If value is not an array it is converted into an array that has one element, the initial value of value

    if (!Array.isArray(value)) {
        value = [value]
    }

    console.log(value)

   //Much like before, expression will hold the boolean expression after some processing is done.

    let expression = []

    for (let i = 0; i < value.length; i++) {
        //If the current element is a valid boolean or math operator, it is simply added to expression.
        if (['==', '>', '>=', '<', '<=', '&&', '||', '!', '+', '-', '*', '/'].includes(value[i])) {
            expression.push(value[i])
        }
        else {
            //Otherwise, if the first character of the current element is ! then, while the current element is not empty and its first character is !, the current element has its first character shaved off and an ! is added to expression.
            if(value[i][0] == '!') {

                while (value[i].length > 0 && value[i][0] == '!') {
                    value[i] = value[i].substring(1)
                    expression.push('!') 
                }

            }

            //Perform substituteVariable on the current element and throw an error if needed, returning null if that is the case.

            let res = substituteVariable(registers, value[i])
            if (res == null) {

                uninitializedVariableMessage(value[i], output)
                return null
            }

            //The result is then pushed to expression.

            expression.push(res)
        }
    }

    //Now expression should only consist of values, operators, and exclamation marks that only occur within single-character elements.

    console.log(expression)

    /*
    expressionString is saved so that it can be used in an error message if needed.
    This is done because this state of the expression is what should be displayed, not the expression in the middle of the transformations that occur within the next loop.
    */

    let expressionString = expression.join(' ')

    for (let i = 0; i < expression.length; i++) {
        //Given that this loop is used to evaluate any math expressions, action is taken when a math operator is spotted.
        if (['+', '-', '*', '/'].includes(expression[i])) {
            //If i is the first or last index of expression, or if either operands are not numeric, then an error is thrown.
            if (i - 1 < 0 || i + 1 >= expression.length || !mips.isNumeric(expression[i-1]) || !mips.isNumeric(expression[i+1])) {
                booleanSyntaxMessage(expressionString, output)
                return null;
            }
            /*
            The currently handled math expression, miniExpression, starts out as only including the operands and operator in the proper order.
            Then the expression elements continue to be iterated over as long as consecutive math operators/numeric values are found.
            Each element that matches this criteria is pushed to miniExpression.
            evaluateMathExpression is then used to obtain the result, with null being returned from this function should it return null, indicating a thrown error.
            i is decremented for similar reasons as before, and however many elements that were added to miniExpression are properly replaced by the result within expression
            */
            else {
                let miniExpression = [expression[i-1], expression[i], expression[i+1]]
                for (let j = i + 2; j < expression.length; j++) {
                    if (!['+', '-', '*', '/'].includes(expression[j]) && !mips.isNumeric(expression[j])) {
                        break;
                    }
                    else {
                        miniExpression.push(expression[j])
                    }
                }
                let res = evaluateMathExpression(miniExpression, registers, output)
                if (res === null) {
                    return null
                }
                expression.splice(--i, miniExpression.length, res)
            }
        }
    }

    //The following loop is used to perform any negations specified by exclamation marks.

    for (let i = 0; i < expression.length; i++) {
        /*
        If an exclamation mark is spotted, then the number of exlamation marks seen, 1 at this point, is odd, so the next non-exclamation mark element seen should be negated.
        The exclamation mark is then removed from expression.
        while the bounds of expression have not been exceeded, and while the next element is an exclamation mark, negate flips as the parity of how many exclamation marks have been seen does as well.
        An even number would result in no negation, an odd number would result in negation.
        The exclamation marks spotted are eliminated like before.
        Then, when there are no more exlamation marks, if the bounds of expression have been exceeded or the value of the current element is not a valid boolean, throw an error and return null.
        Otherwise, if the value needs to be negated, then do so.
        The current element is checked as a boolean and a string just in case, as types can be troublesome to keep track of in JavaScript.
        */
        if (expression[i] == '!') {
            let negate = true
            expression.splice(i, 1)
            while (i < expression.length && expression[i] == '!') {
                negate = !negate
                expression.splice(i, 1)
            }
            if (i >= expression.length || !validateBoolean(expression[i])) {
                booleanSyntaxMessage(expressionString, output)
                return null;
            }
            else if (negate) {
                if (expression[i] == true || expression[i] == 'true') {
                    expression[i] = false
                }
                else {
                    expression[i] = true
                }
            }
        }
    }

    /*
    Regex is used to check the syntax of the current expression, and if it does not match an error is thrown and null is returned.
    Once again the expression is slightly complicated, so feel free to paste it into this site: https://regex101.com/
    It will determine if the expression is in valid form at this point.
    */

    if (!/^(true|false|-?[\d]+(\.[\d]+)?)((>|>=|<=|<|==|&&|\|\|)(true|false|-?[\d]+(\.[\d]+)?))*$/.test(expression.join(''))) {
        booleanSyntaxMessage(expressionString, output)
        return null;
    }

    /*
    The following loop is used to evaluate boolean comparisons within expression.
    If a comparative operator is the current element, action is taken.
    If the operator is == and the first operand is a boolean while the second is numeric, ignore this comparison for now.
    This is because the numeric operand could be part of a yet-to-be-processed comparison that would result in a boolean being on the right side of the ==, making the comparison possible.
    Otherwise use evaluateComparison to do just that, and throw an error if null is returned, which would indicate that this should be done.
    Replace the operands and operator with the result.
    */

    for (let i = 0; i < expression.length; i++) {

        let x = expression[i]

        if (['==', '>', '>=', '<', '<='].includes(x)) {
            if (x == '==' && validateBoolean(expression[i-1]) && mips.isNumeric(expression[i+1])) {
                continue
            }
            let res = evaluateComparison(expression[i-1], x, expression[i+1])
            if (res === null) {
                booleanSyntaxMessage(expressionString, output)
                return null
            }

            expression.splice(--i, 3, res)

        }

    }

    //This loop is similar to the one before, except it is only used to evaluate any comparisons involving == that could have been postponed during the previous loop.

    for (let i = 0; i < expression.length; i++) {
        let x = expression[i]
        if (x == '==') {
            let res = evaluateComparison(expression[i-1], x, expression[i+1])
            if (res === null) {
                booleanSyntaxMessage(expressionString, output)
                return null
            }
            expression.splice(--i, 3, res)
        }
    }

    /*
    Once again, regex is used to check the syntax of expression
    This regular expression is much simpler, but can still be checked with: https://regex101.com/
    I am actually unsure if this check is needed at the time of writing this, but it doesn't hurt to be safe.
    */

    if (!/^(true|false)((&&|\|\|)(true|false))*$/.test(expression.join(''))) {
        booleanSyntaxMessage(expressionString, output)
        return null;
    }

    console.log(expression)

    /*
    Now that expressions can only consist of boolean values, and's, and or's it can be converted into a math expression and evaluated.
    Instances of true are converted to 1, false to 0, and to multiplication, and or to addition.
    Like before, boolean values are checked as strings and booleans to be safe.
    */

    for (let i = 0; i < expression.length; i++) {
        let x = expression[i]
        if (x == 'true' || x == true) {
            expression[i] = '1'
        }
        else if (x == 'false' || x == false) {
            expression[i] = '0'
        }
        else if (x == '&&') {
            expression[i] = '*'
        }
        else if (x == '||') {
            expression[i] = '+'
        }
    }

    console.log("What is given as a math expression:", expression)

    //ret will become the result of this math expression

    let ret = null

    //if expression is only one element then it cannot be given to evaluateMathExpression, so simply set ret to that element.

    if (expression.length == 1) {
        ret = expression[0]
    }

    //Otherwise ret will be what is returned from evaluateMathExpression

    else {
        ret = evaluateMathExpression(expression, registers, output)  
    }

    //If ret is zero, then the result is false.

    if (ret == 0) {
        return false
    }

    //If ret is not zero and it is also not null then no error was thrown and the result is true.

    else if (ret !== null) {
        return true
    }

    //Otherwise an error was thrown, so return null.

    else {
        return null
    }

} 

//This function is used to evaluate a string expression.

function evaluateStringExpression(value, registers, output) {
    //Like before, the expression array will be used to store the expression after some initial processing has been done.
    let expression = []
    //The references object will be used to keep track of string variables after their value has been inserted into expressiom
    let references = {}
    //expressionString is saved at this point for the same reason it was saved in evaluateBooleanExpression, to display an appropriate message in the case of an error.
    let expressionString = value.join(' ')

    console.log("Value is: ", value)

    //This loop is used to make it so that expression will contain only strings and string operators, and set references accordingly.

    for (let i = 0; i < value.length; i++) {
        /*
        If the current element is a variable within registers, do the following.
        If the variable is a string then set a reference whose name refers to the current index to the variable's name.
        Then add the variable's value to expression
        Otherwise, if the variable is another data type, convert its value to a string using convertToString and add it to expression
        No reference needs to be made in this case.
        */
        if (Object.prototype.hasOwnProperty.call(registers, value[i])) {
            let varType = registers[value[i]].type
            if (['String', 'final String'].includes(varType)) {
                references[i] = value[i]
                expression.push(registers[value[i]].value)
            }
            else if (['int', 'final int', 'double', 'final double', 'boolean', 'final boolean'].includes(varType)) {
                expression.push(convertToString(registers[value[i]].value))
            }
        }
        //If the current element is not a variable within registers, do the following.
        else {
            //If the current element is a valid string or a valid string operator, just push it to expression
            if (validateString(value[i]) || ['+', '+='].includes(value[i])) {
                expression.push(value[i])
            }
            //Otherwise, if the current element is a boolean or numeric value, convert it to a string an push it to expression.
            else if (validateBoolean(value[i]) || mips.isNumeric(value[i])) {
                expression.push(convertToString(value[i]))
            }
            /*
            Otherwise, if the first character of the current element is ! , do the following.
            Count how many !'s there are in the current element, shaving off a ! each time the count increases.
            As an aside, I believe that value[i][0] may be undefined if value[i] is empty which would make the empty check not needed, but my lack of familiarity with JavaScript is making me be cautious.
            After this process, if value[i] is a boolean value or a variable within registers, add back all of the !'s and evaluate the boolean expression.
            If an error is thrown, return null.
            Convert the result to a string and add it to expression.
            */
            else if (value[i][0] == '!') {
                let count = 0
                while (value[i].length > 0 && value[i][0] == '!') {
                    count++
                    value[i] = value[i].substring(1)
                }
                if (validateBoolean(value[i]) || Object.prototype.hasOwnProperty.call(registers, value[i])) {
                    for (let c = 0; c < count; c++) {
                        value[i] = '!' + value[i]
                    }
                    let ret = evaluateBooleanExpression(value[i], registers, output)
                    console.log("ret is ", ret)
                    if (ret === null) {
                        return null
                    }
                    expression.push(convertToString(ret))
                }
            }

            //Otherwise, throw an error and return null.

            else {
                stringSyntaxMessage(expressionString, output)
                return null
            }
        }
    }

    //The expressionString is updated.

    expressionString = expression.join(' ')

    /*
    The following loop performs any string operations on expression
    Note how it iterates through expression's elements backwards.
    This is done to ensure that operations are performed in the correct order.
    For example, take the following code-
    String s = "H";
    System.out.println(s += "ello" + " World");
    System.out.println(s);
    If the elements of expression were iterated over forwards then, given the implementation of this loop, only "ello" would be added to s, and not " World" as it should be.
    However, if iterated over backwards then "ello" and " World" would be added together first, so that then "ello World" would be appended to s, as it should be.
    */

    for (let i = expression.length - 1; i >= 0; i--) {
        //If a string expression operand has been found, there is work that needs to be done.
        if (expression[i] == '+' || expression[i] == '+=') {
            /*
            Should i be at the first or last index of expression, or if one of the operands is not a string for whatever reason, throw an error.
            Given the earlier processing, the type check on the operands may not be needed, but I have it here to be certain.
            */
            if (i == 0 || i == expression.length - 1 || !validateString(expression[i-1]) || !validateString(expression[i+1])) {
                stringSyntaxMessage(expressionString, output)
                return null
            }

            /*
            If the operator is a +, then any references that may exist for the operands should be deleted, as even if an operand was initially a variable, it is now impossible for it to have its value modified.
            Use concatenate to combine the operands into a new string and have it take the place of the operands and operator.
            */
            
            if (expression[i] == '+') {
                delete references[i-1]
                delete references[i+1]
                let newString = concatenate(expression[i-1], expression[i+1])
                expression.splice(--i, 3, newString)
            }

            /*
            Otherwise, meaning that the operator is a +=, do the following.
            If the first operand is not a string that was a variable, throw an error, as a simple string value cannot be manipulated in this manner.
            Else, form the new string and update the value of the register being manipulated.
            The reference used to accomplish this should now be deleted, as it will no longer be used.
            Replace the operands and operator with the new string in expression.
            */

            else {
                if (!Object.hasOwnProperty.call(references, i-1)) {
                    stringSyntaxMessage(expressionString, output)
                    return null
                }
                else {
                    let newString = concatenate(expression[i-1], expression[i+1])
                    registers[references[i-1]].value = newString
                    delete references[i-1]
                    expression.splice(--i, 3, newString)
                }
            }
        }
    }

    //If there is not a single string left as the result, throw an error.

    if (expression.length != 1) {
        stringSyntaxMessage(expressionString, output)
        return null
    }

    //Else, return the element within expression, as it is the result.

    else {
        return expression.join()
    }

}

/*
The following function is used to concatenate two strings.
The first string has its second " eliminated, the second string has its first " eliminated, and the two are then combined into one string.
*/

function concatenate(str1, str2) {
    str1 = str1.slice(0,-1)
    str2 = str2.substring(1)
    return str1 + str2
}

//The following function simply converts a value into a string, so it gives it its opening and closing double quotes.

function convertToString(value) {
    return '"' + value + '"'
}

//The following function is used to evaluate an expression if it is a math, boolean, or string expression, it can handle all three of these types.

function evaluateGeneralExpression(expression, registers, output) {
    //res will store the result of the expression
    let res = null

    //If expression is not an array, make it an array that has its original value as its only element.

    if (!Array.isArray(expression)) {
        expression = [expression]
    }

    //expType will keep track of the type of expression, and it will start off as math.

    let expType = 'math'

    //If any elements contain " or are variables that are strings, expType becomes String and the loop is terminated.
    
    for (let i = 0; i < expression.length; i++) {
        if (expression[i].includes('"') || (Object.prototype.hasOwnProperty.call(registers, expression[i]) && ['String', 'final String'].includes(registers[expression[i]].type))) {
            expType = 'String'
            break
        }
    }

    //Otherwise, if expType was not found to be String, if any elements are strings indication boolean operations or values, boolean values themselves, include at least one exclamation mark, or are variables that are booleans, expType is set to boolean and the loop terminates.

    if (expType != 'String') {
        for (let i = 0; i < expression.length; i++) {
            if (['>', '>=', '<', '<=', '==', '&&', '||', 'true', 'false'].includes(expression[i]) || expression[i] == true | expression[i] == false || expression[i].includes('!') || (Object.prototype.hasOwnProperty.call(registers, expression[i]) && ['boolean', 'final boolean'].includes(registers[expression[i]].type))) {
                expType = 'boolean'
                break
            }
        }
    }

    //The expression is then evaluated depending on expType

    if (expType == 'math') {
        res = evaluateMathExpression(expression, registers, output)
    }
    else if (expType == 'boolean') {
        res = evaluateBooleanExpression(expression, registers, output)
        console.log(res)
    }
    else if (expType == 'String') {
        res = evaluateStringExpression(expression, registers, output)
    }

    //The result is then returned, and if it is null then this will indicate that an error was thrown.

    return res

}

//The following function is used to perform a math operation on two operands.

function performMathOp(registers, var1, var2, operation, output) {
    /*
    substituteVariable is applied to both operands.
    If either operand is not numeric, throw an error.
    Before checking if val2 is numeric, throw an error if it is null, which is possible.
    If there are no errors, perform the operation on the operands and return the result.
    */
    let val1 = substituteVariable(registers, var1) 
    let val2 = substituteVariable(registers, var2)

    if (!mips.isNumeric(val1)) {
        invalidOperationMessage(val1, output)
        return null;
    }
    if (val2 === null) {
        uninitializedVariableMessage(val2, output)
        return null;
    }  
    if (!mips.isNumeric(val2)) {
        invalidOperationMessage(val2, output)
        return null;
    }
    return operation(val1, val2)
}

//The following function is used to increment or decrement an element being altered in a for loop.

function changeByOne(conditions, registers, operation, output) {
    //line will hold the variable being manipulated
    let line = []
    /*
    Depending on the operation specified, which should be add or sub, the variable being manipulated will be extracted.
    Any whitespace is trimmed, either ++ or -- is eliminated, and empty elements are not added.
    */
    if (operation.name == 'add') {
        line = conditions[2]
        .trim()
        .split("++")
        .filter(x => {      // Making sure no empty elements are added to the instruction line
            return x.length > 0
        })
    }
    else {
        line = conditions[2]
        .trim()
        .split("--")
        .filter(x => {      // Making sure no empty elements are added to the instruction line
            return x.length > 0
        })
    }
    
    /*
    If line is not one element, an error message is displayed to the console.
    May want to do more than that in case this happens, such as throwing an error.
    */
    if (line.length != 1) {
        console.log("Error with incrementer in for loop")
    }
    //If what was extracted is not a variable within registers, throw an error.
    else if (!Object.prototype.hasOwnProperty.call(registers, line[0])) {
        uninitializedVariableMessage(line[0], output)
        return 'quit';
    }
    //If the variable is a constant, throw an error, as that should not be altered.
    else if (['final int', 'final double'].includes(registers[line[0]].type)) {
        alterConstantMessage(line[0], output)
        return 'quit';
    }
    //If the variable is not numeric, throw an error.
    else if (!mips.isNumeric(registers[line[0]].value)) {
        invalidOperationMessage(registers[line[0]].value, output)
        return 'quit';
    }

    //The variable is incremented/decremented within registers, as is appropriate.
    registers[line[0]] = new Register('int', operation(registers[line[0]].value, 1))

}

//The following function is used to alter a value used within a for loop when +=, -=, *=, or /= are used.

function changeByMany(conditions, registers, operation, output) {

    //Just like before, line becomes an array that contains the words of the third element of conditions, barring "+=", "-=", "*=", "/=".

    let line = []
    if (operation.name == 'add') {
        line = conditions[2]
        .trim()
        .split("+=")
        .map(x => x.trim())
        .filter(x => {      // Making sure no empty elements are added to the instruction line
            return x.length > 0
        })
    }
    else if (operation.name == 'sub') {
        line = conditions[2]
        .trim()
        .split("-=")
        .map(x => x.trim())
        .filter(x => {
            return x.length > 0
        })
    }
    else if (operation.name == 'mult') {
        line = conditions[2]
        .trim()
        .split("*=")
        .map(x => x.trim())
        .filter(x => {
            return x.length > 0
        })
    }
    else {
        line = conditions[2]
        .trim()
        .split("/=")
        .map(x => x.trim())
        .filter(x => {
            return x.length > 0
        })
    }


    /*
    There is an error if line is not two elements long, as it should contain the operands.
    Perhaps an error should be thrown in this case.
    */

    if (line.length != 2) {
        console.log("Error with incrementer in for loop")
    }
    
    //Perform substituteVariable on the second operand, throwing an error if needed.

    let res = substituteVariable(registers, line[1])
    if (res === null) {
        uninitializedVariableMessage(line[1], output)
        return 'quit'
    }

    line[1] = res

    //Several error checks are performed and appropriate errors are thrown if needed.

    if (!Object.prototype.hasOwnProperty.call(registers, line[0])) {
        uninitializedVariableMessage(line[0], output)
        return 'quit'
    }
    else if (['final int', 'final double'].includes(registers[line[0]].type)) {
        alterConstantMessage(line[0], output)
        return 'quit';
    }

    if (!mips.isNumeric(registers[line[0]].value)) {
        invalidOperationMessage(registers[line[0]].value, output)
        return 'quit';
    }

    if (!mips.isNumeric(line[1])) {
        invalidOperationMessage(line[1], output)
        return 'quit';
    }

    //Perform the operation and save the result as value

    let value = operation(registers[line[0]].value, line[1])

    //Throw an error if division by zero is attempted.

    if (value === "Error: division by zero") {
        divideByZeroMessage(line[0] + " /= 0", output)
        return 'quit';
    }

    //If division is done, round the answer down if integer division is being done.

    if (operation.name == 'div') {
        let secondInt = false

        if ((Object.prototype.hasOwnProperty.call(registers, line[1]) && registers[line[1]].type == 'int') || (!Object.prototype.hasOwnProperty.call(registers, line[1]) && validateInt(line[1]))) {
            secondInt = true
        }
        if (registers[line[0]].type == 'int' && secondInt) {
            Math.floor(value)
        }
    }

    //Throw appropriate errors if there is a type mismatch.

    if (registers[line[0]].type == 'int' && !validateInt(value)) {
        invalidIntMessage(line[0], output)
        return 'quit';
    }
    if (registers[line[0]].type == 'double' && !mips.isNumeric(value)) {
        invalidDoubleMessage(line[0], output)
        return 'quit';
    }

    //Save value to the specified register.

    registers[line[0]] = new Register(registers[line[0]].type, value)
}

//This function is used to evaluate conditions in order to determine if execution should continue.

function branch(conditions, registers, type, output) {
    /*
    line will be used to store the conditions.
    type will be if or for, and line will be obtained differently depending on the type.
    This is because for conditions have three pieces, whereas if conditions only have the one relevant piece.
    If type is not if or for, a message is output to the console.
    This should not occur if the branch method is called correctly.
    */
   let line;
    if (type == 'if') {
        line = conditions.trim().split(" ")
    }
    else if (type == 'for') {
        line = conditions[1].trim().split(" ")
    }
    else {
        console.log("Error: Unknown use of branch()")
    }
    /*
    Use evaluateBooleanExpression to determine the result.
    If null is returned, as usual, that is understood to indicate an error.
    */
    console.log(conditions)
    
    return evaluateBooleanExpression(line, registers, output)
    
}

//This function returns a JSON string produced from registers that was converted back into a JavaScript object, effectively cloning registers without keeping any link between it and its clone.

function cloneRegisters(registers) {
    return JSON.parse(JSON.stringify(registers));
}

//This function is used to update the variables that exist in registers with their values in new_registers

function callbackRegisters(registers, new_registers) {
    for (const variable in registers) {
        registers[variable].value = new_registers[variable].value
    }
}

//This function uses regex to test if input is a valid integer.

function validateInt(input) {
    return /^-?[\d]+$/.test(input)
}

//This function determines if input is a valid boolean, string and boolean comparisons are used to be safe.

export function validateBoolean(input) {
    return input == 'true' || input == 'false' || input == true || input == false
}

/*
This function uses regex to test if input is a valid string.
The regex can be broken down by pasting it into: https://regex101.com/
*/

export function validateString(input) {
    return /^"[^"]*"$/.test(input)
}

//This function is used to evaluate a boolean comparison.

function evaluateComparison(op1, operator, op2) {
    //numericOp will hold if numbers are being compared.
    let numericOp = null
    //If both operands are numeric, numericOp is true.
    if (mips.isNumeric(op1) && mips.isNumeric(op2)) {
        numericOp = true
    }
    //Otherwise, if both operands are booleans, numericOp is false.
    else if (validateBoolean(op1) && validateBoolean(op2)) {
        numericOp = false
    }
    //Else the comparison cannot be done, so return null to signify an error.
    else {
        return null
    }
    /*
    Perform operations based on the operator.
    <, >, <=, and >= can only be used with numbers, so if numericOp is false then there is an error.
    If the operator is not recognized as a valid one, there is an error.
    */
    switch(operator) {
        case "<":
            if (!numericOp) {
                return null
            }
            return mips.blt(op1, op2)
        case ">":
            if (!numericOp) {
                return null
            }
            return mips.bgt(op1, op2)
        case "<=":
            if (!numericOp) {
                return null
            }
            return mips.blte(op1, op2)
        case ">=":
            if (!numericOp) {
                return null
            }
            return mips.bgte(op1, op2)       
        case "==":
            if (numericOp) {
                return mips.beq(op1, op2)
            }
            else {
                return op1 == op2
            }
        default:
            console.log("default branch case on operator: " + operator)
            return null

    }
}