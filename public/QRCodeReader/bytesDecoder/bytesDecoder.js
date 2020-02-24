import {charCount, modes} from "./utils";

class BytesDecoder {
    bytesBlocks;

    constructor(bytesBlocks) {
        this.bytesBlocks = bytesBlocks;
    }
    decode() {
        this.bytesBlocks.forEach((block) => {
            this.decodeBlock(block);
        })
    }

    decodeBlock(block) {
        const dataBytesInt = block.getDataBytes();
        const firstByteInt = dataBytesInt[0];
        const firstByteByte = Number(firstByteInt).toString(2);
        let current = firstByteByte.substring(0, firstByteByte.length - 4);
        const blockMode = modes[current];
        const blockCharCount = charCount[current];
        let blockCharCountNumber = firstByteByte.substring(firstByteByte.length - 4, firstByteByte.length);
        const secondByteInt = dataBytesInt[1];
        const secondByteByte = Number(secondByteInt).toString(2);
        current = firstByteByte.substring(0, firstByteByte.length - (blockCharCount-4));
        //blockCharCountNumber += current;


    }
}


export default BytesDecoder;