import React, { Component } from "react";
import { Container, Menu, Icon } from "semantic-ui-react";
import CandidateProfile from "./CandidateProfile";
import NavBar from "../NavBar";

import "./candidatestyle.css";

export default class CandidateDetail extends Component {
    GoBack() {
        this.props.history.goBack();
    }

    render() {
        const { match } = this.props;
        const candidateID = match.params.id;
        return (
            <div>
                <NavBar active="candidates" />
                <Container>
                    <Menu fluid attached="top" size="huge" borderless className="no-print">
                        <Menu.Item onClick={this.GoBack.bind(this)}>
                            <Icon name="arrow left" />
                        </Menu.Item>
                    </Menu>
                    <CandidateProfile candidateID={candidateID} />
                </Container>
            </div>
        );
    }
}
