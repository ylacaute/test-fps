import * as BABYLON from 'babylonjs';

import Hammer from "game/weapons/Hammer";



let CameraType = {
  UNSET : -1,
  FIRST_PERSON : 0,
  THIRD_PERSON : 1
};

export default class Player {

  game = null;
  moveForward = false;
  moveBackward = false;
  strafeLeft = false;
  strafeRight = false;
  moving = false;
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
    this.enableMeshes(true);
    //this.weapon.enabled = true;
    //let skeletons = this.game.skeletons.player;
    //var animation = this.game.scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
  }

  stopPlaying() {
    this.enableMeshes(false);
    this.setCameraType(CameraType.UNSET);
  }

  enableMeshes(value) {
    this.body.container.setEnabled(value);
  }

  beforeRender() {
    let body = this.body.container;
    let gravity = 0.1;
    let speed = 0.05;

    //let camera = this.game.scene.activeCamera;
    // let cameraForwardRayPosition = camera.getForwardRay().direction;
    // let cameraForwardRayPositionWithoutY = new BABYLON.Vector3(cameraForwardRayPosition.x, 0, cameraForwardRayPosition.z);
    // this.body[0].lookAt(this.body[0].position.add(cameraForwardRayPositionWithoutY), Math.PI, 0, 0);
    //this.body[0].position.x = camera.position.x;
    //this.body[0].position.y = camera.position.y - 1.5;
    //this.body[0].position.z = camera.position.z;

    //this.body[0].rotation.y = - Math.PI / 2 - this.camera.thirdPersonCamera.alpha;
    //cameraArcRotative[0].target.x = parseFloat(meshPlayer.position.x);
    //cameraArcRotative[0].target.z = parseFloat(meshPlayer.position.z);
    // if (this.moveForward) {
    //   this.hammer.rotation.y += 10;
    // }

    // DIRECTION
    body.rotation.y = Math.PI / 2 - this.camera.thirdPersonCamera.alpha;

    // MOVEMENT
    if (this.moveForward && !this.moveBackward) {
      body.impostor.setLinearVelocity(new BABYLON.Vector3(
      //body.moveWithCollisions(new BABYLON.Vector3(
        -parseFloat(Math.sin(parseFloat(body.rotation.y))) / speed,
        body.impostor.getLinearVelocity().y,
        -parseFloat(Math.cos(parseFloat(body.rotation.y))) / speed));
    } else if (this.moveBackward && !this.moveForward) {
      body.impostor.setLinearVelocity(new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(body.rotation.y))) / speed,
        body.impostor.getLinearVelocity().y,
        parseFloat(Math.cos(parseFloat(body.rotation.y))) / speed));
    }
    if (this.strafeLeft && !this.strafeRight) {
      body.impostor.setLinearVelocity(new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(body.rotation.y + Math.PI / 2))) / speed,
        body.impostor.getLinearVelocity().y,
        parseFloat(Math.cos(parseFloat(body.rotation.y + Math.PI / 2))) / speed));
    } else if (this.strafeRight && !this.strafeLeft) {
      body.impostor.setLinearVelocity(new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(body.rotation.y - Math.PI / 2))) / speed ,
        body.impostor.getLinearVelocity().y,
        parseFloat(Math.cos(parseFloat(body.rotation.y - Math.PI / 2))) / speed));
    }




    // GRAVITY IF NOT MOVING
    // if (!this.moveForward && !this.strafeLeft) {
    //   body.moveWithCollisions(new BABYLON.Vector3(0, gravity, 0));
    // }

    // JUMP

  }

  createBody(game) {
    console.log("Initializing player body...");
    this.body.meshes = game.meshes.player;
    //this.body.container = game.meshes.player[0];
    //this.body.container = new BABYLON.Mesh("container", game.scene);
    this.body.container = new BABYLON.Mesh.CreateBox("box", 2, game.scene);
    this.body.container.position = new BABYLON.Vector3(4, 50, 4);

    this.body.meshes[0].scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
    this.body.meshes[0].parent = this.body.container;

    this.body.container.impostor = new BABYLON.PhysicsImpostor(this.body.container,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 10,
        friction: 0,
        restitution: 0,
        disableBidirectionalTransformation: true
      }, game.scene);

    //this.createCharacter2(game.scene);
    // new BABYLON.PhysicsImpostor(
    //   this.body.container,
    //   BABYLON.PhysicsImpostor.MeshImpostor, {
    //     mass: 10,
    //     friction: 1,    // 0 = huge sliding, max 1
    //     restitution: 0, // 0 = no bounce, max 1
    //     ignoreParent: true,
    //     disableBidirectionalTransformation: true
    //   }, game.scene);
    var animation = game.scene.beginAnimation(game.skeletons.player[0], 0, 100, true, 1.0);

    let ground = game.scene.getMeshByName("ground");

    this.body.container.impostor.registerOnPhysicsCollide(ground.physicsImpostor, function(main, collided) {
      //main.object.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
      console.log("COLLISION PLAYER ON GROUND !!!!!!!!!!!!");
    });

  }

  createCharacter2 = (scene) => {

    let blueMat = new BABYLON.StandardMaterial("blueMat", scene);
    blueMat.ambientColor = new BABYLON.Color3(0, 0, 1);
    let sphere = BABYLON.Mesh.CreateSphere("sphere1", 30, 2, scene);
    sphere.position.y = 20;
    sphere.material = blueMat;
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere,
      BABYLON.PhysicsImpostor.SphereImpostor, {
        mass: 1,
        restitution: 0.9
      }, scene);


    console.log("Creating small guy...");
    BABYLON.SceneLoader.ImportMesh("", "characters/dude/", "dude.babylon", scene,
      function (newMeshes, particleSystems, skeletons) {
        let smallDude = newMeshes[0];
        smallDude.parent = sphere;
        smallDude.scaling = new BABYLON.Vector3(0.1,0.1,0.1);
        smallDude.position = new BABYLON.Vector3(0, 0, 0);
        scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

        // THIS IMPOSTOR SEEMS TO WORK BUT WRITE THIS ERROR ON CONSOLE :
        //   BJS - [17:37:58]: Unable to import meshes from Scenes/Dude/Dude.babylon: Error in onSuccess callback
        // smallDude.physicsImpostor = new BABYLON.PhysicsImpostor(
        //   smallDude,
        //   BABYLON.PhysicsImpostor.BoxImpostor, {
        //     mass: 10,
        //     friction: 1,
        //     restitution: 0
        //   }, scene);

      });

  };

  createCameras(game) {
    let cam;
    //let target = this.body[0].position.clone();
    let target = this.body.container.position.clone();

    target.y += 1;
    cam = new BABYLON.FreeCamera("camera", target, game.scene);
    cam.position.y = 20;
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
        break;
      case CameraType.THIRD_PERSON:
        console.log("Player: set third person camera");
        this.camera.current = this.camera.thirdPersonCamera;
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
    console.log("KeyDown : " + event.keyCode);

    let kb = this.game.gameMod.keyBindings;
    switch(event.keyCode){
      case kb.jump: this.running = true; break;
      case kb.forward: this.moveForward = true; this.moving = true; break;
      case kb.backward: this.moveBackward = true; this.moving = true; break;
      case kb.left: this.strafeLeft = true; this.moving = true; break;
      case kb.right: this.strafeRight = true; this.moving = true; break;
      case 69: this.switchCameraType(); break; // E
      case 82: this.test(); break; // R
      //case 71: this.firstPersonCamera.applyGravity = !this.firstPersonCamera.applyGravity; break; // R
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
    if (!this.moveForward && !this.moveBackward && !this.strafeLeft && !this.strafeRight) {
      this.moving = false;
      this.body.container.impostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
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
