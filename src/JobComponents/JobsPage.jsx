import React, { Component } from "react";
import NavBar from "../NavBar";

export default class JobsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>
                <NavBar active="jobs" />
                <h2>Jobs Management</h2>
            </div>
        );
    }
}
