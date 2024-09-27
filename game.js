// Select the player element from the DOM (Document Object Model)
const player = document.querySelector('.player');

// Define the step size (movement increment) for the player
const step = 2;

// Get and parse the initial left and top positions of the player from CSS
let left = parseInt(window.getComputedStyle(player).left, 10);
let playerTop = parseInt(window.getComputedStyle(player).top, 10);

// Variable to store the interval ID for continuous movement
let movementInterval;
let keyPressed
// Listen for keydown events on the entire document
document.addEventListener('keydown', function(event) {
    if (gameOver) return
    keyPressed = true
    startTimer()
    clearInterval(movementInterval);
    const playerElement = document.querySelector('.player')
    switch (event.key) {
        case 'ArrowUp':
            movementInterval = setInterval(() => movePlayer(0, -step), 10);
            break;
        case 'ArrowDown':
            movementInterval = setInterval(() => movePlayer(0, step), 10);
            break;
        case 'ArrowLeft':
            movementInterval = setInterval(() => movePlayer(-step, 0), 10);
            playerElement.classList.add('flip-horizontal');
            break;
        case 'ArrowRight':
            movementInterval = setInterval(() => movePlayer(step, 0), 10);
            playerElement.classList.remove('flip-horizontal');
            break;
    }
});

let successChance = 0.4; // Initial 40% chance

function pickUpItem() {
  successChance += 0.1; // Increase chance by 10% for each item
  if (successChance > 1) {
    successChance = 1; // Ensures chance doesn't exceed 100%
  }
}

// Flag to track if the Minotaur has been encountered
let hasEncounteredMinotaur = false;
function encounterMinotaur() {
  if (hasEncounteredMinotaur) return; // Skip if the Minotaur has already been encountered
    pauseTimer()
  let resultMessage;
  const randomNumber = Math.random(); // Call Math.random() to get a random number
  console.log(randomNumber); // Log the random number

  if (randomNumber <= successChance) {
    resultMessage = "You defeated the Minotaur!";
    let minotaurDead = document.getElementById('minotaurDead');
    let victory = document.getElementById('victory')
    minotaurDead.play();
    victory.play();
    victory.volume = 1
    music.pause()
    tryAgain.style.display = "block"
    document.getElementById("minotaur").style.display = "none"
  } else {
    resultMessage = "The Minotaur defeated you!";
    let playerDead = document.getElementById('playerDead');
    playerDead.play();
    tryAgain.style.display = "block"
    document.getElementById("player").style.display = "none"
  }

  // Display the result on the screen
  displayResult(resultMessage);

  // Update the flag
  hasEncounteredMinotaur = true;
}

// Function to display the result on the screen
function displayResult(message) {
  const resultElement = document.getElementById('result'); 
  resultElement.textContent = message;
  resultElement.style.display = 'block';
}


function updateGame() {
    // Check for collision with items
    checkForItemCollision();
    checkForMinotaur()
    console.log(successChance)

    // ... other game update logic, like moving enemies or handling user input
}
// Utility function to check for collision
function isColliding(rect1, rect2) {
    return !(rect2.left > rect1.right || 
             rect2.right < rect1.left || 
             rect2.top > rect1.bottom ||
             rect2.bottom < rect1.top);
}

// Check for collision with the items
function checkForItemCollision() {
    let items = document.querySelectorAll('.item'); // Select all items
    items.forEach((item) => {
        if (isColliding(player.getBoundingClientRect(), item.getBoundingClientRect())) {
            console.log("Collision detected with item"); // Indicates a collision was detected
            pickUpItem(); // Player picks up the item
            item.style.display = "none"; // Hide the item from view

            let itemSound = document.getElementById('itemSound');
            itemSound.play();
        }
    });
}
// Check for collision with the Minotaur
let fight = false
function checkForMinotaur() {
    const minotaur = document.querySelector('#minotaur');
    if (minotaur && isColliding(player.getBoundingClientRect(), minotaur.getBoundingClientRect())) {
            encounterMinotaur(); // Player encounters the Minotaur
            stopPlayer();
            stopWalkSound();
            fight = true
    }
}

let walk = document.getElementById('walk');
let isMoving = false
// Function to move the player
function movePlayer(deltaX, deltaY) {
    if (fight) return
    if (!keyPressed) return
    if (gameOver) return
    if (walk && !walk.playing) {
        walk.play();
        walk.loop = true
    }
    if (!isMoving) {
        document.getElementById('player').src = 'player.gif';
        isMoving = true;
    }
    // Calculate the new position
    let newLeft = left + deltaX;
    let newTop = playerTop + deltaY;
    const borderSize = 10; // Adjust based on your actual border size

    // Get the boundaries of the game area
    const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
    const borderWidth = 10;
    const adjustedGameAreaWidth = gameAreaRect.width - borderWidth * 2; // Subtract border from both sides
    const adjustedGameAreaHeight = gameAreaRect.height - borderWidth * 2; // Subtract border from top and bottom

    // Check if the new position collides with any wall
    if (willCollide(newLeft, newTop) || 
        newLeft < 0 || newTop < 0 || 
        newLeft + player.offsetWidth > adjustedGameAreaWidth || 
        newTop + player.offsetHeight > adjustedGameAreaHeight) {
        stopPlayer(); // Stop the player
        return;
    }
    
    // Check if the new position is outside the game area boundaries
    if (newLeft < 0 || newTop < 0 || 
        newLeft + player.offsetWidth > adjustedGameAreaWidth || 
        newTop + player.offsetHeight > adjustedGameAreaHeight) {
        clearInterval(movementInterval);
        return;
    }

    // Update the player's position
    left = newLeft;
    playerTop = newTop;
    player.style.left = left + 'px';
    player.style.top = playerTop + 'px';


 updateGame(); // Call the update function which will check for item collisions
}

function stopWalkSound() {
    if (walk) {
        walk.pause();  
        walk.currentTime = 0; 
    }
}
function stopPlayer() {
    if (isMoving) {
        document.getElementById('player').src = 'static_player.png';
        isMoving = false;
    }
}

// Function to check for collision with walls
function willCollide(newLeft, newTop) {
    // Get the position and size of the game area
    const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();

    // Define the player's bounding box
    const playerRect = {
        left: newLeft,
        top: newTop,
        right: newLeft + player.offsetWidth,
        bottom: newTop + player.offsetHeight
    };

    // Select all wall elements
    const walls = document.querySelectorAll('.wall');
    for (const wall of walls) {
        // Get the position and size of each wall
        const rect = wall.getBoundingClientRect();
        const wallRect = {
            left: rect.left - gameAreaRect.left,
            top: rect.top - gameAreaRect.top,
            right: rect.right - gameAreaRect.left,
            bottom: rect.bottom - gameAreaRect.top
        };

        // Check if the player's bounding box intersects with the wall's bounding box
        const tolerance = 10;  // Adjust this value as needed
        if (playerRect.left < wallRect.right - tolerance && 
            playerRect.right > wallRect.left - tolerance &&
            playerRect.top < wallRect.bottom - tolerance && 
            playerRect.bottom > wallRect.top - tolerance) {
                stopPlayer();
            return true; // Collision detected
        }
    }
    return false; // No collision
}
const play = document.querySelector('.play')
const title = document.querySelector('.title')
const bricks = document.querySelector('.start-screen')
play.addEventListener('click', function() {
    play.classList.add('clicked')
    setTimeout(function() {
        bricks.style.zIndex = 0
        title.style.display = "none"
        play.style.display = "none"
        timer.style.display = "block"
    }, 1000)

})

document.getElementById("grey").addEventListener("click", function() {
    this.style.display = "none"
    let music = document.getElementById('music');
    music.play();
    music.volume = 0.2;
    music.loop = true
})

function startPosition() {
    player.style.top = "5px"
    player.style.left = "5px"
}

// reset game button!
const resultGone = document.getElementById('result');
let tryAgain = document.querySelector(".try-again")
tryAgain.addEventListener("click", resetGame)
function resetGame() {
    document.getElementById("minotaur").style.display = "block"
    document.getElementById("player").style.display = "block"
    resultGone.style.display = 'none';
    resultGone.textContent = '';
    hasEncounteredMinotaur = false;
    successChance = 0.4;
    tryAgain.style.display = "none"
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.style.display = 'block';
    });
    resetTimer()
    music.play();
    fight = false
    gameOver = false
    keyPressed = false
    left = 5
    playerTop = 5
    startPosition()
}
let timerStarted = false
let gameOver = false
let timerInterval;
let remainingTime = 30000; // 25 seconds in milliseconds

function startTimer() {
    if (timerInterval) return;
    if (timerStarted) return;

    timerStarted = true

    timerInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            document.getElementById("time-up").innerText = "Time's up!";
            gameOver = true
            tryAgain.style.display = "block"
        } else {
            remainingTime -= 10; // Decrease time by 10ms
            updateDisplay();
        }
    }, 10);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    clearInterval(timerInterval);
    remainingTime = 30000;
    timerStarted = false
    timerInterval = null;
    updateDisplay();
     document.getElementById("time-up").innerText = "";
}

function updateDisplay() {
    let seconds = Math.floor(remainingTime / 1000);
    let milliseconds = remainingTime % 1000;
    document.getElementById("timer").innerText = `${seconds}:${milliseconds.toString().padStart(3, '0')}`;
}
