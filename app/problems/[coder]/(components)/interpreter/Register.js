/*
The following class represents a register, that is, a variable that the Java interpreter keeps track of.
This class does not need a field for a variable name, as the interpreter's registers object will have properties whose names are the variable names, while their values are Register objects.
The type specifies the data type, be it int, final int, String, boolean, etc.
The value holds the actual data stored within the variable.
*/
export default class Register {
    constructor(type, value) {
        this.type = type
        this.value = value;
    }
}