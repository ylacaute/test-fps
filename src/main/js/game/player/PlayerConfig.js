import Skins from "game/config/Skins";

export default class PlayerConfig {

  // Default Skin
  skin = Skins.available[0];

  keyBindings = {
    jump : 32,        // <space>
    forward : 90,     // Z, W(87)
    backward : 83,    // S
    left : 81,        // Q, A(65)
    right : 68,       // D
    switchCamera: 69, // E
    reload: 82        // R
  };

}
