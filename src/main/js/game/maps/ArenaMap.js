

export default class ArenaMap {

  images = {
    "title": "img/gameTitle.png"
  };

  textures = {
    "sand" : "textures/ground_sand.png",
    "metal" : "textures/metal.jpg"
  };

  meshes = {
    "ai" : ["tmp/", "mushroomFinal.babylon"],
    "cube" : ["characters/", "player.babylon"]
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
