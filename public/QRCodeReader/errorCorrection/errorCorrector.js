import GalousField from "../galousField/galousField";

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
        this.bytes = this.bytesBlock.getDataBytes().concat(this.bytesBlock.getECBytes());
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
        let syndrome = 0;
        for (let i=0; i<length; i++) {
            syndrome = this.galousField.add(syndrome, this.galousField.multiply(this.bytes[i], this.galousField.getValByDegree(i*degree%2   )));
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
            return undefined;
        }
    }


}

export default ErrorCorrector;