import {charCount, modes} from "./utils";
import {byteLength} from "../constants/constants";

class BytesDecoder {
    bytesBlocks;
    message = [];
    amountOfData = 0;
    remainderBits = "";
    continue = false;
    currentStop = 0;
    currentBlockMode;

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
        if (this.amountOfData === 0) {
            this.continue = false;
            const firstByteInt = dataBytesInt[0];
            const firstByteByte = this.addZeros(Number(firstByteInt).toString(2));
            let current = firstByteByte.substring(0, 4);
            console.log(current);
            this.currentBlockMode = modes[current];
            const blockCharCount = charCount[current];
            let blockCharCountNumber = firstByteByte.substring(4, byteLength);
            const secondByteInt = dataBytesInt[1];
            const secondByteByte = this.addZeros(Number(secondByteInt).toString(2));
            current = secondByteByte.substring(0, blockCharCount - 4);
            blockCharCountNumber += current;
            this.amountOfData = parseInt(blockCharCountNumber, 2).toString();
            this.remainderBits = secondByteByte.substring(blockCharCount - 4, byteLength);
            console.log(this.currentBlockMode);
        } else {
            this.continue = true;
        }

        switch (this.currentBlockMode) {
            case "NUM":
                return this.decodeNumberBlock(dataBytesInt);
            case "ALPHANUM":
                //return this.decodeAlphaNumberBlock(blockCharCountN.umberInt, remainderBits, dataBytesInt);
            case "BYTE":
                return this.decodeAsciiBlock(dataBytesInt);
        }
    }
    decodeNumberBlock(dataBytesInt) {
        let length = dataBytesInt.length;
        let message = "";
        let restBits = this.amountOfData%3;
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
        const normalBytes = Math.trunc(this.amountOfData/3);
        let counter;
        if (this.continue) counter = 0;
        else  counter = 2;
        for (let i=this.currentStop; i<normalBytes; i++) {
            let currentByte = "";
            for (let j=0; j<10; ) {
                currentByte += this.remainderBits;
                j+=this.remainderBits.length;
                if (j===10) break;
                const newByteInt = dataBytesInt[counter];
                counter++;
                const newByteIntByte = this.addZeros(Number(newByteInt).toString(2));
                if ((10-j) >= byteLength) {
                    this.remainderBits = "";
                    currentByte += newByteIntByte;
                    j+=byteLength;
                } else {
                    currentByte += newByteIntByte.substring(0, 10-j);
                    this.remainderBits = newByteIntByte.substring(10-j, byteLength);
                    j=10;
                }
                if (counter >= length) {
                    this.currentStop = i;
                    return message;
                }

            }
            message += parseInt(currentByte, 2).toString();
        }
        if (restBits !== 0) {
            let restByte = "";
            if (this.remainderBits.length > restBits) {
                restByte = this.remainderBits.substring(0, restByte);
                this.remainderBits = this.remainderBits.substring(restByte, this.remainderBits.length);
            } else {
                restByte = this.remainderBits;
                const newByteIntByte = this.addZeros(Number(dataBytesInt[counter]).toString(2));
                restByte += newByteIntByte.substring(0, restBits - this.remainderBits.length);
            }
            message += parseInt(restByte, 2).toString();
        }
        return message;
    }

    decodeAsciiBlock(dataBytesInt) {
        let length = dataBytesInt.length;
        let message = "";
        let counter;
        if (this.continue) counter = 0;
        else  counter = 2;
        for (let i=this.currentStop; i<this.amountOfData; i++) {
            let currentByte = "";
            currentByte += this.remainderBits;
            if (counter<length) {
                const newByteInt = dataBytesInt[counter];
                counter++;
                const newByteIntByte = this.addZeros(Number(newByteInt).toString(2));
                currentByte += newByteIntByte.substring(0, 4);
                this.remainderBits = newByteIntByte.substring(4, byteLength);
                const symbol = parseInt(currentByte, 2);
                console.log(symbol);
                console.log(String.fromCharCode(symbol));
                message += String.fromCharCode(symbol);
            } else {
                this.currentStop = i;
                return message;
            }
        }
        this.amountOfData = 0;
        return message;

    }

}


export default BytesDecoder;