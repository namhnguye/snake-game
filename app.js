const canvas = document.getElementById('game') 
const context = canvas.getContext('2d') 

const eatSound = new Audio('sounds/eat.mp3')
const loseSound = new Audio('sounds/lose.mp3')
loseSound.volume = 0.5
const winSound = new Audio('sounds/finish.mp3')

const scoreCount = document.getElementById('score')
let score = 0
scoreCount.textContent = score 

const highScoreCount = document.getElementById('highScore')
let highScore = 0

// the canvas is 400px x 400px 
// the canvas will be a grid of 10square x 10square, where each square is 40px x 40px
// the snake and apple are being drawn with fillRect(), so the upper left corner (x,y) of every rectangle will be in increments of 40

let nodeSize = 38 // used later in fellRect() for the width and height to add seperation between the snake's tail nodes
let headX = 160 
let headY = 160
let appleX = 280
let appleY = 160
let xMovement = 0 // movement will be done by redrawing the nodes by increments of 40px in a direction
let yMovement = 0 


function drawApple() {  
    context.fillStyle = "#ee9696"  
    context.fillRect(appleX, appleY, nodeSize, nodeSize) 
}


let tail = [] 
let tailLength = 2  

// class to track the (x,y) of tail nodes as they are added to the tail array
class snakePart {
    constructor(x, y) {
        this.x = x 
        this.y = y 
    }    
}

function drawSnake() {

    context.fillStyle ="#BEE5B0" 
    
    // draw every node in the tail array
    for (let i = 0; i < tail.length; i++) {
         context.fillRect(tail[i].x, tail[i].y, nodeSize, nodeSize)
    }

    // just add a new node constantly and remove it if it exceeds the length
    tail.push(new snakePart(headX, headY)) 
    if (tail.length > tailLength) {
        tail.shift() 
    }
    
    // draw the head
    context.fillStyle = '#9FC192' 
    context.fillRect(headX, headY, nodeSize, nodeSize) 
    changeSnakePosition() 
}

function eat() {
    if (appleX == headX && appleY == headY) {
        
        // making sure the apple's new location isn't the head or in the tail
        let appleInTailOrHead = true;
        while (appleInTailOrHead) {
            // choosing a new (x,y)
            appleX = Math.floor(Math.random() * 10) * 40;
            appleY = Math.floor(Math.random() * 10) * 40;

            // keep looping if the new apple (x,y) matches a head node's or atail node's (x,y)
            appleInTailOrHead = false;
            for (let i = 0; i < tail.length; i++) {
                if ((appleX == tail[i].x && appleY == tail[i].y) || (appleX == headX && appleY == headY) ) {
                    appleInTailOrHead = true;
                    break;
                }
            }
        }
        eatSound.play()
        tailLength++;
        score++;
        scoreCount.textContent = score;
    }
}


document.body.addEventListener('keydown', keyDown) 
function keyDown(event) {

    // up
    if ((event.keyCode == 38 || event.keyCode == 87) && yMovement != 40) {
        yMovement = -40  
        xMovement = 0 
    }

    //down
    if ((event.keyCode == 40 || event.keyCode == 83) && yMovement != -40){
        yMovement = 40  
        xMovement = 0 
    }

    //left
    if ((event.keyCode == 37 || event.keyCode == 65) && xMovement != 40){
        yMovement = 0 
        xMovement = -40  
    }

    //right
    if ((event.keyCode == 39 || event.keyCode == 68) && xMovement != -40) {
        yMovement = 0 
        xMovement = 40  
    }
}

function changeSnakePosition() {
    headX = headX + xMovement 
    headY = headY + yMovement 
}


let scores = []

function checkGameEnded() {

    // hit left wall
    if (headX < 0) {
        return true 
    }

    // hit top wall
    if (headY < 0) {
        return true 
    }

    // hit right wall
    if (headX == canvas.width) {  
        return true            
    }

    // hit bottom wall
    if (headY == canvas.height) {
        return true 
    }

    for (let i = 0; i < tail.length; i++) {
        if (headX == tail[i].x && headY == tail[i].y && tailLength > 2) {
            return true 
        }
    }

    // update highscore value only for fast speed
    if (speed == 'fast') {
        scores.push(score)
        for (const score of scores) {
            if (score > highScore) {
                highScore = score
                localStorage.setItem('highScore', highScore)
            }
        }
    }
}


// draw the grid lines
function drawGrid() {
    context.strokeStyle = '#ABCC9F'
    for (let startX = 39; startX <= 400; startX += 40) {
        context.beginPath()
        context.moveTo(startX, 0)
        context.lineTo(startX, 400)
        context.stroke()
    }
    for (let startY = 39; startY <= 400; startY += 40) {
        context.beginPath()
        context.moveTo(0, startY)
        context.lineTo(400, startY)
        context.stroke()
    }
}

let gridLinesShowed = false
let gridButton = document.getElementById('gridLines')
gridButton.addEventListener("click", () => {
        gridLinesShowed = !gridLinesShowed
    }
)

function clearScreen() { 
    context.fillStyle = '#ECECCC' 
    context.fillRect(0, 0, canvas.width, canvas.height) 
    if (gridLinesShowed) {
        drawGrid()
    }
}

function resetGame() {
    setTimeout(() => {
        headX = 160 
        headY = 160
        appleX = 280
        appleY = 160
        xMovement = 0 
        yMovement = 0 
        score = 0
        scoreCount.textContent = score;
        tailLength = 2
        tail = []
    }, 1000)
}

function prepReset(gameEnded) {
    setTimeout(() => {
        clearScreen()
    }, 500)
    if (speed == 'fast') {
        highScoreCount.textContent = highScore
    }
    resetGame()
    gameEnded = false
}

function drawGame() {
    let gameEnded = false
    if (checkGameEnded(gameEnded)) {
        // if score is 28 then tail is 30 long, player wins
        if (tailLength >= 30 && speed == 'fast') {
            highScoreCount.classList.add('winScoreText')
            winSound.play()
            prepReset(gameEnded)
        } else {
             loseSound.play()
             prepReset(gameEnded)
        }
    } else {
        clearScreen() 
        drawSnake() 
        drawApple() 
        eat() 
    }
}


// check for a previous highscore aend load it if so
if (localStorage.getItem('highScore') !== null) {        
    let highScore = parseInt(localStorage.getItem('highScore'))
    scores.push(highScore)
    highScoreCount.textContent = highScore
    if (highScore >= 28) {
        highScoreCount.classList.add('winScoreText')
    }
}

// draw the game and initalize to fast speed
let speed = 'fast' 
let speedInterval = setInterval(drawGame, 1000 / 15)
const speedSelect = document.getElementById('speed')
speedSelect.addEventListener('change', () => {
    speed = speedSelect.value
    changeSpeed()
})

function changeSpeed() {
    clearInterval(speedInterval)
    if (speed == 'slow') {
        speedInterval = setInterval(drawGame, 1000 / 7)  
    } else if (speed == 'normal') { 
        speedInterval = setInterval(drawGame, 1000 / 10) 
    } else if (speed == 'fast') { 
        speedInterval = setInterval(drawGame, 1000 / 15)
    }
}


// stop arrow keys from changing speed
speedSelect.addEventListener('keydown', function(event) {
    if (event.key.includes('Arrow')) {
      event.preventDefault()
    }
  })


// stop arrow keys from moving page if window isn't fullscreen
window.addEventListener("keydown", function(event) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault()
    }
}, false)