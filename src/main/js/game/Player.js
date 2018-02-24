import * as BABYLON from 'babylonjs';

import Hammer from "game/weapons/Hammer";

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

export default class Player {

  game = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  jumping = false;
  running = false;
  next_pos = { x: 0, y: 0, z: 0 };

  isMouseDown = false;

  speed = 1;

  dir_x = 0;
  dir_z = 0;
  force_y = 0;
  startingPosition = new BABYLON.Vector3(0, 40, 0);


  // SCENE OBJECTS
  camera = {
    currentCamera: null,
    firstPersonCamera: null,
    thirdPersonCamera: null
  };


  body = null;
  weapon = null;

  constructor(game) {
    console.log("Creating player for " + game.gameMod.name);
    this.game = game;
    this.createBody(game);
    this.createCameras(game);
    //this.weapon = new Hammer(game, this.firstPersonCamera);
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    document.addEventListener("mouseup", this.onMouseUp.bind(this), false);
  }

  startPlaying() {
    this.game.scene.activeCamera = this.camera.thirdPersonCamera;
    this.game.scene.activeCamera.attachControl(this.canvas);
    for (let i = 0; i < this.body.length; i++) {
      this.body[i].setEnabled(true);
    }
//    for (let mesh in this.body) mesh.setEnabled(true);
    //this.weapon.enabled = true;
    //let skeletons = this.game.skeletons.player;
    //var animation = this.game.scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
  }

  stopPlaying() {
    for (let i = 0; i < this.body.length; i++) {
      this.body[i].setEnabled(false);
    }
    //this.body.foreach((mesh) => mesh.setEnabled(false));
    //this.weapon.enabled = false;
    this.currentCamera.detachControl(this.canvas);
  }




  update() {
    //let camera = this.game.scene.activeCamera;
    // let cameraForwardRayPosition = camera.getForwardRay().direction;
    // let cameraForwardRayPositionWithoutY = new BABYLON.Vector3(cameraForwardRayPosition.x, 0, cameraForwardRayPosition.z);
    // this.body[0].lookAt(this.body[0].position.add(cameraForwardRayPositionWithoutY), Math.PI, 0, 0);
    //this.body[0].position.x = camera.position.x;
    //this.body[0].position.y = camera.position.y - 1.5;
    //this.body[0].position.z = camera.position.z;

    this.body[0].rotation.y = - Math.PI / 2 - this.camera.thirdPersonCamera.alpha;
    //cameraArcRotative[0].target.x = parseFloat(meshPlayer.position.x);
    //cameraArcRotative[0].target.z = parseFloat(meshPlayer.position.z);
    // if (this.moveForward) {
    //   this.hammer.rotation.y += 10;
    // }
    let yPos = 0;//this.body[0].position.y;
    let speed = 2;
    let body = this.body[0];


    if (this.moveForward) {
      body.moveWithCollisions(new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(body.rotation.y))) / speed,
        yPos,
        parseFloat(Math.cos(parseFloat(body.rotation.y))) / speed));
    } else if (this.moveBackward) {
      body.moveWithCollisions(new BABYLON.Vector3(
        -parseFloat(Math.sin(parseFloat(body.rotation.y))) / speed,
        yPos,
        -parseFloat(Math.cos(parseFloat(body.rotation.y))) / speed));
    }
    if (this.strafeLeft) {
      body.moveWithCollisions(new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(body.rotation.y - Math.PI / 2))) / speed ,
        yPos,
        parseFloat(Math.cos(parseFloat(body.rotation.y - Math.PI / 2))) / speed));
    } else if (this.strafeRight) {
      body.moveWithCollisions(new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(body.rotation.y + Math.PI / 2))) / speed,
        yPos,
        parseFloat(Math.cos(parseFloat(body.rotation.y + Math.PI / 2))) / speed));
    }

  }

  createBody(game) {
    console.log("Initializing player body...");
    let body = game.meshes.player;

    body[0].scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
    body[0].position = new BABYLON.Vector3(4, 1, 4);
    //body[0].rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
    body[0].ellipsoid = new BABYLON.Vector3(1, 2, 1);
    body[0].ellipsoidOffset = new BABYLON.Vector3(0.5, 2, 0.5);
    body[0].checkCollisions = true;
    body[0].applyGravity = true;
    //console.log("fucking ske : ", skeletons);
    this.body = body;



  }

  createCameras(game) {
    let cam;
    let target = this.body[0].position.clone();

    target.y += 1;
    cam = new BABYLON.FreeCamera("camera", target, game.scene);
    cam.position.y = 20;
    cam.checkCollisions = true;
    cam.applyGravity = true;
    cam.ellipsoid = new BABYLON.Vector3(1, 2, 1);
    // cam.keysUp.push(90);
    // cam.keysDown.push(83);
    // cam.keysLeft.push(81);
    // cam.keysRight.push(68);
    cam.position = this.startingPosition;
    cam.attachControl(game.canvas, true);
    this.camera.firstPersonCamera = cam;

    //.getRenderingCanvas()

    cam = new BABYLON.ArcRotateCamera("camera", 0, 1, 25, this.body[0], game.scene);
    cam.attachControl(game.canvas, true);
    this.camera.thirdPersonCamera = cam;

  }

  test() {

  }

  fire() {
    if (this.weapon.canHit()) {
      this.weapon.hit();
    }
    //this.game.scene.beginAnimation(this.weapon, 0, 100, false, 10, null);


    // var pickedInfo = window.scene.pick(window.innerWidth * 0.5, window.innerHeight * 0.5, null, false);
    //
    // if (pickedInfo.pickedMesh && pickedInfo.pickedMesh.name) {
    //   if (pickedInfo.pickedMesh.name.indexOf("enemy") != -1) {
    //     this.config.AIManager.hurtAI(pickedInfo.pickedMesh.name, this.shotDammage);
    //   }
    //   this.config.ParticlesManager.launch("impact", pickedInfo.pickedPoint);
    // }

  }

  onKeyDown(event) {
    console.log("KeyDown : " + event.keyCode);

    let kb = this.game.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.jump: this.running = true; break;
      case kb.forward: this.moveForward = true; this.dir_z = 1; break;
      case kb.backward: this.moveBackward = true; this.dir_z = -1; break;
      case kb.left: this.strafeLeft = true; this.dir_x = 1; break;
      case kb.right: this.strafeRight = true; this.dir_x = -1; break;
      case 69: this.test(); break; // E
      case 82: this.test(); break; // R
      //case 71: this.firstPersonCamera.applyGravity = !this.firstPersonCamera.applyGravity; break; // R
    }
  }

  onKeyUp(event) {
    let kb = this.game.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.jump: this.running = false; break;
      case kb.forward: this.moveForward = false; this.dir_z = 0; break;
      case kb.backward: this.moveBackward = false; this.dir_z = 0; break;
      case kb.left: this.strafeLeft = false; this.dir_x = 0; break;
      case kb.right: this.strafeRight = false; this.dir_x = 0; break;
    }
  }

  onMouseDown() {
    this.isMouseDown = true;
    this.fire();
  }

  onMouseUp() {
    this.isMouseDown = false;
  }

}

// export {
//   Player
// }
