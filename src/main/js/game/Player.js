import * as BABYLON from 'babylonjs';

export default class Player {

  gameMod = null;
  camera = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  jumping = false;
  running = false;
  next_pos = { x: 0, y: 2, z: 0 };
  weapon = null;

  constructor(game) {
    console.log("Creating player for " + game.gameMod);
    this.gameMod = game.gameMod;

    this.createCamera(game);
    this.createWeapon(game);

    // KEYBOARD INPUTS
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  createCamera(game) {
    let camTarget = new BABYLON.Vector3(this.next_pos.x, this.next_pos.y, this.next_pos.z);
    this.camera = new BABYLON.FreeCamera("camera", camTarget, game.scene);
    game.scene.activeCamera = this.camera;
    this.camera.attachControl(game.canvas, true);
  }

  createWeapon(game) {
    console.log("Creating weapon from ", game.meshes.gun);
    this.weapon = game.meshes.gun;
    this.weapon.setEnabled(true);
    this.weapon.parent = this.camera; // The weapon will move with the player camera
    this.weapon.material = new BABYLON.StandardMaterial("weaponMat", game.scene);
    this.weapon.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.weapon.material.specularColor = new BABYLON.Color3(1, 0, 0);
    //this.weapon.scaling = new BABYLON.Vector3(0.001, 0.001, 0.001);
    this.weapon.scaling = new BABYLON.Vector3(2, 2, 2);
    this.weapon.position = new BABYLON.Vector3(0, 0, 0);

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

  onKeyDown(event) {
    console.log("KeyDown : " + event.keyCode);
    let kb = this.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.jump: this.running = true; break;
      case kb.forward: this.moveForward = true; break;
      case kb.backward: this.moveBackward = true; break;
      case kb.left: this.strafeLeft = true; break;
      case kb.right: this.strafeRight = true; break;
    }
  }

  onKeyUp(event) {
    let kb = this.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.jump: this.running = false; break;
      case kb.forward: this.moveForward = false; break;
      case kb.backward: this.moveBackward = false; break;
      case kb.left: this.strafeLeft = false; break;
      case kb.right: this.strafeRight = false; break;
    }
  }


}

// export {
//   Player
// }
