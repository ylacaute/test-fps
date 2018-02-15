import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

import Player from 'Player.js';

export default class Game {

  mesh = {
    player: null
  };

  constructor(canvasId) {
    let canvas = document.getElementById(canvasId);

    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.assetsManager = new BABYLON.AssetsManager(this.scene);

    let scene = this.scene;


    this.assetsManager.onFinish = () => {
      console.log("All assets loaded");
      let player = new Player(this, canvas);
      this.initScene();
      this.startRendering();
    };

    console.log("Start loading assets...");
    this.assetsManager.load();

    window.addEventListener("resize", function () {
      if (this.engine) {
        this.engine.resize();
      }
    },false);
  }

  startRendering() {
    console.log("Start rendering...");
    let scene = this.scene;
    this.engine.runRenderLoop(() => {
      scene.render();
    });
  }

  initScene() {
    console.log("Initializing scene...");
    let scene = this.scene;
    scene.ambientColor = BABYLON.Color3.FromInts(250, 250, 250);
    scene.clearColor = BABYLON.Color4.FromInts(127, 165, 13, 0);
    scene.clearColor = BABYLON.Color4.FromInts(40, 40, 40, 0);
    scene.gravity = new BABYLON.Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    //scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    //scene.fogDensity = 0.02;
    //scene.fogColor = scene.clearColor;
    this.applySkybox(scene, "sky01");
    this.createGUI();
    this.initLights(scene);
    this.initGround(scene);
    this.importObjects(scene, this.assetsManager);
    this.createInvisibleBorders(scene);
  }

  createGUI() {
    // http://doc.babylonjs.com/how_to/gui
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let button1 = GUI.Button.CreateSimpleButton("but1", "Click Me");
    button1.width = "150px"
    button1.height = "40px";
    button1.color = "white";
    button1.cornerRadius = 20;
    button1.background = "green";
    button1.onPointerUpObservable.add(function() {
      alert("you did it!");
    });
    advancedTexture.addControl(button1);

  }

  applySkybox(scene, name) {
    let skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
    let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/skybox/" + name, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skybox.renderingGroupId = 0;
  }

  /**
   * Usefull doc : https://doc.babylonjs.com/how_to/how_to_use_assetsmanager
   */
  importObjects(scene, assetsManager) {
    let meshTask = assetsManager.addMeshTask("test", "", "./", "mesh/player.babylon");
    meshTask.onSuccess = function (task) {
      this.mesh.player = task.loadedMeshes[0]
      //task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
    };
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception);
    };

    // BABYLON.SceneLoader.Append("./", "test.babylon", scene, function (scene) {
    //   // do something with the scene
    // });
  }



  initLights(scene) {
    //let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
    //let light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    //light2.intensity = 0.8;

    let LightDirectional = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -4, 2), scene);
    LightDirectional.diffuse = new BABYLON.Color3(1, 1, 1);
    LightDirectional.specular = new BABYLON.Color3(0, 0, 0);
    LightDirectional.position = new BABYLON.Vector3(250, 400, 0);
    LightDirectional.intensity = 1.8;
  }

  createInvisibleBorders(scene) {
    // Invisible borders
    var border0 = BABYLON.Mesh.CreateBox("border0", 1, scene);
    border0.scaling = new BABYLON.Vector3(1, 100, 100);
    border0.position.x = -50.0;
    border0.checkCollisions = true;
    border0.isVisible = false;

    var border1 = BABYLON.Mesh.CreateBox("border1", 1, scene);
    border1.scaling = new BABYLON.Vector3(1, 100, 100);
    border1.position.x = 50.0;
    border1.checkCollisions = true;
    border1.isVisible = false;

    var border2 = BABYLON.Mesh.CreateBox("border2", 1, scene);
    border2.scaling = new BABYLON.Vector3(100, 100, 1);
    border2.position.z = 50.0;
    border2.checkCollisions = true;
    border2.isVisible = false;

    var border3 = BABYLON.Mesh.CreateBox("border3", 1, scene);
    border3.scaling = new BABYLON.Vector3(100, 100, 1);
    border3.position.z = -50.0;
    border3.checkCollisions = true;
    border3.isVisible = false;
  }

  initGround(scene) {
    // MATERIALS
    let grassMaterial = new BABYLON.StandardMaterial("ground", scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("/textures/ground_sand.png", scene);
    grassMaterial.diffuseTexture.uScale = 8.0;
    grassMaterial.diffuseTexture.vScale = 8.0;
    grassMaterial.backFaceCulling = false;

    let wallMaterial = new BABYLON.StandardMaterial("ground", scene);
    wallMaterial.diffuseTexture = new BABYLON.Texture("/textures/metal.jpg", scene);
    wallMaterial.diffuseTexture.uScale = 8.0;
    wallMaterial.diffuseTexture.vScale = 8.0;
    wallMaterial.backFaceCulling = false;

    //let woodMaterial = new BABYLON.StandardMaterial("groundTexture", scene);
    //woodMaterial.diffuseTexture = new BABYLON.Texture("/textures/Wood.jpg", scene);

    // Ground
    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "/heightmap/sampleheightmap.jpg", 100, 100, 50, 0, 5, scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("/textures/ground_sand.png", scene);
    groundMaterial.diffuseTexture.uScale = 6;
    groundMaterial.diffuseTexture.vScale = 6;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    ground.checkCollisions = true;


    let Mur = BABYLON.Mesh.CreateBox("Mur", 1, scene);
    Mur.scaling = new BABYLON.Vector3(15, 6, 1);
    Mur.position.y = 3.1;
    Mur.position.z = 20;
    Mur.checkCollisions = true;
    Mur.material = wallMaterial;

  }

}


// HELP CREATE SCENE
// var helper = scene.createDefaultEnvironment({
//   enableGroundMirror: true,
//   sizeAuto: false,
//   groundSize: 100
// });

//helper.setMainColor(BABYLON.Color3.Teal());

//initBoxArena() {
  // let boxArena = BABYLON.Mesh.CreateBox("box1", 100, scene, false, BABYLON.Mesh.BACKSIDE);
  // boxArena.material = wallMaterial;
  // boxArena.position.y = 50 * 0.3;
  // boxArena.scaling.y = 0.3;
  // boxArena.scaling.z = 0.8;
  // boxArena.scaling.x = 3.5;
//}


// CREATE CYLINDER IN SCENE

// let columns = [];
// let numberColumn = 6;
// let sizeArena = 100*boxArena.scaling.x -50;
// let ratio = ((100/numberColumn)/100) * sizeArena;
// for (let i = 0; i <= 1; i++) {
//   if(numberColumn>0){
//     columns[i] = [];
//     let mainCylinder = BABYLON.Mesh.CreateCylinder("cyl0-"+i, 30, 5, 5, 20, 4, scene);
//     mainCylinder.position = new BABYLON.Vector3(-sizeArena/2,30/2,-20 + (40 * i));
//     mainCylinder.material = woodMaterial;
//     columns[i].push(mainCylinder);
//
//     if(numberColumn>1){
//       for (let y = 1; y <= numberColumn - 1; y++) {
//         let newCylinder = columns[i][0].clone("cyl"+y+"-"+i);
//         newCylinder.position = new BABYLON.Vector3(-(sizeArena/2) + (ratio*y),30/2,columns[i][0].position.z);
//         columns[i].push(newCylinder);
//       }
//     }
//   }
// }

