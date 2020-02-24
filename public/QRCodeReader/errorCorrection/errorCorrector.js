import GalousField from "../galousField/galousField";
import {inv, det, multiply} from 'mathjs'
import Polynom from "../polynoms/polynom";
import PolynomsUtils from "../polynoms/polynomsUtils";

class ErrorCorrector {
    errorCorrectionData;
    bytesBlock;
    bytes;
    galousField;
    correctFullData;
    syndromes;
    errorsPolynom;
    remainderPolynom;

    constructor() {
        this.galousField = new GalousField();
    }

    constructBytes() {
         let dataBytes = this.bytesBlock.getDataBytes();
         let ecBytes = this.bytesBlock.getECBytes();
         this.bytes = dataBytes.concat(ecBytes);
         console.log(this.bytes);
    }

    calculateSyndromes() {
        const syndromeNumber = this.errorCorrectionData.getSyndromeNumber();
        this.syndromes = new Array(syndromeNumber);
        for (let i=0; i<syndromeNumber; i++) {
            this.syndromes[i] = this.calculateSyndromeValue(i);
        }
    }

    calculateSyndromeValue(degree) {
        const length = this.errorCorrectionData.getNumberOfCodewords();
        let syndrome = this.bytes[0];
        for (let i=1; i<length; i++) {
            const x = this.galousField.getValByDegree(degree);
            //console.log(degree, this.bytes[i], i);
            syndrome = this.galousField.add(this.bytes[i], this.galousField.multiply(syndrome, x));
            //console.log(syndrome)
        }
        return syndrome;
    }

    checkIfCorrect() {
        let sum = 0;
        for (let i=0; i<this.syndromes.length; i++) {
            sum += this.syndromes[i];
        }
        console.log(this.syndromes, sum);
        return (sum === 0);
    }

    correct(bytesBlock) {
        this.errorCorrectionData = bytesBlock.getErrorCorrectionData();
        this.bytesBlock = bytesBlock;
        this.constructBytes();
        return this.getCorrectData();
    }

    getCorrectData() {
        this.calculateSyndromes();
        if (this.checkIfCorrect()) {
            return this.bytesBlock;
        } else {
            console.log("NEEDS CORRECTION");
            this.euclidianAlgorithm();
            console.log(this.errorsPolynom);
            const errorPositions = this.chensSearch();
            const errorValues = this.errorValuesSearch(errorPositions);
            this.errorsAdding(errorPositions, errorValues);
            console.log(this.bytes);
            this.setCorrectedData();
            return this.bytesBlock;
        }
    }

    setCorrectedData() {
        const dataWords = this.errorCorrectionData.getNumberOfDataCodewords();
        this.bytesBlock.setDataBytes(this.bytes.slice(0, dataWords));
        this.bytesBlock.setECBytes(this.bytes.slice(dataWords, this.bytes.length));
    }

    euclidianAlgorithm() {
        const ecCapacity = this.errorCorrectionData.getErrorCapacity();
        const polynomUtils = new PolynomsUtils();
        let polynom1 = polynomUtils.createPlainPolynomByDegree(this.syndromes.length);
        let polynom2 = new Polynom(this.syndromes.reverse());
        let b1 = polynomUtils.createZero();
        let b2 = new polynomUtils.createPlainPolynomByDegree(0);
        console.log(polynom1, polynom2);
        for (;;) {
            let {divisionResult, remainder} = polynomUtils.dividePolynoms(polynom1, polynom2);
            console.log(remainder, divisionResult);
            let swap = b2;
            let a = polynomUtils.multiplyPolynoms(divisionResult, b2);
            //console.log(a, b1);
            b2 = polynomUtils.addPolynoms(a, b1);
            b1 = swap;

            console.log(b1, b2);

            if (remainder.getDegree() < ecCapacity) {
                this.errorsPolynom = b2;
                this.remainderPolynom = remainder;
                return;
            } else {
                polynom1 = polynom2;
                polynom2 = remainder;
            }
        }
    }

    chensSearch() {
        const polynom = this.errorsPolynom;
        const degree = polynom.getDegree();
        const roots = [];
        let x=0;
        for (; x<this.galousField.size; x++) {
            let answer = polynom.getCoefficentByDegree(degree);
            for (let i = degree - 1; i >= 0; i--) {
                answer = this.galousField.add(polynom.getCoefficentByDegree(i), this.galousField.multiply(answer, x));
            }
            if (answer===0) roots.push(x);
        }
        const degrees = [];
        for (let i=0; i<degree; i++) {
            degrees.push(this.galousField.getInverse(roots[i]));
        }
        return degrees;
    }

    errorValuesSearch(errorPositions) {
        const errorValues = [];
        let derivativeCoefficents = this.errorsPolynom.getCoefficents();
        derivativeCoefficents.slice(0, derivativeCoefficents.length-1);
        for (let i=derivativeCoefficents.length-2; i>=0; i-=2) {
            derivativeCoefficents[i]=0;
        }
        const derivativePolynom = new Polynom(derivativeCoefficents);
        const derivativeDegree = derivativePolynom.getDegree();
        const remainderDegree = this.remainderPolynom.getDegree();
        for (let i=0; i<errorPositions.length; i++) {
            let x = this.galousField.getInverse(errorPositions[i]);
            let derivativeVal = derivativePolynom.getCoefficentByDegree(derivativeDegree);
            for (let i = derivativeDegree - 1; i >= 0; i--) {
                derivativeVal = this.galousField.add(derivativePolynom.getCoefficentByDegree(i), this.galousField.multiply(derivativeVal, x));
            }
            let remainderVal = this.remainderPolynom.getCoefficentByDegree(remainderDegree);
            for (let i = remainderDegree - 1; i >= 0; i--) {
                remainderVal = this.galousField.add(this.remainderPolynom.getCoefficentByDegree(i), this.galousField.multiply(remainderVal, x));
            }
            errorValues.push(this.galousField.multiply(remainderVal, this.galousField.getInverse(derivativeVal)));
        }
        return errorValues;
    }

    errorsAdding(errorPositions, errorValues) {
        //console.log(errorPositions, errorValues);
        const bytesLength = this.bytes.length;
        for (let i=0; i<errorPositions.length; i++) {
            const power = this.galousField.getPowerByVal(errorPositions[i]);
            //console.log(power);
            this.bytes[bytesLength -1 - power] = this.galousField.add(this.bytes[bytesLength -1 - power], errorValues[i]);
        }
    }


//65,18,7,119,119,114,230,119,38,151,7,7,86,230,87,66,231,39,80,236,17,236,17,236,17,236,17,236,114,157,79,21,180,210,77,97,92,83,33,223,192,64,164,245
}

export default ErrorCorrector;