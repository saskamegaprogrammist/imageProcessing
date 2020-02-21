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
        this.numberOfMisdecodedProtectionCodewords = numberOfMisdecodedProtectionCodewords;
        this.calculateErrorCapacity();
    }

    calculateErrorCapacity() {
        this.errorCapacity = (this.numberOfCodewords - this.numberOfDataCodewords - this.numberOfMisdecodedProtectionCodewords) / 2;
    }

    getNumberOfBlocks() {
        return this.numberOfBlocks;
    }

}

export default ErrorCorrectionData;