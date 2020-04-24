import React, { Component } from "react";
import Result from "./Result";
class Results extends Component {
  state = {};
  render() {
    var cards = this.props.data.map((d) => <Result key={d} data={d} />);
    return cards;
  }
}

export default Results;
