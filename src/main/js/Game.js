import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

import Player from 'Player.js';

export default class Game {

  player = null;

  constructor(canvas) {
    this.engine = this.createEngine(canvas);
    this.scene = this.createScene(this.engine, canvas);

    //new FirstPlayer(this, canvas);

    this.assetsManager = new BABYLON.AssetsManager(this.scene);
    this.assetsManager.onFinish = () => {
      console.log("All assets loaded");
      this.addTests(this.scene);
      this.engine.runRenderLoop(this.render.bind(this));
    };
    console.log("Start loading assets...");
    this.importObjects(this.scene, this.assetsManager);
  }

  addTests(scene) {
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    //var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
      mass: 1,
      restitution: 1,
      friction: 1
    }, scene);
    sphere.position.y = 10;
    sphere.position.x = 30;
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

  createScene(engine, canvas) {
    console.log("Initializing scene...");
    let scene = new BABYLON.Scene(engine);

    // https://doc.babylonjs.com/how_to/using_the_physics_engine
    scene.gravity = new BABYLON.Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true;
    //scene.workerCollisions = false;
    scene.enablePhysics(); // Must be initialize before impostors


    scene.ambientColor = BABYLON.Color3.FromInts(250, 250, 250);
    scene.clearColor = BABYLON.Color4.FromInts(127, 165, 13, 0);
    scene.clearColor = BABYLON.Color4.FromInts(40, 40, 40, 0);

    this.initLights(scene);
    //this.initFog(scene);

    //this.initFirstPersonCamera(scene, canvas);
    this.init3rdPersonCamera(scene, canvas);
    //this.applySkybox(scene, "sky01");
    //this.createGUI();
    this.initGround(scene);

    this.createInvisibleBorders(scene);
    //var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    //scene.enablePhysics(gravityVector);



    return scene;
  }

  render() {
    this.scene.render();
    if (this.scene.isReady() && this.player) {

      // Used only for third person view
      this.cameraFollowActor();

    }

  }

  // initFirstPersonCamera(scene, canvas) {
  //   let camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 3.5, 0), scene);
  //   camera.checkCollisions = true;
  //   camera.applyGravity = true;
  //   camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
  //   camera.attachControl(canvas, true);
  //   this.camera = camera;
  // }

  init3rdPersonCamera(scene, canvas) {
    // Camera 3 eme personne
    //let camera = new BABYLON.ArcRotateCamera("CameraBaseRotate", -Math.PI / 2, Math.PI / 2.2, 12, new BABYLON.Vector3(0, 5.0, 0), scene);
    //new ArcRotateCamera(name, alpha, beta, radius, target, scene)
    let camera = new BABYLON.ArcRotateCamera("CameraBaseRotate", -Math.PI/2, Math.PI/2.2, 20, new BABYLON.Vector3(0, 3.5, 0), scene);
    camera.wheelPrecision = 50;
    camera.lowerRadiusLimit = 0;
    camera.upperRadiusLimit = 50;
    camera.minZ = 0;
    camera.minX = 4096;
    camera.attachControl(canvas);
    this.camera = scene.activeCamera = camera;
  }

  cameraFollowActor() {
    //this.player.mesh.rotation.y = this.camera.alpha;
    // this.camera.target.x = parseFloat(this.player.mesh.position.x);
    // this.camera.target.z = parseFloat(this.player.mesh.position.z);
    // this.camera.target.y = parseFloat(this.player.mesh.position.y);
    //console.log(this.player.mesh.rotation.y);
    //console.log(this.camera.alpha);

    // this.player.meshPlayer.rotation.y = -4.69 - this.camera.alpha;

    //this.player.meshPlayer.rotation.y = -this.camera.alpha / 360;
    this.player.meshPlayer.rotation.y = -this.camera.alpha / 180 * Math.PI;

    this.camera.target.x = parseFloat(this.player.meshPlayer.position.x);
    this.camera.target.y = parseFloat(this.player.meshPlayer.position.y);
    this.camera.target.z = parseFloat(this.player.meshPlayer.position.z);

  }

  initFog(scene) {
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.02;
    scene.fogColor = scene.clearColor;
  }

  /**
   * Usefull doc : https://doc.babylonjs.com/how_to/how_to_use_assetsmanager
   */
  importObjects(scene, assetsManager) {
    // let meshTask = assetsManager.addMeshTask("test", "", "./", "mesh/player.babylon");
    // meshTask.onSuccess = function (task) {
    //   console.log("Player mesh loaded");
    //   console.log("this : ", this);
    //   console.log("this.mesh : ", this.mesh);
    //
    //   meshes.player = task.loadedMeshes[0];
    //   //meshes.player.ellipsoid = new BABYLON.Vector3(0.5, 1.0, 0.5);
    //   //meshes.player.ellipsoidOffset = new BABYLON.Vector3(0, 4, 0);
    //   //meshes.player.rotation = new BABYLON.Vector3(0, (Math.PI / 4), 0);
    //   meshes.player.position = new BABYLON.Vector3(0, 10, 0);
    //   //meshes.player.scaling= new BABYLON.Vector3(0.5, 0.5, 0.5);
    //   scene.activeCamera.alpha = -parseFloat(meshes.player.rotation.y);
    //
    //   //task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
    // };
    // meshTask.onError = function (task, message, exception) {
    //   console.log(message, exception);
    // };

    let self = this;
    let loadPlayerTask = assetsManager.addMeshTask("player", "", "./", "mesh/player.babylon", scene);
    loadPlayerTask.onError = function (task, message, exception) {
      console.log(message, exception);
    };
    loadPlayerTask.onSuccess = function (task) {
      self.player = new Player(self, task.loadedMeshes, task.loadedParticleSystemsn, task.loadedSkeletons);
    };

    // Dude
    // BABYLON.SceneLoader.ImportMesh("him", "./", "Dude.babylon", scene, function (newMeshes2, particleSystems2, skeletons2) {
    //   var dude = newMeshes2[0];
    //
    //   // for (var index = 0; index < newMeshes2.length; index++) {
    //   //   shadowGenerator.getShadowMap().renderList.push(newMeshes2[index]);
    //   // }
    //
    //   //dude.rotation.y = Math.PI;
    //   //dude.position = new BABYLON.Vector3(0, 0, -80);
    //
    //   //scene.beginAnimation(skeletons2[0], 0, 100, true, 1.0);
    // });


    assetsManager.load();

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
    let wireFrameMaterial = new BABYLON.StandardMaterial("wire", scene);
    wireFrameMaterial.diffuseColor = BABYLON.Color3.Black();
    wireFrameMaterial.wireframe = true;
    let grassMaterial = new BABYLON.StandardMaterial("ground", scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("/textures/ground_sand.png", scene);
    grassMaterial.diffuseTexture.uScale = 8.0;
    grassMaterial.diffuseTexture.vScale = 8.0;
    grassMaterial.backFaceCulling = false;
    let metalMaterial = new BABYLON.StandardMaterial("metal", scene);
    metalMaterial.diffuseTexture = new BABYLON.Texture("/textures/metal.jpg", scene);
    metalMaterial.diffuseTexture.uScale = 8.0;
    metalMaterial.diffuseTexture.vScale = 8.0;
    metalMaterial.backFaceCulling = false;
    let groundMaterialOld = new BABYLON.StandardMaterial("ground", scene);
    groundMaterialOld.diffuseTexture = new BABYLON.Texture("/textures/ground_sand.png", scene);
    groundMaterialOld.diffuseTexture.uScale = 6;
    groundMaterialOld.diffuseTexture.vScale = 6;
    groundMaterialOld.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterialOld.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    let groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("/textures/terre.png", scene);
    groundMaterial.diffuseTexture.uScale = 5.0;
    groundMaterial.diffuseTexture.vScale = 5.0;

    //let woodMaterial = new BABYLON.StandardMaterial("groundTexture", scene);
    //woodMaterial.diffuseTexture = new BABYLON.Texture("/textures/Wood.jpg", scene);

    let wall = BABYLON.Mesh.CreateBox("wall", 1, scene);
    wall.scaling = new BABYLON.Vector3(15, 6, 1);
    wall.position.y = 3.1;
    wall.position.z = 20;
    wall.checkCollisions = true;
    wall.material = metalMaterial;

    // Ground put to false
    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "/heightmap/sampleheightmap.jpg", 100, 100, 100, 0, 5, scene, true, () => {
      ground.material = groundMaterial;
      ground.receiveShadows = true;
      ground.checkCollisions = true;
      new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, {
          mass: 0,
          friction: 1, // 0 = huge sliding, max 1
          restitution: 0 // 0 = no bounce, max 1
          //disableBidirectionalTransformation: true
        }, scene);
    });

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

// Simple loading

// BABYLON.SceneLoader.Append("./", "test.babylon", scene, function (scene) {
//   // do something with the scene
// });
