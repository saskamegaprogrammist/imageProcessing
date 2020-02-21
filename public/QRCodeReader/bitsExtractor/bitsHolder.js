import cv from "../../opencv/opencv"
import {detectorProperties, helperBit, QRPicProps} from "../constants/constants";
import ModuleCenter from "../moduleCenter/moduleCenter";
class BitsHolder {
    QRCodeProps;
    bitMatrix;
    helperBit;

    constructor(QRCodeProps) {
        this.helperBit = helperBit;
        this.QRCodeProps = QRCodeProps;
        const dimension = QRCodeProps.dimension;
        this.bitMatrix = new Array(dimension);
        for (let i=0; i<dimension; i++) {
            this.bitMatrix[i] = new Array(dimension);
        }
        this.fillFindingPatterns();
        this.fillTimingPatterns();
        this.fillAlignmentPatterns();

    }

    fill1AlignmentMarker() {
        const size = detectorProperties.statesSizeAlignment;
        const start = this.QRCodeProps.dimension-1 -detectorProperties.moduleSizeFinder-2;
        for (let i = start; i < start + size; i++) {
            for (let j = start; j < start + size; j++) {
                this.bitMatrix[i][j] = helperBit;
            }
        }
    }

    fillAlignmentPatterns() {
        const number = this.QRCodeProps.alignmentMarkersNumber;
        if (number === 0) return;
        if (number === 1) {
            this.fill1AlignmentMarker();
        }
    }


    fillFindingPatterns() {
        const size = detectorProperties.moduleSizeFinder;
        for (let i=0; i<=size; i++) {
            for (let j=0; j<=size; j++) {
                this.bitMatrix[i][j] = helperBit;
            }
            for (let j=this.QRCodeProps.dimension-1; j>=this.QRCodeProps.dimension-1 -size ; j--) {
                this.bitMatrix[i][j] = helperBit;
            }
        }
        for (let i=this.QRCodeProps.dimension-1; i>=this.QRCodeProps.dimension-1 -size; i--) {
            for (let j=0; j<=size; j++) {
                this.bitMatrix[i][j] = helperBit;
            }
        }
    }

    fillTimingPatterns() {
        const size = detectorProperties.moduleSizeFinder;
        const j = size-1;
        for (let i=size+1; i< this.QRCodeProps.dimension-size; i++) {
            this.bitMatrix[i][j] = helperBit;
            this.bitMatrix[j][i] = helperBit;
        }
    }

    getMatrix() {
        return this.bitMatrix;
    }

    setMatrix(matrix) {
       this.bitMatrix = matrix;
    }

    getFormatInformationBits1() {
        const bits = [];
        for (let i=0; i<detectorProperties.moduleSizeFinder+2; i++) {
            if (i !== detectorProperties.moduleSizeFinder-1) {
                bits.push(Number(this.bitMatrix[detectorProperties.moduleSizeFinder+1].slice(i,i+1)));
            }
        }
        for (let j=detectorProperties.moduleSizeFinder; j>=0; j--) {
            if (j !== detectorProperties.moduleSizeFinder-1) {
                bits.push(Number(this.bitMatrix[j].slice(detectorProperties.moduleSizeFinder+1, detectorProperties.moduleSizeFinder+2)));
            }
        }
        return bits;
    }

    getFormatInformationBits2() {
        const bits = [];
        for (let i=this.QRCodeProps.dimension-1; i>=this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder -1; i--) {
            bits.push(Number(this.bitMatrix[i].slice(detectorProperties.moduleSizeFinder+1,detectorProperties.moduleSizeFinder+2)));
        }
        for (let i=this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder; i<this.QRCodeProps.dimension; i++) {
            bits.push(Number(this.bitMatrix[detectorProperties.moduleSizeFinder+1].slice(i, i+1)));
        }
        return bits;
    }

    fillFormatInformationBits() {
        for (let i=0; i<detectorProperties.moduleSizeFinder+2; i++) {
            if (i !== detectorProperties.moduleSizeFinder-1) {
                this.bitMatrix[detectorProperties.moduleSizeFinder+1][i] = helperBit;
            }
        }
        for (let j=detectorProperties.moduleSizeFinder; j>=0; j--) {
            if (j !== detectorProperties.moduleSizeFinder-1) {
                this.bitMatrix[j][detectorProperties.moduleSizeFinder+1] = helperBit;
            }
        }
        for (let i=this.QRCodeProps.dimension-1; i>=this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder -1; i--) {
            this.bitMatrix[i][detectorProperties.moduleSizeFinder+1] = helperBit;
        }
        for (let i=this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder; i<this.QRCodeProps.dimension; i++) {
            this.bitMatrix[detectorProperties.moduleSizeFinder+1][i] = helperBit;
        }
    }


    unmaskData(maskingFunction) {
        for (let i=0; i < this.QRCodeProps.dimension; i++) {
            for (let j=0; j < this.QRCodeProps.dimension; j++) {
                if (this.bitMatrix[i][j] !== helperBit) {
                    if (maskingFunction(i, j)) {
                        this.bitMatrix[i][j] = this.getInvertedBit(this.bitMatrix[i][j]);
                    }
                }
            }
        }
    }

    getInvertedBit(bit) {
        if (bit === 0) return 1;
        else return 0;
    }
}

export default BitsHolder;