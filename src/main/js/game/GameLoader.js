import * as BABYLON from 'babylonjs';
import FPSMod from "game/mods/FPSMod";
import ArenaMap from 'game/maps/ArenaMap';
import Game from "game/Game";
import Player from "game/Player";
import GameMenu from "game/GameMenu";
import Helper from "game/Helper";

class GameLoader {

  load(canvas, modName, mapName) {
    console.log("Loading game, mod = " + modName + ", map = " + mapName);
    // we always load FPSMod and ArenaMap for now
    let gameMod = new FPSMod();
    let gameMap = new ArenaMap();

    console.log("Creating scene...");
    let scene = this.createScene(canvas, gameMod);
    let game = new Game(canvas, gameMod, gameMap, scene);

    this.loadSounds(game);

    let assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.onFinish = this.onAllAssetsLoaded.bind(this, game);
    this.loadAssets(assetsManager, game);

    window.addEventListener("contextmenu", function (e) { e.preventDefault();	});
  }

  onAllAssetsLoaded(game) {
    console.log("All assets loaded");

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

  createScene(canvas, mod) {
    let engine = this.createEngine(canvas);
    let scene = new BABYLON.Scene(engine);

    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
    //scene.gravity = new BABYLON.Vector3(mod.gravity[0], mod.gravity[1], mod.gravity[2]);
    scene.collisionsEnabled = true;
    scene.enablePhysics(); // Must be initialize before impostors


    scene.ambientColor = BABYLON.Color3.FromInts(250, 250, 250);
    //scene.clearColor = new BABYLON.Vector3(mod.clearColor[0], mod.clearColor[1], mod.clearColor[2]);
    scene.clearColor = new BABYLON.Color3(0, 0, .2);

    var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);

    // let groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    // groundMaterial.diffuseTexture = new BABYLON.Texture("maps/arena/ground.png", scene);
    // groundMaterial.diffuseTexture.uScale = 6;
    // groundMaterial.diffuseTexture.vScale = 6;
    // groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // groundMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    // var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "maps/arena/groundHeightMap.jpg", 100, 100, 100, 0, 0, scene, true, () => {
    //   ground.material = groundMaterial;
    //   ground.receiveShadows = true;
    //   ground.checkCollisions = true;
    //   new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, {
    //     mass: 0,
    //     friction: 1, // 0 = huge sliding, max 1
    //     restitution: 0 // 0 = no bounce, max 1
    //     //disableBidirectionalTransformation: true
    //   }, scene);
    // });
    // ground.position.y = -40;

    var ground = BABYLON.Mesh.CreateGround('ground', 100, 100, 2, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
    ground.checkCollisions = true;

    new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {
      mass: 0,
      friction: 1, // 0 = huge sliding, max 1
      restitution: 0 // 0 = no bounce, max 1
      //disableBidirectionalTransformation: true
    }, scene);
    ground.position.y = -10;
    if (mod.groundWireframe) {
      ground.material.wireframe = true;
    }

    var box = new BABYLON.Mesh.CreateBox("box",2,scene);
    box.rotation.x = -0.2;
    box.rotation.y = -0.4;
    box.position= new BABYLON.Vector3(5, 10, 0);
    box.material = new BABYLON.StandardMaterial("material",scene);
    box.material.emmisiveColor = new BABYLON.Color3(0, 0.58, 0.86);
    box.checkCollisions = true;
    box.applyGravity = true;
    box.ellipsoid = new BABYLON.Vector3(0, 1, 0);


    new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10, friction: 1, restitution: 0.2 }, scene);

    if (mod.showAxis) {
      Helper.showAxis(scene, 20);
    }


    console.log("Scene created successfully");
    return scene;
  }

  createMenuCamera(scene) {
    let position = new BABYLON.Vector3(0, 20, 0);
    let menuCamera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 4, Math.PI / 4, position, scene);
    menuCamera.fov = Math.PI / 2;

    let menuCameraAnimation = new BABYLON.Animation("death", "alpha", 20,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE, true);
    menuCameraAnimation.setKeys([
      {
        frame: 0,
        value: 0
      },
      {
        frame: 200,
        value: Math.PI * 2
      }
    ]);
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
    let player = new Player(game);


    return player;
  }

  loadAssets(assetsManager, game) {
    let map = game.gameMap;
    let mod = game.gameMod;

    for (let imageName in map.images) {
      let task = assetsManager.addImageTask(imageName, map.images[imageName]);
      task.onSuccess = this.onTextureLoaded.bind(this, game);
      task.onError = console.error;
    }

    for (let textureName in map.textures) {
      let task = assetsManager.addTextureTask(textureName, map.textures[textureName]);
      task.onSuccess = this.onImageLoaded.bind(this, game);
      task.onError = console.error;
    }

    for(let meshName in mod.meshes) {
      let task = assetsManager.addMeshTask(meshName, '', mod.meshes[meshName][0], mod.meshes[meshName][1]);
      task.onSuccess = this.onMeshLoaded.bind(this, game);
      task.onError = console.error;
    }

    for(let meshName in map.meshes) {
      let task = assetsManager.addMeshTask(meshName, '', map.meshes[meshName][0], map.meshes[meshName][1]);
      task.onSuccess = this.onMeshLoaded.bind(this, game);
      task.onError = console.error;
    }

    console.log("Loading assets...");
    assetsManager.load();
  }

  loadSounds(game) {
    const { gameMod, scene } = game;
    for(let soundName in gameMod.sounds) {
      console.log("Loading sound: " + soundName);
      game.sounds[soundName] = new BABYLON.Sound(
        soundName,
        gameMod.sounds[soundName].src,
        scene,
        null,
        gameMod.sounds[soundName].options);
    }
  }

  onImageLoaded(game, task) {
    game.images[task.name] = task.image;
    console.log("Loaded image: " + task.name);
  }

  onTextureLoaded(game, task) {
    game.textures[task.name] = task.texture;
    console.log("Loaded texture: " + task.name);
  }

  onMeshLoaded(game, task) {
    let meshes = game.meshes[task.name] = task.loadedMeshes; // one mesh per task ! currently we have no multimesh
    meshes[0].setEnabled(false);
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].showBoundingBox = game.gameMod.showBoundingBox;
    }
    console.log("Loaded mesh: " + task.name);
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
