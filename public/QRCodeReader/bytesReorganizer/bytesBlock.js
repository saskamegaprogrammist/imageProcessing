class BytesBlock {
    errorCorrectionBytes =[];
    dataBytes = [];
    errorCorrectionData;

    constructor() {
    }

    setErrorCorrectionData(ECData) {
        this.errorCorrectionData = ECData;
    }

    addDataByte(byte) {
        this.dataBytes.push(byte);
    }

    addErrorCorrectionDataByte(ecData) {
        this.errorCorrectionBytes.push(ecData);
    }

    getECBytes() {
        return this.errorCorrectionBytes;
    }
    getDataBytes() {
        return this.dataBytes;
    }

    getErrorCorrectionData() {
        return this.errorCorrectionData;
    }

}

export default BytesBlock;