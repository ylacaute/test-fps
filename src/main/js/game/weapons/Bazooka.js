import * as BABYLON from 'babylonjs';
import RocketFactory from "game/weapons/bullet/RocketFactory";

export default class Bazooka {

  game = null;
  body = {
    meshes : null,
    container : null
  };

  coolDown = 50;
  onCooldown = false;

  rocketFactory = null;

  constructor(game, playerContainer) {
    this.game = game;
    this.rocketFactory = new RocketFactory(game);
    this.body.meshes = game.meshes.bazooka;
    this.body.container = new BABYLON.MeshBuilder.CreateBox("box", {
      height: 1,
      width: 1,
      depth: 3,
    }, game.scene);
    this.body.container.parent = playerContainer;
    this.body.container.material = new BABYLON.StandardMaterial("weaponMat", game.scene);
    this.body.container.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    this.body.container.material.specularColor = new BABYLON.Color3(1, 0, 0);
    this.body.container.position.y = 2;
    this.body.container.rotation.y = Math.PI;

    for (let i = 0; i < this.body.meshes.length; i++) {
      this.body.meshes[i].parent = this.body.container;
      this.body.meshes[i].scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
    }
    // this.weapon.parent = container; // The weapon will move with the player camera
    // this.weapon.material = new BABYLON.StandardMaterial("weaponMat", game.scene);
    // this.weapon.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    // this.weapon.material.specularColor = new BABYLON.Color3(1, 0, 0);
    // this.weapon.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
    // this.weapon.position = new BABYLON.Vector3(2, 2, 0);
    // this.weapon.rotation = new BABYLON.Vector3(-Math.PI / 8, -Math.PI / 40, 0);
    //this.weapon.setEnabled(true);

    game.meshes.bazooka.forEach((m) => m.setEnabled(true));
  }

  fire(position, direction) {
    if (!this.onCoolDown) {
      console.log("FIRE");
      this.onCooldown = true;
      setTimeout(this.resetCooldown.bind(this), this.coolDown);
      this.game.sounds.bazookaFire.play();

      //console.log("position : ", position);
      //console.log("direction : ", direction);
      //Rocket.createInstance(player);
      this.rocketFactory.create(position, direction);

      //rocket.position = position;
      //game.scene.registerBeforeRender(this.beforeRender.bind(this), false);

    } else {
      console.log("Please wait, on cooldown");
    }
  }

  isOnCooldown() {
    return this.onCooldown;
  }

  resetCooldown() {
    this.onCooldown = false;
  }

}
