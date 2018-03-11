import * as BABYLON from 'babylonjs';

import Hammer from "game/weapons/Hammer";
import Bazooka from "../weapons/Bazooka";
import Helper from "game/Helper";

function vecToLocal(vector, mesh){
  var m = mesh.getWorldMatrix();
  var v = BABYLON.Vector3.TransformCoordinates(vector, m);
  return v;
}


let CameraType = {
  UNSET: -1,
  FIRST_PERSON: 0,
  THIRD_PERSON: 1
};


let PhysicState = {
  WAITING: 0,
  MOVING: 1,
  JUMPING: 2
};

let PhysicEvent = {
  REQUEST_START_MOVE: 0,
  REQUEST_STOP_MOVE: 1,
  REQUEST_START_JUMP: 2,
  REQUEST_STOP_JUMP: 3,
  REQUEST_START_WAIT: 4
};


let EPSILON = 0.01;

export default class Player {

  config = null;
  game = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  moving = false;
  jumping = false;
  firing = false;

  // Better gamePlay
  jumpRequestTimestamp = 0;
  jumpRequestMaxDelay = 50; // ms


  isMouseDown = false;

  acceleration = 0.8;
  deceleration = 2;
  maxSpeed = 100;
  maxWalkSpeed = 50;
  minSpeed = 20;
  speed = this.minSpeed;

  ignoreGroundCollisionTime = 400;
  ignoreGroundCollision = false;

  startingPosition = new BABYLON.Vector3(0, 40, 0);

  // SCENE OBJECTS
  camera = {
    type : CameraType.UNSET,
    current: null,
    firstPersonCamera: null,
    thirdPersonCamera: null
  };

  body = {
    height: 10,
    rotation: new BABYLON.Vector3(0, 0, 0),
    container : null,
    meshes : null,
    feetRay: null
  };

  animation = {
    wait: null,
    walk: null,
    jump: null
  };

  physicState = null;
  weapon = null;

  constructor(game) {
    console.log("Creating player for " + game.gameMod.name);
    this.game = game;
    this.config = game.getPlayerConfig();
    this.createBody(game);
    this.createCameras(game);
    this.createCrosshair(game);
    this.createFeetRay(game);
    this.createFireRay(game);
    this.onPhysicEvent(PhysicEvent.REQUEST_START_WAIT);

    if (game.config.core.debug) {
      var localOrigin = Helper.createLocalAxes(game.scene, 3);
      localOrigin.parent = this.body.container;
    }

    //this.weapon = new Hammer(game, this.firstPersonCamera);
    this.weapon = new Bazooka(game, this.camera.firstPersonCamera);
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    document.addEventListener("mouseup", this.onMouseUp.bind(this), false);
    game.scene.registerBeforeRender(this.beforeRender.bind(this), false);
  }

  startPlaying() {
    this.setCameraType(CameraType.THIRD_PERSON);
    //this.weapon.enabled = true;
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
      body.rotation.y = -Math.PI / 2 - cam.alpha;
    } else {
      body.rotation.y = cam.rotation.y;
      cam.position.copyFrom(body.position);
      cam.position.y += 4;
    }
  }

  beforeRender() {
    this.updateCamera();
    let body = this.body.container;

    // TMP
    if (body.intersectsMesh(this.game.scene.getMeshByName("box2"), true)) {
      this.game.scene.getMeshByName("box2").material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    }

    if (this.firing && !this.weapon.isOnCooldown()) {
      this.fire();
    }

    if (this.jumping) {
      // Can't change movement by apply accel to finish at maxSpeed when keep jumping and moving
      if (this.moving) {
        if (this.speed < this.maxSpeed) {
          this.speed += this.acceleration;
        }
      }
    } else if (this.moving) {
      // Apply accel/decel to finish at maxWalkSpeed when keep walking
      if (this.speed < this.maxWalkSpeed) {
        this.speed += this.acceleration;
      }
      if (this.speed > this.maxWalkSpeed) {
        this.speed -= this.deceleration;
      }
      // Moving and apply gravity
      let vect = this.getCurrentMoveVector(body, this.gravity, this.speed);
      body.impostor.setLinearVelocity(vect);
    } else {
      // Just apply gravity and deceleration
      body.impostor.setLinearVelocity(new BABYLON.Vector3(0, body.impostor.getLinearVelocity().y, 0));
      if (this.speed > this.minSpeed) {
        this.speed -= this.deceleration;
        if (this.speed < this.minSpeed) {
          this.speed = this.minSpeed;
        }
      }
    }
  }

  getCurrentDirectionVector() {
    let xDir = -parseFloat(Math.sin(parseFloat(this.body.currentYRotation)));
    let zDir = -parseFloat(Math.cos(parseFloat(this.body.currentYRotation)));
    return new BABYLON.Vector3(xDir, 0, zDir);
  }

  getCurrentMoveVector(body, gravity, speed) {
    let yRotation = body.rotation.y;
    let strafeModificator = (this.moveBackward || this.moveForward) ? 4 : 2;
    let sign = this.moveBackward ? -1 : 1;
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
      if (this.moveBackward) {
        xDir = -xDir;
        zDir = -zDir;
      }
    }
    gravity = body.impostor.getLinearVelocity().y;
    return new BABYLON.Vector3(xDir, gravity, zDir);
  }

  startWaiting() {
    console.log("startWaiting");
    let frames = this.config.skin.animation.waitFrames;
    this.animation.wait = this.game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], false, 1.0);
  }

  startWalking() {
    console.log("startWalking");
    if (!this.animation.walk) {
      let frames = this.config.skin.animation.walkFrames;
      this.animation.walk = this.game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], true, 1.0);
    } else {
      this.animation.walk.restart();
    }
  }

  stopWalking() {
    console.log("stopWalking");
    if (this.animation.walk) {
      this.animation.walk.pause();
    }
  }

  startJumping() {
    console.log("startJumping");
    this.animation.walk = null;
    this.body.container.impostor.applyImpulse(new BABYLON.Vector3(0, 2500, 0), this.body.container.getAbsolutePosition());
    this.game.sounds.jump.play();
    let frames = this.config.skin.animation.jumpFrames;
    this.animation.jump = this.game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], false, 1.0);
  }

  landing() {
    console.log("landing");
    this.game.sounds.land.play();
    if (this.moving) {
      this.startWalking();
    }
    if (this.jumping) {
      this.onPhysicEvent(PhysicEvent.REQUEST_STOP_JUMP);
    }
  }

  stopJumping() {
    console.log("stopJumping");
    if (this.animation.jump) {
      this.animation.jump.pause();
    }
  }

  createBody(game) {
    console.log("Initializing player body...");
    let skin = this.config.skin;
    this.body.meshes = game.meshes[skin.name];
    this.body.skeletons = game.skeletons[skin.name];
    // this.body.container = new BABYLON.MeshBuilder.CreateBox("box", {
    //   height: this.body.height,
    //   width: 3,
    //   depth: 2,
    // }, game.scene);
    this.body.container = new BABYLON.MeshBuilder.CreateSphere("box", {
      diameterX: 4,
      diameterY: this.body.height,
      diameterZ: 4,
    }, game.scene);
    this.body.container.position = new BABYLON.Vector3(0, 10, 0);
    this.body.container.material = new BABYLON.StandardMaterial("mat", game.scene);
    this.body.container.material.alpha = game.config.core.debug ? 0.5 : 0;
    // this.body.container.rotation.y = Math.PI;
    this.body.meshes[0].scaling = new BABYLON.Vector3(skin.scale[0], skin.scale[1], skin.scale[2]);
    this.body.meshes[0].parent = this.body.container;
    this.body.meshes[0].rotation.x = skin.rotation[0];
    this.body.meshes[0].rotation.y = skin.rotation[1];
    this.body.meshes[0].rotation.z = skin.rotation[2];
    this.body.meshes[0].position.y = this.body.height / 2;
    this.body.meshes[0].position.y = -this.body.height / 2;
    this.body.container.impostor = new BABYLON.PhysicsImpostor(this.body.container,
      BABYLON.PhysicsImpostor.SphereImpostor, {
        mass: 100,
        friction: 0,
        restitution: 0,
        disableBidirectionalTransformation: true
      }, game.scene);
    for (let i = 0; i < game.physicsImpostors.length; i++) {
      this.body.container.impostor.registerOnPhysicsCollide(
        game.physicsImpostors[i], this.checkFeetRayCollision.bind(this));
    }
    // Avoid rotation on the Y axis
    this.body.container.impostor.executeNativeFunction(function (world, body) {
      body.fixedRotation = true;
      body.updateMassProperties();
    });
  }

  onPhysicEvent(physicEvent) {
    switch (physicEvent) {
      case PhysicEvent.REQUEST_START_WAIT:
        this.startWaiting();
        this.speed = this.minSpeed;
        break;
      case PhysicEvent.REQUEST_START_MOVE:
        if (!this.jumping) {
          this.startWalking();
        }
        this.moving = true;
        break;
      case PhysicEvent.REQUEST_STOP_MOVE:
        if (!this.jumping) {
          this.stopWalking();
        }
        this.moving = false;
        break;
      case PhysicEvent.REQUEST_START_JUMP:
        if (!this.jumping) {
          this.startJumping();
        } else {
          // We "may" accept jump input even a fraction of second too early for better game play
          this.jumpRequestTimestamp = Date.now();
        }
        this.jumping = true;
        break;
      case PhysicEvent.REQUEST_STOP_JUMP:
        if (Date.now() - this.jumpRequestTimestamp <= this.jumpRequestMaxDelay) {
          let self = this;
          setTimeout(() => {
            self.startJumping();
            self.jumping = true;
          }, 50);
        } else {
          this.jumping = false;
          this.stopJumping();
          if (!this.moving) {
            this.onPhysicEvent(PhysicEvent.REQUEST_START_WAIT);
          }
        }
        this.jumpRequestTimestamp = 0;
        break;
    }
  }

  /**
   * The ray starts from "inside" the body of 0.1, is very shord (0.1) and
   * create an event when hitting anything.
   */
  createFeetRay(game) {
    let startingYPostion = -this.body.height / 2 + 0.5;
    this.body.feetRay = new BABYLON.Ray();
    let rayHelper = new BABYLON.RayHelper(this.body.feetRay);
    let localMeshDirection = new BABYLON.Vector3(0, -1, 0);
    let loalMeshOrigin = new BABYLON.Vector3(0, startingYPostion, 0);
    let rayLength = 2;
    rayHelper.attachToMesh(this.body.container, localMeshDirection, loalMeshOrigin, rayLength);
    if (game.config.core.debug) {
      rayHelper.show(this.game.scene, new BABYLON.Color3(1, 1, 1));
    }
  }

  createFireRay(game) {
    this.body.fireRay = new BABYLON.Ray();
    let rayHelper = new BABYLON.RayHelper(this.body.fireRay);
    let localMeshDirection = new BABYLON.Vector3(0, 0, 1);
    let localMeshOrigin = new BABYLON.Vector3(0, 0, 0);
    let rayLength = 100;
    rayHelper.attachToMesh(this.camera.firstPersonCamera, localMeshDirection, localMeshOrigin, rayLength);
  }

  checkFeetRayCollision(main, collided) {
    let hitInfo = this.body.feetRay.intersectsMeshes([collided.object]);
    if (hitInfo.length) {
      if (!this.ignoreGroundCollision) {
        this.ignoreGroundCollision = true;
        this.landing();
        let self = this;
        setTimeout(() => {
          self.ignoreGroundCollision = false
        }, self.ignoreGroundCollisionTime);
      }
    }
  }

  createCameras(game) {
    let cam;
    let target = this.body.container.position.clone();
    target.y += 1;
    cam = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), game.scene);
    cam.inputs.removeByType("FreeCameraKeyboardMoveInput");
    cam.noRotationConstraint = true;
    //cam.position = this.startingPosition;
    cam.inertia = 0.2;
    cam.angularSensibility = 1000;
    //cam.fov = 90.00 * (Math.PI / 180);
    cam.attachControl(game.canvas, true);
    this.camera.firstPersonCamera = cam;
    //cam.parent = this.body.container;

    cam = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, 1, 20, this.body.container, game.scene);
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

  createCrosshair(game) {
    let crosshairName = this.config.crosshair.name;
    let myPlane = BABYLON.MeshBuilder.CreatePlane("myPlane", {width: 0.07, height: 0.07}, game.scene);
    myPlane.position.z = 2;
    myPlane.parent = this.camera.firstPersonCamera;
    //myPlane.position.y = -0.03;
    myPlane.material = new BABYLON.StandardMaterial('crosshairMat', game.scene);
    myPlane.material.diffuseTexture = game.textures[crosshairName];
    myPlane.material.diffuseTexture.hasAlpha = true;
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

  fire() {
    console.log("FIRE - body rotation :", this.camera.current.rotation);
    // this.weapon.fire(this.camera.firstPersonCamera.position,
    //   new BABYLON.Vector3(this.body.rotation.x, this.body.rotation.y, 0));
    this.weapon.fire(this.camera.firstPersonCamera.position, this.camera.current.rotation);
  }

  onKeyDown(event) {
    //console.log("KeyDown : " + event.keyCode);
    let wasMoving = this.moving;
    let kb = this.config.keyBindings;
    switch(event.keyCode){
      case kb.jump:
        this.onPhysicEvent(PhysicEvent.REQUEST_START_JUMP);
        break;
      case kb.forward:
        this.moveForward = true;
        break;
      case kb.backward:
        this.moveBackward = true;
        break;
      case kb.left:
        this.strafeLeft = true;
        break;
      case kb.right:
        this.strafeRight = true;
        break;
      case kb.switchCamera:
        this.switchCameraType();
        break;
    }
    if (wasMoving !== (this.moveForward || this.moveBackward || this.strafeLeft || this.strafeRight)) {
      this.onPhysicEvent(PhysicEvent.REQUEST_START_MOVE);
    }
  }

  onKeyUp(event) {
    let wasMoving = this.moving;
    let kb = this.config.keyBindings;
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
    if (wasMoving !== (this.moveForward || this.moveBackward || this.strafeLeft || this.strafeRight)) {
      this.onPhysicEvent(PhysicEvent.REQUEST_STOP_MOVE);
    }
  }

  onMouseDown() {
    this.isMouseDown = true;
    this.firing = true;
  }

  onMouseUp() {
    this.isMouseDown = false;
    this.firing = false;
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

// setPhysicState(physicState) {
//   switch (physicState) {
//     case PhysicState.WAITING:
//
//       break;
//     case PhysicState.MOVING:
//
//       break;
//     case PhysicState.JUMPING:
//
//       break;
//   }
// }
