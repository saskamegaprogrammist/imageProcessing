import {bytesBlockInformation, errorCorrectionLevels, formatInformationConstants, maskingFunctions, xor} from "./utils";
import {detectorProperties, helperBit} from "../constants/constants";
import BytesBlock from "./bytesBlock";

class BytesBlockReorganizer {
    bitMatrix;
    bytesBlockData;
    blocks;
    matrixI;
    matrixJ;
    upwards;
    right;

    constructor(version, errorCorrectionLevel, matrix) {
        this.bitMatrix = matrix;
        this.findBytesBlockData(version, errorCorrectionLevel);
        console.log(this.bytesBlockData);
        this.extractData();
        console.log(this.blocks);
    }

    findBytesBlockData(version, errorCorrectionLevel) {
        for (let i = (version-1)*4 ; i < version*4; i++) {
            if (bytesBlockInformation[i].checkVersionAndECL(version, errorCorrectionLevel)){
                this.bytesBlockData = bytesBlockInformation[i];
                return;
            }
        }
        console.log("ERROR defining bytes block data");
    }

    extractData() {
        let mode = 0;

        const blocksNumber = this.bytesBlockData.getBlocksNumber();
        this.blocks = new Array(blocksNumber);
        for (let i=0; i<blocksNumber; i++) {
            this.blocks[i] = new BytesBlock();
        }

        const errorCorrectionData = this.bytesBlockData.getErrorCorrectionData();
        let currentNumberOfCodewords = errorCorrectionData[0].getNumberOfDataCodewords();

        this.upwards = true; //position
        this.right = true;

        const dimension = this.bitMatrix.length - 1;
        this.matrixI = dimension;
        this.matrixJ = dimension;

        const start = errorCorrectionData[0].getNumberOfBlocks();
        this.iterateMatrix(currentNumberOfCodewords, 0, blocksNumber, dimension, mode);
        if (errorCorrectionData.length > 1) {
            currentNumberOfCodewords = errorCorrectionData[1].getNumberOfDataCodewords() - currentNumberOfCodewords;
            this.iterateMatrix(currentNumberOfCodewords, start, blocksNumber, dimension, mode);
        }
        mode = 1;
        currentNumberOfCodewords = errorCorrectionData[0].getNumberOfECCodewords();
        this.iterateMatrix(currentNumberOfCodewords, 0, blocksNumber, dimension, mode);
        if (errorCorrectionData.length > 1) {
            currentNumberOfCodewords = errorCorrectionData[1].getNumberOfECCodewords() - currentNumberOfCodewords;
            this.iterateMatrix(currentNumberOfCodewords, start, blocksNumber, dimension, mode);
        }
    }

    iterateMatrix(bound, start, blocksNumber, dimension, mode) {
        for (let i=0; i<bound; i++) {
            for (let j=start; j<blocksNumber; j++) {
                let data = 0;
                for (let k=0; k<=7; ) {
                    console.log(this.matrixI, this.matrixJ);
                    if (this.bitMatrix[this.matrixI][this.matrixJ] !== helperBit) {
                        data += Math.pow(10, k)*this.bitMatrix[this.matrixI][this.matrixJ];
                        k++;
                    }
                    if (this.upwards) {
                        if (this.right) {
                            this.matrixJ--;
                        } else {
                            if (this.matrixI === detectorProperties.moduleSizeFinder + 2 && this.bitMatrix[this.matrixI-1][this.matrixJ] === helperBit   //found finder pattern
                                || this.matrixI === 0) { //found end of code
                                this.matrixJ--;
                                this.upwards = !this.upwards;
                            } else {
                                this.matrixJ++;
                                this.matrixI--;
                            }

                        }
                    } else {
                        if (this.right) {
                            this.matrixJ--;
                        } else {
                            if (this.matrixI === dimension - detectorProperties.moduleSizeFinder - 1 && this.bitMatrix[this.matrixI + 1][this.matrixJ] === helperBit   //found finder pattern
                                || this.matrixI === dimension) { //found end of code
                                this.matrixJ--;
                                this.upwards = !this.upwards;
                            } else {
                                this.matrixJ++;
                                this.matrixI++;
                            }
                        }
                    }
                    if (this.matrixJ === detectorProperties.moduleSizeFinder-1 && this.bitMatrix[this.matrixI][this.matrixJ] === helperBit) {//found timing pattern
                        this.matrixJ--;
                    }
                    this.right = !this.right;
                }
                console.log(data);
                if (mode === 0) {
                    this.blocks[j].addDataByte(parseInt(data, 2));
                } else {
                    this.blocks[j].addErrorCorrectionDataByte(parseInt(data, 2));
                }
            }
        }
    }


}

export default BytesBlockReorganizer;