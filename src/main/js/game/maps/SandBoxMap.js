import * as BABYLON from 'babylonjs';

export default class SandBoxMap {

  name = "SandBoxMap";
  groundTexture = "ground";
  width = 600;
  height = 600;

  images = {
    "title": "img/gameTitle.png"
  };

  textures = {
    "sand" : "textures/ground_sand.png",
    "metal" : "textures/metal.jpg",
    "ground" : "textures/ground/ground_01.jpg",
    "smoke" : "weapons/bazooka/smoke.png",
    "fire" : "weapons/bazooka/fire.png",
    "rocket" : "weapons/bazooka/rocket.jpg",
    "wall" : "maps/wall_01.jpg",
   // "wall_02" : "maps/wall_02.jpg",
  };

  meshes = {
    monolith : {
      baseDir: "maps/monolith/",
      model: "monolith.babylon",
      scale: 6,
      position: [-50, -26, 50]
    },
    doubleBridge : {
      baseDir: "maps/",
      model: "doubleBridge.babylon",
      scale: 0.1,
      position: [-100, 0, -100]
    }
  };



  // meshes = {
  //   "mush" : ["tmp/", "mushroomFinal.babylon", false],
  //   "hammer" : ["weapons/hammer/", "hammer.babylon", false],
  //   "gun" : ["weapons/", "PowerRifle.babylon", false]
  // };

  weapons = [{
    name: "bazooka",
    baseDir: "weapons/bazooka/",
    model: "bazooka.babylon",
    enabled: false,
    sounds: [{
      name: "bazookaFire",
      src: "fire.mp3",
      options: {
        volume: 0.1
      }
    }, {
      name: "bazookaHit",
      src: "hit.mp3",
      options: {
        volume: 0.1
      }
    }]
  }];

  defaultWeapon = "bazooka";

  ground = {
    material : {
      src : "maps/arena/ground.png",
      options : {

      }
    },
    heightMap : "maps/arena/groundHeightMap.jpg"
  };


}
