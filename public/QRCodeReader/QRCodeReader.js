import QRDetector from "./detector/detector";
import BitsExtractor from "./bitsExtractor/bitsExtractor";
import BitsHolder from "./bitsExtractor/bitsHolder";
import FormatInformationDecoder from "./formatInformationDecoder/formatInformationDecoder";
import {formatInformationConstants} from "./formatInformationDecoder/utils";
import BytesBlockReorganizer from "./bytesReorganizer/bytesReorganizer";

class QRCodeReader {
    QRCodeProps;
    bitsHolder;
    originalImage;
    processedImage;
    formatInformationDecoder;
    formatInfo;

    constructor () {

    }

    read(image) {
        this.originalImage = image;
        this.detect();
        this.extract();
        console.log(this.bitsHolder.getFormatInformationBits1());
        console.log(this.bitsHolder.getFormatInformationBits2());
        this.readFormatInformation();
        if (this.formatInfo === formatInformationConstants.errorNumber) {
            console.log("FORMAT DATA CAN'T BE READ");
            return;
        }
        console.log(this.formatInfo);
        this.bitsHolder.unmaskData(this.formatInfo.getMaskingFunction());
        this.readDataBlocks();
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

    }
}

export default QRCodeReader;