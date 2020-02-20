import cv from "../../opencv/opencv"
import {detectorProperties, helperBit, QRPicProps} from "../constants/constants";
import ModuleCenter from "../moduleCenter/moduleCenter";
class BitsHolder {
    dataBits = [];
    errorCorrectionBits = [];
    maskedBits = [];

    constructor(dataBits) {
        this.dataBits = dataBits;
        this.errorCorrectionBits = this.generateErrorCorrectionBits();
        this.maskedBits = this.generateMaskedBits();
    }

    generateErrorCorrectionBits() {

    }


}

export default BitsHolder;