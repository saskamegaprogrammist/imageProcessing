class GalousField {
    size = 256;
    xorNumber = 285;
    primitivePowers = new Array(256);
    primitivePowersInverted = new Array(256);

    constructor() {
        this.generatePrimitivePowers();
    }

    generatePrimitivePowers() {
        this.primitivePowers[0] = 1;
        this.primitivePowersInverted[1] = 0;
        this.primitivePowers[1] = 2;
        this.primitivePowersInverted[2] = 1;
        for (let i=2; i < this.size-1; i++) {
            let result = this.primitivePowers[i-1]*2;
            if (result >= this.size) {
                result ^= this.xorNumber;
            }
            this.primitivePowers[i] = result;
            this.primitivePowersInverted[result] = i;
        }
        this.primitivePowers[255] = 0;
        this.primitivePowersInverted[0] = 255;
    }

    multiply(number1, number2) {
        console.log(number1, number2, this.primitivePowersInverted[number1], this.primitivePowersInverted[number2]);
        const res = this.primitivePowers[(this.primitivePowersInverted[number1] + this.primitivePowersInverted[number2])%(this.size-1)];
        console.log(res);
        return res;
    }

    add(number1, number2) {
        return number1 ^ number2;
    }

    getValByDegree(degree) {
        degree = degree % (this.size-1);
        return this.primitivePowers[degree];
    }

    getPowerByVal(value) {
        return this.primitivePowersInverted[value];
    }

}

export default GalousField;