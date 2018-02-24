

export default class ArenaMap {

  images = {
    "title": "img/gameTitle.png"
  };

  textures = {
    "sand" : "textures/ground_sand.png",
    "metal" : "textures/metal.jpg"
  };

  meshes = {
    "mush" : ["tmp/", "mushroomFinal.babylon"],
    "player" : ["characters/dude/", "dude.babylon"],
    "hammer" : ["weapons/hammer/", "hammer.babylon"]
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
