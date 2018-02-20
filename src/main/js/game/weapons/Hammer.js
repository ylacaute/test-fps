import * as BABYLON from 'babylonjs';

export default class Hammer {

  // Pivot wrapper to change rotation point
  pivot = null;

  // Contains all meshes
  container = null;

  counter = 0;

  // Collision box
  impostor = null;
  ground = null;

  enabled = false;

  angle = Math.PI / 50;

  activate() {

    this.pivot.rotate(BABYLON.Axis.X, this.angle, BABYLON.Space.LOCAL);

    //console.log("fucking mesh : ", this.meshes[0].getPhysicsBodyOfMesh());
    if (this.enabled && this.meshes[0].intersectsMesh(this.ground, false)) {
      //this.meshes[0].material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
      this.game.sounds.eat.play();
      this.angle = -this.angle;
      this.counter -= 1;
    } else {
      this.counter += 1;
      //this.meshes[0].material.emissiveColor = new BABYLON.Color4(1, 1, 1, 1);
      console.log("no");
    }
    if (this.angale <= 0) {
      this.angle = -this.angle;
    }
  }

  hit() {
    console.log("");
  }

  constructor(game) {
    this.meshes = game.meshes.hammer;
    this.ground = game.scene.getMeshByName("ground");
    this.game = game;
    this.pivot = new BABYLON.TransformNode("root");
    this.pivot.position = new BABYLON.Vector3(0, -4, 0);
    this.container = new BABYLON.Mesh("container", game.scene);
    this.container.parent = this.pivot;
    this.container.position = new BABYLON.Vector3(0, -6, 0);
    this.pivot.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].parent = this.container;
    }
    this.meshes[0].setEnabled(true);

    //this.meshes[0].ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    //var vis = 100; // visibility scaling
    //this.meshes[0]._boundingInfo = new BABYLON.BoundingInfo(new BABYLON.Vector3(-vis, -vis, -vis), new BABYLON.Vector3(vis, vis, vis));
    //this.meshes[0].checkCollisions = true;

    // this.container.actionManager = new BABYLON.ActionManager(game.scene);
    // this.container.actionManager.registerAction(
    //   new BABYLON.InterpolateValueAction(
    //     BABYLON.ActionManager.OnIntersectionEnterTrigger,
    //     light,
    //     'diffuse',
    //     BABYLON.Color3.Black(),
    //     1000
    //   )
    // );
    //
    // this.impostor = new BABYLON.PhysicsImpostor(this.meshes[0], BABYLON.PhysicsImpostor.BoxImpostor, {
    //   mass: 0,
    //   friction: 1, // 0 = huge sliding, max 1
    //   restitution: 0 // 0 = no bounce, max 1
    //   //disableBidirectionalTransformation: true
    // }, game.scene);

  }



}
