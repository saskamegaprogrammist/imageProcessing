import MainPageComponent from "./components/main-page";
import cv from "./opencv/opencv"
import QRDetector from "./qrReader/detector/detector";

const application = document.getElementById('application');
const baseBlock = document.createElement('div');

const mainPage = new MainPageComponent();
baseBlock.innerHTML = mainPage.render();
application.appendChild(baseBlock);

const imageInput = document.querySelector(".image-input");
imageInput.addEventListener("change", () => {
    const image = document.querySelector(".original-image");
    image.src = URL.createObjectURL(event.target.files[0]);

});

const image = document.querySelector("#img");
image.onload = () => {
    let mat = cv.imread(image);
    // console.log('image width: ' + mat.cols + '\n' +
    //     'image height: ' + mat.rows + '\n' +
    //     'image size: ' + mat.size().width + '\n' + mat.size().height + '\n' +
    // 'image depth: ' + mat.depth() + '\n' +
    // 'image channels ' + mat.channels() + '\n' +
    // 'image type: ' + mat.type() + '\n');
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
    cv.adaptiveThreshold(mat, mat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 251, 0);
    cv.imshow('canvas', mat);
    const detector = new QRDetector();
    mat = detector.detect(mat);
    cv.imshow('canvas', mat);
}
