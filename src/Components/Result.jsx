import React, { Component } from "react";
import { Card } from "react-bootstrap";

class Result extends Component {
  state = {};
  render() {
    var card = (
      <Card>
        <Card.Header></Card.Header>
        <Card.Header>ID: {this.props.data.id}</Card.Header>
        <Card.Body>
          <Card.Title>
            Title :{" "}
            <a href={this.props.data.url} target="_blank">
              {this.props.data.title}
            </a>
          </Card.Title>
          <Card.Text>Description : {this.props.data.description}</Card.Text>
        </Card.Body>
        <Card.Header>
          URL :{" "}
          <a href={this.props.data.url} target="_blank">
            {this.props.data.url}
          </a>
        </Card.Header>
        <Card.Header></Card.Header>
      </Card>
    );
    return card;
  }
}

export default Result;
