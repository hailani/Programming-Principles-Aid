/*
This class represents an error that can be thrown by the Java interpreter.
It contains a message, which is to be displayed to the user.
It also contains an error type details the type of error that has transpired, like dividing by zero or attempting to alter a constant.
The error type is not currently used anywhere within the program, but it could be useful in further development.
*/
export default class Error {
    constructor(message, errorType) {
        this.message = message
        this.errorType = errorType;
    }
}