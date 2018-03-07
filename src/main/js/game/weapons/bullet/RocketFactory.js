import * as BABYLON from 'babylonjs';

export default class RocketFactory {

  game = null;
  reference = null;
  speed = 1;
  alive = [];
  rocketFire = null;
  rocketSmoke = null;
  maxAlive = 100000;
  indexToDestroy = [];

  constructor(game) {
    this.game = game;

    this.reference = new BABYLON.MeshBuilder.CreateBox("box", {
      height: 0.25,
      width: 0.25,
      depth: 0.7,
    }, game.scene);
    this.reference.material = new BABYLON.StandardMaterial("mat", game.scene);
    this.reference.material.alpha = 0;
    this.reference.destroy = false;
    this.reference.setEnabled(false);
    this.cylinder = BABYLON.MeshBuilder.CreateCylinder("cone", {
      diameterTop: 0.08,
      diameterBottom: 0.2,
      height: 0.7,
      tessellation: 8}, game.scene);
    this.cylinder.rotation.x = Math.PI / 2;
    this.cylinder.parent = this.reference;
    this.cylinder.material = new BABYLON.StandardMaterial("bmat", game.scene);
    this.cylinder.material.diffuseTexture = game.textures.rocket;
    game.scene.registerBeforeRender(this.updateRockets.bind(this), false);

    this.createRocketSmoke(game);
    this.createRocketFire(game)
  }

  createRocketFire(game) {
    let rocketFire = new BABYLON.ParticleSystem("rocketFireParticles", 200, game.scene);
    rocketFire.particleTexture = game.textures.fire;
    rocketFire.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.4);
    rocketFire.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, -0.4);
    rocketFire.colorDead = new BABYLON.Color4(0.5, 0.5, 0.5, 0.0);
    rocketFire.minSize = 0.2;
    rocketFire.maxSize = 0.5;
    rocketFire.minLifeTime = 0.1;
    rocketFire.maxLifeTime = 0.2;
    rocketFire.emitRate = 200;
    rocketFire.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    rocketFire.gravity = new BABYLON.Vector3(0, 0, 0);
    rocketFire.minAngularSpeed = 0;
    rocketFire.maxAngularSpeed = Math.PI / 20;
    rocketFire.minEmitPower = 0.1;
    rocketFire.maxEmitPower = 1;
    rocketFire.updateSpeed = 0.02;
    this.rocketFire = rocketFire;
  }

  createRocketSmoke(game) {
    let rocketSmoke = new BABYLON.ParticleSystem("rocketSmokeParticles", 200, game.scene);
    rocketSmoke.particleTexture = game.textures.smoke;
    rocketSmoke.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.5);
    rocketSmoke.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, -0.5);
    rocketSmoke.colorDead = new BABYLON.Color4(0.5, 0.5, 0.5, 0.5);
    rocketSmoke.minSize = 0.2;
    rocketSmoke.maxSize = 0.5;
    rocketSmoke.minLifeTime = 0.1;
    rocketSmoke.maxLifeTime = 0.2;
    rocketSmoke.emitRate = 200;
    rocketSmoke.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    rocketSmoke.gravity = new BABYLON.Vector3(0, 0, 0);
    rocketSmoke.minAngularSpeed = 0;
    rocketSmoke.maxAngularSpeed = Math.PI / 20;
    rocketSmoke.minEmitPower = 0.1;
    rocketSmoke.maxEmitPower = 1;
    rocketSmoke.updateSpeed = 0.02;
    this.rocketSmoke = rocketSmoke;
  }


  updateRockets() {
    let rocket;

    for (let i = 0; i < this.alive.length; i++) {
      rocket = this.alive[i];
      rocket.locallyTranslate(new BABYLON.Vector3(0, 0, this.speed));
      //test collision
      if (rocket.intersectsMesh(this.game.scene.getMeshByName("box2"), true)) {
        this.game.scene.getMeshByName("box2").material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.indexToDestroy.push(i);
      }
    }
    for (let i = 0; i < this.indexToDestroy.length; i++) {
      this.destroy(this.alive[i]);
    }
    this.indexToDestroy = [];
  }

  create(position, direction) {
    let rocket = this.reference.clone();
    rocket.setEnabled(true);
    rocket.position.copyFrom(position);
    rocket.rotation.copyFrom(direction);
    //rocket.direction = direction.clone();
    //rocket.rotation = new BABYLON.Vector3(-direction.x, direction.y, direction.z);

    // rocket.direction = new BABYLON.Vector3(
    //   parseFloat(Math.sin(parseFloat(direction.y))) * 10,
    //   parseFloat(Math.sin(parseFloat(direction.x))) * 10,
    //   parseFloat(Math.cos(parseFloat(direction.y))) * 10);
    // rocket.direction = new BABYLON.Vector3(
    //   10,
    //   10,
    //   10);
    //console.log("rocket.direction : ", rocket.direction);
    this.alive.push(rocket);
    let smoke = this.rocketSmoke.clone();
    smoke.emitter = rocket;
    smoke.direction1 = direction;
    let fire = this.rocketFire.clone();
    fire.emitter = rocket;
    fire.direction1 = direction;
    smoke.start();
    fire.start();
    setTimeout(this.registerForDestroy.bind(this, rocket), this.maxAlive);
  }

  registerForDestroy(rocket) {
    this.indexToDestroy.push(this.alive.indexOf(rocket));
  }

  destroy(rocket) {
    if (!this.reference.destroy) {
      this.alive.splice(this.alive.indexOf(rocket), 1);
      rocket.destroy = true;
      rocket.dispose();
      this.game.sounds.bazookaHit.play();
    }
  }

}
