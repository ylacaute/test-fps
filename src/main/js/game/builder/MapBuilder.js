import * as BABYLON from 'babylonjs';
import Helper from "game/Helper";

export default class MapBuilder {

  game = null;

  constructor(game) {
    this.game = game;
  }

  build(map) {

    this.createGround(map);
    this.addMonolith(this.game, map);
    this.addDoubleBridge(this.game, map);

    this.populateScene(this.game);

  }

  addDoubleBridge(game, map) {
    let bridge = game.meshes.doubleBridge;
    let scale = map.meshes.doubleBridge.scale;
    let pos = map.meshes.doubleBridge.position;

    console.log("FUCKING  bridge length: ", bridge.length);
    for (let i = 0; i < bridge.length; i++) {
      bridge[i].setEnabled(true);
    }
    bridge[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    bridge[0].position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);

    bridge.physicsImpostor = new BABYLON.PhysicsImpostor(
      bridge[0],
      BABYLON.PhysicsImpostor.MeshImpostor, {
        mass: 0,

      }, this.game.scene);

  }

  addMonolith(game, map) {
    let monolith = game.meshes.monolith;
    let scale = map.meshes.monolith.scale;
    let pos = map.meshes.monolith.position;

    for (let i = 0; i < monolith.length; i++) {
      monolith[i].setEnabled(true);
    }
    console.log("FUCKING monolith: ", monolith[0]);
    monolith[0].scaling = new BABYLON.Vector3(scale, scale, scale);
    monolith[0].position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);

    //this.body.container.position = new BABYLON.Vector3(0, 10, 0);
  }

  createGround(map) {
    let texture = this.game.textures[map.groundTexture];
    let mesh = BABYLON.MeshBuilder.CreateGround("mesh", { height: map.height, width: map.width}, this.game.scene);

    // GROUND MATERIAL
    mesh.material = new BABYLON.StandardMaterial("groundMat", this.game.scene);
    mesh.material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    mesh.material.wireframe = this.game.gameMod.groundWireframe;
    mesh.material.diffuseTexture = texture;
    texture.uScale = texture.vScale = 10;

    mesh.receiveShadows = true;
    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      mesh,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1,    // 0 = huge sliding, max 1
        restitution: 0, // 0 = no bounce, max 1
        disableBidirectionalTransformation: true
      }, this.game.scene);

    this.game.physicsImpostors.push(mesh.physicsImpostor);
  }

  createWalls2(game, cfg) {
    let faceUV = new Array(6);
    var faceColors = new Array(6);

    for (let i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
      //faceColors[i] = new BABYLON.Color4(1, 1, 1, 1);
    }
    for (let i = 2; i < 6; i++) {
      faceColors[i] = new BABYLON.Color4(1, 1, 1, 0);
    }
    faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[1] = new BABYLON.Vector4(1, 1, 0, 0);
    let wall = new BABYLON.MeshBuilder.CreateBox("wall", {
      height: cfg.height,
      width: cfg.width,
      depth: cfg.depth,
      faceUV: faceUV,
      faceColors: faceColors
    }, game.scene);
    wall.hasVertexAlpha = true;
    wall.material = new BABYLON.StandardMaterial("mat", game.scene);
    wall.material.diffuseTexture = game.textures.wall;
    wall.material.diffuseTexture.uScale = 2.0;
    wall.material.diffuseTexture.vScale = 2.0;
    //wall.material.diffuseTexture.hasAlpha = true;
    wall.position = new BABYLON.Vector3(cfg.position[0], cfg.position[1], cfg.position[2]);
    wall.setPivotMatrix(BABYLON.Matrix.Translation(cfg.width/2 - cfg.depth/2, 0, 0));
    wall.rotation.y = Math.radians(cfg.rotation);
  }

  wallCounter = 0;

  createWalls(game, cfg) {
    // let faceUV = new Array(6);
    // var faceColors = new Array(6);
    //
    // for (let i = 0; i < 6; i++) {
    //   faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    //   //faceColors[i] = new BABYLON.Color4(1, 1, 1, 1);
    // }
    // // for (let i = 2; i < 6; i++) {
    // //   faceColors[i] = new BABYLON.Color4(1, 1, 1, 0);
    // // }
    // faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    // faceUV[1] = new BABYLON.Vector4(1, 1, 0, 0);
    let wall = BABYLON.MeshBuilder.CreatePlane("wall_" + ++this.wallCounter, {
      height: cfg.height,
      width: cfg.width,
      //faceUV: faceUV,
      //faceColors: faceColors
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, game.scene);
    //wall = BABYLON.MeshBuilder.CreatePlane("plane", {height:2, width: 1}, game.scene);

    //wall.hasVertexAlpha = true;
    wall.material = new BABYLON.StandardMaterial("wallMat", game.scene);
    wall.material.diffuseTexture = game.textures.wall;
    wall.material.diffuseTexture.uScale = 20.0;
    wall.material.diffuseTexture.vScale = 2.0;
    //wall.material.wireframe = true;
    //wall.material.diffuseTexture.hasAlpha = true;
    wall.position = new BABYLON.Vector3(cfg.position[0], cfg.position[1], cfg.position[2]);
    //wall.setPivotMatrix(BABYLON.Matrix.Translation(cfg.width/2, 0, 0));
    wall.rotation.y = Math.radians(cfg.rotation);
    wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1,
        restitution: 0,
        disableBidirectionalTransformation: true
      }, game.scene);
    if (game.config.core.debug) {
      var localOrigin = Helper.createLocalAxes(game.scene, 3);
      localOrigin.parent = wall;
    }
  }

  populateScene(game) {
    console.log("Loading map: " + this.name);

    this.createLights(game.scene);
    this.createSkyBox(game.scene);


    // this.addSampleObjects(game);
    this.createParticules(game);

    // let redBox = new BABYLON.MeshBuilder.CreateBox("box", {
    //   height: 4,
    //   width: 4,
    //   dept: 4
    // }, game.scene);
    // redBox.material = new BABYLON.StandardMaterial("redMat", game.scene);
    // redBox.material.ambientColor = new BABYLON.Color3(1, 0, 0);
    // redBox.position = new BABYLON.Vector3(-102, 0, 0);


    let cfg = {
      position: [0, 15, -300],
      height: 30,
      width: 600,
      rotation: 0
    };
    this.createWalls(game, cfg);


    let cfg2 = {
      position: [-300, 15, 0],
      height: 30,
      width: 600,
      rotation: -90
    };
    this.createWalls(game, cfg2);

    let cfg3 = {
      position: [0, 15, 300],
      height: 30,
      width: 600,
      rotation: 0
    };
    this.createWalls(game, cfg3);

    let cfg4 = {
      position: [300, 15, 0],
      height: 30,
      width: 600,
      rotation: 90
    };
    this.createWalls(game, cfg4);
  }


  createWall(game) {
    let faceUV = new Array(6);
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[1] = new BABYLON.Vector4(1, 1, 0, 0);
    let wall = new BABYLON.MeshBuilder.CreateBox("wall", {
      height: 30,
      width: 50,
      dept: 5,
      faceUV: faceUV
    }, game.scene);
    wall.material = new BABYLON.StandardMaterial("mat", game.scene);
    wall.material.diffuseTexture = game.textures.wall;
    wall.material.diffuseTexture.uScale = 2.0;
    wall.material.diffuseTexture.vScale = 2.0;
    wall.position = new BABYLON.Vector3(100, 15, 0);
  }


  createParticules(game) {
    let scene = game.scene;

    // BOX
    let box = new BABYLON.MeshBuilder.CreateBox("box1", {
      size: 5
    }, scene);
    box.material = new BABYLON.StandardMaterial("redMat", scene);
    box.material.ambientColor = new BABYLON.Color3(1, 0, 0);
    box.rotation.x = -0.2;
    box.rotation.y = -0.4;
    box.position= new BABYLON.Vector3(10, 0, 50);




    //Whispy Smoke
    // var smokeParticlesB = new BABYLON.ParticleSystem("particles", 1000, scene);
    // smokeParticlesB.particleTexture = game.textures.fire;
    // smokeParticlesB.emitter = box; // the starting object, the emitter
    // smokeParticlesB.minEmitBox = new BABYLON.Vector3(-0.25, 1, -0.25); // Starting all from
    // smokeParticlesB.maxEmitBox = new BABYLON.Vector3(0.25, 1, 0.25); // To...
    //
    // smokeParticlesB.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 0.5);
    // smokeParticlesB.color2 = new BABYLON.Color4(0.2, 0.2, 0.2, 0.5);
    // smokeParticlesB.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
    //
    // smokeParticlesB.minSize = 1.5;
    // smokeParticlesB.maxSize = 3;
    //
    // smokeParticlesB.minLifeTime = 0.3;
    // smokeParticlesB.maxLifeTime = 1.5;
    //
    // smokeParticlesB.emitRate = 125;
    //
    // // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    // smokeParticlesB.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    //
    // smokeParticlesB.gravity = new BABYLON.Vector3(0, 0, 0);
    //
    // smokeParticlesB.direction1 = new BABYLON.Vector3(-1.5, 8, -1.5);
    // smokeParticlesB.direction2 = new BABYLON.Vector3(1.5, 8, 1.5);
    //
    // smokeParticlesB.minEmitPower = 0.5;
    // smokeParticlesB.maxEmitPower = 1.5;
    // smokeParticlesB.updateSpeed = 0.005;
    //
    // smokeParticlesB.start();


    let box2 = new BABYLON.MeshBuilder.CreateBox("box2", {
      size: 5
    }, scene);
    box2.material = new BABYLON.StandardMaterial("redMat", scene);
    box2.material.ambientColor = new BABYLON.Color3(1, 0, 0);
    box2.rotation.x = -0.2;
    box2.rotation.y = -0.4;
    box2.position= new BABYLON.Vector3(25, 0, 25);

    //Boiling Smoke
    var smokeParticlesA = new BABYLON.ParticleSystem("particles", 1000, scene);
    smokeParticlesA.particleTexture = game.textures.smoke;
    smokeParticlesA.emitter = box2; // the starting object, the emitter
    smokeParticlesA.minEmitBox = new BABYLON.Vector3(-0.5, 1, -0.5); // Starting all from
    smokeParticlesA.maxEmitBox = new BABYLON.Vector3(0.5, 1, 0.5); // To...

    smokeParticlesA.color1 = new BABYLON.Color4(0.05, 0.05, 0.05, 0.75);
    smokeParticlesA.color2 = new BABYLON.Color4(0.15, 0.15, 0.15, 0.75);
    smokeParticlesA.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

    smokeParticlesA.minSize = 1.0;
    smokeParticlesA.maxSize = 2.0;

    smokeParticlesA.minLifeTime = 0.3;
    smokeParticlesA.maxLifeTime = 0.8;

    smokeParticlesA.emitRate = 125;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    smokeParticlesA.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

    smokeParticlesA.gravity = new BABYLON.Vector3(0, 0, 0);

    smokeParticlesA.direction1 = new BABYLON.Vector3(-1.5, 8, -1.5);
    smokeParticlesA.direction2 = new BABYLON.Vector3(1.5, 8, 1.5);

    smokeParticlesA.minAngularSpeed = -10.0;
    smokeParticlesA.maxAngularSpeed = 10.0;

    smokeParticlesA.minEmitPower = 0.5;
    smokeParticlesA.maxEmitPower = 1.5;
    smokeParticlesA.updateSpeed = 0.005;

    smokeParticlesA.start();
  }



  createLights(scene) {
    //var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    let light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(1, 1, 1), scene);
  }

  createSkyBox(scene, mod) {
    let skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, scene);
    let shader = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader;
  }

  addSampleObjects(game) {
    let scene = game.scene;



    // SPHERE
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {
      diameter: 2,
      diameterX: 3}, scene);
    sphere.position = new BABYLON.Vector3(-100, 30, 5);
    sphere.material = new BABYLON.StandardMaterial("blueMat", scene);
    sphere.material.ambientColor = new BABYLON.Color3(0, 0, 1);
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 10,
        friction: 1,
        restitution: 0
      }, scene);

    // BOX
    let box = new BABYLON.MeshBuilder.CreateBox("box1", {
      size: 10
    }, scene);
    box.material = new BABYLON.StandardMaterial("redMat", scene);
    box.material.ambientColor = new BABYLON.Color3(1, 0, 0);
    box.rotation.x = -0.2;
    box.rotation.y = -0.4;
    box.position= new BABYLON.Vector3(-105, 0, 0);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1,
        restitution: 0
      }, scene);

    // BOX
    let box2 = new BABYLON.MeshBuilder.CreateBox("box2", {
      width: 50,
      height: 5,
      depth: 50
    }, scene);
    box2.material = new BABYLON.StandardMaterial("redMat", scene);
    box2.material.ambientColor = new BABYLON.Color3(1, 0, 20);
    box2.checkCollisions = true;
    box2.position= new BABYLON.Vector3(100, 0, 50);
    //box.ellipsoid = new BABYLON.Vector3(0, 1, 0);
    box2.physicsImpostor = new BABYLON.PhysicsImpostor(box2,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 1,
        restitution: 0
      }, scene);

    game.physicsImpostors.push(sphere.physicsImpostor);
    game.physicsImpostors.push(box.physicsImpostor);
    game.physicsImpostors.push(box2.physicsImpostor);

  }


}
