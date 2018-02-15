
import { shortcutJS } from 'shortcutjs';

export default class Player {

  camera = null;

  constructor(game, canvas) {
    let self = this;
    this.game = game;


    // Axe de mouvement X et Z
    this.axisMovement = [false, false, false, false];

    shortcutJS.subscribe('moveForward', () => {
      //_this.camera.axisMovement[0] = false;
      console.log("MOVE FORWARD");
    });

    // window.addEventListener("keyup", (evt) => {
    //   switch(evt.keyCode){
    //     // case 90:
    //     //   _this.camera.axisMovement[0] = false;
    //     //   break;
    //     case 83:
    //       _this.camera.axisMovement[1] = false;
    //       console.log("HUMMM");
    //       break;
    //     case 81:
    //       _this.camera.axisMovement[2] = false;
    //       break;
    //     case 68:
    //       _this.camera.axisMovement[3] = false;
    //       break;
    //   }
    // }, false);
    //
    // window.addEventListener("keydown", (evt) => {
    //   switch(evt.keyCode){
    //     case 90:
    //       _this.camera.axisMovement[0] = true;
    //       break;
    //     case 83:
    //       _this.camera.axisMovement[1] = true;
    //       break;
    //     case 81:
    //       _this.camera.axisMovement[2] = true;
    //       break;
    //     case 68:
    //       _this.camera.axisMovement[3] = true;
    //       break;
    //   }
    // }, false);

    this.initCamera(this.game.scene, canvas);
  };

  initCamera(scene, canvas) {
    this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-20, 5, 0), scene);
    let camera = this.camera;

    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.checkCollisions = true;

    // Look point 0 of scene
    camera.setTarget(BABYLON.Vector3.Zero());

    // User can move camera from keyboard
    // camera.attachControl(canvas, true);



    let beforeRenderFunction = function () {
      // Camera
      if (camera.beta < 0.1)
        camera.beta = 0.1;
      else if (camera.beta > (Math.PI / 2) * 0.9)
        camera.beta = (Math.PI / 2) * 0.9;

      if (camera.radius > 50)
        camera.radius = 50;

      if (camera.radius < 5)
        camera.radius = 5;
    };

    scene.registerBeforeRender(beforeRenderFunction);

  }

}



