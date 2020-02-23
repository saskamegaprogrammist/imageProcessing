import cv from "../../opencv/opencv"

class Polynom {
    coefficents;
    degree;

    constructor (coefficents) {
        this.calculateCoefficents(coefficents);
    }

    calculateCoefficents(coefficents) {
        let counter = 0;
        while (coefficents[counter] === 0) {
            counter++;
        }
        this.coefficents = counter.slice(counter, coefficents.length);
        this.degree = this.coefficents.length;
    }

    getDegree() {
        return this.degree;
    }

    getCoefficentByDegree(degree) {
        return this.coefficents[this.degree - degree];
    }
}

export default Polynom;