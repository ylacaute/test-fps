

export default class TestCollisionMap {

  images = {
    "title": "img/gameTitle.png"
  };

  textures = {
    "sand" : "textures/ground_sand.png",
    "metal" : "textures/metal.jpg",
    "ground" : "textures/ground/ground_01.jpg"
  };

  meshes = {
    "player" : ["characters/dude/", "dude.babylon", true],
  };

  ground = {
    material : {
      src : "maps/arena/ground.png",
      options : {
      }
    },
    heightMap : "maps/arena/groundHeightMap.jpg"
  }

}
