import {errorCorrectionLevels, formatInformationConstants, maskingFunctions, xor} from "./utils";

class FormatInformationData {
    errorCorrectionLevel;
    maskingFunction;

    constructor(dataBits) {
        this.calculateErrorCorrectionLevel(dataBits);
        this.calculateMaskingFunction(dataBits);
    }

    calculateErrorCorrectionLevel(dataBits) {
        this.errorCorrectionLevel = errorCorrectionLevels[parseInt(Math.trunc(dataBits/Math.pow(10, 13)), 2)];
    }
    calculateMaskingFunction(dataBits) {
        this.maskingFunction = maskingFunctions[parseInt(Math.trunc((dataBits%Math.pow(10, 13))/Math.pow(10, 10)), 2)];
    }

    getMaskingFunction() {
        return this.maskingFunction;
    }

    getErrorCorrectionLevel() {
        return this.errorCorrectionLevel;
    }


}

export default FormatInformationData;