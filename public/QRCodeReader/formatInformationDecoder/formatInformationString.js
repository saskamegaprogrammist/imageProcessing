import {formatInformationConstants, xor} from "./utils";

class FormatInformationString {
    dataBits = [];
    errorCorrectionBits;
    maskedBits = [];
    mask = 101010000010010;
    generatorPolynomial = 10100110111; //x10 + x8 + x5 + x4 + x2 + x + 1

    constructor(dataBits) {
        this.dataBits = dataBits;
        this.generateErrorCorrectionBits();
        this.generateMaskedBits();
    }

    generateErrorCorrectionBits() {
        let newDataBits = this.dataBits*Math.pow(10,10);
        let newGenPol = this.generatorPolynomial*Math.pow(10,4);
        let result = xor(newDataBits, newGenPol);
        while (Math.trunc(result/Math.pow(10,10)) !== 0) {
            const resultString = result.toString();
            newGenPol = this.generatorPolynomial*Math.pow(10, resultString.length - 11);
            result = xor(result, newGenPol);
        }
        this.errorCorrectionBits = result;
    }

    generateMaskedBits() {
        let newDataBits = this.dataBits*Math.pow(10,10) + this.errorCorrectionBits;
        this.maskedBits = xor(newDataBits, this.mask);
    }

    returnMaskedBits() {
        return this.maskedBits;
    }

    compareMaskedStrings(originalData) {
        return (originalData === this.maskedBits);
    }

    findErrorNumbers(originalData) {
        let errorsNumber = 0;
        let biggerNumber = this.maskedBits;
        let smallerNumber = originalData;
        if (originalData > this.maskedBits) {
            biggerNumber = originalData;
            smallerNumber = this.maskedBits;
        }
        for(;;) {
            if (biggerNumber%10 !== smallerNumber%10) {
                errorsNumber++;
            }
            biggerNumber = Math.trunc(biggerNumber/10);
            smallerNumber = Math.trunc(smallerNumber/10);
            if (smallerNumber === 0) break;
            if (errorsNumber>formatInformationConstants.maxErrors) break;
        }
        if (errorsNumber>formatInformationConstants.maxErrors) {
            return formatInformationConstants.errorNumber;
        }
        for(;;) {
            if (biggerNumber%10 !== 0) {
                errorsNumber++;
            }
            biggerNumber = Math.trunc(biggerNumber/10);
            if (biggerNumber === 0) break;
            if (errorsNumber>formatInformationConstants.maxErrors) break;
        }
        if (errorsNumber>formatInformationConstants.maxErrors) {
            return formatInformationConstants.errorNumber;
        } else {
            return errorsNumber;
        }
    }
}

export default FormatInformationString;