class GalousField {
    size = 256;
    xorNumber = 285;
    primitivePowers = new Array(256);
    primitivePowersInverted = new Array(256);

    constructor() {
        if (GalousField.__instance) {
            return GalousField.__instance;
        }
        this.generatePrimitivePowers();
        GalousField.__instance = this;
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

    getInverse(number) {
        return this.primitivePowers[this.size -1 - this.primitivePowersInverted[number]];
    }

    multiply(number1, number2) {
        if (number1 === 0 || number2 === 0) return 0;
        //console.log(number1, number2, this.primitivePowersInverted[number1], this.primitivePowersInverted[number2], (this.primitivePowersInverted[number1] + this.primitivePowersInverted[number2])%(this.size-1));
        const res = this.primitivePowers[(this.primitivePowersInverted[number1] + this.primitivePowersInverted[number2])%(this.size-1)];
        //console.log(res);
        return res;
    }

    divide(number1, number2) {
        if (number2 === 0) {
            console.log("ERROR DIVIDING");
            return ;
        }
        if (number1 === 0) return 0;
        let degree = (this.primitivePowersInverted[number1] - this.primitivePowersInverted[number2]);
        if (degree<0) {
            degree = (this.size-1) + degree;
        }
        return this.primitivePowers[degree];
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