import GalousField from "../galousField/galousField";

class PolynomsUtils {
    galousField;

    constructor() {
        this.galousField = new GalousField();
    }

    dividePolynoms(polynom1, polynom2) {
        const polynom2Degree = polynom2.getDegree();
        let remainderDegree = polynom2Degree;
        const divisionCoefficents = new Array()
        while (polynom2Degree <= remainderDegree) {

        }
    }

}

export default PolynomsUtils;