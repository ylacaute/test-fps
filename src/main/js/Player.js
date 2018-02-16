import * as BABYLON from 'babylonjs';

export default class Player {

  mass = 5;

  camera = null;
  //physicsImpostor = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  jumping = false;
  running = false;

  playAnnimation = false;
  meshPlayer = null;
  meshOctree = null;
  skeletonsPlayer = [];
  walkingSpeed = 10;
  runningSpeed = 2;
  walkingAnimeSpeed = 1.5;
  runningAnimeSpeed = 5;

  constructor(game, loadedMeshes, particleSystems, skeletons) {
    this.scene = game.scene;
    console.log("Initializing player...");
    this.meshPlayer = loadedMeshes[0];
    this.meshOctree = loadedMeshes;
    this.meshPlayer.scaling= new BABYLON.Vector3(0.05, 0.05, 0.05);
    //this.meshPlayer.position = new BABYLON.Vector3(-5.168, 1.392, -7.463);
    this.meshPlayer.position = new BABYLON.Vector3(0, 5, 0);
    this.meshPlayer.rotation = new BABYLON.Vector3(0, 3.9, 0);
    game.camera.alpha = -parseFloat(this.meshPlayer.rotation.y) + 4.69;

    this.skeletonsPlayer[0] = skeletons[0];
    this.skeletonsPlayer.push(skeletons[0]);
    let totalFrame = skeletons[0]._scene._activeSkeletons.data.length;
    let start = 0;
    let end = 100;

    game.scene.beginAnimation(skeletons[0], 100 * start / totalFrame, 100 * end / totalFrame, true, this.walkingAnimeSpeed);
    this.meshPlayer.checkCollisions = true;
    this.meshPlayer.ellipsoid = new BABYLON.Vector3(0.5, 2, 0.5);
    this.meshPlayer.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);
    this.meshPlayer.applyGravity = true;

    game.scene.registerBeforeRender(this.beforeRender.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    console.log("Player initialization complete");
  }


  beforeRender() {
    if (this.scene.isReady() && this.meshPlayer) {
      //this.animatPlayer();
      this.animateActor();
    }
  }

  animateActor() {
    let speed = this.running ? this.runningSpeed : this.walkingSpeed;
    let animeSpeed = this.running ? this.runningAnimeSpeed : this.walkingAnimeSpeed;

    if(this.playAnnimation === false && (this.moveForward || this.moveBackward)) {
      let totalFrame = this.skeletonsPlayer[0]._scene._activeSkeletons.data.length;
      let start = 0;
      let end = 100;
      this.scene.beginAnimation(this.skeletonsPlayer[0], (100*start)/totalFrame, (100*end)/totalFrame, true, animeSpeed);
      this.meshPlayer.position = new BABYLON.Vector3(
        parseFloat(this.meshPlayer.position.x),
        parseFloat(this.meshPlayer.position.y),
        parseFloat(this.meshPlayer.position.z));
      this.playAnnimation = true;
    }
    if (this.moveForward) {
      let forward = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.meshPlayer.rotation.y))) / speed,
        0.5,
        parseFloat(Math.cos(parseFloat(this.meshPlayer.rotation.y))) / speed);
      forward = forward.negate();
      this.meshPlayer.moveWithCollisions(forward);
    }
    else if (this.moveBackward) {
      let backwards = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.meshPlayer.rotation.y))) / speed,
        -0.5,
        parseFloat(Math.cos(parseFloat(this.meshPlayer.rotation.y))) / speed);
      this.meshPlayer.moveWithCollisions(backwards);
    }
  }






  animatPlayer() {
    let xMove, yMove, zMove;
    xMove = 0;
    yMove = 0;
    zMove = 0;
    if (this.moveForward === true) {
      xMove = 0.5;
    }
    if (this.moveBackward === true) {
      xMove = -0.5;
    }
    if (this.strafeLeft === true) {
      zMove = 0.5;
    }
    if (this.strafeRight === true) {
      zMove = -0.5;
    }
      //console.log("this.mesh.rotation : ", this.mesh.rotation);
    // let forward = new BABYLON.Vector3(
    //   0.5,
    //   0, //parseFloat(Math.sin(parseFloat(this.mesh.rotation.y))) / speedCharacter,
    //   0, parseFloat(Math.cos(parseFloat(this.mesh.rotation.y))) / speedCharacter
    // );
    if (this.moveForward || this.moveBackward || this.strafeRight || this.strafeLeft) {
      let forward = new BABYLON.Vector3(xMove, yMove, zMove);
      //forward = forward.negate();
      this.mesh.moveWithCollisions(forward);
    }

  }

  onKeyDown(event) {
    console.log("key : " + event.keyCode);
    switch(event.keyCode){
      case 16: this.running = true; break;
      case 32: this.jumping = true; break;
      case 90: this.moveForward = true; break;
      case 83: this.moveBackward = true; break;
      case 81: this.strafeLeft = true; break;
      case 68: this.strafeRight = true; break;
    }
  }

  onKeyUp(event) {
    switch(event.keyCode){
      case 16: this.running = false; break;
      case 32: this.jumping = false; break;
      case 90: this.moveForward = false; break;
      case 83: this.moveBackward = false; break;
      case 81: this.strafeLeft = false; break;
      case 68: this.strafeRight = false; break;
    }
    this.playAnnimation = false;
    this.scene.stopAnimation(this.skeletonsPlayer[0]);
  }







  initCamera2(scene, canvas) {
    this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-20, 5, 0), scene);
    let camera = this.camera;

    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.checkCollisions = true;

    // Look point 0 of scene
    camera.setTarget(BABYLON.Vector3.Zero());

    // User can move camera from keyboard
    camera.attachControl(canvas, true);



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



/*

    shortcutJS.subscribe('moveForward', () => {
      //_this.camera.axisMovement[0] = false;
      console.log("MOVE FORWARD");
      this.moveEnabled[0] = true;
    });
    shortcutJS.subscribe('moveBackward', () => {
      //_this.camera.axisMovement[0] = false;
      console.log("MOVE BACKWARD");
      this.moveEnabled[0] = true;
    });
    shortcutJS.subscribe('strafeLeft', () => {
      //_this.camera.axisMovement[0] = false;
      console.log("STRAFE LEFT");
      this.moveEnabled[0] = true;
    });
    shortcutJS.subscribe('strafeRight', () => {
      //_this.camera.axisMovement[0] = false;
      console.log("STRAFE RIGHT");
      this.moveEnabled[0] = true;
    });

 */



//
// this.physicsImpostor = new BABYLON.PhysicsImpostor(
//   this.mesh,
//   BABYLON.PhysicsImpostor.BoxImpostor, {
//     mass: this.mass,
//     friction: 1, // 0 = huge sliding, max 1
//     restitution: 0 // 0 = no bounce, max 1
//   }, game.scene);
