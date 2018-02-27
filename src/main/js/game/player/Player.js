import * as BABYLON from 'babylonjs';

import Hammer from "game/weapons/Hammer";



let CameraType = {
  UNSET : -1,
  FIRST_PERSON : 0,
  THIRD_PERSON : 1
};

export default class Player {

  // Ignore x successive collisions on ground (bounces)
  IGNORE_SUCCESSIVE_GROUND_COLLISION_FRAME = 3;

  game = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  moving = false;
  jumping = false;
  isMouseDown = false;
  speed = 50;
  ignoredSuccessiveGroundCollision = 0;

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
    for (let i = 0; i < this.body.meshes.length; i++) {
      this.body.meshes[i].setEnabled(value);
    }
  }

  updateCamera() {
    let body = this.body.container;
    let cam = this.camera.current;

    if (this.camera.type === CameraType.THIRD_PERSON) {
      body.rotation.y = Math.PI / 2 - cam.alpha;
    } else {
      body.rotation.y = - Math.PI + cam.rotation.y;
      cam.position = body.position.clone();
      cam.position.y += 4;
      cam.position.z -= 4;
    }
  }

  beforeRender() {
    this.updateCamera();

    let body = this.body.container;

    if (body.intersectsMesh(this.game.scene.getMeshByName("box2"), true)) {
      this.game.scene.getMeshByName("box2").material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    }
    if (this.jumping) {
      // Jumping, can't change movement
    } else if (this.moving) {
      // Moving and apply gravity
      body.impostor.setLinearVelocity(this.getCurrentMoveVector(body, this.gravity, this.speed));
    } else {
      // Just apply gravity
      body.impostor.setLinearVelocity(new BABYLON.Vector3(0, body.impostor.getLinearVelocity().y, 0));
    }
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
    gravity = body.impostor.getLinearVelocity().y;
    return new BABYLON.Vector3(xDir, gravity, zDir);
  }

  landing() {
    this.game.sounds.land.play();
    this.jumping = false;
    this.game.scene.stopAnimation(this.body.container, "jump");
  }

  beginJump() {
    this.jumping = true;
    this.body.container.impostor.applyImpulse(new BABYLON.Vector3(0, 3000, 0), this.body.container.getAbsolutePosition());
    this.game.sounds.jump.play();
  }

  createBody(game) {
    console.log("Initializing player body...");
    this.body.meshes = game.meshes.player;
    this.body.container = new BABYLON.MeshBuilder.CreateBox("box", {
      height: 10,
      width: 3,
      depth: 2,
    }, game.scene);
    this.body.container.position = new BABYLON.Vector3(4, 50, 4);
    this.body.container.ellipsoid = new BABYLON.Vector3(3, 5, 3);
    this.body.container.material = new BABYLON.StandardMaterial("mat", game.scene);
    this.body.container.material.alpha = 0;
    this.body.meshes[0].scaling = new BABYLON.Vector3(0.14, 0.14, 0.14);
    this.body.meshes[0].parent = this.body.container;
    this.body.meshes[0].position.y = -10 / 2;
    var animation = game.scene.beginAnimation(game.skeletons.player[0], 0, 100, true, 1.0);

    this.body.container.impostor = new BABYLON.PhysicsImpostor(this.body.container,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 100,
        friction: 0,
        restitution: 0,
        disableBidirectionalTransformation: true
      }, game.scene);

    let self = this;
    this.body.container.impostor.registerOnPhysicsCollide(
      game.scene.getMeshByName("ground").impostor,
      function(main, collided) {
        if (self.ignoredSuccessiveGroundCollision === 0) {
          self.ignoredSuccessiveGroundCollision = self.IGNORE_SUCCESSIVE_GROUND_COLLISION_FRAME;
          console.log("COLLISION PLAYER ON GROUND");
          self.landing();
        } else {
          self.ignoredSuccessiveGroundCollision--;
        }

    });

    this.body.container.impostor.executeNativeFunction(function (world, body) {
      body.fixedRotation = true;
      body.updateMassProperties();
    });

  }

  createCameras(game) {
    let cam;
    let target = this.body.container.position.clone();

    target.y += 1;
    cam = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), game.scene);


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

    cam.inertia = 0.2;
    cam.angularSensibility = 1000;


    cam.attachControl(game.canvas, true);
    this.camera.firstPersonCamera = cam;

    //.getRenderingCanvas()

    //cam = new BABYLON.ArcRotateCamera("camera", 0, 1, 25, this.body[0], game.scene);
    cam = new BABYLON.ArcRotateCamera("camera", 0, 1, 20, this.body.container, game.scene);
    //cam.setPosition(new BABYLON.Vector3(4, 55, 4));
    cam.inertia = 0.2;
    cam.angularSensibility = 1000;
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
        this.moveForward = false;
        break;
      case kb.backward:
        this.moveBackward = false;
        break;
      case kb.left:
        this.strafeLeft = false;
        break;
      case kb.right:
        this.strafeRight = false;
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




//this.body.container.actionManager = new BABYLON.ActionManager(game.scene);

// this.body.container.actionManager.registerAction(
//   new BABYLON.ExecuteCodeAction({
//       trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
//       parameter: game.scene.getMeshByName("box")
//     }, this.landing.bind(this))
// );
// this.body.container.actionManager.registerAction(
//   new BABYLON.ExecuteCodeAction({
//       trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
//       parameter: game.scene.getMeshByName("ground")
//     }, this.landing.bind(this))
// );
