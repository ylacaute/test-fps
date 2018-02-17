


export default class FPSMod {

  gravity = [0, -0.5, 0];
  clearColor = [0.7, 0, 0];

  fog_start = 0;
  fog_end = 100;
  elapsedTime = 0;

  keyBindings = {
    jump : 32,         // <space>
    forward : 90,  // Z, W(87)
    backward : 83,     // S
    left : 81,     // Q, A(65)
    right : 68         // D
  };

  meshes = {
    "gun" : ["weapons/", "PowerRifle.babylon"]
  };

  sounds = {
    "shot" : {
      src: "sounds/pew.mp3",
      options: {
        volume: 1
      }
    },
    "hurt" : {
      src:"sounds/hurt.mp3"
    },
    "eat" : {
      src:"sounds/eat.mp3"
    },
    "die" : {
      src:"sounds/die.mp3",
      options: {
        volume: 1.1
      }
    },
    "BGM" : {
      src: "sounds/RunAmok.mp3",
      options: {
        loop: true,
        autoplay: true
      }
    }
  };


}
