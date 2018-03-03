import * as BABYLON from 'babylonjs';

import Hammer from "game/weapons/Hammer";

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

let EPSILON = 0.01;

export default class Player {

  config: null;

  // Ignore x successive collisions on ground (bounces)
  IGNORE_SUCCESSIVE_GROUND_COLLISION_FRAME = 5;

  game = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  moving = false;
  jumping = false;
  isMouseDown = false;
  speed = 50;

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
    container : null,
    meshes : null,
    feetRay: null
  };

  animation = {
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

    // if (Math.abs(this.body.previousY - this.body.container.position.y) > EPSILON) {
    //   this.checkFeetRayCollision();
    // } else {
    //   console.log("this.body.previousY : ", this.body.previousY);
    //   console.log("this.body.container.position.y : ", this.body.container.position.y);
    // }
    // if (body.impostor.getLinearVelocity().y > EPSILON) {
    //   this.checkFeetRayCollision();
    // }

    //console.log("body.impostor.getLinearVelocity().y: "  + body.impostor.getLinearVelocity().y);
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
    if (this.jumping) {
      this.body.meshes[0].position.y += 0;
    }
    this.jumping = false;
    //this.game.scene.stopAnimation(this.body.container);
    this.stopJumpAnimation();
    if (this.moving) {
      this.startWalkAnimation();
    }

  }

  beginJump() {
    this.jumping = true;
    this.body.container.impostor.applyImpulse(new BABYLON.Vector3(0, 2500, 0), this.body.container.getAbsolutePosition());
    this.game.sounds.jump.play();
    this.stopWalkAnimation();
    this.startJumpAnimation();
    this.body.meshes[0].position.y -= 0;
    //this.animation.jump.restart();
  }

  setMoving(value) {
    if (this.moving && !value) {
      //this.game.scene.stopAnimation(this.body.container);
      this.pauseWalkAnimation();
      console.log("STOP MOVING");
    } else if (!this.moving && value) {
//      this.startWalkAnimation(this.game);
      //this.animation.walk.restart();
      this.startWalkAnimation();
      console.log("START MOVING");
    }
    this.moving = value;
  }

  startWalkAnimation() {
    if (!this.animation.walk) {
      let frames = this.config.skin.animation.walkFrames;
      this.animation.walk = this.game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], true, 1.0);
    } else {
      this.animation.walk.restart();
    }
  }

  stopWalkAnimation() {
    this.animation.walk = null;
  }

  pauseWalkAnimation() {
    if (this.animation.walk) {
      this.animation.walk.pause();
    }
  }

  startJumpAnimation() {
    this.animation.jump = this.game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], false, 0.7);
    // if (!this.animation.jump) {
    //   let frames = this.config.skin.animation.jumpFrames;
    //   this.animation.jump = this.game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], false, 1.0);
    // } else {
    //   this.animation.jump.restart();
    // }
  }

  stopJumpAnimation() {
    if (this.animation.jump) {
      this.animation.jump.pause();
    }
  }

  createBody(game) {
    console.log("Initializing player body...");
    let skin = this.config.skin;
    this.body.meshes = game.meshes[skin.name];
    this.body.skeletons = game.skeletons[skin.name];
    this.body.container = new BABYLON.MeshBuilder.CreateBox("box", {
      height: this.body.height,
      width: 3,
      depth: 2,
    }, game.scene);
    this.body.container.position = new BABYLON.Vector3(0, 10, 0);
    this.body.container.material = new BABYLON.StandardMaterial("mat", game.scene);
    this.body.container.material.alpha = 0.5;
    this.body.meshes[0].scaling = new BABYLON.Vector3(skin.scale[0], skin.scale[1], skin.scale[2]);
    this.body.meshes[0].parent = this.body.container;
    this.body.meshes[0].rotation.x = skin.rotation[0];
    this.body.meshes[0].rotation.y = skin.rotation[1];
    this.body.meshes[0].rotation.z = skin.rotation[2];
    this.body.meshes[0].position.y = this.body.height / 2;
    this.body.meshes[0].position.y = -this.body.height / 2;



    //this.animation.walk = this.body.skeletons[0].beginAnimation("walk", true, 1.0);
    //this.animation.walk = game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], true, 1.0);

    frames = this.config.skin.animation.jumpFrames;
    //this.animation.jump = game.scene.beginAnimation(this.body.skeletons[0], frames[0], frames[1], false, 0.5);
    //this.animation.jump.pause();

    this.body.container.impostor = new BABYLON.PhysicsImpostor(this.body.container,
      BABYLON.PhysicsImpostor.BoxImpostor, {
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
    this.createFeetRay();

    this.setPhysicState(PhysicState.WAITING);
  }

  setPhysicState(physicState) {
    switch (physicState) {
      case PhysicState.WAITING:

        break;
      case PhysicState.MOVING:

        break;
      case PhysicState.JUMPING:

        break;
    }
  }

  /**
   * The ray starts from "inside" the body of 0.1, is very shord (0.1) and
   * create an event when hitting anything.
   */
  createFeetRay() {
    let startingYPostion = -this.body.height / 2 + 0.5;
    this.body.feetRay = new BABYLON.Ray();
    let frontHelper = new BABYLON.RayHelper(this.body.feetRay);
    let frontLocalMeshDirection = new BABYLON.Vector3(0, -1, 0);
    let frontLocalMeshOrigin = new BABYLON.Vector3(0, startingYPostion, 0);
    let frontLength = 2;
    frontHelper.attachToMesh(this.body.container, frontLocalMeshDirection, frontLocalMeshOrigin, frontLength);
    frontHelper.show(this.game.scene, new BABYLON.Color3(1, 1, 1));
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
    cam.position = this.startingPosition;
    cam.inertia = 0.2;
    cam.angularSensibility = 1000;
    //cam.fov = 90.00 * (Math.PI / 180);
    cam.attachControl(game.canvas, true);
    this.camera.firstPersonCamera = cam;

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

  fire() {
    // if (this.weapon.canHit()) {
    //   this.weapon.hit();
    // }
    //this.game.scene.beginAnimation(this.weapon, 0, 100, false, 10, null);


    // let pickedInfo = window.scene.pick(window.innerWidth * 0.5, window.innerHeight * 0.5, null, false);
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
    let kb = this.config.keyBindings;
    switch(event.keyCode){
      case kb.jump:
        if (!this.jumping) {
          this.beginJump();
        }
        break;
      case kb.forward:
        if (!this.jumping) {
          this.moveForward = true;
          this.setMoving(true);
        }
        break;
      case kb.backward:
        if (!this.jumping) {
          this.moveBackward = true;
          this.setMoving(true);
        }
        break;
      case kb.left:
        if (!this.jumping) {
          this.strafeLeft = true;
          this.setMoving(true);
        }
        break;
      case kb.right:
        if (!this.jumping) {
          this.strafeRight = true;
          this.setMoving(true);
        }
        break;
      case kb.switchCamera:
        this.switchCameraType();
        break;
    }
  }

  onKeyUp(event) {
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
    if (!this.moveForward && !this.moveBackward && !this.strafeLeft && !this.strafeRight) {
      this.setMoving(false);
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
