

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
  sounds = {};

  // Loaded after assets
  player = null;

  constructor(canvas, gameMod, gameMap, scene) {
    this.canvas = canvas;
    this.gameMod = gameMod;
    this.gameMap = gameMap;
    this.scene = scene;

    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  start() {
    console.log("Starting a new game !");
    this.gameState = GameState.IN_GAME;
    this.gameMenu.hide();
    this.player.startPlaying();
  }

  stop() {
    console.log("Sopping current current game !");
    this.showMenu();
  }

  pause() {
    console.log("Pausing the game");
    this.gameState = GameState.PAUSE;
    this.gameMenu.show();
  }

  resume() {
    console.log("Continuing the game");
    this.gameState = GameState.IN_GAME;
    this.gameMenu.hide();
  }

  update() {
    let deltaTime = this.scene.getEngine().getDeltaTime();
    this.player.update(deltaTime);

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
