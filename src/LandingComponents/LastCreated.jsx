import React, { Component } from "react";
import history from "../modules/history";

import { fbCandidatesDB } from "../firebase/firebase.config";
import { Container, Image, List } from "semantic-ui-react";
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
        fbCandidatesDB.orderByChild("create_date").on("value", data => {
            let tmpitems = [];
            data.forEach(function(candidate) {
                tmpitems.push({ key: candidate.key, info: candidate.val() });
            });
            this.setState({
                candidates: tmpitems
            });
        });
    }

    ViewCandidate(ev, key) {
        ev.stopPropagation();
        history.push({ pathname: `/candidates/${key}` });
    }

    render() {
        const { candidates } = this.state;
        const { currentuser } = this.props;

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
                                    <Image avatar src={currentuser.photoURL} />
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
                {/* <Table selectable className="hovered">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Skill</Table.HeaderCell>
                            <Table.HeaderCell>Date added</Table.HeaderCell>
                            <Table.HeaderCell>Added by</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {candidates.map(({ info, key }) => {
                            const created_date = info.created_date ? moment(info.created_date).format("MMM DD, YYYY") : "";
                            return (
                                <Table.Row key={key} onClick={ev => this.ViewCandidate(ev, key)}>
                                    <Table.Cell>
                                        <Image avatar src={currentuser.photoURL} />
                                        {info.firstname} {info.lastname}
                                    </Table.Cell>
                                    <Table.Cell>{info.skill}</Table.Cell>
                                    <Table.Cell>{created_date}</Table.Cell>
                                    <Table.Cell>{info.created_by}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table> */}
            </Container>
        );
    }
}
