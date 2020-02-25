const detectorProperties = {
    statesSizeFinder : 5,
    statesSizeAlignment: 3,
    moduleSizeFinder : 7,
    moduleSizeAlignment : 3,
    errorPoint : -1,
    centersDistance : 10,
    rowsSkipped : 2,
    takeVariance : (moduleSize) => {
        return moduleSize/3;
    }
};

const helperBit = -1;
const byteLength = 8;

const QRPicProps = {
    resize : 10,
    halfFindMarker : 35,
};

export {detectorProperties, QRPicProps, helperBit, byteLength};