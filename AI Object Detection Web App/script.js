document.getElementById("ai").addEventListener("change", toggleAi);
document.getElementById("fps").addEventListener("input", changeFps);

const video = document.getElementById("video");
const canvas = document.getElementById("c1");
const ctx = canvas.getContext('2d');

let cameraAvailable = false;
let aiEnabled = false;
let fps = 1000 / 30;
let modelIsLoaded = false;

const objectDetector = ml5.objectDetector('cocossd', {}, () => {
    modelIsLoaded = true;
    document.getElementById("loadingText").style.display = "none";
    document.getElementById("ai").disabled = false;
    console.log("Model loaded!");
});

const constraints = {
    audio: false,
    video: { facingMode: "environment" }
};

startCamera();

function startCamera() {
    if (!cameraAvailable) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                cameraAvailable = true;
                video.srcObject = stream;
            })
            .catch(err => {
                console.error("Camera error:", err);
                setTimeout(startCamera, 1000);
            });
    }
}

function timerCallback() {
    if (isReady()) {
        updateCanvasSize();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (aiEnabled) runDetection();
    }
    setTimeout(timerCallback, fps);
}

function isReady() {
    return modelIsLoaded && cameraAvailable;
}

function updateCanvasSize() {
    const scale = 0.9;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
}

function toggleAi() {
    aiEnabled = document.getElementById("ai").checked;
}

function changeFps() {
    fps = 1000 / document.getElementById("fps").value;
}

function runDetection() {
    objectDetector.detect(canvas, (err, results) => {
        if (err) {
            console.error("Detection error:", err);
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        results.forEach(obj => {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            ctx.fillText(`${obj.label} (${(obj.confidence * 100).toFixed(1)}%)`, obj.x + 5, obj.y > 20 ? obj.y - 5 : obj.y + 15);
        });
    });
}

window.onload = timerCallback;
function startCamera() {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            cameraAvailable = true;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                console.log("Camera started");
            };
        })
        .catch(err => {
            cameraAvailable = false;
            document.getElementById("loadingText").innerText = "Camera access denied or unavailable.";
            console.error("Camera error:", err.name, err.message);
        });
}
