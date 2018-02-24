import * as BABYLON from 'babylonjs';

export default class Gun {

  constructor(game) {
    this.weapon = game.meshes.gun[0];
    this.weapon.parent = this.camera; // The weapon will move with the player camera
    this.weapon.material = new BABYLON.StandardMaterial("weaponMat", game.scene);
    this.weapon.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.weapon.material.specularColor = new BABYLON.Color3(1, 0, 0);
    this.weapon.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
    this.weapon.position = new BABYLON.Vector3(1, -2, 2);
    this.weapon.rotation = new BABYLON.Vector3(-Math.PI / 8, -Math.PI / 40, 0);
    this.weapon.setEnabled(true);


    //this.container.rotation = new BABYLON.Vector3(Math.PI / 4, 0, Math.PI / 2);

    //this.container.position = new BABYLON.Vector3(0, -10, 0);

    //game.meshes.hammer[0].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);

    // let wImpostor = new BABYLON.PhysicsImpostor(container, BABYLON.PhysicsImpostor.BoxImpostor, {
    //   mass: 0,
    //   friction: 1, // 0 = huge sliding, max 1
    //   restitution: 0 // 0 = no bounce, max 1
    //   //disableBidirectionalTransformation: true
    // }, game.scene);
    //wImpostor.setLinearVelocity(new BABYLON.Vector3(1,2,0));

    //this.hammer = game.meshes.hammer[0];
    //console.log("HAMMER : ", game.meshes.hammer);
    //this.hammer.setEnabled(true);
    //this.hammer.position = this.startingPosition.clone();
    //this.hammer.position.x += 30;
    //this.hammer.position.z += 30;

    // for (let i = 0; i < game.meshes.hammer.length; i++) {
    //   game.meshes.hammer[i].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);
    // }



    //this.weapon.position = new BABYLON.Vector3(window.innerWidth * 1.1e-6, -0.0035, 0.0025);
    // var end_position = this.weapon.position.clone();
    // end_position.z -= 0.001;
    // var display = new BABYLON.Animation("fire", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    // var anim_keys = [
    //   {
    //     frame: 0,
    //     value: this.weapon.position
    //   },
    //   {
    //     frame: 10,
    //     value: end_position
    //   },
    //   {
    //     frame: 100,
    //     value: this.weapon.position
    //   }
    // ];
    //
    // display.setKeys(anim_keys);
    // this.weapon.animations.push(display);

  }
}
