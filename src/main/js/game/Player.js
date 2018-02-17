import * as BABYLON from 'babylonjs';

export default class Player {

  game = null;
  camera = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  jumping = false;
  running = false;
  next_pos = { x: 0, y: 0, z: 0 };
  weapon = null;
  speed = 1;

  dir_x = 0;
  dir_z = 0;
  force_y = 0;

  constructor(game) {
    console.log("Creating player for " + game.gameMod);
    this.game = game;

    this.createCamera(game);
    this.createWeapon(game);

    // INPUTS
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    window.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    window.addEventListener("mouseup", this.onMouseUp.bind(this), false);

    // PLAYER ACTIONS
  }

  startPlaying() {
    this.game.scene.activeCamera = this.camera;
  }

  stopPlaying() {

  }

  update(deltaTime) {
    if (this.dir_x || this.dir_z) {
      console.log("UPD PLAYER");
      let angle = this.camera.rotation.y;
      //let speed = lerp(this.minSpeed, this.maxSpeed, this.config.drug.drug_ratio);
      this.next_pos.x -= Math.cos(angle) * this.dir_x * this.speed * deltaTime;
      this.next_pos.z += Math.sin(angle) * this.dir_x * this.speed * deltaTime;
      this.next_pos.x -= Math.cos(angle + Math.PI / 2) * this.dir_z * this.speed * deltaTime;
      this.next_pos.z += Math.sin(angle + Math.PI / 2) * this.dir_z * this.speed * deltaTime;
    }

    // gravité
    //this.force_y -= 0.0001 * deltaTime;
    //this.next_pos.y += this.force_y * deltaTime;


  }

  createCamera(game) {
    //let camTarget = new BABYLON.Vector3(this.next_pos.x, this.next_pos.y, this.next_pos.z);
    //let camTarget = new BABYLON.Vector3(this.next_pos.x, this.next_pos.y, this.next_pos.z);

    this.camera = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), game.scene);
    //this.camera.fov = Math.PI / 2;
    this.camera.minZ = 0.001;

    // this.camera.checkCollisions = false;
    // this.camera.applyGravity = false;
    // this.camera.ellipsoid = null;

    this.camera.checkCollisions = true;
    this.camera.applyGravity = true;
    this.camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    //this.camera.speed = 0;
    //this.camera.inertia = 0;
    //this.camera.angularSensibility = 300; // lower is more sensible

    this.camera.attachControl(game.canvas, true);
    this.camera.position = new BABYLON.Vector3(0, 5, 0);

    this.position = this.camera.position;
  }

  createWeapon(game) {
    console.log("Creating weapon from ", game.meshes.gun);
    this.weapon = game.meshes.gun;
    this.weapon.setEnabled(true);
    this.weapon.parent = this.camera; // The weapon will move with the player camera
    this.weapon.material = new BABYLON.StandardMaterial("weaponMat", game.scene);
    this.weapon.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.weapon.material.specularColor = new BABYLON.Color3(1, 0, 0);
    this.weapon.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
    this.weapon.position = new BABYLON.Vector3(1, -2, 2);
    this.weapon.rotation = new BABYLON.Vector3(-Math.PI / 8, -Math.PI / 40, 0);

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

  fire() {
    this.game.scene.beginAnimation(this.weapon, 0, 100, false, 10, null);
    this.game.sounds.shot.play();

    // var pickedInfo = window.scene.pick(window.innerWidth * 0.5, window.innerHeight * 0.5, null, false);
    //
    // if (pickedInfo.pickedMesh && pickedInfo.pickedMesh.name) {
    //   if (pickedInfo.pickedMesh.name.indexOf("enemy") != -1) {
    //     this.config.AIManager.hurtAI(pickedInfo.pickedMesh.name, this.shotDammage);
    //   }
    //   this.config.ParticlesManager.launch("impact", pickedInfo.pickedPoint);
    // }

  }


  onMouseDown(event) {
    console.log("onMouseUp");
  }

  onMouseUp(event) {
    console.log("onMouseUp");
  }

  onKeyDown(event) {
    //console.log("KeyDown : " + event.keyCode);
    this.game.sounds.shot.play();
    let kb = this.game.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.jump: this.running = true; break;
      case kb.forward: this.moveForward = true; this.dir_z = 1; break;
      case kb.backward: this.moveBackward = true; this.dir_z = -1; break;
      case kb.left: this.strafeLeft = true; this.dir_x = 1; break;
      case kb.right: this.strafeRight = true; this.dir_x = -1; break;
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


}

// export {
//   Player
// }
