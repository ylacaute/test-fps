import * as BABYLON from 'babylonjs';


import FreeCameraKeyboardRotateInput from 'FreeCameraKeyboardRotateInput';

export default class FirstPlayer {

  scene = null;
  camera = null;

  constructor(game, canvas) {
    this.camera = this.createCamera(game.scene, canvas);
    this.scene = game.scene;
    this.scene.registerBeforeRender(this.beforeRender.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  beforeRender() {
    let speed = 1;
    if (this.scene.isReady()) {

      if (this.moveForward) {
        console.log("MOVING");

        let forward = new BABYLON.Vector3(
          parseFloat(Math.sin(parseFloat(this.camera.rotation.y))) / speed,
          0.5,
          parseFloat(Math.cos(parseFloat(this.camera.rotation.y))) / speed);
        forward = forward.negate();
        this.camera.moveWithCollisions(forward);

      }

    }
  }

  createCamera(scene, canvas) {
    let camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(1, 3.5, 1), scene);
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.attachControl(canvas, true); // canvas, noPreventDefault
    scene.activeCamera = camera;
    //let inputManager = camera.inputs;
    camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
    camera.inputs.add(new FreeCameraKeyboardRotateInput());

    return camera;
  }

  onKeyDown(event) {
    console.log("key : " + event.keyCode);
    switch(event.keyCode){
      case 16: this.running = true; break;
      case 90: this.moveForward = true; break;
      case 83: this.moveBackward = true; break;
      case 81: this.strafeLeft = true; break;
      case 68: this.strafeRight = true; break;
    }
  }

  onKeyUp(event) {
    switch(event.keyCode){
      case 16: this.running = false; break;
      case 32:
        if (!this.jumping) {
          //this.jump();
          console.log("Begin of jump");
          this.jumping = true;
        }
        break;
      case 90: this.moveForward = false; break;
      case 83: this.moveBackward = false; break;
      case 81: this.strafeLeft = false; break;
      case 68: this.strafeRight = false; break;
    }
    //this.playAnnimation = false;
    //this.scene.stopAnimation(this.skeletonsPlayer[0]);
  }

}
