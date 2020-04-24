import React, { Component } from "react";
import Mynavbar from "./Mynavbar";
import Results from "./Results";
import axios from "axios";
import { loadFile, speller } from "../SpellCheck/index";

class Container extends Component {
  state = {
    data: [],
    ans: "",
    showSuggestion: false,
    query: "",
    engine: "lucene",
  };
  constructor(props) {
    super(props);
  }

  suggestCall = () => {
    const url = `http://localhost:8081/correct?input=${this.state.query}`;
    axios
      .get(url)
      .then((response) => {
        //handle success
        this.setState({ ans: response.data });
      })
      .catch(function (error) {
        console.log("error");
      });
  };

  handleSearch = (query, engine) => {
    console.log("inc lick");
    this.setState({ query, engine }, () => {
      const url = `http://localhost:8081/search?engine=${engine}&query=${query}`;
      axios
        .get(url)
        .then((response) => {
          //handle success
          if (response.data.length > 0)
            this.setState({ data: response.data, showSuggestion: false });
          else {
            this.setState({ showSuggestion: true }, this.suggestCall);
          }
        })
        .catch(function (error) {
          console.log("error");
        });
    });
  };
  render() {
    return (
      <React.Fragment>
        <Mynavbar onSearch={this.handleSearch} />
        {this.state.showSuggestion == true ? (
          <div>
            Did you mean{" "}
            <div
              style={{ color: "blue", fontSize: "13dp" }}
              onClick={() =>
                this.handleSearch(this.state.ans, this.state.engine)
              }
            >
              {this.state.ans}
            </div>
          </div>
        ) : (
          <Results data={this.state.data} />
        )}
      </React.Fragment>
    );
  }
}

export default Container;
