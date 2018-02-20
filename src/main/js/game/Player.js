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
  camera = null;
  body = null;
  weapon = null;
  hammer = null;

  constructor(game) {
    console.log("Creating player for " + game.gameMod);
    this.game = game;
    this.createCamera(game);
    this.createBody(game);
    this.createWeapon(game);
    this.hammer = new Hammer(game);
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    document.addEventListener("mouseup", this.onMouseUp.bind(this), false);
  }

  startPlaying() {
    this.game.scene.activeCamera = this.camera;
    this.body.setEnabled(false);
    this.hammer.enabled = true;
  }

  stopPlaying() {
    this.body.setEnabled(true);
    this.hammer.enabled = false;
  }

  update() {
    let cameraForwardRayPosition = this.camera.getForwardRay().direction;
    let cameraForwardRayPositionWithoutY = new BABYLON.Vector3(cameraForwardRayPosition.x, 0, cameraForwardRayPosition.z);
    this.body.lookAt(this.body.position.add(cameraForwardRayPositionWithoutY), 0, 0, 0);
    this.body.position.x = this.camera.position.x;
    this.body.position.y = this.camera.position.y - 1.5;
    this.body.position.z = this.camera.position.z;

    // if (this.moveForward) {
    //   this.hammer.rotation.y += 10;
    // }

    if (this.isMouseDown) {


      //this.container.rotation = new BABYLON.Vector3(Math.PI / 4 + Math.sin(this.counter) + Math.cos(this.counter), 0, Math.PI / 2);
      //this.container.rotate(BABYLON.Axis.X, Math.PI / 50, BABYLON.Space.LOCAL);
      this.hammer.activate();
    }
  }

  createBody(game) {
    console.log("Initializing player body...");
    let body = game.meshes.player[0];
    // ...
    this.body = body;
  }

  createCamera(game) {
    let camera = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), game.scene);
    camera.position.y = 20;
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 2, 1);
    camera.keysUp.push(90);
    camera.keysDown.push(83);
    camera.keysLeft.push(81);
    camera.keysRight.push(68);
    camera.position = this.startingPosition;
    camera.attachControl(game.canvas, true);
    this.camera = camera;
  }

  createWeapon(game) {
    console.log("Creating weapon from ", game.meshes.gun);
    this.weapon = game.meshes.gun[0];
    this.weapon.parent = this.camera; // The weapon will move with the player camera
    this.weapon.material = new BABYLON.StandardMaterial("weaponMat", game.scene);
    this.weapon.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.weapon.material.specularColor = new BABYLON.Color3(1, 0, 0);
    this.weapon.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
    this.weapon.position = new BABYLON.Vector3(1, -2, 2);
    this.weapon.rotation = new BABYLON.Vector3(-Math.PI / 8, -Math.PI / 40, 0);
    this.weapon.setEnabled(true);




    //this.container.rotation = new BABYLON.Vector3(Math.PI / 4, 0, Math.PI / 2);

    //this.container.position = new BABYLON.Vector3(0, -10, 0);

    //game.meshes.hammer[0].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);

    // let wImpostor = new BABYLON.PhysicsImpostor(container, BABYLON.PhysicsImpostor.BoxImpostor, {
    //   mass: 0,
    //   friction: 1, // 0 = huge sliding, max 1
    //   restitution: 0 // 0 = no bounce, max 1
    //   //disableBidirectionalTransformation: true
    // }, game.scene);
    //wImpostor.setLinearVelocity(new BABYLON.Vector3(1,2,0));

    //this.hammer = game.meshes.hammer[0];
    //console.log("HAMMER : ", game.meshes.hammer);
    //this.hammer.setEnabled(true);
    //this.hammer.position = this.startingPosition.clone();
    //this.hammer.position.x += 30;
    //this.hammer.position.z += 30;

    // for (let i = 0; i < game.meshes.hammer.length; i++) {
    //   game.meshes.hammer[i].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);
    // }



    //this.weapon.position = new BABYLON.Vector3(window.innerWidth * 1.1e-6, -0.0035, 0.0025);
    // var end_position = this.weapon.position.clone();
    // end_position.z -= 0.001;
    // var display = new BABYLON.Animation("fire", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    // var anim_keys = [
    //   {
    //     frame: 0,
    //     value: this.weapon.position
    //   },
    //   {
    //     frame: 10,
    //     value: end_position
    //   },
    //   {
    //     frame: 100,
    //     value: this.weapon.position
    //   }
    // ];
    //
    // display.setKeys(anim_keys);
    // this.weapon.animations.push(display);

  }

  test() {

  }

  fire() {
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
    //console.log("KeyDown : " + event.keyCode);

    let kb = this.game.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.jump: this.running = true; break;
      case kb.forward: this.moveForward = true; this.dir_z = 1; break;
      case kb.backward: this.moveBackward = true; this.dir_z = -1; break;
      case kb.left: this.strafeLeft = true; this.dir_x = 1; break;
      case kb.right: this.strafeRight = true; this.dir_x = -1; break;
      case 69: this.test(); break; // E
      case 82: this.test(); break; // R
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
