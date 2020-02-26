import cv from "../../opencv/opencv"
import {detectorProperties,QRPicProps} from "../constants/constants";
import ModuleCenter from "../moduleCenter/moduleCenter";
import QRCodeProps from "../QRCodeProps/QRCodeProps";
import BitsExtractor from "../bitsExtractor/bitsExtractor";
class QRDetector {

    image;
    QRimage;
    imageRows;
    imageCols;
    moduleCenters = [];
    alignmentModuleCenters = [];
    QRCodeProps;
    bitsExtractor;

    constructor() {

    }

    getPixel(row, column) {
        return this.image.ucharPtr(row, column)[0];
    }

    setPixel(row, column, value) {
        this.image.ucharPtr(row, column)[0] = value;
    }

    getQRCodeProps() {
        return this.QRCodeProps;
    }

    detect(image) {
        this.image = image;
        this.imageCols = image.cols;
        this.imageRows = image.rows;

        if (!this.searchForFinderPatterns()) {
            console.log("COULD NOT FIND FINDER PATTERNS");
            return image;
        }

        const centers = this.calculateDimension();

        this.findAlignmentMarkers(centers);
        this.makeTransform(centers);
        this.imageCols = this.QRimage.cols;
        this.imageRows = this.QRimage.rows;

        return this.image;
    }

    findBottomRightAlignmentMarker(xTopLeft, yTopLeft, xBottomRight, yBottomRight) {
        const startX = xTopLeft + Math.ceil((xBottomRight - xTopLeft)/2),
            startY = yTopLeft + Math.ceil((yBottomRight - yTopLeft)/2),
            endX = Math.ceil(xBottomRight + this.QRCodeProps.averagePixelSize*3.5),
            endY = Math.ceil(yBottomRight + this.QRCodeProps.averagePixelSize*3.5);
        //console.log(startX, startY, endX, endY);
        const centers = this.searchForAlignmentPatternsInArea(startX, startY, endX, endY);
        if (centers !== 1) {
            //console.log("ERROR");
        } else {
            //console.log(this.alignmentModuleCenters[0].point.x, this.alignmentModuleCenters[0].point.y);
        }
    }

    findAlignmentMarkerCenter(currentRow, currentColumn, stateCount, moduleSizeInPixels) {
        const moduleEnd = stateCount[2] + stateCount[1];
        const columnCenter = currentColumn - moduleEnd + Math.ceil(stateCount[1] / 2);
        //console.log(currentRow, currentColumn);
        //console.log(currentRow, columnCenter);
        const rowCenter = this.checkVerticalAlignmentMarker(currentRow, columnCenter);
        //console.log(rowCenter);
        if (rowCenter === detectorProperties.errorPoint) return;
        const columnCenterNew = this.checkHorizontalAlignmentMarker(rowCenter, columnCenter);
        //console.log(columnCenterNew);
        if (columnCenterNew === detectorProperties.errorPoint) return;
        const checkDiagonalRatio = this.checkDiagonalAlignmentMarker(rowCenter, columnCenterNew);
        //console.log(checkDiagonalRatio);
        if (checkDiagonalRatio) {
            //console.log("TRUE", columnCenterNew, rowCenter);
            // this.setPixel(rowCenter, columnCenterNew, 126);
            const point = new cv.Point(columnCenterNew, rowCenter);
            const lineInPixels = Math.round(moduleSizeInPixels / detectorProperties.moduleSizeFinder);
            this.checkExistingAlignmentModuleCenter(point, lineInPixels);
        }
    }

    findAlignmentMarkers(centers) {
        let xBottomRight, yBottomRight;
        xBottomRight = (centers[2] - centers[0]) + centers[4] ;
        yBottomRight = (centers[3] - centers[1]) + centers[5] ;
        //console.log(xBottomRight,yBottomRight);
        let markersNumber = 0;
        if (this.QRCodeProps.version === 1) {
            centers.push(xBottomRight, yBottomRight)
            return;
        }
        markersNumber = Math.pow(Math.trunc(this.QRCodeProps.version / 7) + 2, 2) - 3;
        this.QRCodeProps.setAlignmentMarkersNumber(markersNumber);
        this.findBottomRightAlignmentMarker(centers[0], centers[1], xBottomRight, yBottomRight);
        const newPoint = this.calculateProjection(centers[0], centers[1], xBottomRight, yBottomRight, this.alignmentModuleCenters[0].point.x, this.alignmentModuleCenters[0].point.y);
        centers.push(newPoint.x, newPoint.y);
        if (markersNumber === 6) {
            //this.findAlignmentMarkers5();
        }
    }

    makeTransform(centers) {
        const shift = QRPicProps.halfFindMarker;
        const newPoints = cv.matFromArray(4, 1, cv.CV_32FC2, 
            [shift, shift, QRPicProps.resize*this.QRCodeProps.dimension - shift, shift,
                shift, QRPicProps.resize*this.QRCodeProps.dimension - shift, QRPicProps.resize*this.QRCodeProps.dimension - shift, QRPicProps.resize*this.QRCodeProps.dimension - shift ]);
        const transform = cv.getPerspectiveTransform(cv.matFromArray(4, 1, cv.CV_32FC2, centers), newPoints);
        this.QRimage = new cv.Mat();
        const newimage = new cv.Mat();
        cv.warpPerspective(this.image, this.QRimage, transform, new cv.Size(this.QRCodeProps.dimension*QRPicProps.resize, this.QRCodeProps.dimension*QRPicProps.resize), cv.INTER_CUBIC);
        cv.pyrDown(this.QRimage, newimage, new cv.Size(0, 0), cv.BORDER_DEFAULT);

        this.QRCodeProps.setAveragePixelSize(newimage.cols/this.QRCodeProps.dimension);
        //console.log(this.QRCodeProps.averagePixelSize);
        //
        // const newPoints_2= cv.matFromArray(4, 1, cv.CV_32FC2,
        //     [0, 0, this.QRCodeProps.dimension, 0, 0, this.QRCodeProps.dimension, this.QRCodeProps.dimension, this.QRCodeProps.dimension ]);
        // const oldPoints = cv.matFromArray(4, 1, cv.CV_32FC2,
        //     [0, 0, newimage.cols, 0, 0, newimage.rows, newimage.cols, newimage.rows]);
        // const transform_2 = cv.getPerspectiveTransform(oldPoints, newPoints_2);
        // const newimage_1 = new cv.Mat();
        // cv.warpPerspective(newimage, newimage_1, transform_2, new cv.Size(this.QRCodeProps.dimension, this.QRCodeProps.dimension), cv.INTER_CUBIC);
        this.image = newimage;
    }

    calculateDimension() {
        //Math.sqrt(Math.pow(this.moduleCenters[i].point.x - point.x, 2) + Math.pow(this.moduleCenters[i].point.y - point.y, 2);
        let xBottomLeft=this.imageCols-1, yBottomLeft=0;
        for (let i=0; i<3; i++) {
            if (this.moduleCenters[i].point.y > yBottomLeft) { //finding the lowest point
                xBottomLeft = this.moduleCenters[i].point.x;
                yBottomLeft = this.moduleCenters[i].point.y;
            }
        }
        let xTopRight=0, yTopRight=0;
        for (let i=0; i<3; i++) {
            if (this.moduleCenters[i].point.x > xTopRight && this.moduleCenters[i].point.y !== yBottomLeft) { //finding the highest point
                xTopRight = this.moduleCenters[i].point.x;
                yTopRight = this.moduleCenters[i].point.y;
            }
        }


        let xTopLeft=0, yTopLeft=0;
        for (let i=0; i<3; i++) { //finding the remained point
            if (this.moduleCenters[i].point.x === xTopRight && this.moduleCenters[i].point.y === yTopRight) continue;
            if (this.moduleCenters[i].point.x === xBottomLeft && this.moduleCenters[i].point.y === yBottomLeft) continue;
            xTopLeft = this.moduleCenters[i].point.x;
            yTopLeft = this.moduleCenters[i].point.y;
        }
        //console.log(xBottomLeft, yBottomLeft, xTopLeft, yTopLeft, xTopRight, yTopRight);
        const topDistance = Math.round(Math.sqrt(Math.pow(xTopRight - xTopLeft, 2) + Math.pow(yTopRight - yTopLeft, 2)));
        const leftDistance = Math.round(Math.sqrt(Math.pow(xBottomLeft - xTopLeft, 2) + Math.pow(yBottomLeft - yTopLeft, 2)));

        let sumModuleSize = 0;
        for (let i=0; i<3; i++) {
            sumModuleSize += this.moduleCenters[i].moduleSize;
        }

        const averageModuleSize =  Math.round(sumModuleSize/3);
        const averageDistance = Math.round((topDistance + leftDistance)/2);
        let dimension = Math.round(averageDistance/averageModuleSize) + 7;
        dimension = this.checkDimension(dimension);
        const version = (dimension - 17) / 4;

        this.QRCodeProps = new QRCodeProps(dimension, version, averageModuleSize);
        //console.log(topDistance, leftDistance, averageModuleSize, dimension, version);

        return [xTopLeft, yTopLeft, xTopRight, yTopRight, xBottomLeft, yBottomLeft,];

    }

    checkDimension(dimension) {
        if (dimension % 4 === 0) {
            dimension++;
        }
        if (dimension % 4 === 2) {
            dimension--;
        }
        if (dimension % 4 === 3) {
            dimension-=2;
        }
        return dimension;
    }

    searchForAlignmentPatternsInArea(startX, startY, endX, endY) {
        let stateCount = [0, 0, 0];
        let currentState = 0;

        for (let i = startY ; i < endY; i += detectorProperties.rowsSkipped) {
            stateCount = [0, 0, 0];
            currentState = 0;

            for (let j = startX; j < endX; j++) {

                let ptr = this.getPixel(i, j);
                if (ptr !== 0) { //then we are in white pixel

                    if (currentState % 2 !== 0) { //then we were in black pixel
                        currentState++;
                    }
                    stateCount[currentState]++;
                } else { //then we are in black pixel

                    if (currentState % 2 !== 0) { //then we were in black pixel
                        stateCount[currentState]++;
                    } else { //then we were in white pixel
                        if (currentState === 2) {
                            const moduleSizeInPixels = this.calculateModuleSizeInPixels(stateCount);
                            if (this.checkingRatioAlignmentMarker(stateCount, moduleSizeInPixels)) {
                                this.findAlignmentMarkerCenter(i, j, stateCount, moduleSizeInPixels);
                                currentState = 1;
                                stateCount = [stateCount[2], 1, 0];
                            } else {
                                currentState = 1;
                                stateCount = [stateCount[2], 1, 0];
                            }
                        } else {
                            currentState++;
                            stateCount[currentState]++;
                        }
                    }
                }
            }
        }
        //console.log(this.alignmentModuleCenters);
        return this.alignmentModuleCenters.length ;
    }



    searchForFinderPatterns() {
        let stateCount = [0, 0, 0, 0, 0];
        let currentState = 0;

        for (let i = detectorProperties.rowsSkipped - 1; i < this.imageRows; i += detectorProperties.rowsSkipped) {
            stateCount = [0, 0, 0, 0, 0];
            currentState = 0;

            for (let j = 0; j < this.imageCols; j++) {

                let ptr = this.getPixel(i, j);
                if (ptr === 0) { //then we are in black pixel

                    if (currentState % 2 === 1) { //then we were in white pixel
                        currentState++;
                    }
                    stateCount[currentState]++;
                } else { //then we are in white pixel

                    if (currentState % 2 === 1) { //then we were in white pixel
                        stateCount[currentState]++;
                    } else { //then we were in black pixel
                        if (currentState === 4) {
                            const moduleSizeInPixels = this.calculateModuleSizeInPixels(stateCount);
                            if (this.checkingRatio(stateCount, moduleSizeInPixels)) {
                                this.findModuleCenter(i, j, stateCount, moduleSizeInPixels);
                                currentState = 3;
                                stateCount = [stateCount[2], stateCount[3], stateCount[4], 1, 0];
                            } else {
                                currentState = 3;
                                stateCount = [stateCount[2], stateCount[3], stateCount[4], 1, 0];
                            }
                        } else {
                            currentState++;
                            stateCount[currentState]++;
                        }
                    }
                }
            }
        }
        console.log(this.moduleCenters);
        return (this.moduleCenters.length === 3);
    }

    findModuleCenter(currentRow, currentColumn, stateCount, moduleSizeInPixels) {
        const moduleEnd = stateCount[4] + stateCount[3] + stateCount[2];
        const columnCenter = currentColumn - moduleEnd + Math.ceil(stateCount[2] / 2);
        ////console.log(currentRow, columnCenter);
        const rowCenter = this.checkVertical(currentRow, columnCenter);
        if (rowCenter === detectorProperties.errorPoint) return;
        ////console.log(rowCenter);
        const columnCenterNew = this.checkHorizontal(rowCenter, columnCenter);
        ////console.log(columnCenterNew);
        if (columnCenterNew === detectorProperties.errorPoint) return;
        const checkDiagonalRatio = this.checkDiagonal(rowCenter, columnCenterNew);
        ////console.log(checkDiagonalRatio);
        if (checkDiagonalRatio) {
            //this.setPixel(rowCenter, columnCenterNew, 126);
            const point = new cv.Point(columnCenterNew, rowCenter);
            const lineInPixels = Math.round(moduleSizeInPixels / detectorProperties.moduleSizeFinder);
            this.checkExistingModuleCenter(point, lineInPixels);
        }
    }

    checkExistingModuleCenter(point, lineInPixels) {
        ////console.log(point);
        for (let i=0; i < this.moduleCenters.length; i++) {
           if (Math.sqrt(Math.pow(this.moduleCenters[i].point.x - point.x, 2) + Math.pow(this.moduleCenters[i].point.y - point.y, 2))
               < detectorProperties.centersDistance ) return;
        }
        this.moduleCenters.push(new ModuleCenter(point, lineInPixels));
    }

    checkExistingAlignmentModuleCenter(point, lineInPixels) {
        for (let i=0; i < this.alignmentModuleCenters.length; i++) {
            if (Math.sqrt(Math.pow(this.alignmentModuleCenters[i].point.x - point.x, 2) + Math.pow(this.alignmentModuleCenters[i].point.y - point.y, 2))
                < detectorProperties.centersDistance ) return;
        }
        this.alignmentModuleCenters.push(new ModuleCenter(point, lineInPixels));
    }


    traverseVertical(currentRow, currentColumn, stateCountVertical) {
        let row;
        for (row = currentRow; row >= 0 && this.getPixel(row, currentColumn) === 0; row--) {
            stateCountVertical[2]++;
        }

        if (row < 0) {
            return detectorProperties.errorPoint;
        }
        for (; row >= 0 && this.getPixel(row, currentColumn) !== 0; row--) {
            stateCountVertical[1]++;
        }

        if (row < 0) {
            return detectorProperties.errorPoint;
        }
        for (; row >= 0 && this.getPixel(row, currentColumn) === 0; row--) {
            stateCountVertical[0]++;
        }

        for (row = currentRow + 1; row < this.imageRows && this.getPixel(row, currentColumn) === 0; row++) {
            stateCountVertical[2]++;
        }

        if (row === this.imageRows) {
            return detectorProperties.errorPoint;
        }
        for (; row < this.imageRows && this.getPixel(row, currentColumn) !== 0; row++) {
            stateCountVertical[3]++;
        }

        if (row === this.imageRows) {
            return detectorProperties.errorPoint;
        }
        for (; row < this.imageRows && this.getPixel(row, currentColumn) === 0; row++) {
            stateCountVertical[4]++;
        }

        return row;
    }

    checkVertical(currentRow, currentColumn) {
        const stateCountVertical = [0, 0, 0, 0, 0];
        const row = this.traverseVertical(currentRow, currentColumn, stateCountVertical);
        ////console.log(stateCountVertical);
        const moduleSizeInPixelsVertical = this.calculateModuleSizeInPixels(stateCountVertical);
        if (this.checkingRatio(stateCountVertical, moduleSizeInPixelsVertical)) {
            const moduleEnd = stateCountVertical[4] + stateCountVertical[3] + stateCountVertical[2];
            return (row - moduleEnd + Math.ceil(stateCountVertical[2] / 2));
        }
        return detectorProperties.errorPoint;
    }

    traverseVerticalAlignment(currentRow, currentColumn, stateCountVertical) {
        let row;
        for (row = currentRow; row >= 0 && this.getPixel(row, currentColumn) === 0; row--) {
            stateCountVertical[1]++;
        }

        if (row < 0) {
            return detectorProperties.errorPoint;
        }
        for (; row >= 0 && this.getPixel(row, currentColumn) !== 0; row--) {
            stateCountVertical[0]++;
        }

        if (row < 0) {
            return detectorProperties.errorPoint;
        }

        for (row = currentRow + 1; row < this.imageRows && this.getPixel(row, currentColumn) === 0; row++) {
            stateCountVertical[1]++;
        }

        if (row === this.imageRows) {
            return detectorProperties.errorPoint;
        }
        for (; row < this.imageRows && this.getPixel(row, currentColumn) !== 0; row++) {
            stateCountVertical[2]++;
        }

        if (row === this.imageRows) {
            return detectorProperties.errorPoint;
        }
        return row;
    }

    checkVerticalAlignmentMarker(currentRow, currentColumn) {
        const stateCountVertical = [0, 0, 0];
        const row = this.traverseVerticalAlignment(currentRow, currentColumn, stateCountVertical);
        const moduleSizeInPixelsVertical = this.calculateModuleSizeInPixels(stateCountVertical);
        ////console.log(stateCountVertical, moduleSizeInPixelsVertical);
        if (this.checkingRatioAlignmentMarker(stateCountVertical, moduleSizeInPixelsVertical)) {
            const moduleEnd = stateCountVertical[2] + stateCountVertical[1];
            return (row - moduleEnd + Math.trunc(stateCountVertical[1] / 2));
        }

        return detectorProperties.errorPoint;
    }

    traverseHorizontal(currentRow, currentColumn, stateCountHorizontal) {
        let column;
        for (column = currentColumn; column >= 0 && this.getPixel(currentRow, column) === 0; column--) {
            stateCountHorizontal[2]++;
        }

        if (column < 0) {
            return detectorProperties.errorPoint;
        }
        for (; column >= 0 && this.getPixel(currentRow, column) !== 0; column--) {
            stateCountHorizontal[1]++;
        }

        if (column < 0) {
            return detectorProperties.errorPoint;
        }
        for (; column >= 0 && this.getPixel(currentRow, column) === 0; column--) {
            stateCountHorizontal[0]++;
        }

        for (column = currentColumn + 1; column < this.imageCols && this.getPixel(currentRow, column) === 0; column++) {
            stateCountHorizontal[2]++;
        }

        if (column === this.imageCols) {
            return detectorProperties.errorPoint;
        }
        for (; column < this.imageCols && this.getPixel(currentRow, column) !== 0; column++) {
            stateCountHorizontal[3]++;
        }

        if (column === this.imageCols) {
            return detectorProperties.errorPoint;
        }
        for (; column < this.imageCols && this.getPixel(currentRow, column) === 0; column++) {
            stateCountHorizontal[4]++;
        }
        return column;
    }

    checkHorizontal(currentRow, currentColumn) {
        const stateCountHorizontal = [0, 0, 0, 0, 0];
        const column = this.traverseHorizontal(currentRow, currentColumn, stateCountHorizontal);
        ////console.log(stateCountHorizontal);
        const moduleSizeInPixelsHorizontal = this.calculateModuleSizeInPixels(stateCountHorizontal);
        if (this.checkingRatio(stateCountHorizontal, moduleSizeInPixelsHorizontal)) {
            const moduleEnd = stateCountHorizontal[4] + stateCountHorizontal[3] + stateCountHorizontal[2];
            return (column - moduleEnd + Math.ceil(stateCountHorizontal[2] / 2));
        }
        return detectorProperties.errorPoint;
    }

    traverseHorizontalAlignment(currentRow, currentColumn, stateCountHorizontal) {
        let column;
        for (column = currentColumn; column >= 0 && this.getPixel(currentRow, column) === 0; column--) {
            stateCountHorizontal[1]++;
        }

        if (column < 0) {
            return detectorProperties.errorPoint;
        }
        for (; column >= 0 && this.getPixel(currentRow, column) !== 0; column--) {
            stateCountHorizontal[0]++;
        }

        if (column < 0) {
            return detectorProperties.errorPoint;
        }

        for (column = currentColumn + 1; column < this.imageCols && this.getPixel(currentRow, column) === 0; column++) {
            stateCountHorizontal[1]++;
        }

        if (column === this.imageCols) {
            return detectorProperties.errorPoint;
        }
        for (; column < this.imageCols && this.getPixel(currentRow, column) !== 0; column++) {
            stateCountHorizontal[2]++;
        }

        if (column === this.imageCols) {
            return detectorProperties.errorPoint;
        }
        return column;
    }

    checkHorizontalAlignmentMarker(currentRow, currentColumn) {
        const stateCountHorizontal = [0, 0, 0];
        const column = this.traverseHorizontalAlignment(currentRow, currentColumn, stateCountHorizontal);

        const moduleSizeInPixelsHorizontal = this.calculateModuleSizeInPixels(stateCountHorizontal);
        if (this.checkingRatioAlignmentMarker(stateCountHorizontal, moduleSizeInPixelsHorizontal)) {
            const moduleEnd = stateCountHorizontal[2] + stateCountHorizontal[1];
            return (column - moduleEnd + Math.trunc(stateCountHorizontal[1] / 2));
        }
        return detectorProperties.errorPoint;
    }

    traverseDiagonal(currentRow, currentColumn, stateCountDiagonal) {
        let column;
        let row;
        for (column = currentColumn, row = currentRow; column >= 0 && row >= 0 && this.getPixel(row, column) === 0; column--, row--) {
            stateCountDiagonal[2]++;
        }

        if (column < 0 || row < 0) {
            return false;
        }
        for (; column >= 0 && row >= 0 && this.getPixel(row, column) !== 0; column--, row--) {
            stateCountDiagonal[1]++;
        }

        if (column < 0 || row < 0) {
            return false;
        }
        for (; column >= 0 && row >= 0 && this.getPixel(row, column) === 0; column--, row--) {
            stateCountDiagonal[0]++;
        }

        for (column = currentColumn + 1, row = currentRow + 1; column < this.imageCols && row < this.imageRows && this.getPixel(row, column) === 0; column++, row++) {
            stateCountDiagonal[2]++;
        }

        if (column === this.imageCols || row === this.imageRows) {
            return false;
        }
        for (; column < this.imageCols && row < this.imageRows && this.getPixel(row, column) !== 0; column++, row++) {
            stateCountDiagonal[3]++;
        }

        if (column === this.imageCols || row === this.imageRows) {
            return false;
        }
        for (; column < this.imageCols && row < this.imageRows && this.getPixel(row, column) === 0; column++, row++) {
            stateCountDiagonal[4]++;
        }
    }

    traverseDiagonalAlignment(currentRow, currentColumn, stateCountDiagonal) {
        let column;
        let row;
        for (column = currentColumn, row = currentRow; column >= 0 && row >= 0 && this.getPixel(row, column) === 0; column--, row--) {
            stateCountDiagonal[1]++;
        }

        if (column < 0 || row < 0) {
            return false;
        }
        for (; column >= 0 && row >= 0 && this.getPixel(row, column) !== 0; column--, row--) {
            stateCountDiagonal[0]++;
        }

        if (column < 0 || row < 0) {
            return false;
        }

        for (column = currentColumn + 1, row = currentRow + 1; column < this.imageCols && row < this.imageRows && this.getPixel(row, column) === 0; column++, row++) {
            stateCountDiagonal[1]++;
        }

        if (column === this.imageCols || row === this.imageRows) {
            return false;
        }
        for (; column < this.imageCols && row < this.imageRows && this.getPixel(row, column) !== 0; column++, row++) {
            stateCountDiagonal[2]++;
        }

        if (column === this.imageCols || row === this.imageRows) {
            return false;
        }
    }

    checkDiagonal(currentRow, currentColumn) {
        const stateCountDiagonal = [0, 0, 0, 0, 0];
        this.traverseDiagonal(currentRow, currentColumn, stateCountDiagonal);
        ////console.log(stateCountDiagonal);
        const moduleSizeInPixelsDiagonal = this.calculateModuleSizeInPixels(stateCountDiagonal);
        return this.checkingRatio(stateCountDiagonal, moduleSizeInPixelsDiagonal)
    }

    checkDiagonalAlignmentMarker(currentRow, currentColumn) {
        const stateCountDiagonal = [0, 0, 0, ];
        this.traverseDiagonalAlignment(currentRow, currentColumn, stateCountDiagonal);
        const moduleSizeInPixelsDiagonal = this.calculateModuleSizeInPixels(stateCountDiagonal);
        return this.checkingRatioAlignmentMarker(stateCountDiagonal, moduleSizeInPixelsDiagonal)
    }

    calculateModuleSizeInPixels(stateCount) {
       let moduleSizeInPixels = 0;
        for (let i=0; i< stateCount.length; i++) {
            moduleSizeInPixels += stateCount[i];
        }
        return moduleSizeInPixels;
    }

    checkingRatioAlignmentMarker(stateCount, moduleSizeInPixels) {
        if (moduleSizeInPixels < detectorProperties.moduleSizeAlignment) {
            return false;
        }
        const lineInPixels = Math.ceil(moduleSizeInPixels / detectorProperties.moduleSizeAlignment);
        const variance = Math.ceil(detectorProperties.takeVariance(lineInPixels));
        let checkVariance = [false, false, false];
        for (let i=0; i<detectorProperties.statesSizeAlignment; i++) {
                checkVariance[i] = Math.abs(lineInPixels - stateCount[i]) < variance;
        }
        for (let i=0; i<detectorProperties.statesSizeAlignment; i++) {
            if (!checkVariance[i]) return false;
        }
        return true;
    }

    checkingRatio(stateCount, moduleSizeInPixels) {
        if (moduleSizeInPixels < detectorProperties.moduleSizeFinder) {
            return false;
        }
        const lineInPixels = Math.ceil(moduleSizeInPixels / detectorProperties.moduleSizeFinder);
        const variance = Math.ceil(detectorProperties.takeVariance(lineInPixels));
        let checkVariance = [false, false, false, false, false];
        for (let i=0; i<detectorProperties.statesSizeFinder; i++) {
            if (i===2) {
                checkVariance[i] = Math.abs(3*lineInPixels - stateCount[i]) < 3*variance;
            } else {
                checkVariance[i] = Math.abs(lineInPixels - stateCount[i]) < variance;
            }
            // //console.log(variance);
            // //console.log(lineInPixels);
            // //console.log(i, stateCount[i]);
        }
        for (let i=0; i<detectorProperties.statesSizeFinder; i++) {
            if (!checkVariance[i]) return false;
        }
        return true;
    }

    calculateProjection(lineX1, lineY1, lineX2, lineY2, pointX, pointY) {
        const m = lineX2 - lineX1;
        const p = lineY2 - lineY1;
        const t = Math.round((m*pointX + p*pointY - m*lineX1 - p*lineY1) / (Math.pow(m, 2) + Math.pow(p, 2)));
        const projectionX = m*t + lineX1;
        const projectionY = p*t + lineY1;
        //console.log(projectionX, projectionY);
        return new cv.Point(projectionX, projectionY);
    }
}

export default QRDetector;