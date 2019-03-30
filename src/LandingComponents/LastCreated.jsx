import React, { Component } from "react";
import history from "../modules/history";

import { fbCandidatesDB } from "../firebase/firebase.config";
import { Container, List } from "semantic-ui-react";
import { format } from "date-fns";

export default class LastCreated extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidates: []
        };

        this.ViewCandidate = this.ViewCandidate.bind(this);
    }

    componentDidMount() {
        fbCandidatesDB
            .orderByChild("create_date")
            .limitToLast(5)
            .on("value", data => {
                let tmpitems = [];
                data.forEach(function(candidate) {
                    tmpitems.push({ key: candidate.key, info: candidate.val() });
                });
                this.setState({
                    candidates: tmpitems
                });
            });
    }

    componentWillUnmount() {
        fbCandidatesDB.off("value");
    }

    ViewCandidate(ev, key) {
        ev.stopPropagation();
        history.push({ pathname: `/candidates/${key}` });
    }

    render() {
        const { candidates } = this.state;

        return (
            <Container>
                <h3>Recently added candidates</h3>
                <List selection verticalAlign="middle" divided relaxed>
                    {candidates
                        .filter(candidate => {
                            return candidate.info.created_by;
                        })
                        .map(({ info, key }) => {
                            const created_date = info.created_date ? format(info.created_date, "MMM DD, YYYY") : "";
                            const skill = info.skill ? `(${info.skill})` : "";
                            const addedmsg = info.created_by ? `Added by ${info.created_by} on ${created_date}` : "";

                            return (
                                <List.Item key={key} onClick={ev => this.ViewCandidate(ev, key)}>
                                    <List.Content>
                                        <List.Header as="a">
                                            {info.firstname} {info.lastname} {skill}
                                        </List.Header>
                                        <List.Description>{addedmsg}</List.Description>
                                    </List.Content>
                                </List.Item>
                            );
                        })}
                </List>
            </Container>
        );
    }
}
