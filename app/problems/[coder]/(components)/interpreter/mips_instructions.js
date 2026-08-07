//As the previously made comments state, these functions are based on MIPS instructions and are exported for other files to use.
// MIPS instructions as functions


// Arithmetic functions
//The following functons all use parseFloat(String) which converts a String into a floating point number.
//This function adds two values and returns the sum.
export function add(val1, val2) {
    return parseFloat(val1) + parseFloat(val2)
}
//This function subtracts val2 from val1 and returns the difference.
export function sub(val1, val2) {
    return parseFloat(val1) - parseFloat(val2)
}
//This function multiplies two values and returns the product.
export function mult(val1, val2) {
    return parseFloat(val1) * parseFloat(val2)
}
/*
This function divides val1 by val2 and returns the quotient.
This is floating-point division, meaning that there is no rounding done on the quotient.
If val2 is 0 then a String with value "Error: division by zero" is returned instead.
*/
export function div(val1, val2) {
    if (val2 == "0") return "Error: division by zero"
        return parseFloat(val1) / parseFloat(val2)
}
// Branch functions for looping
/*
The instruction beq causes a branch in execution if the two supplied values are equivalent.
See more at: https://www3.ntu.edu.sg/home/smitha/fyp_gerald/beqinstruction.html
The function below simply returns a boolean regarding if the supplied values are equal.
To be honest, I am unsure if converting both values to floats if they are numeric before conducting the comparison is needed, but this is how the previous team elected to implement it, and it does work.
*/
export function beq(val1, val2) {
    if (isNumeric(val1) && isNumeric(val2)){
        return parseFloat(val1) == parseFloat(val2)
    }
    return val1 == val2
}
//This function is similar to beq except it determines if val1 is greater than val2.
export function bgt(val1, val2) {
    if (isNumeric(val1) && isNumeric(val2)){
        return parseFloat(val1) > parseFloat(val2)
    }
    return val1 > val2
}
//This function determines if val1 is less than val2.
export function blt(val1, val2) {
    if (isNumeric(val1) && isNumeric(val2)){
        return parseFloat(val1) < parseFloat(val2)
    }
    return val1 < val2
}
//This function determines if val1 is greater than or equal to val2.
export function bgte(val1, val2) {
    if (isNumeric(val1) && isNumeric(val2)){
        return parseFloat(val1) >= parseFloat(val2)
    }
    return val1 >= val2
}
//This function determines if val1 is less than or equal to val2.
export function blte(val1, val2) {
    if (isNumeric(val1) && isNumeric(val2)){
        return parseFloat(val1) <= parseFloat(val2)
    }
    return val1 <= val2
}

//This function returns true if n can successfully be converted to a number and is finite.

export function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
