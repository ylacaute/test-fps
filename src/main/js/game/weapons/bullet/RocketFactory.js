import * as BABYLON from 'babylonjs';

export default class RocketFactory {

  reference = null;
  counter = 0;
  speed = 2;
  alive = [];

  constructor(game) {
    this.reference = BABYLON.MeshBuilder.CreateSphere("b", {
      diameter: 0.5,
      tessellation: 4,
    }, game.scene);
    this.reference.setEnabled(false);
    this.reference.material = new BABYLON.StandardMaterial("bmat", game.scene);
    this.reference.material.diffuseColor = BABYLON.Color3.White();
    game.scene.registerBeforeRender(this.updateRockets.bind(this), false);
  }

  updateRockets() {
    let rocket;
    for (let i = 0; i < this.alive.length; i++) {
      rocket = this.alive[i];
      rocket.translate(rocket.direction, this.speed, BABYLON.Space.LOCAL);

      // rocket.dispose();
      // this.alive..splice(rocket, 1);
      // i--
    }
  }

  create(position, direction) {
    console.log("Creating rocket");
    let rocket = this.reference.clone("rocket_" + this.counter++);
    rocket.setEnabled(true);
    rocket.position.copyFrom(position);
    rocket.position.y += 2;
    rocket.direction = new BABYLON.Vector3(
      -parseFloat(Math.sin(parseFloat(direction.y))),
      -parseFloat(Math.sin(parseFloat(direction.x))),
      -parseFloat(Math.cos(parseFloat(direction.y))));
    console.log("rocket.direction : " , rocket.direction);
    this.alive.push(rocket);
  }

}
