import * as BABYLON from 'babylonjs';

export default class Hammer {

  // Used to change rotation point : it is the hammer parent meshes
  pivot = null;

  // Used to link all meshes together (parent is pivot)
  container = null;

  // Keep a direct instance to the ground to check collision
  ground = null;

  // Can hit only when the hitTimer is at 0, while hitting, this value change
  hitTimer = 0;

  // Can hit only every 2 seconds
  cooldown = 2000;

  // Initial angle of the hammer
  initialAngle = -Math.PI / 4;

  // Max angle on hit
  maxAngle = Math.PI / 2;

  // Angle increment per frame (hit speed)
  angleIncPerFrame = Math.PI / 20;

  // Used to calculate rotation direction
  beforeMaxAngle = true;

  // Relative to the first person camera
  initialPosition = new BABYLON.Vector3(0, 0, 0);

  constructor(game, playerCamera) {
    this.meshes = game.meshes.hammer;
    this.ground = game.scene.getMeshByName("ground");
    this.game = game;
    this.pivot = new BABYLON.TransformNode("root");
    this.pivot.position = this.initialPosition;
    this.pivot.rotation = new BABYLON.Vector3(this.initialAngle, 0, 0);
    this.container = new BABYLON.Mesh("container", game.scene);
    this.container.parent = this.pivot;
    this.container.position = new BABYLON.Vector3(2, -2, 5);
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].parent = this.container;
      this.meshes[i].setEnabled(true);
    }
    this.meshes[0].position.y = 8.3;

    this.pivot.parent = playerCamera;

    game.scene.registerBeforeRender(this.render.bind(this));

    this.pivot.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);


    //this.meshes[0].setEnabled(true);

    //this.meshes[0].ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    //var vis = 100; // visibility scaling
    //this.meshes[0]._boundingInfo = new BABYLON.BoundingInfo(new BABYLON.Vector3(-vis, -vis, -vis), new BABYLON.Vector3(vis, vis, vis));
    //this.meshes[0].checkCollisions = true;

    // this.pivot.actionManager = new BABYLON.ActionManager(game.scene);
    // this.pivot.actionManager.registerAction(
    //   new BABYLON.ExecuteCodeAction({
    //       trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
    //       parameter: {
    //         mesh: this.game.ground
    //       }
    //     }, () => {
    //       console.log("COLLISION !!!!!!!!!!");
    //     }
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


  canHit() {
    return this.hitTimer === 0;
  }

  hit() {
    this.hitTimer = 1;
  }

  render() {
    if (this.hitTimer === 0) {
      return;
    }

    this.pivot.rotation.x += this.angleIncPerFrame * this.hitTimer;

    if (this.meshes[0].intersectsMesh(this.ground, false)) {
      this.game.sounds.eat.play();
      this.hitTimer = -1;
    }

    // Check collision with other guys

    if (this.hitTimer > 0 && this.pivot.rotation.x >= this.maxAngle) {
      this.hitTimer = -1;
    } else if (this.hitTimer < 0 && this.pivot.rotation.x < this.initialAngle) {
      this.hitTimer = 0;
    }
  }

}
