import {bytesBlockInformation, errorCorrectionLevels, formatInformationConstants, maskingFunctions, xor} from "./utils";

class BytesBlockReorganizer {
    bitMatrix;
    bytesBlockData;

    constructor(version, errorCorrectionLevel, matrix) {
        this.bitMatrix = matrix;
        this.findBytesBlockData(version, errorCorrectionLevel);
        console.log(this.bytesBlockData);
    }

    findBytesBlockData(version, errorCorrectionLevel) {
        for (let i = (version-1)*4 ; i < version*4; i++) {
            if (bytesBlockInformation[i].checkVersionAndECL(version, errorCorrectionLevel)){
                this.bytesBlockData = bytesBlockInformation[i];
                break;
            }
        }
        console.log("ERROR defining bytes block data");
    }

    extractData() {
        const dataCodewordsNumber = this.bytesBlockData.getNumberOfDataCodewords();
        let counterCodewords = 0;
        let counterBlocks = 0;
        let upwards = true;
        let i = this.bitMatrix.length - 1;
        let j = this.bitMatrix.length - 1;
        for (;;) {
            for (let i=0; i<7; i++) {

            }
        }
    }


}

export default BytesBlockReorganizer;