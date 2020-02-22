class BytesBlock {
    errorCorrectionBytes =[];
    dataBytes = [];

    constructor() {
    }

    addDataByte(byte) {
        this.dataBytes.push(byte);
    }

    addErrorCorrectionDataByte(ecData) {
        this.errorCorrectionBytes.push(ecData);
    }

}

export default BytesBlock;