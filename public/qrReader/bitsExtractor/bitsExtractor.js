import cv from "../../opencv/opencv"
import {detectorProperties,QRPicProps} from "../constants/constants";
import ModuleCenter from "../moduleCenter/moduleCenter";
import BitsHolder from "./bitsHolder";
class BitsExtractor {

    image;
    imageSize;
    QRCodeProps;
    pixelsMiddle;
    currentX;
    currentY;
    bitsHolder;

    getPixel(row, column) {
        return this.image.ucharPtr(row, column)[0];
    }

    setPixel(row, column, value) {
        this.image.ucharPtr(row, column)[0] = value;
    }

    constructor(image, QRCodeProps) {
        this.image = image;
        this.imageSize = image.cols;
        this.QRCodeProps = QRCodeProps;
        this.bitsHolder = new BitsHolder(QRCodeProps);
    }

    readBits() {
        const length = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder - 2;
        const block = this.bitsHolder.getMatrix();
        const startY = this.currentY;
        for (let i = length ; i>=detectorProperties.moduleSizeFinder+1; i--) { //going from topRight finder pattern to topLeft
            for (let j = detectorProperties.moduleSizeFinder - 2; j>=0; j--) {
                if (this.getPixel(this.currentY, this.currentX) === 0) {
                    block[j][i] = 1;
                } else {
                    block[j][i] = 0;
                }
                console.log(this.currentY, this.currentX);
                this.setPixel(this.currentY, this.currentX, 126);

                // if (this.getPixel(this.currentX, this.currentY) === 0) {
                //     block[i][j] = 1;
                // } else {
                //     block[i][j] = 0;
                // }
                // console.log(this.currentX, this.currentY);
                // this.setPixel(this.currentX, this.currentY, 126);
                // this.currentY -= this.QRCodeProps.averagePixelSize;
            }
            this.currentY = startY;
            this.currentX -= this.QRCodeProps.averagePixelSize;

        }
        console.log(block);
    }

    countTimingPattern() {
        const length = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder*2;
        for (let i=0; i<length; i++) {
            if (i%2 === 0) {
                if (this.getPixel(this.currentY, this.currentX) === 0) return false;
            } else {
                if (this.getPixel(this.currentY, this.currentX) !== 0) return false;
            }
            this.currentX += this.QRCodeProps.averagePixelSize;
        }
        return true;
    }

    findUpperTimingPattern() {
        const shift = this.QRCodeProps.averagePixelSize;
        this.pixelsMiddle = Math.trunc(shift / 2);
        const startX = detectorProperties.moduleSizeFinder*shift + this.pixelsMiddle;
        const startY = (detectorProperties.moduleSizeFinder - 1)*shift  + this.pixelsMiddle;
        let foundFlag = false;
        for (let i=0; i<shift; i++) {
            this.currentX = startX - i;
            this.currentY = startY;
            if (this.countTimingPattern()){
                foundFlag = true;
                break;
            }
        }
        if (!foundFlag) {
            for (let i=0; i<shift; i++) {
                this.currentX = startX + i;
                this.currentY = startY;
                if (this.countTimingPattern()){
                    foundFlag = true;
                    break;
                }
            }
        }
        if (foundFlag) {
            this.currentX -= shift*2;
            this.currentY -= shift;
            this.readBits();
        }
        this.countTimingPattern()
    }

    extract() {
        if (this.QRCodeProps.version < 7) {
            this.findUpperTimingPattern() ;
        }
    }


}

export default BitsExtractor;