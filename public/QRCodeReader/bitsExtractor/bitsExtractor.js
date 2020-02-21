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
    matrix;

    getPixel(row, column) {
        return this.image.ucharPtr(row, column)[0];
    }

    setPixel(row, column, value) {
        this.image.ucharPtr(row, column)[0] = value;
    }

    constructor(image, QRCodeProps, matrix) {
        this.image = image;
        this.imageSize = image.cols;
        this.QRCodeProps = QRCodeProps;
        this.matrix = matrix;
    }

    readBitsUpperTimingPattern() {
        const length = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder - 2;
        const startY = this.currentY;
        for (let i = length ; i>=detectorProperties.moduleSizeFinder+1; i--) { //going from topRight finder pattern to topLeft
            for (let j = detectorProperties.moduleSizeFinder - 2; j>=0; j--) {
                if (this.getPixel(this.currentY, this.currentX) === 0) {
                    this.matrix[j][i] = 1;
                } else {
                    this.matrix[j][i] = 0;
                }
                //console.log(this.currentY, this.currentX);
                this.setPixel(this.currentY, this.currentX, 126);
                this.currentY -= this.QRCodeProps.averagePixelSize;
            }
            this.currentY = startY;
            this.currentX -= this.QRCodeProps.averagePixelSize;

        }
    }

    readBitsLeftTimingPattern() {
        const length = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder - 2;
        const startX = this.currentX;
        for (let i = length ; i>=detectorProperties.moduleSizeFinder+1; i--) { //going from bottomLeft finder pattern to topLeft
            for (let j = detectorProperties.moduleSizeFinder - 2; j>=0; j--) {
                if (this.getPixel(this.currentY, this.currentX) === 0) {
                    this.matrix[i][j] = 1;
                } else {
                    this.matrix[i][j] = 0;
                }
                //console.log(this.currentY, this.currentX);
                this.setPixel(this.currentY, this.currentX, 126);
                this.currentX -= this.QRCodeProps.averagePixelSize;
            }
            this.currentX = startX;
            this.currentY -= this.QRCodeProps.averagePixelSize;

        }
    }

        readRemainedBitsVersion1() {
        //this.currentY += this.QRCodeProps.averagePixelSize;
        this.currentX += 2*this.QRCodeProps.averagePixelSize;
        const startX = this.currentX;
        for (let i = detectorProperties.moduleSizeFinder; i < this.QRCodeProps.dimension; i++) {
            for (let j = detectorProperties.moduleSizeFinder; j < this.QRCodeProps.dimension; j++) {
                if (this.matrix[i][j] !== -1) {
                    if (this.getPixel(this.currentY, this.currentX) === 0) {
                        this.matrix[i][j] = 1;
                    } else {
                        this.matrix[i][j] = 0;
                    }
                }
                //console.log(this.currentY, this.currentX);
                this.setPixel(this.currentY, this.currentX, 126);
                this.currentX += this.QRCodeProps.averagePixelSize;
            }
            this.currentX = startX;
            this.currentY += this.QRCodeProps.averagePixelSize;
        }
    }

    readCenterBits() {
        const length = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder;
        const startY = this.currentY;
        for (let i = length ; i>=detectorProperties.moduleSizeFinder-1; i--) { //going from right to left
            for (let j = length ; j>=detectorProperties.moduleSizeFinder-1; j--) {
                if (this.matrix[j][i] !== -1) {
                    if (this.getPixel(this.currentY, this.currentX) === 0) {
                        this.matrix[j][i] = 1;
                    } else {
                        this.matrix[j][i] = 0;
                    }
                }
                //console.log(this.currentY, this.currentX);
                this.setPixel(this.currentY, this.currentX, 126);
                this.currentY -= this.QRCodeProps.averagePixelSize;
            }
            this.currentY = startY;
            this.currentX -= this.QRCodeProps.averagePixelSize;
        }
    }

    readRemainedBottomBits() {
        if (this.currentY % this.QRCodeProps.averagePixelSize !== 0) {
            this.currentY++; //we want our pixel to be lower
        }
        const startX = this.currentX;
        for (let i = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder  ; i < this.QRCodeProps.dimension ; i++) { //going from to left right
            for (let j = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder ; j >= detectorProperties.moduleSizeFinder + 1; j--) {
                if (this.matrix[j][i] !== -1) {
                    if (this.getPixel(this.currentY, this.currentX) === 0) {
                        this.matrix[i][j] = 1;
                    } else {
                        this.matrix[i][j] = 0;
                    }
                }
                //console.log(this.currentY, this.currentX);
                this.setPixel(this.currentY, this.currentX, 126);
                this.currentX -= this.QRCodeProps.averagePixelSize;
            }
            this.currentX = startX;
            this.currentY += this.QRCodeProps.averagePixelSize;
        }
    }

    readRemainedRightBits() {
        this.currentY -= this.QRCodeProps.averagePixelSize;
        this.currentX += this.QRCodeProps.averagePixelSize*(detectorProperties.moduleSizeFinder-1);
        // if (this.currentX < this.QRCodeProps.dimension*this.QRCodeProps.averagePixelSize-1) {
        //     this.currentX++; //we want our pixel to be more to the right
        // }
        const startY = this.currentY;
        for (let i = this.QRCodeProps.dimension - 1 ; i >= this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder + 1; i--) { //going from  right to left
            for ( let j = this.QRCodeProps.dimension - 1 ; j >= detectorProperties.moduleSizeFinder + 1; j--) {
                if (this.matrix[j][i] !== -1) {
                    if (this.getPixel(this.currentY, this.currentX) === 0) {
                        this.matrix[j][i] = 1;
                    } else {
                        this.matrix[j][i] = 0;
                    }
                }
                //console.log(this.currentY, this.currentX);
                this.setPixel(this.currentY, this.currentX, 126);
                this.currentY -= this.QRCodeProps.averagePixelSize;
            }
            this.currentY = startY;
            this.currentX -= this.QRCodeProps.averagePixelSize;
        }
    }

    countTimingPatternUpper() {
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

    countTimingPatternLeft() {
        const length = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder*2;
        for (let i=0; i<length; i++) {
            if (i%2 === 0) {
                if (this.getPixel(this.currentY, this.currentX) === 0) return false;
            } else {
                if (this.getPixel(this.currentY, this.currentX) !== 0) return false;
            }
            this.currentY += this.QRCodeProps.averagePixelSize;
        }
        return true;
    }

    countAlignmentPatternHorizontal() {
        const length = detectorProperties.statesSizeFinder;
        for (let i=0; i<length; i++) {
            if (i%2 === 0) {
                if (this.getPixel(this.currentY, this.currentX) !== 0) return false;
            } else {
                if (this.getPixel(this.currentY, this.currentX) === 0) return false;
            }
            this.currentX += this.QRCodeProps.averagePixelSize;
        }
        console.log('true');
        return true;
    }

    countAlignmentPatternVertical() {
        const length = detectorProperties.statesSizeFinder;
        for (let i=0; i<length; i++) {
            if (i%2 === 0) {
                if (this.getPixel(this.currentY, this.currentX) !== 0) return false;
            } else {
                if (this.getPixel(this.currentY, this.currentX) === 0) return false;
            }
            this.currentY += this.QRCodeProps.averagePixelSize;
        }
        return true;
    }

    findLeftTimingPattern(shift) {
        const startY = detectorProperties.moduleSizeFinder*shift + this.pixelsMiddle;
        const startX = (detectorProperties.moduleSizeFinder - 1)*shift  + this.pixelsMiddle;

        let foundFlag = false;
        for (let i=0; i<shift; i++) {
            this.currentY = startY - i;
            this.currentX = startX;
            if (this.countTimingPatternLeft()){
                foundFlag = true;
                break;
            }
        }
        if (!foundFlag) {
            for (let i=0; i<shift; i++) {
                this.currentY = startY + i;
                this.currentX = startX;
                if (this.countTimingPatternLeft()){
                    foundFlag = true;
                    break;
                }
            }
        }
        if (foundFlag) {
            this.currentY -= shift*2;
            this.currentX -= shift;
            this.readBitsLeftTimingPattern();
        }
    }


    findUpperTimingPattern(shift) {
        const startX = detectorProperties.moduleSizeFinder*shift + this.pixelsMiddle;
        const startY = (detectorProperties.moduleSizeFinder - 1)*shift  + this.pixelsMiddle;
        let foundFlag = false;
        for (let i=0; i<shift; i++) {
            this.currentX = startX - i;
            this.currentY = startY;
            if (this.countTimingPatternUpper()){
                foundFlag = true;
                break;
            }
        }
        if (!foundFlag) {
            for (let i=0; i<shift; i++) {
                this.currentX = startX + i;
                this.currentY = startY;
                if (this.countTimingPatternUpper()){
                    foundFlag = true;
                    break;
                }
            }
        }
        if (foundFlag) {
            this.currentX -= shift*2;
            this.currentY -= shift;
            this.readBitsUpperTimingPattern();
        }
    }

    findTimingPatterns(shift) {
        this.findUpperTimingPattern(shift);
        this.findLeftTimingPattern(shift);
    }

    find1AlignmentPattern(shift) {
        const length = this.QRCodeProps.dimension - detectorProperties.moduleSizeFinder;
        let startX = (length-2)*shift  + this.pixelsMiddle;
        let startY = length*shift + this.pixelsMiddle;
        let foundFlag = false;
        //console.log(startY,startX);

        for (let i=0; i<=shift*2; i++) {
            for (let j=0; j<=shift*2; j++) {
                this.currentX = startX -i ;
                this.currentY = startY - j;
                //console.log(this.currentY, this.currentX);
                if (this.countAlignmentPatternHorizontal()){
                    foundFlag = true;
                    break;
                }
                //this.setPixel(this.currentY, this.currentX , 100);
            }
            if (foundFlag === false) {
                for (let j=0; j<=shift*2; j++) {
                    this.currentX = startX - i;
                    this.currentY = startY + j;
                    //console.log(this.currentY, this.currentX);
                    if (this.countAlignmentPatternHorizontal()){
                        foundFlag = true;
                        break;
                    }
                    //this.setPixel(this.currentY, this.currentX , 100);
                }
            }
            if (foundFlag) break;
        }
        if (foundFlag === false) {
            for (let i=0; i<=shift*2; i++) {
                for (let j=0; j<=shift*2; j++) {
                    this.currentX = startX + i ;
                    this.currentY = startY - j;
                    //console.log(this.currentY, this.currentX);
                    if (this.countAlignmentPatternHorizontal()){
                        foundFlag = true;
                        break;
                    }
                    //this.setPixel(this.currentY, this.currentX , 100);
                }
                if (foundFlag === false) {
                    for (let j=0; j<=shift*2; j++) {
                        this.currentX = startX + i;
                        this.currentY = startY + j;
                        //console.log(this.currentY, this.currentX);
                        if (this.countAlignmentPatternHorizontal()){
                            foundFlag = true;
                            break;
                        }
                        //this.setPixel(this.currentY, this.currentX , 100);
                    }
                }

                if (foundFlag) break;
            }
        }

        //console.log(this.currentY, this.currentX);
        return foundFlag;
    }

    extract() {
        const shift = this.QRCodeProps.averagePixelSize;
        this.pixelsMiddle = Math.trunc(shift / 2);
        if (this.QRCodeProps.version < 7) {
            this.findTimingPatterns(shift);
            if (this.QRCodeProps.version === 1) {
                this.readRemainedBitsVersion1();
            }
            if (this.QRCodeProps.version > 1) {
                if(this.find1AlignmentPattern(shift)) {
                    this.currentX -= shift*3;
                    const firstAlignmentPatternCenterX= this.currentX;
                    const firstAlignmentPatternCenterY = this.currentY;
                    this.readCenterBits();
                    this.currentX = firstAlignmentPatternCenterX;
                    this.currentY = firstAlignmentPatternCenterY;
                    this.readRemainedBottomBits();
                    this.readRemainedRightBits();
                }
            }
        }
        console.log(this.matrix);
        return this.matrix;
    }


}

export default BitsExtractor;