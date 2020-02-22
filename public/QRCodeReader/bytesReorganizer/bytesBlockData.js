class BytesBlockData {
    version;
    errorCorrectionLevel;
    blocksNumber;
    numberOfCodewords;
    errorCorrectionCodewordsNumber;
    dataCodewordsNumber;
    errorCorrectionData = [];

    constructor(version, errorCorrectionLevel, numberOfCodewords, errorCorrectionCodewordsNumber, errorCorrectionData) {
        this.version = version;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.numberOfCodewords = numberOfCodewords;
        this.errorCorrectionData = errorCorrectionData;
        this.errorCorrectionCodewordsNumber = errorCorrectionCodewordsNumber;
        this.dataCodewordsNumber = numberOfCodewords - errorCorrectionCodewordsNumber;
        this.calculateBlocksNumber();
    }

    calculateBlocksNumber() {
        this.errorCorrectionData.forEach( ecd => {
            this.blocksNumber = ecd.getNumberOfBlocks();
        })
    }

    checkVersionAndECL(version, ecl) {
        return (this.version === version && this.errorCorrectionLevel === ecl);
    }

    getNumberOfCodewords() {
        return this.numberOfCodewords;
    }

    getNumberOfDataCodewords() {
        return this.dataCodewordsNumber;
    }

    getErrorCorrectionCodewordsNumber() {
        return this.errorCorrectionCodewordsNumber;
    }

    getBlocksNumber() {
        return this.blocksNumber;
    }

    getErrorCorrectionData() {
        return this.errorCorrectionData;
    }
}

export default BytesBlockData;