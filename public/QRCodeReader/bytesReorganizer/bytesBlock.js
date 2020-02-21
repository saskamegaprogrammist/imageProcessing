class BytesBlockData {
    errorCorrection;
    data;

    constructor(data) {
        this.data = data;
    }

    setErrorCorrectionData(ecData) {
        this.errorCorrection = ecData;
    }

}

export default BytesBlockData;