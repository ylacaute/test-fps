import React from 'react'
//import Spector from 'spectorjs';
var SPECTOR = require("spectorjs");

import { connect } from 'react-redux'
import styleCSS from "../sass/index.scss";
import Game from 'Game.js';
import { shortcutJS } from 'shortcutjs';
import shortcuts from '../resources/shortcuts.json'

class Application extends React.Component {

  static propTypes = {
  };

  constructor(props) {
    super(props);
    console.log("Initializing application...");
  };

  componentDidMount() {
    // optional debug param
    shortcutJS.loadFromJson(shortcuts);
    // shortcutJS.subscribe('moveForward', ev => console.log('moveForward'));

    let canvas = document.getElementById("renderCanvas");
    let g = new Game(canvas);

    var spector = new SPECTOR.Spector();
    spector.displayUI();

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
