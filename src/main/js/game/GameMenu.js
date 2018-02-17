import * as GUI from 'babylonjs-gui';

export default class GameMenu {

  ui = null;

  layout = null;
  startButton = null;
  clickStartCallback = null;

  constructor(scene, clickStartCallback) {
    this.ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("menu");
    this.clickStartCallback = clickStartCallback;
    this.createButtons();
  }

  show() {
    this.ui.addControl(this.layout);
    // this.ui.addControl(this.startGameButton);
  }

  hide() {
    this.ui.removeControl(this.layout);
    //this.ui.removeControl(this.startGameButton);
  }

  createButtons() {

    var layout = new GUI.StackPanel();
    layout.width = 0.4;
    layout.height = 0.5;
    layout.cornerRadius = 6;
    layout.color = "black";
    layout.thickness = 1;
    layout.background = "white";
    layout.alpha = 0.2;
    this.layout = layout;

    let startGameButton = GUI.Button.CreateSimpleButton("but1", "Start new game  (or press ENTER)");
    startGameButton.z = "20px";
    startGameButton.width = "300px"
    startGameButton.height = "70px";
    startGameButton.color = "black";
    startGameButton.cornerRadius = 6;
    startGameButton.background = "white";
    startGameButton.onPointerUpObservable.add(this.clickStartCallback);
    this.startGameButton = startGameButton;
    this.layout.addControl(this.startGameButton);
  }

}
