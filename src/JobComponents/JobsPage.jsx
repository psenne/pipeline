import React, { Component } from "react";
import NavBar from "../NavBar";
import { Container } from "semantic-ui-react";

export default class JobsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>
                <NavBar active="jobs" />
                <Container>
                    <h1>Jobs Management</h1>
                </Container>
            </div>
        );
    }
}
