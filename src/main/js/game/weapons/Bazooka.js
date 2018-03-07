import * as BABYLON from 'babylonjs';
import RocketFactory from "game/weapons/bullet/RocketFactory";

export default class Bazooka {

  game = null;
  body = {
    meshes : null,
    container : null
  };
  coolDown = 500;
  onCooldown = false;
  rocketFactory = null;

  constructor(game, parent) {
    this.game = game;
    this.rocketFactory = new RocketFactory(game);
    this.body.meshes = game.meshes.bazooka;
    this.body.container = new BABYLON.MeshBuilder.CreateBox("box", {
      height: 1,
      width: 1,
      depth: 3,
    }, game.scene);
    this.body.container.parent = parent;
    this.body.container.material = new BABYLON.StandardMaterial("weaponMat", game.scene);
    this.body.container.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    this.body.container.material.specularColor = new BABYLON.Color3(1, 0, 0);
    this.body.container.position.y = -2;
    this.body.container.rotation.y = Math.PI;
    game.meshes.bazooka.forEach((m) => {
      m.parent = this.body.container;
      m.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
      m.setEnabled(true);
    });
  }

  fire(position, direction) {
    if (!this.onCoolDown) {
      this.onCooldown = true;
      setTimeout(this.resetCooldown.bind(this), this.coolDown);
      this.game.sounds.bazookaFire.play();
      this.rocketFactory.create(position, direction);
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
