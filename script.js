const gameContainer = document.querySelector(".game-container");
const frontContainer = document.querySelector(".front-container");
const restartContainer = document.querySelector(".restart-container");
const attackField = document.querySelector(".attack-field");
const restartBtn = document.querySelector(".restart");
const startBtn = document.querySelector(".start");
const homeRestartBtn = document.querySelector(".home-btn");
const soundBtn = document.querySelector(".sound-btn");
const soundOn = document.querySelector(".sound-on");
const soundOff = document.querySelector(".sound-off");
const allSounds = document.querySelectorAll("audio");
const themeSound = document.querySelector(".theme-sound");
const jetDestroySound = document.querySelector(".destroy-sound");
const jetEscapeSound = document.querySelector(".jet-escape-sound");
const gameOverSound = document.querySelector(".game-over");
const gameWinSound = document.querySelector(".game-win");
const points = document.querySelector(".score p");
const restartCardPoint = document.querySelector(".game-over-heading p");
const missedJets = document.querySelectorAll(".missed-jet-img");
const stopwatch = document.querySelector(".timer p");
const tryAgainText = document.querySelector(".try-again-text");
const gameHeadingContainer = document.querySelector(".game-heading");

let gameInterval, missed, intervalId, jetProp;
let score = 0,
  timeLeft = 4,
  isSoundOn = true;
const gameDuration = 60;

let timer = gameDuration;

restartBtn.addEventListener("click", onClickRestartBtn);
startBtn.addEventListener("click", onClickStartBtn);
homeRestartBtn.addEventListener("click", restartGame);
soundBtn.addEventListener("click", onClickSoundBtn);

function onClickSoundBtn() {
  if (isSoundOn) {
    soundOn.style.display = "none";
    soundOff.style.display = "block";
    allSounds.forEach((sound) => (sound.volume = 0.0));
  } else {
    soundOn.style.display = "block";
    soundOff.style.display = "none";
    allSounds.forEach((sound) => (sound.volume = 1.0));
  }
  isSoundOn = !isSoundOn;
}

function onClickStartBtn() {
  frontContainer.style.display = "none";
  gameContainer.style.filter = "none";
  startGame();
}

function onClickRestartBtn() {
  restartContainer.style.display = "none";
  gameContainer.style.filter = "none";
  restartGame();
}

function getPositions() {
  const containerHeight = gameContainer.clientHeight;
  const jetHeight = jetProp.clientHeight;
  const randomY =
    Math.random() *
    (containerHeight - (jetHeight + gameHeadingContainer.clientHeight + 20));
  console.log(containerHeight, randomY);
  return { x: gameContainer.offsetLeft, y: randomY };
}

attackField.addEventListener("click", (e) => {
  console.log(e);
});

function createJet() {
  const jet = document.createElement("img");
  jet.src = "./images/fighterjet.png";

  //getting the of jet(image) for finding out randomY in getPositions()
  attackField.appendChild(jet);
  jetProp = jet;

  const { x, y } = getPositions();
  jet.style.left = `${x}px`;
  jet.style.top = `${y}px`;

  destroyJet(jet);
  moveJet(jet);
}

function moveJet(jet) {
  const speed = computeSpeed(timer);
  const moveJet = setInterval(() => {
    const currentLeft = parseInt(jet.style.left);
    jet.style.left = `${currentLeft + speed}px`;

    if (currentLeft >= attackField.clientWidth) {
      // Check if the jet is still part of jetsContainer before removing it
      if (jet.parentNode === attackField) {
        attackField.removeChild(jet);
        clearInterval(moveJet);

        if (missed < 3) {
          playJetEscapeSound();
          missedJets[2 - missed].style.opacity = "0";
          missed++;

          if (missed === 3) {
            showRestartCard();
            gameOver();
          }
        }
      }
    }
  }, 10);
}

function computeSpeed(speedTimer) {
  let computedSpeed;
  let min = 2,
    max = 2;

  if (speedTimer <= gameDuration - 10) {
    max = 3;
  }
  if (speedTimer <= gameDuration - 40) {
    min = 3;
    max = 4;
  }
  computedSpeed = Math.random() * max + min;

  return computedSpeed;
}

function gameOver() {
  stopGame(gameInterval);
  themeSound.pause();
  gameOverSound.play();
  tryAgainText.textContent = `Play Again in 4 seconds`;
  timeLeft = 4;
  restartBtn.disabled = true;
}

function showRestartCard() {
  restartCardPoint.textContent = score;
  gameContainer.style.filter = "blur(10px)";
  restartContainer.style.display = "flex";

  intervalId = setInterval(updateRestartTimer, 1000);
}

function updateRestartTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    tryAgainText.textContent = `Play Again in ${timeLeft} seconds`;
  } else {
    restartBtn.disabled = false;
    clearInterval(intervalId);
  }
}

function startGame() {
  timer = gameDuration;
  themeSound.play();
  missed = 0;
  gameInterval = setInterval(() => {
    if (timer > 0) {
      createJet();
      timer--;
      stopwatch.textContent = `${timer}`;
    } else {
      showRestartCard();
      gameWinSound.play();
      stopGame(gameInterval);
    }
  }, 1000);
}

function destroyJet(jet) {
  jet.addEventListener("click", () => {
    playDestroySound();
    score++;
    points.textContent = score;
    attackField.removeChild(jet);
  });
}

function restartGame() {
  score = 0;
  points.textContent = "0";
  themeSound.currentTime = 1;
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
