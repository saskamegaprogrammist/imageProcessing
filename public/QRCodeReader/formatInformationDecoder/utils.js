const formatInformationConstants = {
    variantsNumber : 32,
    maxErrors : 3,
    errorNumber : -1,
};

const errorCorrectionLevels = ["M", "L", "H", "Q"];
const maskingFunctions = [
    (i, j) => ((i+j)%2 === 0),
    (i, j) => (i%2 === 0),
    (i, j) => (j%3 === 0),
    (i, j) => ((i+j)%3 === 0),
    (i, j) => ((Math.trunc(i/2)+Math.trunc(j/3))%2 === 0),
    (i, j) => (((i*j)%2 + (i*j)%3) === 0),
    (i, j) => ((((i*j)%2 + (i*j)%3))%2 === 0),
    (i, j) => ((((i+j)%2 + (i*j)%3))%2 === 0),
];


function xor(number1, number2) {
    let biggerNumber = number1;
    let smallerNumber = number2;
    if (number2 > number1) {
        biggerNumber = number2;
        smallerNumber = number1;
    }
    let result = 0;
    let counter = 0;
    for(;;) {
        if (biggerNumber%10 !== smallerNumber%10) {
            result += Math.pow(10, counter);
        }
        counter++;
        biggerNumber = Math.trunc(biggerNumber/10);
        smallerNumber = Math.trunc(smallerNumber/10);
        if (smallerNumber === 0) break;
    }
    ////console.log(biggerNumber, result);
    for(;;) {
        //console.log(biggerNumber%10, Math.trunc(biggerNumber/10), result);
        result += Math.pow(10, counter)*(biggerNumber%10);
        counter++;
        biggerNumber = Math.trunc(biggerNumber/10);
        if (biggerNumber === 0) break;
    }
    //console.log(number1, number2, result);
    return result;
}

export {xor, formatInformationConstants, errorCorrectionLevels, maskingFunctions};
