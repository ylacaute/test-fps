import * as BABYLON from 'babylonjs';
import FPSMod from "game/mods/FPSMod";
import ArenaMap from 'game/maps/ArenaMap';
import SandBoxMap from 'game/maps/SandBoxMap';
import Game from "game/Game";
import Player from "game/player/Player";
import GameMenu from "game/GameMenu";
import Helper from "game/Helper";
import PlayerConfig from "game/player/PlayerConfig";
import MapBuilder from "game/builder/MapBuilder";

class GameLoader {

  mapBuilder = null;

  // we always load FPSMod and ArenaMap for now
  load(canvas, gameConfig) {
    console.log("Loading game, mod = " + gameConfig.mod + ", map = " + gameConfig.map);
    let scene = this.createScene(canvas, gameConfig.debug);
    let map = new SandBoxMap();
    let game = new Game(canvas, new FPSMod(), map, scene, gameConfig, new PlayerConfig());
    this.mapBuilder = new MapBuilder(game);


    let assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onFinish = this.onAllAssetsLoaded.bind(this, game);
    this.loadAssets(assetsManager, game);

    window.addEventListener("contextmenu", function (e) { e.preventDefault();	});
  }

  onAllAssetsLoaded(game) {
    console.log("All assets loaded");
    this.enablePhysics(game.scene, game.gameMod.gravity);

    this.mapBuilder.build(game.gameMap);
    //game.gameMap.populateScene(game);

    console.log("Scene populated successfully");
    game.gameMenu = new GameMenu(game.scene, () => {
      game.start();
    });
    game.menuCamera = this.createMenuCamera(game.scene);
    game.player = this.createPlayer(game);
    game.showMenu();

    game.scene.executeWhenReady(() => {
      game.scene.getEngine().runRenderLoop(() => {
        game.scene.render();
        game.update();
      });
    });
  }

  createScene(canvas, isDebug) {
    console.log("Creating scene...");
    let engine = this.createEngine(canvas);
    let scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    scene.clearColor = new BABYLON.Color3(0, 0, .2);
    BABYLON.Engine.ShadersRepository = "shaders/";
    if (isDebug) {
      Helper.showAxis(scene, 20);
    }
    console.log("Scene created successfully");
    return scene;
  }

  enablePhysics(scene, gravity) {
    scene.enablePhysics(new BABYLON.Vector3(0, gravity, 0), new BABYLON.CannonJSPlugin());
  }




  createMenuCamera(scene) {
    let position = new BABYLON.Vector3(0, 20, 0);
    let menuCamera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 4, Math.PI / 4, position, scene);
    menuCamera.fov = Math.PI / 2;

    let menuCameraAnimation = new BABYLON.Animation("death", "alpha", 20,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE, true);
    menuCameraAnimation.setKeys([{
        frame: 0,
        value: 0
      }, {
        frame: 200,
        value: Math.PI * 2
      }]);
    menuCamera.animations.push(menuCameraAnimation);
    return menuCamera;
  }

  createEngine(canvas) {
    let engine = new BABYLON.Engine(canvas, true);
    window.addEventListener("resize", function () {
      if (engine) {
        engine.resize();
      }
    },false);
    return engine;
  }

  createPlayer(game) {
    return new Player(game);
  }

  loadAssets(assetsManager, game) {
    this.loadMapAssets(assetsManager, game, game.gameMap);
    this.loadSkin(assetsManager, game, game.getPlayerConfig().skin);
    this.loadCrosshair(assetsManager, game, game.getPlayerConfig().crosshair);
    console.log("Loading assets...");
    assetsManager.load();
  }

  loadMapAssets(assetsManager, game, map) {
    for (let imageName in map.images) {
      let task = assetsManager.addImageTask(imageName, map.images[imageName]);
      task.onSuccess = this.onImageLoaded.bind(this, game);
      task.onError = console.error;
    }
    for (let textureName in map.textures) {
      let task = assetsManager.addTextureTask(textureName, map.textures[textureName]);
      task.onSuccess = this.onTextureLoaded.bind(this, game);
      task.onError = console.error;
    }

    map.weapons.forEach((weapon) => this.loadWeapon(assetsManager, game, weapon));

    for (let meshName in map.meshes) {
      let task = assetsManager.addMeshTask(meshName, '', map.meshes[meshName].baseDir, map.meshes[meshName].model);
      task.onSuccess = this.onMeshLoaded.bind(this, game, false);
      task.onError = console.error;
    }
  }

  loadCrosshair(assetsManager, game, crosshair) {
    this.loadTexture(assetsManager, game, crosshair);
  }

  loadWeapon(assetsManager, game, weapon) {
    console.log("Loading weapon: ", weapon);
    weapon.sounds.forEach((sound) => this.loadSound(game, weapon.baseDir, sound));
    this.loadMesh(assetsManager, game, weapon.baseDir, weapon.name, weapon.model, weapon.enabled);
  }

  loadSkin(assetsManager, game, skin) {
    console.log("Loading skin: ", skin);
    skin.sounds.forEach((sound) => this.loadSound(game, skin.baseDir, sound));
    this.loadMesh(assetsManager, game, skin.baseDir, skin.name, skin.model, skin.enabled);
  }

  loadTexture(assetsManager, game, texture) {
    let task = assetsManager.addTextureTask(texture.name, texture.path);
    task.onSuccess = this.onTextureLoaded.bind(this, game);
    task.onError = console.error;
  }

  loadSound(game, baseDir, sound) {
    console.log("Loading sound: " + sound.name);
    game.sounds[sound.name] = new BABYLON.Sound(sound.name, baseDir + sound.src, game.scene, null, sound.options);
  }

  loadMesh(assetsManager, game, baseDir, meshName, babylonFile, meshEnabled) {
    let task = assetsManager.addMeshTask(meshName, '', baseDir, babylonFile);
    task.onSuccess = this.onMeshLoaded.bind(this, game, meshEnabled);
    task.onError = console.error;
  }

  onImageLoaded(game, task) {
    game.images[task.name] = task.image;
    console.log("Loaded task '" + task.name + "' (image)");
  }

  onTextureLoaded(game, task) {
    game.textures[task.name] = task.texture;
    console.log("Loaded task '" + task.name + "' (texture)");
  }

  onMeshLoaded(game, meshEnabled, task) {
    let logMsg = "Loaded task '" + task.name + "' (mesh";

    if (task.loadedParticleSystems.length > 0) {
      game.particleSystems[task.name] = task.loadedParticleSystems;
      logMsg += ", particleSystems"
    }
    if (task.loadedSkeletons.length > 0) {
      game.skeletons[task.name] = task.loadedSkeletons;
      logMsg += ", skeletons"
    }
    console.log("task.loadedMeshes : ", task.loadedMeshes);
    let meshes = game.meshes[task.name] = task.loadedMeshes;
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].setEnabled(meshEnabled);
      meshes[i].showBoundingBox = game.gameMod.showBoundingBox;
    }
    console.log(logMsg + ")");
  }
}

const GameMod = {
  FPS : "FPSMod"
};

const GameMap = {
  Arena : "ArenaMap",
  Sample : "SampleMap"
};

export {
  GameLoader,
  GameMod,
  GameMap
}
