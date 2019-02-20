import React, { Component } from "react";
import { Link } from "react-router-dom";
import history from "../modules/history";
import { Container, Menu, Icon } from "semantic-ui-react";
import CandidateProfile from "./CandidateProfile";
import NavBar from "../NavBar";

import "./candidatestyle.css";

export default class CandidateDetail extends Component {
    constructor(props) {
        super(props);

        this.GoBack = this.GoBack.bind(this);
    }

    GoBack() {
        // history.push("/candidates");
        const filter = this.props.location.state ? this.props.location.state.filter : "current";
        const filterBySearch = this.props.location.state ? this.props.location.state.filterBySearch : "";
        const filterByStatus = this.props.location.state ? this.props.location.state.filterByStatus : "";

        history.push({ pathname: `/candidates`, state: { filter, filterBySearch, filterByStatus } });
    }

    render() {
        const { match } = this.props;
        const candidateID = match.params.id;
        return (
            <div>
                <NavBar active="candidates" />
                <Container>
                    <Menu fluid attached="top" size="huge" borderless className="no-print">
                        <Menu.Item onClick={this.GoBack}>
                            <Icon name="arrow left" />
                        </Menu.Item>
                        <Menu.Menu position="right">
                            <Menu.Item as={Link} to={`/candidates/${candidateID}/edit`}>
                                <Icon name="edit" />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                    <CandidateProfile candidateID={candidateID} />
                </Container>
            </div>
        );
    }
}
