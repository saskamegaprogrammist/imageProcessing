import cv from "../../opencv/opencv"

class ModuleCenter {
    point;
    moduleSize;

    constructor (point, moduleSize) {
        this.point = point;
        this.moduleSize = moduleSize;
    }
}

export default ModuleCenter;