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
}

export default BitsHolder;