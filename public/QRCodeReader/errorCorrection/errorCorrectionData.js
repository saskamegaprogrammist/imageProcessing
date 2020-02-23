class ErrorCorrectionData {
    numberOfBlocks;
    numberOfCodewords;
    numberOfDataCodewords;
    numberOfECCodewords;
    errorCapacity;
    numberOfMisdecodedProtectionCodewords = 0;

    constructor(numberOfBlocks, numberOfCodewords, numberOfDataCodewords, numberOfMisdecodedProtectionCodewords) {
        this.numberOfBlocks = numberOfBlocks;
        this.numberOfCodewords = numberOfCodewords;
        this.numberOfDataCodewords = numberOfDataCodewords;
        this.numberOfECCodewords = numberOfCodewords - numberOfDataCodewords;
        if (numberOfMisdecodedProtectionCodewords) {
            this.numberOfMisdecodedProtectionCodewords = numberOfMisdecodedProtectionCodewords;
        }
        this.calculateErrorCapacity();
    }

    calculateErrorCapacity() {
        this.errorCapacity = (this.numberOfCodewords - this.numberOfDataCodewords - this.numberOfMisdecodedProtectionCodewords) / 2;
    }

    getNumberOfBlocks() {
        return this.numberOfBlocks;
    }

    getNumberOfDataCodewords() {
        return this.numberOfDataCodewords;
    }

    getNumberOfCodewords() {
        return this.numberOfCodewords;
    }

    getNumberOfECCodewords() {
        return this.numberOfECCodewords;
    }

    getSyndromeNumber() {
        return this.errorCapacity*2;
    }

    getErrorCapacity() {
        return this.errorCapacity;
    }

}

export default ErrorCorrectionData;