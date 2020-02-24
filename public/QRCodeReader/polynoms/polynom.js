import cv from "../../opencv/opencv"

class Polynom {
    coefficents;
    degree;

    constructor (coefficents) {
        this.calculateCoefficents(coefficents);
    }


    calculateCoefficents(coefficents) {
        let counter = 0;
        if (coefficents.length !== 1) {
            while (coefficents[counter] === 0) {
                counter++;
            }
        }
        this.coefficents = coefficents.slice(counter, coefficents.length);
        this.degree = this.coefficents.length-1;
    }

    increaseDegreeBy(value) {
        for (let i=0; i<value; i++) {
            this.coefficents.push(0);
        }
        this.degree+=value;
    }

    getDegree() {
        return this.degree;
    }

    getCoefficentByDegree(degree) {
        return this.coefficents[this.degree - degree];
    }
    getCoefficents() {
        return this.coefficents;
    }
}

export default Polynom;