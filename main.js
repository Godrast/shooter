let scope = {};

((scope, $) => {

    let defaultWidth = 1000,
        defaultHeight = 700,
        scale = 1;

    let canvas,
        canvasContext,
        grid = 10;



    let playerWidth,
        playerHeight,
        playerX,
        playerY,
        player = [new Image()],
        currentPlayerSprite = 0,
        ghostSpriteDefaultAlpha = 170,
        ghostTimer,
        ghostImage = new Image(),
        ghostWidth,
        ghostHeight,
        ghosts = [],
        ghostSpeed = 3,
        ghostVanishSpeed = 3,
        diffInWidth;

    /*
    let shootAnimationFps = 45,
    	charNumberOfFrames = 16,
    	handsUp = [],
    	isAnimationOn = false,
    	animationUpInterval;
    */



    let bulletRadius = 4,
        bulletSize,
        bulletImage = new Image(),
        bulletSpeed = 6,
        bulletDelay = 250,
        bulletTest = true,
        bullets = [];


    let enemies = [],
        minNumOfEnemies = 1,
        maxNumOfEnemies = 2,
        minEnemySpeed = 1.8,
        maxEnemySpeed = 2.7,
        enemyDelay = 850;

    //let enemyColors=['red', 'yellow', 'blue', 'purple', 'orange'];

    let killedEnemies = 0,
        highscore = 0,
        lifes = 50,
        keys = [];

    let fps = 45;

    let mineTimer,
        enemyTimer,
        gameRunning = true;


    let background = new Image(),
        enemyFrames = [],
        enemyFramesTimer,
        enemyFramesUpdate = 10,
        numberOfFrames = 10,
        enemyRadius,
        isEnemySizeSet = false;



    let defaultSizeScale = 1.35;
    //let cookiesDays=30;








    //move the game above the ads
    //this no longer makes sense, it should be just created in the html file, but it was done like this, so the ads don't appear above the game and make it a lot harder to play
    //this pushed the game above the ads so it's nto required to scroll down if the ads were too big
    function moveGame() {
        $('body').prepend('<center><canvas id="myCanvas"></canvas><!--</br><span style="font-size:17; font-weight:bold;">All design credits go to Merryawe.<span></br></br>--></center>');
        //$('.cbalink').remove();
    }

    //not used anymore
    /*
    function rakProof(){
    	let elem=document.getElementById("bmone2n-7482.1.1.30");
    	elem.parentNode.removeChild(elem);
    	elem=document.getElementsByClassName("cbalink");
    	elem[0].parentNode.removeChild(elem[0]);
    	elem=document.body.childNodes[5];
    	elem.parentNode.removeChild(elem);
    }
    */

    //magic starts here
    $('document').ready(function() {
        /*
        if(document.cookie.match(/; highscore=(\d+)/)){
        	highscore=document.cookie.match(/; highscore=(\d+)/)[1];
        }
        */
        getImages();
        setEvents();
        moveGame();
        canvas = document.getElementById('myCanvas');
        canvasContext = canvas.getContext('2d');
        resizeEverything();
        //canvas.addEventListener("click", onClick, false);
        mainTimer = setInterval(game, 1000 / fps);
        enemyTimer = setInterval(spawnEnemies, enemyDelay);
        enemyFramesTimer = setInterval(changeFrames, 1000 / enemyFramesUpdate);
        //rakProof();
    });



    function restart() {
        if (!gameRunning) {
            gameRunning = true;
            enemies = [];
            bullets = [];
            killedEnemies = 0;
            lifes = 5;
            playerX = (canvas.width - playerWidth) / 2;
            playerY = canvas.height - playerHeight;
            mainTimer = setInterval(game, 1000 / fps);
            enemyTimer = setInterval(spawnEnemies, enemyDelay);
        }
    }







    //EVERYTHING
    function game() {
        /*
        canvasContext.fillStyle = 'grey';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        */



        //background
        canvasContext.drawImage(background, 0, 0);



        //enemies + collision
        for (let i = enemies.length - 1; i >= 0; i--) {
            let enemy = enemies[i];
            /*
            canvasContext.fillStyle=enemy.color;
            canvasContext.beginPath();
            canvasContext.ellipse(enemy.x, enemy.y, enemyWidth, enemyHeight, 0, 0,2*Math.PI);
            canvasContext.fill();
            */
            canvasContext.drawImage(enemyFrames[enemy.frame], enemy.x - enemyRadius, enemy.y - enemyRadius, enemyRadius * 2, enemyRadius * 2);

            enemy.y += enemy.speed;
            if (enemy.y > canvas.height + enemyRadius) {
                enemies.splice(i, 1);
                lifes--;
                spawnGhost();
                if ((lifes + parseInt(killedEnemies / 50)) < 1) {
                    if (killedEnemies > highscore) {
                        highscore = killedEnemies;
                        //document.cookie="highscore="+highscore+"; expires="+cookiesDays*86400000;
                    }

                    gameRunning = false;

                }
                continue;
            }



            for (let j = bullets.length - 1; j >= 0; j--) {
                if (detectCollision(enemy, bullets[j])) {
                    bullets.splice(j, 1);
                    enemies.splice(i, 1);
                    killedEnemies++;
                    break;
                };
            }

        }


        //ghosts
        for (let i = ghosts.length - 1; i >= 0; i--) {
            let ghost = ghosts[i];

            canvasContext.save();
            canvasContext.globalAlpha = (ghostSpriteDefaultAlpha - ghost.counter) / 255;
            canvasContext.drawImage(ghostImage, ghost.x - diffInWidth, ghost.y, ghostWidth, ghostHeight);
            canvasContext.restore();

            ghost.counter += ghostVanishSpeed;
            ghost.y -= ghostSpeed;
            if (ghost.counter >= ghostSpriteDefaultAlpha) {
                ghosts.splice(i, 1);
            }
        }

        //player
        move();
        /*
        canvasContext.fillStyle = 'lightgreen';
        canvasContext.fillRect(playerX, playerY, playerWidth, playerHeight);
        */
        canvasContext.drawImage(player[currentPlayerSprite], playerX, playerY, playerWidth, playerHeight);



        //bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            let bullet = bullets[i];
            canvasContext.drawImage(bulletImage, bullet.x - bulletSize / 2, bullet.y - bulletSize / 2, bulletSize, bulletSize);
            /*
            canvasContext.beginPath();
            canvasContext.ellipse(bullet.x - bulletRadius/2, bullet.y - bulletRadius/2, bulletRadius, bulletRadius, 0, 0,2*Math.PI);
            canvasContext.fill();
            */
            bullet.y -= bulletSpeed;
            if (bullet.y < -bulletRadius) {
                bullets.splice(i, 1);
            }
        }




        //overlay

        canvasContext.font = 30 * scale + "px Arial";
        canvasContext.fillStyle = 'lightblue';
        canvasContext.textAlign = 'left';
        canvasContext.fillText(killedEnemies, 10, 30);
        canvasContext.textAlign = 'right';
        canvasContext.fillStyle = 'red';
        canvasContext.fillText(lifes + parseInt(killedEnemies / 50), canvas.width - 10, 30);



        // reset?
        if (!gameRunning) {
            clearInterval(enemyTimer);
            clearInterval(mainTimer);
            canvasContext.fillStyle = 'white';
            canvasContext.font = '70px Arial';
            canvasContext.textAlign = 'center';
            let txt = 'GAME OVER\nCurrent score: ' + killedEnemies + '\nHighscore: ' + highscore + '\nPress R to restart.';
            let lineheight = 75;
            let lines = txt.split('\n');

            for (let i = 0; i < lines.length; i++) {
                canvasContext.fillText(lines[i], canvas.width / 2, canvas.height / 2 + (i * lineheight) - lineheight * lines.length / 2);
            }
        }


    }




    //get all images and frames
    function getImages() {
        background.src = './images/tlo2.jpg';

        bulletImage.onload = function() {
            bulletSize = this.width * scale;
        }
        bulletImage.src = './images/bullet.png';

        player[0].onload = function() {
            playerWidth = (this.width / defaultSizeScale) * scale;
            playerHeight = (this.height / defaultSizeScale) * scale;

            playerX = (canvas.width - playerWidth) / 2;
            playerY = canvas.height - playerHeight;
        }

        player[0].src = './images/char1.png';
        player.push(new Image());
        player[1].src = './images/charAnimation/1 (16).png';

        /*
        for(let i=1; i<=charNumberOfFrames; i++){
        	let temp = new Image();
        	temp.src = './images/charAnimation/1 ('+i+').png';
        	handsUp.push(temp);
        }
        */
        ghostImage.onload = function() {
            ghostWidth = (this.width / defaultSizeScale) * scale;
            ghostHeight = (this.height / defaultSizeScale) * scale;
            diffInWidth = (ghostWidth - playerWidth) / 2;
        }
        ghostImage.src = './images/ghost.png';


        for (let i = 1; i <= numberOfFrames; i++) {
            let temp = new Image();
            if (!isEnemySizeSet) {
                isEnemySizeSet = true;
                temp.onload = function() {
                    enemyRadius = (this.width / defaultSizeScale) / 2 * scale;
                    //enemyHeight=this.height;
                }

            }

            temp.src = './images/' + i + '.png';
            enemyFrames.push(temp);
        }



    }



    //change frames of enemies
    function changeFrames() {
        enemies.map(enemy => enemy.frame = (++enemy.frame) % numberOfFrames);
    }






    function spawnEnemies() {
        let numOfEnemies = parseInt(Math.random() * (((maxNumOfEnemies - minNumOfEnemies + 1) + parseInt(killedEnemies / 50)))) + minNumOfEnemies;
        for (let i = 0; i < numOfEnemies; i++) {
            //let color=enemyColors[parseInt(Math.random()*enemyColors.length)];
            enemies.push({ x: parseInt(Math.random() * canvas.width), y: 0, speed: (parseInt(Math.random() * (maxEnemySpeed - minEnemySpeed + 1) * 10) / 10 + minEnemySpeed) * scale, frame: 0 });
            enemy = enemies[enemies.length - 1];
            /*
            canvasContext.fillStyle=enemy.color;
            canvasContext.beginPath();
            canvasContext.ellipse(enemy.x, enemy.y, enemyWidth, enemyHeight, 0, 0,2*Math.PI);
            canvasContext.fill();
            */
            canvasContext.drawImage(enemyFrames[enemy.frame], enemy.x - enemyRadius, enemy.y - enemyRadius, enemyRadius * 2, enemyRadius * 2);


        }

    }


    //movement function, also adds bullets to array
    function move() {
        keys.map(key => {
            switch (key) {

                /*	
				case 38:
					if(playerY>0){
						playerY-=grid;
					}
					break;
			
				case 40:
					if(playerY<(canvas.height-playerHeight)){
						playerY+=grid;
					}
					break;
				*/

                case 37:
                    if (playerX > 0 - playerWidth / 2) {
                        playerX -= grid;
                    }
                    break;


                case 39:
                    if (playerX < (canvas.width - playerWidth / 2)) {
                        playerX += grid;
                    }
                    break;


                case 32:
                    if (bulletTest) {
                        bullets.push({ x: playerX + playerWidth / 2, y: playerY + 20 * scale });
                        bulletTest = false;
                        currentPlayerSprite = 1;
                        setTimeout(function() {
                            bulletTest = true;
                        }, bulletDelay);
                    }
                    break;
            }
        });
    }

    //set all events
    function setEvents() {
        document.onkeydown = function(e) {
            e = e || event;
            let keycode = e.keyCode;
            if (keycode == 32 || (keycode >= 37 && keycode <= 40)) {
                e.preventDefault();
                if (keycode == 32) {
                    //currentPlayerSprite=1;
                }
            }
            if (e.key == "r" || e.key == "R") {
                restart();
            }
            let index = keys.indexOf(e.keyCode);
            if (index == -1) {
                keys.push(e.keyCode);
            }
        }
        document.onkeyup = function(e) {
            e = e || event;
            let index = keys.indexOf(e.keyCode);
            if (e.keyCode == 32) {
                currentPlayerSprite = 0;
            }
            keys.splice(index, 1);
        }

        /*
        document.onclick = function(e){
        	e=e||event;
        	
        	if(bulletTest){
        			bullets.push({x:playerX+playerWidth/2, y:playerY + 20*scale});
        			bulletTest=false;
        			currentPlayerSprite=1;
        			setTimeout(function(){
        				bulletTest = true;
        			}, bulletDelay);
        		}
        	
        }
        */


    }


    //i guess that's needed
    function resizeEverything() {
        scale = Math.max(0.5, Math.min(1.3, Math.min((window.innerHeight - 100) / defaultHeight, (window.innerWidth - 100) / defaultWidth)));
        canvas.width = defaultWidth * scale;
        canvas.height = defaultHeight * scale;
        grid *= scale;
        minEnemySpeed *= scale;
        maxEnemySpeed *= scale;
        //enemyRadius*=scale;
        bulletRadius *= scale;
        playerWidth *= scale;
        playerHeight *= scale;
        bulletSpeed *= scale;
        ghostSpeed *= scale;
        //playerY = canvas.height-playerHeight;
        //playerX=Math.max(0,canvas.width-distFromRight);
        //console.log(scale);

    }


    function spawnGhost() {
        ghosts.push({ x: playerX, y: playerY, counter: 0 });

    }


    //IT WORKS!
    function detectCollision(element1, element2) {
        let dx = element1.x - element2.x;
        let dy = element1.y - element2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return (distance <= (enemyRadius + bulletRadius))

    }







})(scope, jQuery);