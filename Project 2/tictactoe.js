var gameContainer;
var gameBoard;
var compGoesFirstButton;
var gameOverContainer;
var playAgainButton;
var moveCount;

/* initialize game board and buttons */
var initializeGame = function() {
  gameContainer = document.getElementById("game");
  gameBoard = [];
  moveCount = 0;

  // add nine playable buttons to the page
  for (row = 0; row < 3; row++) {
    gameBoard[row] = [];
    for (col = 0; col < 3; col++) {
      gameBoard[row].push(document.createElement("button"));
      gameBoard[row][col].innerHTML = "&nbsp;";
      gameBoard[row][col].onclick = humanMove.bind(gameBoard[row][col], row, col);
      gameContainer.appendChild(gameBoard[row][col]);
    }
    gameContainer.appendChild(document.createElement("br"));
  }

  // bind button that allows user to let computer go first to its function
  compGoesFirstButton = document.getElementById("compGoesFirstButton");
  compGoesFirstButton.onclick = compGoesFirst.bind(compGoesFirstButton);

  // bind button that allows user to play again to its function
  playAgainButton = document.getElementById("playAgainButton");
  playAgainButton.onclick = playAgain.bind(playAgainButton);

  // hide "play again" section until game is over
  gameOverContainer = document.getElementById("gameOver");
  gameOverContainer.style.visibility = "hidden";

}

/* computer goes first if button is clicked */
var compGoesFirst = function() {
  // hide button after being clicked
  compGoesFirstButton.style.visibility = "hidden";
  compMove();
}

/* handle human move */
var humanMove = function(row, col){
  // if user goes first, hide "let computer go first" button
  if (moveCount == 0) {
    compGoesFirstButton.style.visibility = "hidden";
  }

  // actually make move
  gameBoard[row][col].innerHTML = "X";
  gameBoard[row][col].disabled = true;
  moveCount++;

  // check if human won; if not, and game is not done, computer goes
  if (checkForWins("X")) {
    wonGame("Human");
  } else if (moveCount < 9) {
    compMove();
  } else {
    wonGame("Cat");
  }
}

/* handle computer move */
var compMove = function(){
  // build list of possible moves for computer to make
  var possibleCompMoves = []
  for (row = 0; row < 3; row++) {
    for (col = 0; col < 3; col++) {
      if (gameBoard[row][col].innerHTML == "&nbsp;") {
        possibleCompMoves.push([row, col]);
      }
    }
  }

  // randomly choose from possible moves
  randomNum = Math.floor(Math.random() * possibleCompMoves.length);
  compChoice = possibleCompMoves[randomNum];
  row = compChoice[0];
  col = compChoice[1];

  // actually make move
  gameBoard[row][col].innerHTML = "O";
  gameBoard[row][col].disabled = true;
  moveCount++;

  // check if computer won; if not, and game is not done, human goes
  if (checkForWins("O")) {
    wonGame("Computer");
  } else if (moveCount == 9) {
    wonGame("Cat");
  }
}

/* check if provided character has won */
var checkForWins = function(char) {
  var hasWon = false;
  if (checkHorizontalWin(char) ||
      checkVerticalWin(char) ||
      checkDiagonalWin(char)) {
    hasWon = true;
  };
  return hasWon;
}

/* check if provided character has won horizontally */
var checkHorizontalWin = function(c) {
  var hasWonH = false;

  for (row = 0; row < 3; row++) {
    if ((gameBoard[row][0].innerHTML == c) &&
        (gameBoard[row][1].innerHTML == c) &&
        (gameBoard[row][2].innerHTML == c)) {
      hasWonH = true;
    }
  }

  return hasWonH;
}

/* check if provided character has won vertically */
var checkVerticalWin = function(c) {
  var hasWonV = false;

  for (col = 0; col < 3; col++) {
    if ((gameBoard[0][col].innerHTML == c) &&
        (gameBoard[1][col].innerHTML == c) &&
        (gameBoard[2][col].innerHTML == c)) {
      hasWonV = true;
    }
  }

  return hasWonV;
}

/* check if provided character has won diagonally */
var checkDiagonalWin = function(c) {
  var hasWonD = false;

  if ((gameBoard[0][0].innerHTML == c) &&
      (gameBoard[1][1].innerHTML == c) &&
      (gameBoard[2][2].innerHTML == c)) {
    hasWonD = true;
  }

  if ((gameBoard[0][2].innerHTML == c) &&
      (gameBoard[1][1].innerHTML == c) &&
      (gameBoard[2][0].innerHTML == c)) {
    hasWonD = true;
  }

  return hasWonD;
}

/* handle end-of-game formalities */
var wonGame = function(winner) {
  // disable all buttons as soon as game is over
  for (row = 0; row < 3; row++) {
    for (col = 0; col < 3; col++) {
      gameBoard[row][col].disabled = true;
    }
  }

  // create text section to display results
  var resultsText = document.createElement("h3");

  // fill results text based on winner
  switch(winner) {
    case "Human":
      resultsText.innerHTML = "You won!"
      break;
    case "Computer":
      resultsText.innerHTML = "You lost!"
      break;
    case "Cat":
      resultsText.innerHTML = "Cat's game!"
      break;
    default:
      resultsText.innerHTML = "Wat"
      break;
  }

  // add results text to game over section, and make the section visible
  gameOverContainer.insertBefore(resultsText, playAgainButton);
  gameOverContainer.style.visibility = "visible";
}

/* reload page if user chooses to play again */
var playAgain = function() {
  location.reload();
}

/* initialize game when page is loaded */
window.addEventListener("load", initializeGame);
