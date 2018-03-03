

export default class ArenaMap {

  images = {
    "title": "img/gameTitle.png"
  };

  textures = {
    "sand" : "textures/ground_sand.png",
    "metal" : "textures/metal.jpg",
    "ground" : "textures/ground/ground_01.jpg"
  };

  // meshes = {
  //   "mush" : ["tmp/", "mushroomFinal.babylon", false],
  //   "hammer" : ["weapons/hammer/", "hammer.babylon", false],
  //   "gun" : ["weapons/", "PowerRifle.babylon", false]
  // };

  ground = {
    material : {
      src : "maps/arena/ground.png",
      options : {

      }
    },
    heightMap : "maps/arena/groundHeightMap.jpg"
  }

}
