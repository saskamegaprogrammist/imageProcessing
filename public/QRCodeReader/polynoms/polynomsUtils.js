import GalousField from "../galousField/galousField";
import Polynom from "./polynom";

class PolynomsUtils {
    galousField;

    constructor() {
        this.galousField = new GalousField();
    }

    createZero() {
        return new Polynom([0]);
    }

    createPlainPolynomByDegree(degree) {
        const coeff = new Array(degree+1).fill(0);
        coeff[0] = 1;
        return new Polynom(coeff);
    }

    multiplyPolynoms(polynom1, polynom2) {
        let degreeBigger = polynom1.getDegree();
        let degreeSmaller = polynom2.getDegree();
        let biggerPolynom = polynom1;
        let smallerPolynom = polynom2;
        if (degreeBigger < degreeSmaller) {
            biggerPolynom = polynom2;
            smallerPolynom = polynom1;
            degreeBigger = degreeSmaller;
            degreeSmaller = polynom1.getDegree();
        }
        let answer = this.createZero();
        for (let i=degreeSmaller; i>=0; i--) {
            const newCoeff = [];
            for (let j=degreeBigger; j>=0; j--) {
                newCoeff.push(this.galousField.multiply(biggerPolynom.getCoefficentByDegree(j), smallerPolynom.getCoefficentByDegree(i)));
            }
            const polynom = new Polynom(newCoeff);
            //console.log(polynom);
            polynom.increaseDegreeBy(i);
            answer = this.addPolynoms(answer, polynom);
            //console.log(answer);
        }
        return answer;
    }

    addPolynoms(polynom1, polynom2) {
        let degreeBigger = polynom1.getDegree();
        let degreeSmaller = polynom2.getDegree();
        let biggerPolynom = polynom1;
        let smallerPolynom = polynom2;
        if (degreeBigger < degreeSmaller) {
            biggerPolynom = polynom2;
            smallerPolynom = polynom1;
            degreeBigger = degreeSmaller;
            degreeSmaller = polynom1.getDegree();
        }
        let coeffBiggerRev = biggerPolynom.getCoefficents();
        let coeffSmallerRev = smallerPolynom.getCoefficents();
        const newCoeff = [];
        for (let i=0; i<=degreeSmaller; i++) {
            newCoeff.push(this.galousField.add(coeffBiggerRev[degreeBigger-i], coeffSmallerRev[degreeSmaller-i]));
            //console.log(this.galousField.add(coeffBiggerRev[degreeBigger-i], coeffSmallerRev[degreeSmaller-i]), coeffBiggerRev[degreeBigger-i], coeffSmallerRev[degreeSmaller-i]);
        }

        for (let i=degreeSmaller+1; i<=degreeBigger; i++) {
            newCoeff.push(coeffBiggerRev[degreeBigger-i]);
        }
        return new Polynom(newCoeff.reverse());
    }


    dividePolynoms(polynom1, polynom2) {
        const polynom2Degree = polynom2.getDegree();
        let remainderDegree = polynom2Degree;
        const divisionCoefficents = [];
        const divisionDegree = polynom1.getDegree() - polynom2Degree;
        let divisionDegCounter = divisionDegree;
        let mainCoefficents = polynom1.getCoefficents().slice(0, polynom2Degree+1);
        for (let i=divisionDegree; i>=0;  ) {
            if (divisionDegCounter<0) break;

            const substractingCoefficents = [];
            const currentCoeff = this.galousField.divide(mainCoefficents[0], polynom2.getCoefficentByDegree(polynom2Degree));
            divisionCoefficents.push(currentCoeff);
            divisionDegCounter--;
            for (let j=polynom2Degree; j>=0; j--) {
                substractingCoefficents.push(this.galousField.multiply(currentCoeff, polynom2.getCoefficentByDegree(j)));
            }

            //console.log(mainCoefficents, substractingCoefficents);
            for (let j=0; j<substractingCoefficents.length; j++) {
                substractingCoefficents[j] = this.galousField.add(substractingCoefficents[j], mainCoefficents[j]);
            }
            //console.log(mainCoefficents, substractingCoefficents, i);
            const substractingPolynom = new Polynom(substractingCoefficents);
            mainCoefficents = substractingPolynom.getCoefficents();
            if (i>0) {
                mainCoefficents.push(polynom1.getCoefficentByDegree(i-1));
                i--;
            }
            //console.log(mainCoefficents.length, polynom2Degree+1, i);
            while (mainCoefficents.length !== polynom2Degree+1) {
                if (i>0) {
                    mainCoefficents.push(polynom1.getCoefficentByDegree(i - 1));
                    divisionCoefficents.push(0);
                    i--;
                } else {
                    break;
                }
            }
        }
        //console.log(divisionCoefficents, mainCoefficents);
        return {
            divisionResult : new Polynom(divisionCoefficents),
            remainder: new Polynom(mainCoefficents)
        }
    }

}

export default PolynomsUtils;