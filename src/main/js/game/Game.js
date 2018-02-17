

export default class Game {

  canvas = null;
  gameMod = null;
  gameMap = null;
  scene = null;

  // Loaded assets from AssetsManager
  images = {};
  textures = {};
  meshes = {};

  constructor(canvas, gameMod, gameMap, scene) {
    this.canvas = canvas;
    this.gameMod = gameMod;
    this.gameMap = gameMap;
    this.scene = scene;
  }

  start() {
    console.log("start");
  }

}
//
// export {
//   Game2
// }
