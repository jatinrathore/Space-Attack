const gameContainer = document.querySelector(".game-container");
const attackField = document.querySelector(".attack-field");
const restartBtn = document.querySelector(".restart");
const startBtn = document.querySelector(".start");
const points = document.querySelector("p");
const missedJets = document.querySelectorAll(".missed-jet-img");
const stopwatch = document.querySelector(".timer p");
const themeSound = document.querySelector(".theme-sound");
const jetDestroySound = document.querySelector(".destroy-sound");
const jetEscapeSound = document.querySelector(".jet-escape-sound");
const gameOverSound = document.querySelector(".game-over");
const gameWinSound = document.querySelector(".game-win");
const frontContainer = document.querySelector(".front-container");

let gameInterval;
let score = 0,
  missed;
const gameDuration = 60;

themeSound.volume = 0.6;

restartBtn.addEventListener("click", restartGame);
startBtn.addEventListener("click", onClickStartBtn);

function onClickStartBtn() {
  frontContainer.style.display = "none";
  gameContainer.style.filter = "none";
  startGame();
}

function getPositions() {
  const containerHeight = gameContainer.clientHeight;
  const randomY = Math.random() * (containerHeight - 300);
  return { x: gameContainer.offsetLeft, y: randomY };
}

function createJet() {
  const jet = document.createElement("img");
  jet.src = "./images/fighterjet.png";

  const { x, y } = getPositions();
  jet.style.left = `${x}px`;
  jet.style.top = `${y}px`;
  attackField.appendChild(jet);

  destroyJet(jet);
  moveJet(jet);
}

function moveJet(jet) {
  const speed = Math.random() * 4 + 2;
  const moveJet = setInterval(() => {
    const currentLeft = parseInt(jet.style.left);
    jet.style.left = `${currentLeft + speed}px`;

    if (currentLeft >= attackField.clientWidth) {
      if (missed === 3) {
        themeSound.pause();
        gameOverSound.play();
        stopGame(gameInterval);
      }
      // Check if the jet is still part of jetsContainer before removing it
      if (jet.parentNode === attackField) {
        attackField.removeChild(jet);
        clearInterval(moveJet);

        if (missed < 3) {
          playJetEscapeSound();
          missedJets[2 - missed].style.opacity = "0";
          missed++;
        }
      }
    }
  }, 10);
}

function startGame() {
  let timer = gameDuration;
  themeSound.play();
  missed = 0;
  gameInterval = setInterval(() => {
    if (timer > 0) {
      createJet();
      timer--;
      stopwatch.textContent = `${timer}`;
    } else {
      stopGame(gameInterval);
      gameWinSound.play();
    }
  }, 1000);
}

function destroyJet(jet) {
  jet.addEventListener("click", () => {
    score++;
    playDestroySound();
    points.textContent = score;
    attackField.removeChild(jet);
  });
}

function restartGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
    stopwatch.textContent = "00";
    missedJets.forEach((jet) => (jet.style.opacity = "1"));
    setTimeout(startGame(), 1000);
  } else {
    startGame();
  }
}

function stopGame(interval) {
  clearInterval(interval);
  themeSound.pause();
}

function playDestroySound() {
  if (!jetDestroySound) return;
  jetDestroySound.currentTime = 0;
  jetDestroySound.play();
}

function playJetEscapeSound() {
  if (!jetEscapeSound) return;
  jetEscapeSound.currentTime = 0;
  jetEscapeSound.play();
}
