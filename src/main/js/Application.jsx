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
    console.log("WTF");
  };

  componentDidMount() {
    // optional debug param
    console.log("shortcutJS : ", shortcutJS);
    console.log("shortcuts : ", shortcuts);
    shortcutJS.loadFromJson(shortcuts);
    // shortcutJS.subscribe('moveForward', ev => console.log('moveForward'));


    let g = new Game("renderCanvas");
    var spector = new SPECTOR.Spector();
    spector.displayUI();

    console.log("WTF");
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
