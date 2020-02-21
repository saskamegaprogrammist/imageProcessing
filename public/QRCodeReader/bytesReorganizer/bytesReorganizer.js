import {bytesBlockInformation, errorCorrectionLevels, formatInformationConstants, maskingFunctions, xor} from "./utils";

class BytesBlockReorganizer {
    bitMatrix;
    bytesBlockData;

    constructor(version, errorCorrectionLevel, matrix) {
        this.bitMatrix = matrix;
        this.findBytesBlockData();
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
}

export default BytesBlockReorganizer;