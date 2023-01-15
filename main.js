
const templates = (() => {
    const splashString = `
        <div class="splash-screen">
            <h1>Tic Tac Toe</h1>
            <button>Play Game</button>
        </div>
    `;

    const nameString = `
        <div class="name-screen">
            <h2>What is your name?</h2>
            <input type="text">
            <button>Ready?</button>
        </div>
    `;

    const titleAreaString = `
        <div class="title-area">
            <h1>Tic Tac Toe</h1>
        </div>
    `;

    const scoreAreaString = (aiName, aiScore, playerName, playerScore, curTrial, numOfTrials) => {
        return `
        <div class="score-area">
            <div class="score">
                <span>${aiName}: </span>
                <span>${aiScore}</span>
            </div>
            <div class="game-ctr">
                <span>Game ${curTrial}/${numOfTrials}</span>
            </div>
            <div class="score">
                <span>${playerName}: </span>
                <span>${playerScore}</span>
            </div>
        </div>
        `;
    };

    const boardString = `
        <table class="board">
            <tbody>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    `;

    const controlAreaString = `
        <div class="control-area">
            <button>Restart Game</button>
            <button>Leave Game</button>
        </div>
    `;

    const resultAreaString = (aiName, aiScore, playerName, playerScore, winnerName) => {
        return `
        <div class="result-area">
            <h1>Tic Tac Toe</h1>
            <h2>Final Score</h2>
            <ul>
                <li>
                    <span>${aiName}</span>
                    <span>${aiScore}</span>
                </li>
                <li>
                    <span>${playerName}</span>
                    <span>${playerScore}</span>
                </li>
            </ul>
            <h3>${winnerName} Wins!</h3>
            <div class="result-buttons">
                <button>Play Again</button>
                <button>Quit</button>
            </div>
        </div>
        `;
    };

    const roundEndString = (i, msg) => {
        return `
        <div class="round-end">
            <h2>Round ${i} Over!</h2>
            <span>${msg}</span>
        </div>
        `;
    };


    return {
        splashString,
        nameString,
        titleAreaString,
        scoreAreaString,
        boardString,
        controlAreaString,
        resultAreaString,
        roundEndString
    };
})();


const startScreen = (() => {

    const init = function() {
        document.querySelector('.game-area').classList.remove('game-grid');
        document.querySelector('.game-area').classList.remove('result-grid');
        document.querySelector('.game-area').classList.add('splash-grid');

        document.querySelector('.game-area').innerHTML = `
            ${templates.splashString}
        `;
        document.querySelector('.game-area .splash-screen button')
            .addEventListener('click', e => {
                nameScreen.init();
            });
    };

    return {
        init
    };
})();


const nameScreen = (() => {

    const init = function() {
        document.querySelector('.game-area').classList.remove('game-grid');
        document.querySelector('.game-area').classList.add('splash-grid');

        document.querySelector('.game-area').innerHTML = `
            ${templates.nameString}
        `;

        const nameScreen = document.querySelector('.game-area .name-screen');
        nameScreen.querySelector('button')
            .addEventListener('click', e => {
                let val = document.querySelector('input').value.trim();
                if (val !== '' && val.toLowerCase() !== 'computer') {
                    game.start(val);
                }
            });
    };

    return {
        init
    };
})();


const game = (() => {
    // Private Constants ------------------------------------
    const _trials = 3;

    const _gameBoard = (() => {
        // Private Variables
        let _board = null;

        // Public Constants
        const getBoard = () => _board;
        const setBoard = (b) => _board = b;

        const init = function() {
            _board = Array.from(Array(3), () => new Array(3));
            let gameArea = document.querySelector('.game-area');
            gameArea.classList.remove('splash-grid');
            gameArea.classList.remove('result-grid');
            gameArea.classList.add('game-grid');

            gameArea.innerHTML = `
            ${templates.titleAreaString}
            ${
                templates.scoreAreaString(
                    _aiPlayer.getName(),
                    _aiPlayer.getScore(),
                    _userPlayer.getName(),
                    _userPlayer.getScore(),
                    _curTrial,
                    _trials
                )
            }
            ${templates.boardString}
            ${templates.controlAreaString}
            `;

            gameArea.querySelector('.control-area button:first-of-type')
                .addEventListener('click', e => {
                    start(_userPlayer.getName());
                });

            gameArea.querySelector('.control-area button:last-of-type')
                .addEventListener('click', e => {
                    startScreen.init();
                });

            const cells = document.querySelectorAll('.game-area .board td');
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                cell.addEventListener('click', async (e) => {
                    if (cell.innerHTML === '') {
                        await _performRound(cell, gameArea);
                    }
                });
            }
        };

        const isBoardFull = function () {
            let isFull = true;

            for (let i = 0; i < _board.length; i++) {
                for (let j = 0; j < _board[i].length; j++) {
                    if (typeof _board[i][j] === 'undefined') {
                        isFull = false;
                    }
                }
            }

            return isFull;
        }

        return {
            init,
            getBoard,
            setBoard,
            isBoardFull
        };
    })();

    const _player = (n, c, isAi) => {
        // Private Constants
        const _charMark = c;
        const _name = n;
        const _isAi = isAi;


        // Private Variables
        let _score = 0;


        // Public Constants
        const getName = () => _name;
        const getScore = () => _score;
        const getCharMark = () => _charMark;
        const isAiPlayer = () => _isAi;
        const resetScore = () => _score = 0;
        const incrementScore = () => _score += 1;

        const userMarkBoard = function (cell) {
            let row = cell.closest('tr').rowIndex;
            let col = cell.cellIndex;

            cell.innerHTML = `<span>${_charMark}</span>`;
            _gameBoard.getBoard()[row][col] = _charMark;
        };

        const aiMarkBoard = function (gameArea) {
            let keepTrying = true;
            let row = null;
            let col = null;

            while (keepTrying) {
                row = Math.floor(Math.random() * 3);
                col = Math.floor(Math.random() * 3);

                if (typeof _gameBoard.getBoard()[row][col] === 'undefined') {
                    _gameBoard.getBoard()[row][col] = _charMark;
                    gameArea.querySelector('.board').rows[row].cells[col].innerHTML = `<span>${_charMark}</span>`;
                    keepTrying = false;
                }
            }
        };

        const isWinner = function () {
            // TODO: Find an algo to do this
            let wonGame = false;
            let b = _gameBoard.getBoard();

            let possibilities = [
                [b[0][0], b[0][1], b[0][2]],
                [b[1][0], b[1][1], b[1][2]],
                [b[2][0], b[2][1], b[2][2]],
                [b[0][0], b[1][0], b[2][0]],
                [b[0][1], b[1][1], b[2][1]],
                [b[0][2], b[1][2], b[2][2]],
                [b[0][0], b[1][1], b[2][2]],
                [b[2][0], b[1][1], b[0][2]]
            ];

            for (let i = 0; i < possibilities.length; i++) {
                let sum = 0;
                for (let j = 0; j < possibilities[i].length; j++) {
                    if (possibilities[i][j] === _charMark) {
                        sum++;
                    }
                }
                if (sum === 3) {
                    wonGame = true;
                    break;
                }
            }

            return wonGame;
        }

        return {
            getName,
            getScore,
            getCharMark,
            isAiPlayer,
            isWinner,
            resetScore,
            incrementScore,
            userMarkBoard,
            aiMarkBoard
        };
    };

    const _performRound = async function (cell, gameArea) {
        let winnerFound = false;

        if (!_gameBoard.isBoardFull()) {
            _userPlayer.userMarkBoard(cell);
            winnerFound = _userPlayer.isWinner();
        }

        if (!_gameBoard.isBoardFull() && !winnerFound) {
            await new Promise(r => setTimeout(r, 500));
            _aiPlayer.aiMarkBoard(gameArea);
            winnerFound = _aiPlayer.isWinner();
        }

        if (winnerFound) {
            if (_userPlayer.isWinner()) {
                _userPlayer.incrementScore();
            } else if (_aiPlayer.isWinner()) {
                _aiPlayer.incrementScore();
            }
            await _nextRound(false);

        } else if (_gameBoard.isBoardFull()) {
            await _nextRound(true);
        }
    };

    const _nextRound = async function (isDraw) {
        let message = '';
        let winnerName = null;
        let cur = _curTrial;
        let gameArea = document.querySelector('.game-area');

        if (isDraw) {
            message = 'The result is a DRAW! Repeat Round!'
        } else {
            if (_userPlayer.isWinner()) {
                winnerName = _userPlayer.getName();
                message = `${_userPlayer.getName()} wins round!`;
            } else if (_aiPlayer.isWinner()) {
                winnerName = _aiPlayer.getName();
                message = `${_aiPlayer.getName()} wins round!`;
            }
            _curTrial++;
        }

        if (_curTrial <= _trials) {
            gameArea.classList.remove('game-grid');
            gameArea.classList.add('result-grid');
            gameArea.innerHTML = `
                ${templates.titleAreaString}
                ${
                    templates.roundEndString(cur, message)
                }   
            `;

            await new Promise(r => setTimeout(r, 1000));

            _gameBoard.init();
        } else {
            gameArea.classList.remove('game-grid');
            gameArea.classList.add('splash-grid');
            gameArea.innerHTML = `
                ${
                    templates.resultAreaString(
                        _aiPlayer.getName(),
                        _aiPlayer.getScore(),
                        _userPlayer.getName(),
                        _userPlayer.getScore(),
                        winnerName
                    )
            }   
            `;

            gameArea.querySelector('.result-buttons button:first-of-type')
                .addEventListener('click', e => {
                    start(_userPlayer.getName());
                });

            gameArea.querySelector('.result-buttons button:last-of-type')
                .addEventListener('click', e => {
                    startScreen.init();
                });
        }

    };

    // Private Variables ------------------------------------
    let _curTrial = null;
    let _userPlayer = null;
    let _aiPlayer = null;


    // Public Constants -------------------------------------
    const start = function (username) {
        _curTrial = 1;
        _userPlayer = _player(username, 'X');
        _aiPlayer = _player('Computer', 'O');
        _gameBoard.init();
    };


    return {
        start
    }
})();


startScreen.init();


