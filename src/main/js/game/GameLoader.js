import * as BABYLON from 'babylonjs';
import FPSMod from "game/mods/FPSMod";
import ArenaMap from 'game/maps/ArenaMap';
import Game from "game/Game";
import Player from "game/player/Player";
import GameMenu from "game/GameMenu";
import Helper from "game/Helper";
import PlayerConfig from "game/player/PlayerConfig";

class GameLoader {

  // we always load FPSMod and ArenaMap for now
  load(canvas, gameConfig) {
    console.log("Loading game, mod = " + gameConfig.mod + ", map = " + gameConfig.map);
    let scene = this.createScene(canvas, gameConfig.debug);
    let game = new Game(canvas, new FPSMod(), new ArenaMap(), scene, gameConfig, new PlayerConfig());
    let assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onFinish = this.onAllAssetsLoaded.bind(this, game);
    this.loadAssets(assetsManager, game);

    window.addEventListener("contextmenu", function (e) { e.preventDefault();	});
  }

  onAllAssetsLoaded(game) {
    console.log("All assets loaded");
    this.enablePhysics(game.scene, game.gameMod.gravity);
    this.createLights(game.scene);
    this.createSkyBox(game.scene);
    this.createGround(game);
    this.addSamples(game);
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

  createLights(scene) {
    //var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    let light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(1, 1, 1), scene);
  }

  createSkyBox(scene, mod) {
    let skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, scene);
    let shader = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader;
  }

  createGround(game) {
    let scene = game.scene;
    let texture = game.textures.ground;
    let ground = BABYLON.Mesh.CreateGround('ground', 500, 500, 2, scene);

    texture.uScale = texture.vScale = 10;
    ground.checkCollisions = true;
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    ground.material.wireframe = game.gameMod.groundWireframe;
    ground.material.diffuseTexture = texture;
    ground.position.y = -1;
    ground.receiveShadows = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1, // 0 = huge sliding, max 1
        restitution: 0, // 0 = no bounce, max 1
        disableBidirectionalTransformation: true
      }, scene);

    game.physicsImpostors.push(ground.physicsImpostor);

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

  }

  addSamples(game) {
    let scene = game.scene;
    // WALL
    let wall = new BABYLON.MeshBuilder.CreateBox("wall", {
      height: 10,
      width: 20,
      dept: 5
    }, scene);
    wall.checkCollisions = true;
    wall.position = new BABYLON.Vector3(100, 0, 5);

    // SPHERE
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {
      diameter: 2,
      diameterX: 3}, scene);
    sphere.position = new BABYLON.Vector3(-100, 30, 5);
    sphere.material = new BABYLON.StandardMaterial("blueMat", scene);
    sphere.material.ambientColor = new BABYLON.Color3(0, 0, 1);
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 10,
        friction: 1,
        restitution: 0
      }, scene);

    // BOX
    let box = new BABYLON.MeshBuilder.CreateBox("box1", {
      size: 10
    }, scene);
    box.material = new BABYLON.StandardMaterial("redMat", scene);
    box.material.ambientColor = new BABYLON.Color3(1, 0, 0);
    box.rotation.x = -0.2;
    box.rotation.y = -0.4;
    box.position= new BABYLON.Vector3(5, 0, 100);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1,
        restitution: 0
      }, scene);

    // BOX
    let box2 = new BABYLON.MeshBuilder.CreateBox("box2", {
      width: 50,
      height: 5,
      depth: 50
    }, scene);
    box2.material = new BABYLON.StandardMaterial("redMat", scene);
    box2.material.ambientColor = new BABYLON.Color3(1, 0, 20);
    box2.checkCollisions = true;
    box2.position= new BABYLON.Vector3(100, 0, 50);
    //box.ellipsoid = new BABYLON.Vector3(0, 1, 0);
    box2.physicsImpostor = new BABYLON.PhysicsImpostor(box2,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1,
        restitution: 0
      }, scene);

    game.physicsImpostors.push(sphere.physicsImpostor);
    game.physicsImpostors.push(box.physicsImpostor);
    game.physicsImpostors.push(box2.physicsImpostor);
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
    this.loadMap(assetsManager, game, game.gameMap);
    this.loadSkin(assetsManager, game, game.getPlayerConfig().skin);
    console.log("Loading assets...");
    assetsManager.load();
  }

  loadMap(assetsManager, game, map) {
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
    // for(let meshName in meshList) {
    //   let task = assetsManager.addMeshTask(meshName, '', mod.meshes[meshName][0], mod.meshes[meshName][1]);
    //   task.onSuccess = this.onMeshLoaded.bind(this, game);
    //   task.onError = console.error;
    // }
  }

  loadSkin(assetsManager, game, skin) {
    console.log("Loading skin: ", skin);
    skin.sounds.forEach((sound) => this.loadSound(game, skin.baseDir, sound));
    this.loadMesh(assetsManager, game, skin.baseDir, skin.name, skin.model);
  }

  loadSound(game, baseDir, sound) {
    console.log("Loading sound: " + sound.name);
    game.sounds[sound.name] = new BABYLON.Sound(sound.name, baseDir + sound.src, game.scene, null, sound.options);
  }

  loadMesh(assetsManager, game, baseDir, meshName, babylonFile) {
    let task = assetsManager.addMeshTask(meshName, '', baseDir, babylonFile);
    task.onSuccess = this.onMeshLoaded.bind(this, game);
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

  onMeshLoaded(game, task) {
    let logMsg = "Loaded task '" + task.name + "' (mesh";

    if (task.loadedParticleSystems.length > 0) {
      game.particleSystems[task.name] = task.loadedParticleSystems;
      logMsg += ", particleSystems"
    }
    if (task.loadedSkeletons.length > 0) {
      game.skeletons[task.name] = task.loadedSkeletons;
      logMsg += ", skeletons"
    }
    let meshes = game.meshes[task.name] = task.loadedMeshes;
    for (let i = 0; i < meshes.length; i++) {
      //meshes[i].setEnabled(game.gameMap.meshes[task.name][2]);
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
