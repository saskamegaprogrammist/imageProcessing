import {formatInformationConstants, xor} from "./utils";
import FormatInformationString from "./formatInformationString";
import FormatInformationData from "./formatInformationData";

class FormatInformationDecoder {
    formatInformation1 = [];
    formatInformation2 = [];
    formatInformationStrings = [];
    mask = 101010000010010;

    constructor() {
    }

    setFormatInformation1(formatInformation1) {
        this.formatInformation1 = Number(formatInformation1.join(''));
        //console.log(this.formatInformation1);
    }
    setFormatInformation2(formatInformation2) {
        this.formatInformation2 = Number(formatInformation2.join(''));
    }

    generateAllFormatInformationStrings() {
        for (let i=0; i<32; i++) {
            this.formatInformationStrings.push(new FormatInformationString(parseInt(i.toString(2))));
        }
    }

    checkTrueData(maskedInfo) {
        let foundFlag = false;
        for (let i=0; i<32; i++) {
            if (this.formatInformationStrings[i].compareMaskedStrings(maskedInfo)) {
                foundFlag = true;
                break;
            }
        }
        return foundFlag;
    }

    correctErrors(maskedInfo) {
        let errors = formatInformationConstants.maxErrors+1;
        let correctDataIndex;
        for (let i=0; i<32; i++) {
            let result = this.formatInformationStrings[i].findErrorNumbers(maskedInfo);
            if (result !== formatInformationConstants.errorNumber) {
                if (result < errors) {
                    errors = result;
                    correctDataIndex = i;
                }
            }
        }
        if (errors !== formatInformationConstants.maxErrors+1) return correctDataIndex;
        else return formatInformationConstants.errorNumber;
    }

    decode() {
        this.generateAllFormatInformationStrings();
        if (this.checkTrueData(this.formatInformation1)) {
            return new FormatInformationData(xor(this.mask, this.formatInformation1));
        } else {
            if (this.checkTrueData(this.formatInformation2)) {
                return new FormatInformationData(xor(this.mask, this.formatInformation2));
            } else {
                let result = this.correctErrors(this.formatInformation1);
                if (result !== formatInformationConstants.errorNumber) {
                    return new FormatInformationData(xor(this.mask, this.formatInformationStrings[result].returnMaskedBits()));
                } else {
                    result = this.correctErrors(this.formatInformation2);
                    if (result !== formatInformationConstants.errorNumber) {
                        return new FormatInformationData(xor(this.mask, this.formatInformationStrings[result].returnMaskedBits()));
                    } else {
                        return formatInformationConstants.errorNumber;
                    }
                }
            }
        }


    }
}

export default FormatInformationDecoder;