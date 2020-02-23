import GalousField from "../galousField/galousField";
import {inv, det, multiply} from 'mathjs'

class ErrorCorrector {
    errorCorrectionData;
    bytesBlock;
    bytes;
    galousField;
    correctFullData;
    syndromes;

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
            this.constructMatrix();
            return this.bytesBlock;
        }
    }

    constructMatrix() {
        let errorCapacity = this.errorCorrectionData.getErrorCapacity();
        let errorPositionVector;
        for (; errorCapacity>=1; errorCapacity--) {
            const syndromesMatrix = new Array(errorCapacity);
            for (let i=0; i<errorCapacity; i++) {
                syndromesMatrix[i] = new Array(errorCapacity);
            }
            for (let i=0; i<errorCapacity; i++) {
                for (let j=0; j<errorCapacity; j++) {
                    syndromesMatrix[i][j] = this.syndromes[i+j];
                }
            }
            if (det(syndromesMatrix) !== 0) {
                const syndromesVector = new Array(errorCapacity);
                for (let i=0; i<errorCapacity; i++) {
                    syndromesVector[i] = this.syndromes[errorCapacity+i];
                }
                const invertedSyndromesMatrix = inv(syndromesMatrix);
                errorPositionVector = multiply(invertedSyndromesMatrix, syndromesVector);
                break;
            }
        }
        console.log(errorPositionVector);

    }


}

export default ErrorCorrector;