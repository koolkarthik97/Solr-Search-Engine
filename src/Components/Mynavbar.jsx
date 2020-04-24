import React, { Component } from "react";
import { Navbar, Form, FormControl, Button, Nav } from "react-bootstrap";
import Switch from "react-switch";
import "../Styles/Mynavbar.css";
import AsyncSelect from "react-select/async";

class Mynavbar extends Component {
  state = {
    checked: false,
    engine: "lucene",
    query: "",
    options: [{ value: "", label: "" }],
  };

  handleToggle = () => {
    if (!this.state.checked)
      this.setState({ checked: true, engine: "pagerank" });
    else this.setState({ checked: false, engine: "lucene" });
  };

  // handleChange = (e) => {
  //   this.setState({ query: e.target.value });
  // };

  handleChange = (inputValue, { action }) => {
    this.setState({
      query: inputValue,
    });
  };

  handleSearch = () => {
    this.props.onSearch(this.state.query, this.state.engine);
  };

  loadOptions = async (inputValue) => {
    this.setState({ query: inputValue });
    if (!inputValue) {
      return [];
    }
    try {
      const response = await fetch(
        `http://localhost:8983/solr/myexample/suggest?q=${inputValue}`
      );
      const data = await response.json();
      const resultsRaw = data["suggest"]["suggest"][inputValue];
      const options = resultsRaw["suggestions"].map((result) => ({
        label: result["term"],
        value: result["term"],
      }));
      this.setState({ options });
      return options;
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    let navtag = (
      <Navbar bg="dark" variant="dark" className=".bg-custom-2">
        <Navbar.Brand
          style={{ width: "15rem", marginRight: "1rem", marginLeft: "1rem" }}
        >
          Solr Search Engine
        </Navbar.Brand>
        {/* <Form inline>
          <FormControl
            type="text"
            placeholder="Search"
            className="mr-sm-2"
            onChange={this.handleChange}
          /> */}
        <div style={{ width: "15rem", marginRight: "1rem", color: "black" }}>
          <AsyncSelect
            cacheOptions
            isClearable
            loadOptions={this.loadOptions}
            defaultOptions
            onChange={this.handleChange}
          />
        </div>
        <Button variant="outline-info" onClick={this.handleSearch}>
          Search
        </Button>
        {/* </Form> */}
        <Nav style={{ marginLeft: "40rem", width: "5rem" }}>Lucene</Nav>
        <Switch
          checked={this.state.checked}
          onChange={this.handleToggle}
          onColor="#86d3ff"
          onHandleColor="#2693e6"
          handleDiameter={30}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={20}
          width={48}
          className="react-switch"
          id="material-switch"
        />{" "}
        <Nav style={{ width: "6rem" }}>Pagerank</Nav>
      </Navbar>
    );
    return navtag;
  }
}

export default Mynavbar;
