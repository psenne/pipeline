import React, { Component } from "react";
import NavBar from "../NavBar";
import { Container } from "semantic-ui-react";

export default class PositionsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>
                <NavBar active="positions" />
                <Container>
                    <h1>Positions Management</h1>
                </Container>
            </div>
        );
    }
}
