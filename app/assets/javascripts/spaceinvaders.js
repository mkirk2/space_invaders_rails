
//code.iamkate.com
function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0===a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!==a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};
var alienSprites=["assets/sprites/blue_alien.png","assets/sprites/green_alien.png","assets/sprites/blue_alien2.png","assets/sprites/red_alien.png"];
var playerSprite="assets/sprites/player.png";
var projectileSprite="assets/sprites/projectile.png"
var explosionSprite="assets/sprites/explosion.png"
var playerShootAudio = new Audio('shoot.wav');
var playerHitAudio = new Audio("/audio/explosion.wav");
var alienHitAudio = new Audio("/audio/invaderkilled.wav");
var soundOn = true;
var board; 
var leftBoundary=10;
var rightBoundary=87;
var startingPosY=14;
var startingPosX=12;
var horizontalSpacing=5;
var horizontalOffset=2.5;
var verticalSpacing=8;
var playerSpeed=2;
var playerProjectileSpeed=1.5;
var enemyProjectileSpeed=1;
var cannotShoot=true;
var respawnTime=3000;
//each time the aliens move down this is decreased, when it reaches 0 the game is lost
var downCount=16;
//time in ms that takes for the projectile to update position (less is faster)
var projectileMoveFreq=16;
//Enemy move distance
var moveDistanceX=1;
var moveDistanceY=3;
//Time in ms that it takes for the enemy to move to the right/left
var moveTime=250;
//Number of times that it will move to the left/right before moving down and reversing direction
var moveTurns=25;
// Time in ms that it takes for the enemy to shoot
var shootTime=1800;
//Keeps current move turn
var movesRemaining=moveTurns;
//Number of projectiles instantiated when the game starts
var projectileNumber=15;
var projectiles = new Queue();
reverse=false;
var playerShip;
var enemyShips=[];
var destroyedShips=[];
//game controller vars
var userScore=0;
var highScore=0;
var livesRemaining=3;
var userName='';
var topScore="top_score";
var gameController;
//scores
var topRowScore=50;
var secondRowScore=30;
var thirdRowScore=20;
var bottomRowScore=10;


$(document).ready(function() {
  instantiateProjectiles(projectileNumber);
  instantiateEnemies();
  playerShip=new Player(); 
  gameController=new GameController(livesRemaining);
});

function startEnemies(){
  enemyMoveInterval = setInterval(moveEnemies,moveTime); 
  enemyShootInterval = setInterval(randomShoot,shootTime);  
}

function stopEnemies(){
  clearInterval(enemyMoveInterval);
  clearInterval(enemyShootInterval);
}

function randomShoot(){
  randomEnemy=Math.floor(Math.random()*(enemyShips.length-1));
  if(enemyShips[randomEnemy].alive){    
      enemyShips[randomEnemy].shoot(); 
  }else{
    randomShoot();
  }
}

function checkIncreaseDifficulty(){
  if(destroyedShips.length===24){
    stopEnemies();
    console.log("level 1 increase")
    moveTime-=100;
    shootTime-=500;
    startEnemies();
  }else if(destroyedShips.length===34){
    console.log("level 2 increase")
    stopEnemies();
    moveTime-=25;
    shootTime-=250;
    startEnemies();
  }else if(destroyedShips.length==43){
    console.log("level 3 increase")
    stopEnemies();
    moveTime-=25;
    shootTime-=250;
    startEnemies();
  }
}

document.addEventListener('keydown',function (evt){
  if(evt.which === 37){
    if(playerShip.left<leftBoundary) return;
    playerShip.moveLeft();
  } else if (evt.which === 39){
    if(playerShip.left>rightBoundary) return;
    playerShip.moveRight();
  } else if(evt.which=== 32){ 
      if (!cannotShoot) {
        playerShip.shoot(); 
        if (soundOn) playerShootAudio.play(); 
      }
    }
});

function instantiateProjectiles(projectileNumber){
  for(var i=0;i<projectileNumber;i++){
    projectiles.enqueue(new Projectile());
  }
}

function instantiateEnemies() {
  count = 0;
  for(var j=0;j<4;j++){
    for (var i=0;i<11;i++){
      var offset=0;
      if(j % 2 !== 0) offset=horizontalOffset;
      var enemy=new Enemy(alienSprites[j],toPercentage(startingPosX + horizontalSpacing * i + offset),toPercentage(startingPosY + verticalSpacing * j),i,j);
      enemyShips[count] = enemy; 
      count++;    
    }
  } 
}

function toPercentage(integer){
  return integer+"%";
}

function createGameObject(sprite=""){
  var gameObject = document.createElement("div");
  document.body.appendChild(gameObject);
  var objectSprite = document.createElement("img");
  if(sprite!==""){
    objectSprite.src=sprite;
  }
  gameObject.appendChild(objectSprite);
  gameObject.style.position = "absolute";
  gameObject.style.visibility = "visible"
  return gameObject;
}

function moveEnemies(){
  enemyShips.forEach(function(enemy){
   if(movesRemaining>0){
    currentPosX=parseFloat(enemy.left);
    if(!reverse){        
        enemy.left=toPercentage(currentPosX+moveDistanceX);
      } else {
        enemy.left=toPercentage(currentPosX-moveDistanceX);
      }
    }else{
      currentPosY=parseFloat(enemy.top);
      enemy.top=toPercentage(currentPosY+moveDistanceY);
    }
  });
  movesRemaining--;
  if(movesRemaining<0){
    movesRemaining=moveTurns;
    reverse=!reverse;
    downCount--;
    if(downCount===0){
      livesRemaining=0;
      gameController.updateUI();
      stopEnemies();
    }
  }
}

class Enemy {
  constructor(sprite,xPos,yPos,col,row) {
    this.enemyShip=this.instantiateEnemy(sprite,xPos,yPos,col,row);
  }

  get alive(){    
    return this.enemyShip.style.visibility === "visible";  
  }

  get left() {
    return this.enemyShip.style.left;
  }

  get x() {
    return this.enemyShip.getBoundingClientRect().x;
  }

  get y(){
    return this.enemyShip.getBoundingClientRect().y;
  }

  set left(value) {
    this.enemyShip.style.left=value;
  }

  get top() {
    return this.enemyShip.style.top;
  }

  set top(value) {
    this.enemyShip.style.top=value;
  }

  get width(){
    return this.enemyShip.offsetWidth;
  }

  get height(){
    return this.enemyShip.offsetHeight;
  }

  instantiateEnemy(sprite,xPos,yPos,col,row){
    var enemyShip = createGameObject(sprite);
    enemyShip.style.position = "absolute";
    enemyShip.style.top = yPos;
    enemyShip.style.left = xPos;
    enemyShip.style.zIndex = "-1";
    enemyShip.classList.add('enemy');
    enemyShip.classList.add('row'+row); //enemy row0
    enemyShip.setAttribute('id',"enemy"+col+''+row) //enemy32
    return enemyShip;
  }

  shoot(){ 
    var projectile=projectiles.dequeue();
    projectile.shoot(-1,this.left,this.top,enemyProjectileSpeed);  
  }

  destroy(){
    destroyedShips.push(this);
    this.enemyShip.style.visibility="hidden";
    gameController.addScore(this.enemyShip.className);
    if (soundOn) alienHitAudio.play();
    checkIncreaseDifficulty();   
  }
}

class Player {
  constructor() {
    this.playerShip=this.instantiatePlayer();
  }

  instantiatePlayer(){
    var div = createGameObject(playerSprite);
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    return div;
  }

  start(instance=this){
    if(livesRemaining>0){
      cannotShoot=false;
      instance.playerShip.style.visibility = "visible"
      instance.playerShip.style.top = "85%";
      instance.playerShip.style.left = "50%";
    }
  }

  get alive(){
    return this.playerShip.style.visibility === "visible";
  }

  get left() {
    return parseFloat(this.playerShip.style.left);
  }

  get x() {
    return this.playerShip.getBoundingClientRect().x;
  }

  get y() {
    return this.playerShip.getBoundingClientRect().y;
  }

  get top(){
    return parseFloat(this.playerShip.style.top);
  }

  get width(){
    return this.playerShip.offsetWidth;
  }

  get height(){
    return this.playerShip.offsetHeight;
  }

  moveRight(){
    this.playerShip.style.left = toPercentage(parseFloat(this.playerShip.style.left) + playerSpeed);
  }

  moveLeft(){
    this.playerShip.style.left = toPercentage(parseFloat(this.playerShip.style.left) - playerSpeed);
  }

  shoot(){ 
    if(this.alive){
      var projectile=projectiles.dequeue();
      projectile.shoot(1,toPercentage(parseFloat(playerShip.left)+0.5),toPercentage(parseFloat(playerShip.top)+0.5),playerProjectileSpeed);
      cannotShoot=true;
      
    }
  }

  destroy(){
    this.playerShip.style.visibility="hidden";
    setTimeout(playerShip.start,respawnTime,this);
    livesRemaining--;
    gameController.updateUI();
    if (soundOn) playerHitAudio.play();
  }
}

class Projectile {
  constructor(){
    this.projectile=createGameObject(projectileSprite);
    this.projectile.style.visibility="hidden";
    this.moveProjectileInterval;
  }

  setVisibility(visible){
    if(visible) {
      this.projectile.style.visibility='visible';
    }else {
      this.projectile.style.visibility='hidden';
    }
  }

  get active(){
    return this.projectile.style.visibility === "visible"
  }

  get left() {
    return this.projectile.style.left;
  }

  set left(value){
    this.projectile.style.left=value;
  }
  get top() {
    return this.projectile.style.top;
  }

  get x() {
    return this.projectile.getBoundingClientRect().x;
  }
  
  get y(){
    return this.projectile.getBoundingClientRect().y;
  }

  set top(value){
    this.projectile.style.top=value;
  } 

  get width(){
    return this.projectile.offsetWidth;
  }

  get height(){
    return this.projectile.offsetHeight;
  }

  stop(){
    clearInterval(this.moveProjectileInterval);  
  }

  //moves projectile in the specified direction (1 for up or -1 for down) from the x,y position specified
  shoot(direction,xPos,yPos,speed){   
    this.projectile.style.left = xPos;//
    this.projectile.style.top = yPos; //
    this.projectile.style.visibility ='visible';
    this.moveProjectileInterval=setInterval(this.move,projectileMoveFreq,direction,this,speed);
  }

  move(direction,projectile,speed){
    projectile.top = toPercentage(parseFloat(projectile.top) + speed *-direction); 
    //direction is passed so the function knows if it was shot by a player or an enemy
    projectile.detectCollision(direction,projectile);
  }

  recycleProjectile(projectile){ 
    projectile.setVisibility(false);
    projectile.stop();
    projectiles.enqueue(projectile);   
  }

  detectCollision(direction,projectile){
    if(direction>0){
      enemyShips.forEach(function(element){
      if (isColliding(projectile,element)&&element.alive&&projectile.active) {
        projectile.recycleProjectile(projectile);
        element.destroy();     
        if (direction>0){
          cannotShoot=false;
        }
      }
      });
      if(parseFloat(projectile.top)<1){
        cannotShoot=false;
        projectile.recycleProjectile(projectile)
      }
    }else{
      if (isColliding(projectile,playerShip)&&playerShip.alive&&projectile.active) {
        playerShip.destroy();
        projectile.recycleProjectile();
      }
      if(parseFloat(projectile.top)>99){
        projectile.recycleProjectile(projectile)
      }
    }
  }
}

function isColliding(a, b) {  
  return !(
    ((a.y + a.height) < (b.y)) ||
    (a.y > (b.y + b.height)) ||
    ((a.x + a.width) < b.x) ||
    (a.x > (b.x + b.width))
);
}

class GameController {  
  constructor(startingLives){
    this.updateUI();
  }

  addScore(row){
  switch(row){
      case "enemy row0":
        userScore+=topRowScore
      break
      case "enemy row1":
        userScore+=secondRowScore
      break
      case "enemy row2":
        userScore+=thirdRowScore
      break
      case "enemy row3":
        userScore+=bottomRowScore
      break;
    }
    this.updateUI();
  }
    
  updateUI() {

  document.getElementById("live_score").innerHTML=("Your score: " + userScore); 
  document.getElementById("high_score").innerHTML=("Highest score: " + highScore + " By " + userName);
  document.getElementById("show_lives").innerHTML=("Lives remaining: " + livesRemaining);

  //end game form
    if (livesRemaining === 0 || destroyedShips.length === 44) {
      stopEnemies();
      var show = document.getElementById("top_10_button");
      show.style.visibility = "visible";
      var finalScore = userScore;
      var displayForm = document.getElementById("end_game_display");
      displayForm.style.visibility = "visible";
      document.getElementById("user_score").innerHTML=("Game over! Your score was " + finalScore);
      document.getElementById("score").value=finalScore + "";
    }
  }
}

class Level{
  constructor(){
    }
  }

  function toggleTopTen() {
    var toggle = document.getElementById("show_top_ten_list");
    if (toggle.style.display === "block") {
        toggle.style.display = "none";
    } else {
        toggle.style.display = "block";
    }
}

function toggleSound() {
  var muteToggle = document.getElementById("toggle_sound_button");
    if (soundOn){
    muteToggle.innerHTML="Turn Sound On";
    } else {
    muteToggle.innerHTML="Turn Sound Off";
    }
    soundOn = !soundOn;
}

function initiateGame() {
  playerShip.start();
  startEnemies();
  var hide = document.getElementById("initiate_button");
  hide.style.visibility = "hidden";
  var hide2 = document.getElementById("top_10_button");
  hide2.style.visibility = "hidden";
  var hide3 = document.getElementById("toggle_sound_button");
  hide3.style.visibility = "hidden";
  var hide4 = document.getElementById("show_top_ten_list");
  hide4.style.display = "none";
}

function reload() {
  document.getElementById("restart_button");
  document.location.reload(true);
}