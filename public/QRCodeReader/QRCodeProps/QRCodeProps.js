class QRCodeProps {
    dimension;
    version;
    averagePixelSize;
    alignmentMarkersNumber;

    constructor (dimension, version, averagePixelSize) {
        this.dimension = dimension;
        this.version = version;
        this.averagePixelSize = averagePixelSize;
    }

    setAveragePixelSize(averagePixelSize) {
        this.averagePixelSize = averagePixelSize;
    }

    setAlignmentMarkersNumber(alignmentMarkersNumber) {
        this.alignmentMarkersNumber = alignmentMarkersNumber;
    }
}

export default QRCodeProps;