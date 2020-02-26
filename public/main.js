import MainPageComponent from "./components/main-page";
import cv from "./opencv/opencv"
import QRDetector from "./QRCodeReader/detector/detector";
import QRCodeReader from "./QRCodeReader/QRCodeReader";


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
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
    cv.adaptiveThreshold(mat, mat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 251, 0);
    cv.imshow('canvas', mat);
    const qrCodeReader = new QRCodeReader();
    const result = qrCodeReader.read(mat);
    let finalMessage = "";
    if (result === undefined || result.includes(undefined)) finalMessage = "COULD NOT DECODE :(";
    else {
        result.forEach((mess) => finalMessage = `${finalMessage}${mess}`);
    }
    document.querySelector(".result-window").innerText = finalMessage;
    mat = qrCodeReader.getProcessedImage();
    cv.imshow('canvas', mat);
};
