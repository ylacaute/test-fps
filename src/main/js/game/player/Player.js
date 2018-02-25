import * as BABYLON from 'babylonjs';

import Hammer from "game/weapons/Hammer";



let CameraType = {
  UNSET : -1,
  FIRST_PERSON : 0,
  THIRD_PERSON : 1
};

export default class Player {

  // Number of frames to take off (avoid collision check during this time)
  TAKE_OFF_FRAMES = 5;

  gravity = -0.3;

  game = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  requireStopMoveForward = false;
  requireStopMoveBackward = false;
  requireStopStrafeLeft = false;
  requireStopStrafeRight = false;
  moving = false;
  jumping = false;
  jumpVector = null;
  jumpTakeOffFrames = this.TAKE_OFF_FRAMES;

  onAir = false;
  running = false;
  next_pos = { x: 0, y: 0, z: 0 };

  isMouseDown = false;

  speed = 0.5;



  force_y = 0;
  startingPosition = new BABYLON.Vector3(0, 40, 0);


  // SCENE OBJECTS
  camera = {
    type : CameraType.UNSET,
    current: null,
    firstPersonCamera: null,
    thirdPersonCamera: null
  };

  body = {
    meshes : null,
    container : null
  };

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
    game.scene.registerBeforeRender(this.beforeRender.bind(this), false);
  }

  startPlaying() {
    this.setCameraType(CameraType.THIRD_PERSON);
    //this.weapon.enabled = true;
    //let skeletons = this.game.skeletons.player;
    //var animation = this.game.scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
  }

  stopPlaying() {
    this.setCameraType(CameraType.UNSET);
  }

  enableMeshes(value) {
    this.body.container.setEnabled(value);
  }

  beforeRender() {
    let body = this.body.container;
    let cam = this.camera.current;

    if (this.camera.type === CameraType.THIRD_PERSON) {
      body.rotation.y = Math.PI / 2 - cam.alpha;
    } else {
      body.rotation.y = - Math.PI + cam.rotation.y;
      cam.position = body.position.clone();
      cam.position.y += 4;
    }
    if (this.jumpTakeOffFrames > 0) {
      this.jumpTakeOffFrames--;
    }
    if (this.onAir && this.jumpTakeOffFrames === 0
          && body.intersectsMesh(this.game.scene.getMeshByName("ground"), true)) {
        this.landing();
    }
    if (this.onAir && body.intersectsMesh(this.game.scene.getMeshByName("box"), true)) {
      this.onAir = false;
    }

    if (this.jumping) { // Jumping, can't change any direction
      body.moveWithCollisions(this.jumpVector);
    } else if (this.moving) { // Moving and apply gravity
      body.moveWithCollisions(this.getCurrentMoveVector(body, this.gravity, this.speed));
    } else { // Just apply gravity
      body.moveWithCollisions(new BABYLON.Vector3(0, this.gravity, 0));
    }

    //console.log("ON AIR : " + this.onAir);

  }

  getCurrentMoveVector(body, gravity, speed) {
    let yRotation = body.rotation.y;
    let strafeModificator = (this.moveBackward || this.moveForward) ? 4 : 2;
    let sign = this.moveForward ? 1 : -1;
    let xDir = 0;
    let zDir = 0;

    if (this.moving) {
      if (this.strafeLeft) {
        yRotation = yRotation - (Math.PI / strafeModificator) * sign;
      } else if (this.strafeRight) {
        yRotation = yRotation + (Math.PI / strafeModificator) * sign;
      }
      xDir = parseFloat(Math.sin(parseFloat(yRotation))) * speed;
      zDir = parseFloat(Math.cos(parseFloat(yRotation))) * speed;
      if (this.moveForward) {
        xDir = -xDir;
        zDir = -zDir;
      }
    }
    return new BABYLON.Vector3(xDir, gravity, zDir);
  }

  landing() {
    this.onAir = false;
    this.game.sounds.land.play();

    console.log("End player jump");
    this.jumping = false;
    this.game.scene.stopAnimation(this.body.container, "jump");
    if (this.requireStopMoveForward) {
      this.moveForward = this.requireStopMoveForward = false;
    }
    if (this.requireStopMoveBackward) {
      this.moveBackward = this.requireStopMoveBackward = false;
    }
    if (this.requireStopStrafeLeft) {
      this.strafeLeft = this.requireStopStrafeLeft = false;
    }
    if (this.requireStopStrafeRight) {
      this.strafeRight = this.requireStopStrafeRight = false;
    }
    if (!this.moveForward && !this.moveBackward && !this.strafeLeft && !this.strafeRight) {
      this.moving = false;
    }

  }

  beginJump() {
    console.log("Begin player jump");
    this.jumping = true;
    this.jumpTakeOffFrames = this.TAKE_OFF_FRAMES;
    this.onAir = true;
    this.jumpVector = this.getCurrentMoveVector(this.body.container, this.gravity, this.speed);

    let jumpAnimation = new BABYLON.Animation(
      "jump",
      "position.y",
      20,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    jumpAnimation.setKeys([
      { frame: 0, value: this.body.container.position.y },
      { frame: 8, value: this.body.container.position.y + 9 },
      { frame: 10, value: this.body.container.position.y + 10 },
     // { frame: 12, value: this.body.container.position.y + 9 },
     // { frame: 20, value: this.body.container.position.y }
    ]);
    this.body.container.animations.push(jumpAnimation);
    this.game.scene.beginAnimation(this.body.container, 0, 10, false, 1, this.endJump.bind(this));
    this.game.sounds.jump.play();
  }

  endJump() {

  }

  createBody(game) {
    console.log("Initializing player body...");
    this.body.meshes = game.meshes.player;
    //this.body.container = game.meshes.player[0];
    //this.body.container = new BABYLON.Mesh("container", game.scene);
    this.body.container = new BABYLON.MeshBuilder.CreateBox("box", {
      height: 10,
      width: 3,
      depth: 2,
    }, game.scene);
    this.body.container.position = new BABYLON.Vector3(4, 50, 4);
    this.body.container.checkCollisions = true;
    this.body.container.ellipsoid = new BABYLON.Vector3(0.5, 4.9, 0.5);
    this.body.container.material = new BABYLON.StandardMaterial("mat", game.scene);
    this.body.container.material.alpha = 0;

    //this.body.container.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);
    //this.body.container.applyGravity = true;

    this.body.meshes[0].scaling = new BABYLON.Vector3(0.14, 0.14, 0.14);
    this.body.meshes[0].parent = this.body.container;
    this.body.meshes[0].position.y = -10 / 2;

    var animation = game.scene.beginAnimation(game.skeletons.player[0], 0, 100, true, 1.0);


    this.body.container.actionManager = new BABYLON.ActionManager(game.scene);

    this.body.container.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction({
          trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
          parameter: game.scene.getMeshByName("box")
        }, this.landing.bind(this)
      )
    );



  }

  createCameras(game) {
    let cam;
    let target = this.body.container.position.clone();

    target.y += 1;
    cam = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), game.scene);
    cam.position.y = 5;
    //cam.parent = this.body.container;
    cam.inputs.removeByType("FreeCameraKeyboardMoveInput");
    //cam.checkCollisions = true;
    ///cam.applyGravity = true;
    //cam.ellipsoid = new BABYLON.Vector3(1, 2, 1);
    // cam.keysUp.push(90);
    // cam.keysDown.push(83);
    // cam.keysLeft.push(81);
    // cam.keysRight.push(68);
    cam.position = this.startingPosition;
    cam.attachControl(game.canvas, true);
    this.camera.firstPersonCamera = cam;

    //.getRenderingCanvas()

    //cam = new BABYLON.ArcRotateCamera("camera", 0, 1, 25, this.body[0], game.scene);
    cam = new BABYLON.ArcRotateCamera("camera", 0, 1, 20, this.body.container, game.scene);
    //cam.setPosition(new BABYLON.Vector3(4, 55, 4));

    cam.attachControl(game.canvas, true);
    // cam.maxZ = 5000;
    // cam.lowerRadiusLimit = 120;
    // cam.upperRadiusLimit = 430;
    // cam.lowerBetaLimit =0.75;
    // cam.upperBetaLimit =1.58 ;

    this.camera.thirdPersonCamera = cam;

    this.setCameraType(CameraType.THIRD_PERSON);
  }

  setCameraType(cameraType) {
    if (this.camera.type !== CameraType.UNSET) {
      this.camera.current.detachControl(this.canvas);
    }
    switch (cameraType) {
      case CameraType.FIRST_PERSON:
        console.log("Player: set first person camera");
        this.camera.current = this.camera.firstPersonCamera;
        this.enableMeshes(false);
        break;
      case CameraType.THIRD_PERSON:
        console.log("Player: set third person camera");
        this.camera.current = this.camera.thirdPersonCamera;
        this.enableMeshes(true);
        break;
      case CameraType.UNSET:
        this.enableMeshes(true);
        break;
    }
    if (cameraType !== CameraType.UNSET) {
      this.camera.type = cameraType;
      this.game.scene.activeCamera = this.camera.current;
      this.game.scene.activeCamera.attachControl(this.canvas);
    }
  }

  switchCameraType() {
    switch (this.camera.type) {
      case CameraType.FIRST_PERSON:
        this.setCameraType(CameraType.THIRD_PERSON);
        break;
      case CameraType.THIRD_PERSON:
        this.setCameraType(CameraType.FIRST_PERSON);
        break;
      default:
        break;
    }
  }

  test() {

  }

  fire() {
    // if (this.weapon.canHit()) {
    //   this.weapon.hit();
    // }
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
      case kb.jump:
        if (!this.jumping) {
          this.beginJump();
        }
        break;
      case kb.forward:
        if (!this.jumping) {
          this.moveForward = true;
          this.moving = true;
        }
        break;
      case kb.backward:
        if (!this.jumping) {
          this.moveBackward = true;
          this.moving = true;
        }
        break;
      case kb.left:
        if (!this.jumping) {
          this.strafeLeft = true;
          this.moving = true;
        }
        break;
      case kb.right:
        if (!this.jumping) {
          this.strafeRight = true;
          this.moving = true;
        }
        break;
      case 69: this.switchCameraType(); break; // E
      case 82: this.test(); break; // R
      //case 71: this.firstPersonCamera.applyGravity = !this.firstPersonCamera.applyGravity; break; // R
    }
  }

  onKeyUp(event) {
    let kb = this.game.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.forward:
        if (this.jumping) {
          this.requireStopMoveForward = true;
        } else {
          this.moveForward = false;
        }
        break;
      case kb.backward:
        if (this.jumping) {
          this.requireStopMoveBackward = true;
        } else {
          this.moveBackward = false;
        }
        break;
      case kb.left:
        if (this.jumping) {
          this.requireStopStrafeLeft = true;
        } else {
          this.strafeLeft = false;
        }
        break;
      case kb.right:
        if (this.jumping) {
          this.requireStopStrafeRight = true;
        } else {
          this.strafeRight = false;
        }
        break;
    }
    if (!this.moveForward && !this.moveBackward && !this.strafeLeft && !this.strafeRight) {
      this.moving = false;
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


// DISABLE PHYSIC ENGINE FOR PLAYER
// this.body.container.impostor = new BABYLON.PhysicsImpostor(this.body.container,
//   BABYLON.PhysicsImpostor.BoxImpostor, {
//     mass: 100,
//     friction: 0,
//     restitution: 0,
//     disableBidirectionalTransformation: true
//   }, game.scene);
// let ground = game.scene.getMeshByName("ground");
// this.body.container.impostor.registerOnPhysicsCollide(ground.physicsImpostor, function(main, collided) {
//   //main.object.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
//   console.log("COLLISION PLAYER ON GROUND !!!!!!!!!!!!");
//   this.jumping = false;
// });
