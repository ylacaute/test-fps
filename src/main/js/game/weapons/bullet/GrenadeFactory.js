import * as BABYLON from 'babylonjs';

export default class GrenadeFactory {

  game = null;
  reference = null;
  speed = 2;

  constructor(game) {
    this.game = game;
    this.reference = BABYLON.MeshBuilder.CreateSphere("b", {
      diameter: 0.5,
      tessellation: 4,
    }, game.scene);
    this.reference.setEnabled(false);
    this.reference.material = new BABYLON.StandardMaterial("grenadeMat", game.scene);
    this.reference.material.diffuseColor = BABYLON.Color3.White();
  }

  create(position, direction) {
    console.log("Creating grenade");
    let rocket = this.reference.clone();
    rocket.setEnabled(true);
    rocket.position.copyFrom(position);
    rocket.position.y += 2;
    rocket.direction = new BABYLON.Vector3(
      -parseFloat(Math.sin(parseFloat(direction.y))) * 10,
      -parseFloat(Math.sin(parseFloat(direction.x))) * 10,
      -parseFloat(Math.cos(parseFloat(direction.y))) * 10);
    rocket.impostor = new BABYLON.PhysicsImpostor(rocket,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0.1,
        friction: 1,
        restitution: 0,
        disableBidirectionalTransformation: true
      }, this.game.scene);
    rocket.impostor.applyImpulse(
      rocket.direction,
      rocket.getAbsolutePosition());
    setTimeout(() => {
      rocket.dispose();
    }, 5000);
  }

}
