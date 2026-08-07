/*
This is the main file for the interpreter, which contains the definition for the Interpreter class.
The decode and execute methods are stored in different files for organization, so they have to be imported to be used here.
*/
import decode from './decoder.js'
import { execute } from './executor.js'

class Interpreter {
                
    constructor(blocks_list, registers) {
        /*
        An interpreter's registers will be set to the registers parameter if it is not undefined.
        If the registers parameter is undefined, then the interpreter object's registers will be set to an empty object.
        The properties kept in registers will be the variables that the interpreter will keep track of.
        */
        this.registers = typeof(registers) != "undefined" ? registers : {}
        /*
        If the blocks_list parameter is an object then the object's blocks_list attribute will be set to the parameter's inner HTML, or the content within the HTML tags.
        See more at: https://www.w3schools.com/jsref/prop_html_innerhtml.asp
        If the blocks_list parameter is not an object then the object's block_list attribute is simply set to the parameter.
        */
        this.blocks_list = typeof(blocks_list) == 'object' ? blocks_list.innerHTML : blocks_list 
        //This object's instructions attribute will be initialized as an empty array.
        this.instructions = []
        //This object's output attribute will be initialized as an empty array.
        this.output = []
    }

    //The run method is the entry point of execution, as it runs the fetch and decode methods.

    run() {
        /*
        The fetch and decode methods are called if this object's blocks_list is not undefined.
        If this object's blocks_list is undefined, then a message is output to the console.
        While this is a case worth checking for, it should not occur if the Interpreter is used properly within the code.
        */
        if (typeof this.blocks_list !== 'undefined') {
            this.fetch()
            decode(this.registers, this.blocks_list, this.instructions, this.output)
        }
        else {
            console.log("Undefined blocks_list")
        }
        
    }
    /*
    The following method converts the blocks_list String held by the object into an array of Strings.
    The array elements are delimited by newlines in the original String.
    Each array element has any whitespace that precedes or succeeds all text removed.
    Any array element that is an empty String is removed.
    */
    fetch() { // Pull instruction from instruction components
        this.blocks_list = this.blocks_list
            .split("\n")            // Each code instruction needs to be on its own line
            .map(x => x.trim())     // Trim white space from each line
            .filter(x => {
                return x.length > 0 // Make sure empty strings aren't added to list
            })
        
    }
    
    //The following method simply returns this intepreter's output.
    get_output() {
        return this.output;
    }


    /*
    The Interpreter class's execute method is distinct from the execute method that is stored in executor.js
    It is implemented so that the execute method from executor.js can be called on by a particular interpreter, as it will supply its own registers and output to the method.
    This is done within executor.js's execute method itself.
    */
    execute(instruction) {
        execute(instruction, this.registers, this.output)
    }
}

//The following line exposes the Interpreter class to other files so that they can import it, and because it is the default export it does not have to be specifically selected by the import statement, only given a name.

export default Interpreter;