

const GameState = {
  LOADING : 0,
  MENU : 1,
  IN_GAME : 2,
  PAUSE: 3
};

export default class Game {

  canvas = null;
  gameMenu = null;
  gameMod = null;
  gameMap = null;
  gameState = GameState.LOADING;

  scene = null;

  // Camera in rotation for main menu
  menuCamera = null;

  // Loaded assets from AssetsManager
  images = {};
  textures = {};
  meshes = {};
  particleSystems = {};
  skeletons = {};
  sounds = {};

  // Loaded after assets
  player = null;

  physicsImpostors = [];

  config = {
    core: null,
    player : null
  };

  constructor(canvas, gameMod, gameMap, scene, gameConfig, playerConfig) {
    this.canvas = canvas;
    this.gameMod = gameMod;
    this.gameMap = gameMap;
    this.scene = scene;
    this.config.core = gameConfig;
    this.config.player = playerConfig;

    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("pointerlockchange", this.pointerLockChange.bind(this), false);
    document.addEventListener("mspointerlockchange", this.pointerLockChange.bind(this), false);
    document.addEventListener("mozpointerlockchange", this.pointerLockChange.bind(this), false);
    document.addEventListener("webkitpointerlockchange", this.pointerLockChange.bind(this), false);
  }

  getPlayerConfig() {
    return this.config.player;
  }

  start() {
    console.log("Starting a new game !");
    this.player.startPlaying();
    this.gameState = GameState.IN_GAME;
    this.gameMenu.hide();
    this.requestPointerLock(this.canvas);
  }

  stop() {
    console.log("Sopping current current game !");
    this.showMenu();
  }

  pause() {
    console.log("Pausing the game");
    this.gameState = GameState.PAUSE;
    this.player.stopPlaying();

    this.gameMenu.show();
  }

  resume() {
    console.log("Continuing the game");

    this.gameState = GameState.IN_GAME;
    this.gameMenu.hide();
    //this.player.camera.attachControl(this.canvas);
    this.requestPointerLock(this.canvas);
  }

  update() {
    let deltaTime = this.scene.getEngine().getDeltaTime();
    //this.player.update(deltaTime);

    // switch(this.gameState) {
    //   case GameState.IN_GAME:
    //
    //     break;
    //   case GameState.LOADING: break;
    //   case GameState.MENU:
    //   case GameState.PAUSE:
    // }

  }

  showMenu() {
    this.gameState = GameState.MENU;
    this.scene.activeCamera = this.menuCamera;
    this.scene.beginAnimation(this.menuCamera, 0, 200, true);
    this.gameMenu.show();
  }

  pointerLockChange() {
    if (this.gameState !== GameState.IN_GAME)
      return;
    let canvas = this.canvas;
    let controlEnabled = (document.mozPointerLockElement === canvas
      || document.webkitPointerLockElement === canvas
      || document.msPointerLockElement === canvas
      || document.pointerLockElement === canvas);
    if (!controlEnabled) {
      // ESC has been clicked : the mouse pointer appears and we need to pause the game
      this.pause();
    }
  };

  requestPointerLock(canvas) {
    canvas.requestPointerLock =
      canvas.requestPointerLock ||
      canvas.msRequestPointerLock ||
      canvas.mozRequestPointerLock ||
      canvas.webkitRequestPointerLock;
    if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    } else {
      console.log("/!\\ No pointer lock possible, please use a real browser");
    }
  }

  // ESCAPE-27 - ENTER-13
  onKeyUp(event) {
    switch(this.gameState) {
      case GameState.LOADING: break;
      case GameState.MENU:
        switch(event.keyCode) {
          case 13:
            this.start();
            break;
        }
        break;
      case GameState.IN_GAME:
        switch(event.keyCode) {
          case 27:
            this.pause();
            break;
        }
        break;
      case GameState.PAUSE:
        switch(event.keyCode) {
          case 27:
            this.resume();
            break;
        }
        break;
    }
  }
}
//
// export {
//   Game2
// }
