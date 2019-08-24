import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import history from "../modules/history";
import { Button, Header, Segment, Container, Menu, Icon } from "semantic-ui-react";
import classnames from "classnames";
import moment from "moment";
import NavBar from "../NavBar";
import { fbPositionsDB } from "../firebase/firebase.config";
import tmplPosition from "../constants/positionInfo";

export default function PositionDetailPage({ match }) {
    const [position, setposition] = useState({ ...tmplPosition });
    const key = match.params.id;

    useEffect(() => {
        const key = match.params.id;
        fbPositionsDB.child(key).on("value", data => {
            if (data.val()) {
                setposition({ ...tmplPosition, ...data.val() });
            } else {
                history.push("/positions/");
            }
        });
        return () => fbPositionsDB.off("value");
    }, {});

    if (position) {
        const position_id = position.position_id ? `(${position.position_id})` : "";
        const contract = position.contract ? `${position.contract} - ` : "";
        const level = position.level ? `${position.level}` : "";
        const dash = position.level && position.skill_summary ? "-" : "";
        const location = position.location ? `Location: ${position.location}` : "";

        return (
            <div>
                <NavBar active="positions" />
                <Container>
                    <Menu fluid attached="top" size="huge" borderless className="no-print">
                        <Menu.Item
                            onClick={() => {
                                history.goBack();
                            }}>
                            <Icon name="arrow left" />
                        </Menu.Item>
                        <Menu.Menu position="right">
                            <Menu.Item as={Link} to={`/positions/${key}/edit`}>
                                <Icon name="edit" />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                    <Segment attached padded>
                        <Segment vertical padded>
                            <Header size="large">
                                {contract} {position.title} {position_id}
                                <Header.Subheader>
                                    <div>
                                        {level} {dash} {position.skill_summary}
                                    </div>
                                    <div>{location}</div>
                                </Header.Subheader>
                            </Header>
                            <div>{position.description}</div>
                        </Segment>
                        <Segment vertical padded>
                            <Header size="medium">Candidate Submissions</Header>
                            <p>
                                <Link to="/candidates:id">Alex M - submitted on Jan 2, 2019</Link>
                            </p>
                            <p>
                                <Link to="/candidates:id">Alex M - submitted on Jan 2, 2019</Link>
                            </p>
                            <p>
                                <Link to="/candidates:id">Alex M - submitted on Jan 2, 2019</Link>
                            </p>
                            <p>
                                <Link to="/candidates:id">Alex M - submitted on Jan 2, 2019</Link>
                            </p>
                            <p>
                                <Button icon="plus" title="Submit candidate"></Button>
                            </p>
                        </Segment>
                    </Segment>
                </Container>
            </div>
        );
    }
}
// position:
//     title: "",
//     description: "",
//     level: "",
//     position_id: "",
//     contract: "",
//     candidate_submitted: [],
//     location: ""
