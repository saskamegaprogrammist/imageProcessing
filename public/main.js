import MainPageComponent from "./components/main-page";
import cv from "./opencv/opencv"
import QRDetector from "./QRCodeReader/detector/detector";
import QRCodeReader from "./QRCodeReader/QRCodeReader";
import QrScanner from "qr-scanner";

import QrScannerWorkerPath from '!!file-loader!../node_modules/qr-scanner/qr-scanner-worker.min.js';

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
    const qrCodeReader = new QRCodeReader();
    var mine1 = performance.now();

    let mat = cv.imread(image);
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
    cv.adaptiveThreshold(mat, mat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 271, 3);
    cv.imshow('canvas', mat);

    const result = qrCodeReader.read(mat);
    let finalMessage = "";
    if (result === undefined || result.includes(undefined)) finalMessage = "COULD NOT DECODE :(";
    else {
        result.forEach((mess) => finalMessage = `${finalMessage}${mess}`);
    }

    var mine2 = performance.now();
    console.log("Call to myScanner took " + (mine2 - mine1) + " milliseconds.");

    document.querySelector(".result-window").innerText = finalMessage;
    mat = qrCodeReader.getProcessedImage();
    cv.imshow('canvas', mat);

    var test1 = performance.now();
    QrScanner.WORKER_PATH = QrScannerWorkerPath;

    QrScanner.scanImage(image.src)
        .then(result => console.log(result))
        .catch(error => console.log(error || 'No QR code found.'));


    var test2 = performance.now();

    console.log("Call to myScanner took " + (test2 - test1) + " milliseconds.");
};
