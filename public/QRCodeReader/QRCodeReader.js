import QRDetector from "./detector/detector";
import BitsExtractor from "./bitsExtractor/bitsExtractor";
import BitsHolder from "./bitsExtractor/bitsHolder";
import FormatInformationDecoder from "./formatInformationDecoder/formatInformationDecoder";
import {formatInformationConstants} from "./formatInformationDecoder/utils";
import BytesBlockReorganizer from "./bytesReorganizer/bytesReorganizer";
import PolynomsUtils from "./polynoms/polynomsUtils";
import Polynom from "./polynoms/polynom";
import BytesDecoder from "./bytesDecoder/bytesDecoder";

class QRCodeReader {
    QRCodeProps;
    bitsHolder;
    originalImage;
    processedImage;
    formatInformationDecoder;
    formatInfo;
    dataBlocks;
    result;

    constructor () {

    }

    read(image) {
        this.originalImage = image;
        this.detect();
        if (this.processedImage === undefined) {
            console.log("ERROR FINDING CODE");
            return undefined;
        }
        this.extract();
        //console.log(this.bitsHolder.getFormatInformationBits1());
        //console.log(this.bitsHolder.getFormatInformationBits2());
        this.readFormatInformation();
        if (this.formatInfo === formatInformationConstants.errorNumber) {
            console.log("FORMAT DATA CAN'T BE READ");
            return undefined;
        }
        //console.log(this.formatInfo);
        this.bitsHolder.unmaskData(this.formatInfo.getMaskingFunction());
        this.result = this.readDataBlocks();
        //console.log(this.result);
        return this.result;
        // const polynomeUtils = new PolynomsUtils();
        // polynomeUtils.dividePolynoms(new Polynom([4, 2, 1, 0, 0]), new Polynom( [1, 2, 2]));
        // console.log(polynomeUtils.multiplyPolynoms(new Polynom( [102, 97]), new Polynom([88, 70, 81])));
        // console.log(polynomeUtils.addPolynoms(new Polynom([4, 2, 1, 46, 58]), new Polynom([46, 58])));
    }

    extract() {
        this.bitsHolder = new BitsHolder(this.QRCodeProps);
        this.bitsExtractor = new BitsExtractor(this.processedImage, this.QRCodeProps, this.bitsHolder.getMatrix());
        this.bitsHolder.setMatrix(this.bitsExtractor.extract());
    }

    detect(){
        const detector = new QRDetector();
        this.processedImage = detector.detect(this.originalImage);
        this.QRCodeProps = detector.getQRCodeProps();
    }

    getProcessedImage() {
        return this.processedImage;
    }

    readFormatInformation() {
        this.formatInformationDecoder = new FormatInformationDecoder();
        this.formatInformationDecoder.setFormatInformation1(this.bitsHolder.getFormatInformationBits1());
        this.formatInformationDecoder.setFormatInformation2(this.bitsHolder.getFormatInformationBits2());
        this.bitsHolder.fillFormatInformationBits();
        this.formatInfo = this.formatInformationDecoder.decode();
    }

    readDataBlocks() {
        const bytesBlockReorganizer = new BytesBlockReorganizer(this.QRCodeProps.version, this.formatInfo.getErrorCorrectionLevel(), this.bitsHolder.getMatrix());
        this.dataBlocks = bytesBlockReorganizer.getDataBlocks();
        const bytesDecoder = new BytesDecoder(this.dataBlocks);
        return bytesDecoder.decode();

    }
}

export default QRCodeReader;