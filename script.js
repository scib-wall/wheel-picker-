// Secret predetermined winning sequence in exact order
const predeterminedWinners = [
  "ROCHELLE",
  "ELLA",
  "HEART",
  "KYLA",
  "HYGEIA",
  "ALTHEA",
  "MELIZA"
];

// Initial visual list on the wheel
const initialNames = [
  "ROCHELLE",
  "ELLA",
  "HEART",
  "KYLA",
  "HYGEIA",
  "ALTHEA",
  "MELIZA"
];
let names = [...initialNames];

const colors = [
  "#ef4444", "#3b82f6", "#10b981", "#f59e0b", 
  "#8b5cf6", "#ec4899", "#14b8a6"
];

let turnIndex = 0;
let isSpinning = false;
let currentAngle = 0;
let lastSliceIndex = -1;

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin-center-btn");
const resetBtn = document.getElementById("reset-btn");
const resultModal = document.getElementById("result-modal");
const winnerNameText = document.getElementById("winner-name");
const closeBtn = document.getElementById("close-btn");

const nameInput = document.getElementById("name-input");
const addBtn = document.getElementById("add-btn");
const entriesListEl = document.getElementById("entries-list");
const entryCountEl = document.getElementById("entry-count");

const tickSound = document.getElementById("tick-sound");
const winSound = document.getElementById("win-sound");

const center = canvas.width / 2;
const radius = center - 10;

function addName() {
  const value = nameInput.value.trim().toUpperCase();
  if (!value) return;

  names.push(value);
  nameInput.value = "";
  updateWheelState();
}

function removeName(index) {
  names.splice(index, 1);
  updateWheelState();
}

function updateWheelState() {
  renderSidebar();

  if (names.length === 0 || turnIndex >= predeterminedWinners.length) {
    spinBtn.disabled = true;
    spinBtn.textContent = turnIndex >= predeterminedWinners.length ? "DONE" : "SPIN";
  } else {
    spinBtn.disabled = false;
    spinBtn.textContent = "SPIN";
  }

  drawWheel();
}

function renderSidebar() {
  entriesListEl.innerHTML = "";
  entryCountEl.textContent = names.length;
  
  names.forEach((name, i) => {
    const item = document.createElement("div");
    item.className = "entry-item";
    item.style.borderLeftColor = colors[i % colors.length];
    item.innerHTML = `
      <span>${name}</span>
      <i class="fa-solid fa-trash remove-icon" onclick="removeName(${i})"></i>
    `;
    entriesListEl.appendChild(item);
  });
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (names.length === 0) return;

  const sliceAngle = (2 * Math.PI) / names.length;

  names.forEach((name, index) => {
    const angle = currentAngle + index * sliceAngle;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Poppins";
    ctx.fillText(name, radius - 25, 6);
    ctx.restore();
  });
}

function spin() {
  if (isSpinning || turnIndex >= predeterminedWinners.length || names.length === 0) return;

  const targetWinner = predeterminedWinners[turnIndex];
  let targetIndex = names.indexOf(targetWinner);

  // Auto-inject target winner if removed manually
  if (targetIndex === -1) {
    names.push(targetWinner);
    targetIndex = names.length - 1;
    updateWheelState();
  }

  isSpinning = true;
  spinBtn.disabled = true;

  const sliceAngle = (2 * Math.PI) / names.length;
  const sliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
  const targetSliceAngle = (3 * Math.PI / 2) - sliceCenter;

  const currentNormalized = currentAngle % (2 * Math.PI);
  let angleNeeded = (targetSliceAngle - currentNormalized) % (2 * Math.PI);
  if (angleNeeded < 0) angleNeeded += 2 * Math.PI;

  const extraTurns = (6 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
  const totalRotation = extraTurns + angleNeeded;

  const duration = 5500;
  const startAngle = currentAngle;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);
    
    currentAngle = startAngle + totalRotation * easeOut;
    drawWheel();

    const currentSlice = Math.floor(((2 * Math.PI - (currentAngle % (2 * Math.PI))) % (2 * Math.PI)) / sliceAngle);
    if (currentSlice !== lastSliceIndex) {
      tickSound.currentTime = 0;
      tickSound.play().catch(() => {});
      lastSliceIndex = currentSlice;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      showWinner(targetWinner);
    }
  }

  requestAnimationFrame(animate);
}

function showWinner(winner) {
  winSound.play().catch(() => {});
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  winnerNameText.textContent = winner;
  resultModal.classList.remove("hidden");

  const removeIndex = names.indexOf(winner);
  if (removeIndex !== -1) {
    names.splice(removeIndex, 1);
  }

  turnIndex++;
}

addBtn.addEventListener("click", addName);
nameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addName();
});

resetBtn.addEventListener("click", () => {
  turnIndex = 0;
  names = [...initialNames];
  updateWheelState();
});

spinBtn.addEventListener("click", spin);

closeBtn.addEventListener("click", () => {
  resultModal.classList.add("hidden");
  updateWheelState();
});

updateWheelState();