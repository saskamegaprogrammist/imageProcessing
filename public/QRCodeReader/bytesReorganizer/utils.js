import BytesBlockData from "./bytesBlockData";
import ErrorCorrectionData from "../errorCorrection/errorCorrectionData";

const bytesBlockInformation = [
    //version 1
    new BytesBlockData(1, "L", 26, 7,
    [new ErrorCorrectionData(1, 26, 19, 3)]),

    new BytesBlockData(1, "M", 26, 10,
        [new ErrorCorrectionData(1, 26, 16, 2)]),

    new BytesBlockData(1, "Q", 26, 13,
        [new ErrorCorrectionData(1, 26, 13, 1)]),

    new BytesBlockData(1, "H", 26, 17,
        [new ErrorCorrectionData(1, 26, 9, 1)]),

    //version 2
    new BytesBlockData(2, "L", 44, 10,
        [new ErrorCorrectionData(1, 44, 34, 2)]),

    new BytesBlockData(2, "M", 44, 16,
        [new ErrorCorrectionData(1, 44, 28)]),

    new BytesBlockData(2, "Q", 44, 22,
        [new ErrorCorrectionData(1, 44, 22)]),

    new BytesBlockData(2, "H", 44, 28,
        [new ErrorCorrectionData(1, 44, 16)]),

    //version 3
    new BytesBlockData(3, "L", 70, 15,
        [new ErrorCorrectionData(1, 70, 55, 1)]),

    new BytesBlockData(3, "M", 70, 26,
        [new ErrorCorrectionData(1, 70, 44)]),

    new BytesBlockData(3, "Q", 70, 36,
        [new ErrorCorrectionData(2, 35, 17)]),

    new BytesBlockData(3, "H", 70, 44,
        [new ErrorCorrectionData(2, 35, 13)]),

    //version 4
    new BytesBlockData(4, "L", 100, 20,
        [new ErrorCorrectionData(1, 100, 80)]),

    new BytesBlockData(4, "M", 100, 36,
        [new ErrorCorrectionData(2, 50, 32)]),

    new BytesBlockData(4, "Q", 100, 52,
        [new ErrorCorrectionData(2, 50, 24)]),

    new BytesBlockData(4, "H", 100, 64,
        [new ErrorCorrectionData(4, 25, 9)]),

    //version 5
    new BytesBlockData(5, "L", 134, 26,
        [new ErrorCorrectionData(1, 134, 108)]),

    new BytesBlockData(5, "M", 134, 48,
        [new ErrorCorrectionData(2, 67, 43)]),

    new BytesBlockData(5, "Q", 134, 72,
        [new ErrorCorrectionData(2, 33, 15),
                            new ErrorCorrectionData(2, 34, 16)]),

    new BytesBlockData(5, "H", 134, 88,
        [new ErrorCorrectionData(2, 33, 11),
            new ErrorCorrectionData(2, 34, 12)]),

    //version 6
    new BytesBlockData(6, "L", 172, 36,
        [new ErrorCorrectionData(2, 86, 68)]),

    new BytesBlockData(6, "M", 172, 64,
        [new ErrorCorrectionData(4, 43, 27)]),

    new BytesBlockData(6, "Q", 172, 96,
        [new ErrorCorrectionData(4, 43, 19)]),

    new BytesBlockData(6, "H", 172, 112,
        [new ErrorCorrectionData(4, 43, 15)]),

    //version 7
    new BytesBlockData(7, "L", 196, 40,
        [new ErrorCorrectionData(2, 98, 78)]),

    new BytesBlockData(7, "M", 196, 72,
        [new ErrorCorrectionData(4, 49, 31)]),

    new BytesBlockData(7, "Q", 196, 108,
        [new ErrorCorrectionData(2, 32, 14),
            new ErrorCorrectionData(4, 33, 15)]),

    new BytesBlockData(7, "H", 196, 130,
        [new ErrorCorrectionData(4, 39, 13),
            new ErrorCorrectionData(1, 40, 14)]),

];

export {bytesBlockInformation};