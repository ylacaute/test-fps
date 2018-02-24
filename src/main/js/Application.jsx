import React from 'react'
//import Spector from 'spectorjs';
var SPECTOR = require("spectorjs");

import { connect } from 'react-redux'
import styleCSS from "../sass/index.scss";
//import Game from 'Game.js';
// Converts from degrees to radians.

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

import { GameLoader, GameMod, GameMap } from 'game/GameLoader.js';

class Application extends React.Component {

  static propTypes = {
  };

  constructor(props) {
    super(props);
    console.log("Initializing application...");
  };

  componentDidMount() {


    let canvas = document.getElementById("renderCanvas");

    new GameLoader().load(canvas, GameMod.FPS, GameMap.Arena);

    //let g = new Game(canvas);
    //var spector = new SPECTOR.Spector();
    //spector.displayUI();



  }

  render() {
    return (
      <div>
        <canvas id="renderCanvas"></canvas>
      </div>
    );
  };

}

const mapStateToProps = state => {
  return {
  }
};

const mapDispatchToProps = dispatch => ({

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Application)
