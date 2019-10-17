import React, { Component } from "react";
import { Link } from "react-router-dom";

import { fbCandidatesDB } from "../firebase/firebase.config";
import { Container, List } from "semantic-ui-react";
import { format } from "date-fns";

export default class LastModified extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidates: []
        };
    }

    componentDidMount() {
        fbCandidatesDB
            .orderByChild("modified_date")
            .limitToLast(5)
            .on("value", data => {
                let tmpitems = [];
                data.forEach(function(candidate) {
                    tmpitems.push({ key: candidate.key, info: candidate.val() });
                });
                this.setState({
                    candidates: tmpitems.reverse()
                });
            });
    }

    componentWillUnmount() {
        fbCandidatesDB.off("value");
    }

    render() {
        const { candidates } = this.state;

        return (
            <Container>
                <h3>Recently edited candidates</h3>
                <List selection verticalAlign="middle" divided relaxed>
                    {candidates
                        .filter(candidate => {
                            return candidate.info.modified_fields !== undefined;
                        })
                        .map(({ info, key }) => {
                            const modified_date = info.modified_date ? format(info.modified_date, "MMM DD, YYYY") : "";
                            const skill = info.skill ? `(${info.skill})` : "";
                            const modified_fields = info.modified_fields
                                ? info.modified_fields.map(field => {
                                      return `${field.replace("_", " ")}`;
                                  })
                                : [];
                            const modifiedmsg = info.modified_by ? `${info.modified_by} edited ${modified_fields.join(", ")} on ${modified_date}` : "";

                            return (
                                <List.Item key={key}>
                                    <List.Content>
                                        <List.Header>
                                            <Link to={`/candidates/${key}`}>
                                                {info.firstname} {info.lastname} {skill}
                                            </Link>
                                        </List.Header>
                                        <List.Description>
                                            <div>{modifiedmsg}</div>
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            );
                        })}
                </List>
            </Container>
        );
    }
}
