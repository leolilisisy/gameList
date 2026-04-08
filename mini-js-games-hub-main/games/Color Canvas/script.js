const canvas = document.getElementById("drawing-board");
const ctx = canvas.getContext("2d");
const brushSize = document.getElementById("brush-size");
const colorPicker = document.getElementById("color-picker");
const eraserBtn = document.getElementById("eraser");
const clearBtn = document.getElementById("clear");
const saveBtn = document.getElementById("save");

let drawing = false;
let currentColor = colorPicker.value;
let lineWidth = brushSize.value;
let isErasing = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - document.querySelector(".toolbar").offsetHeight;
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false, ctx.beginPath()));
canvas.addEventListener("mouseout", () => (drawing = false));
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = isErasing ? "#0f0c29" : currentColor;

  ctx.lineTo(e.clientX, e.clientY - document.querySelector(".toolbar").offsetHeight);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY - document.querySelector(".toolbar").offsetHeight);
}

brushSize.addEventListener("input", (e) => (lineWidth = e.target.value));
colorPicker.addEventListener("input", (e) => {
  currentColor = e.target.value;
  isErasing = false;
});

eraserBtn.addEventListener("click", () => (isErasing = true));

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "my_art.png";
  link.href = canvas.toDataURL();
  link.click();
});
