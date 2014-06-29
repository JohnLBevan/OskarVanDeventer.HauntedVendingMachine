
window.onload = function () {
    var board = new Game('gameid');
    board.applyBackground();
    var h = (board.h - 60) / 3;
    var w = 10;
    var x = board.w / 8;
    var y = 20;

    board.addWall(2 * x, y, w, h);
    board.addWall(4 * x, y, w, h);
    board.addWall(6 * x, y, w, h);
    y = y + h;
    board.addWall(1 * x, y, w, h);
    board.addWall(3 * x, y, w, h);
    board.addWall(5 * x, y, w, h);
    board.addWall(7 * x, y, w, h);
    y = y + h;
    board.addWall(2 * x, y, w, h);
    board.addWall(4 * x, y, w, h);
    board.addWall(6 * x, y, w, h);

    EventManager.addEventListener(board.board, 'keypress', keyPressHandler); //board.board to attach to canvas, document.body to attach to the rest
    KeyPressHandler.addKeyListener('1', function () { board.addCoin(getCoinXPosition(1, 4, board.w), getCoinYPosition(board.h), 20); });
    KeyPressHandler.addKeyListener('2', function () { board.addCoin(getCoinXPosition(2, 4, board.w), getCoinYPosition(board.h), 20); });
    KeyPressHandler.addKeyListener('3', function () { board.addCoin(getCoinXPosition(3, 4, board.w), getCoinYPosition(board.h), 20); });
    KeyPressHandler.addKeyListener('4', function () { board.addCoin(getCoinXPosition(4, 4, board.w), getCoinYPosition(board.h), 20); });
    board.focus();
}

//todo: consider best place to refactor these to
function getCoinXPosition(coinNo, noCoins, width) {
    //figure out a good dynamic algorithm; currently hardcoded to 4
    //var spacing = width / (noCoins + 1);
    //var offset = spacing / 2;
    //return spacing * coinNo;
    var x = 0;
    switch (coinNo) {
        case 1: x = 200; break;
        case 2: x = 250; break;
        case 3: x = 350; break;
        default: x = 400; break;
    }
    return x;
}
function getCoinYPosition(height) {
    return height / 10;
}

//event manager

    var EventManager = [];
    EventManager.addEventListener = function (obj, event, handler) {
        event = event || '';
        handler = handler || function (e) { };
        if (obj.addEventListener) {
            obj.addEventListener(event, handler, false);
        }
        else {
            obj.attachEvent('on' + event, handler);
        }
    };

//key press handler

    function keyPressHandler(e) {
        e = e || window.event;
        var char = String.fromCharCode(e.keyCode); 
        KeyPressHandler.doAction(char);
    }
    var KeyPressHandler = {};
    KeyPressHandler.keyListeners = {};
    KeyPressHandler.addKeyListener = function (key, func) { this.keyListeners[key] = func; };
    KeyPressHandler.doAction = function (key) {
        var func = this.keyListeners[key] || function () { };
        func();
    };

//game board setup

    function Game(id) {
        this.drawn = false;
        this.animate = false;
        this.board = document.getElementById(id);
        canvasToStyleSize(this.board);
        this.context = this.board.getContext('2d');
        this.h = this.board.height || this.board.scrollHeight;
        this.w = this.board.width || this.board.scrollWidth;
        this.coins = [];
        this.switches = [];
        this.walls = [];
        var me = this;
        setInterval(function () { me.draw(); }, 30);
    }
    Game.prototype = {

        applyBackground: function () {
            var gameContext = this.context;
            var gradient = gameContext.createLinearGradient(0, 0, 0, this.h);
            gradient.addColorStop(0, '#99ff99');
            gradient.addColorStop(1, '#003300');
            gameContext.fillStyle = gradient;
            gameContext.fillRect(0, 0, this.w, this.h);
        }

        , addCoin: function (x,y,r,c) {
            var coin = new Coin(x, y, r, c);
            this.coins.push(coin);
            this.drawn = false;
        }
        , addWall: function (x, y, w, h, f) {
            var wall = new Wall(x, y, w, h, f);
            this.walls.push(wall);
            this.drawn = false;
        }
        , addSwitch: function (x, y, r, c) {
            var aSwitch = new Switch(x, y, r, c);
            this.switches.push(aSwitch);
            this.drawn = false;
        }

        , draw: function () {
            if (!this.drawn) { //todo:refactor below code to reduce duplication
                for (var i = 0; i < this.walls.length; i++) {
                    var wall = this.walls[i];
                    wall.draw(this.context);
                }
                for (var i = 0; i < this.switches.length; i++) {
                    var aSwitch = this.switches[i];
                    aSwitch.draw(this.context);
                }
                for (var i = 0; i < this.coins.length; i++) {
                    var coin = this.coins[i];
                    coin.draw(this.context);
                }
                //this.context.stroke();
                //this.context.fill();
                this.drawn = true;
            }
        }

        , focus: function () {
            this.board.focus();
        }

    }
    function canvasToStyleSize(canvas) {
        var canvasStyle = getComputedStyle(canvas);
        canvas.height = parseFloat(canvasStyle.height, 10);
        canvas.width = parseFloat(canvasStyle.width, 10);
    }

//coin logic

    function Coin(x, y, r, f) {
        this.drawn = false;
        this.x = x || 0; //horizontal position (centre of coin)
        this.y = y || 0; //vertical position
        this.r = r || 1; //radius
        this.f = f || 'yellow'; //colour / fill
    }

    Coin.prototype = {
        draw: function (context) {
            if (!this.drawn) {
                context.beginPath();
                context.fillStyle = this.f;
                context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                context.closePath();
                context.stroke();
                context.fill();
                this.drawn = true;
            }
        }
        , move: function () {
            this.y++;
            this.drawn = false;
        }
    }

//wall logic

    function Wall(x, y, w, h, f) {
        this.drawn = false;
        this.x = x || 0  //top left (h)
        this.y = y || 0; //top left (v)
        this.w = w || 1; //width
        this.h = h || 1; //height
        this.f = f || 'black';
        this.x = this.x - this.w / 2;
    }
    Wall.prototype = {
        draw: function (context) {
            if (!this.drawn) {
                //context.beginPath();
                context.fillStyle = this.f;
                context.fillRect(this.x, this.y, this.w, this.h);
                //context.drawRec(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                //context.closePath();
                //context.stroke();
                //context.fill();
                this.drawn = true;
            }
        }
    }


    //switch logic

    function Switch(x, y, w, h, t, f) {
        this.drawn = false;
        this.toggle = t || false;
        this.x = x || 0  //top left (h)
        this.y = y || 0; //top left (v)
        this.w = w || 1; //width
        this.h = h || 1; //height
        this.f = f || 'black';
    }
    Switch.prototype = {
        draw: function (context) {
            if (!this.drawn) {
                //todo: put in code to draw a switch
                //context.beginPath();
                context.fillStyle = this.f;
                context.fillRect(this.x, this.y, this.w, this.h);
                //context.drawRec(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                //context.closePath();
                //context.stroke();
                //context.fill();
                this.drawn = true;
            }
        }
        , throwToggle: function () {
            this.toggle = !this.toggle;
            this.drawn = false;
        }
    }