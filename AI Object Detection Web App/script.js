const video = document.getElementById("video");
const canvas = document.getElementById("c1");
const ctx = canvas.getContext('2d');

let cameraAvailable = false;
let aiEnabled = false;
let fps = 1000 / 30;
let modelIsLoaded = false;
let showConfidence = true;

const objectDetector = ml5.objectDetector('cocossd', {}, () => {
    modelIsLoaded = true;
    document.getElementById("loadingText").style.display = "none";
    document.getElementById("ai").disabled = false;
    console.log("Model loaded!");
});

const constraints = { audio: false, video: { facingMode: "environment" } };

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        cameraAvailable = true;
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
    })
    .catch(err => {
        document.getElementById("loadingText").innerText = "Camera access denied or unavailable.";
        console.error(err);
    });

// Event Listeners
document.getElementById("ai").addEventListener("change", () => aiEnabled = !aiEnabled);
document.getElementById("fps").addEventListener("input", e => {
    fps = 1000 / e.target.value;
    document.getElementById("fpsValue").innerText = e.target.value;
});
document.getElementById("showConfidence").addEventListener("change", e => showConfidence = e.target.checked);
document.getElementById("capture").addEventListener("click", captureSnapshot);

function updateCanvasSize() {
    const scale = 0.9;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
}

function captureSnapshot() {
    const link = document.createElement('a');
    link.download = `snapshot-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function timerCallback() {
    if (modelIsLoaded && cameraAvailable) {
        updateCanvasSize();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (aiEnabled) runDetection();
    }
    setTimeout(timerCallback, fps);
}

function runDetection() {
    objectDetector.detect(canvas, (err, results) => {
        if (err) return console.error(err);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let count = 0;
        results.forEach(obj => {
            count++;
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            ctx.lineWidth = 3;
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

            if (showConfidence) {
                ctx.font = "16px Arial";
                ctx.fillStyle = "red";
                ctx.fillText(`${obj.label} (${(obj.confidence*100).toFixed(1)}%)`, obj.x + 5, obj.y > 20 ? obj.y - 5 : obj.y + 15);
            }
        });

        document.getElementById("objectCount").innerText = count;
    });
}

window.onload = timerCallback;
