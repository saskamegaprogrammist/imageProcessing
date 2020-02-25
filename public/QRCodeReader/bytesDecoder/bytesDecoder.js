import {charCount, modes} from "./utils";
import {byteLength} from "../constants/constants";

class BytesDecoder {
    bytesBlocks;
    message = [];

    constructor(bytesBlocks) {
        this.bytesBlocks = bytesBlocks;
    }
    decode() {
        this.bytesBlocks.forEach((block) => {
            this.message.push(this.decodeBlock(block));
        });
        return this.message;
    }

    addZeros(string) {
        let bound = byteLength - string.length;
        for (let i=0; i<bound; i++) {
            string = "0" + string;
        }
        return string;
    }

    decodeBlock(block) {
        const dataBytesInt = block.getDataBytes();
        const firstByteInt = dataBytesInt[0];
        const firstByteByte = this.addZeros(Number(firstByteInt).toString(2));
        let current = firstByteByte.substring(0,  4);
        const blockMode = modes[current];
        const blockCharCount = charCount[current];
        let blockCharCountNumber = firstByteByte.substring(4, byteLength);
        const secondByteInt = dataBytesInt[1];
        const secondByteByte = this.addZeros(Number(secondByteInt).toString(2));
        current = secondByteByte.substring(0, blockCharCount-4);
        blockCharCountNumber += current;
        const blockCharCountNumnberInt =  parseInt(blockCharCountNumber, 2).toString()
        const remainderBits = secondByteByte.substring(blockCharCount-4, byteLength);

        switch (blockMode) {
            case "NUM":
                return this.decodeNumberBlock(blockCharCountNumnberInt, remainderBits, dataBytesInt);
            case "ALPHANUM":
                //return this.decodeAlphaNumberBlock(blockCharCountNumnberInt, remainderBits, dataBytesInt);
            case "BYTE":
                return this.decodeAsciiBlock(blockCharCountNumnberInt, remainderBits, dataBytesInt);
        }
    }
    decodeNumberBlock(amountOfData, remainderBits, dataBytesInt) {
        let message;
        let restBits = amountOfData%3;
        switch (restBits) {
            case 0:
                break;
            case 1:
                restBits = 4;
                break;
            case 2:
                restBits = 7;
                break;
        }
        const normalBytes = Math.trunc(amountOfData/3);
        let counter = 2;
        for (let i=0; i<normalBytes; i++) {
            let currentByte = "";
            for (let j=0; j<10; ) {
                currentByte += remainderBits;
                j+=remainderBits.length;
                if (j===10) break;
                const newByteInt = dataBytesInt[counter];
                counter++;
                const newByteIntByte = this.addZeros(Number(newByteInt).toString(2));
                if ((10-j) >= byteLength) {
                    remainderBits = "";
                    currentByte += newByteIntByte;
                } else {
                    currentByte += newByteIntByte.substring(0, 10-j);
                    remainderBits = newByteIntByte.substring(10-j, byteLength);
                }

            }
            message += parseInt(currentByte, 2).toString();
        }
        if (restBits !== 0) {
            let restByte = "";
            if (remainderBits.length > restBits) {
                restByte = remainderBits.substring(0, restByte);
            } else {
                restByte = remainderBits;
                const newByteIntByte = this.addZeros(Number(dataBytesInt[counter]).toString(2));
                restByte += newByteIntByte.substring(0, restBits - remainderBits.length);
            }
            message += parseInt(restByte, 2).toString();
        }
        return message;
    }

    decodeAsciiBlock(amountOfData, remainderBits, dataBytesInt) {
        let length = dataBytesInt.length;
        let message = "";
        let counter = 2;
        for (let i=0; i<amountOfData; i++) {
            let currentByte = "";
            currentByte += remainderBits;
            if (counter<length) {
                const newByteInt = dataBytesInt[counter];
                counter++;
                const newByteIntByte = this.addZeros(Number(newByteInt).toString(2));
                currentByte += newByteIntByte.substring(0, 4);
                remainderBits = newByteIntByte.substring(4, byteLength);
            }
            const symbol = parseInt(currentByte, 2);
            message += String.fromCharCode(symbol);
        }
        return message;

    }

}


export default BytesDecoder;