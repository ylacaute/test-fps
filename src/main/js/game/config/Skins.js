
export default class Skins {

  static characterDirectory = "characters/";

  static available = [{
    name: "ely",
    baseDir: "characters/ely/",
    scale: [0.055, 0.055, 0.055],
    rotation: [- Math.PI / 2 , Math.PI, 0], // +
    model: "ely.babylon",
    enabled: true,
    animation: {
      waitFrames: [30, 30],
      walkFrames: [0, 25],
      jumpFrames: [31, 38]
    },
    sounds: [{
      name: "jump",
      src: "sounds/jump1.wav",
      options: {
        volume: 0.1
      }
    }, {
      name: "land",
      src: "sounds/land1.wav",
      options: {
        volume: 0.1
      }
    }]
  }];


}
