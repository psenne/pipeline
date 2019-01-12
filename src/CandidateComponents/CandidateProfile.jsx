import React, { Component } from "react";
import { Grid, Header, Segment, Icon, Card } from "semantic-ui-react";
import moment from "moment";
import { fbCandidatesDB } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";

class CandidateProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: null
        };
    }

    componentDidMount() {
        const { candidateID } = this.props;
        fbCandidatesDB.child(candidateID).once("value", data => {
            this.setState({ candidate: data.val() });
        });

        //child_changed will be called when an object is updated in firebase (usually by another user).
        //Checks if the candidate updated is the one this user is currently editing. If so, then update form with those values.

        fbCandidatesDB.on("child_changed", childSnapshot => {
            if (childSnapshot.key === this.props.ckey) {
                this.setState({
                    candidate: childSnapshot.val()
                });
            }
        });
    }

    render() {
        let candidate = this.state.candidate;
        let interviewed = "Candidate has not been interviewed.";
        let loi_message = "LOI has not been sent.";

        if (candidate) {
            candidate = { ...tmplCandidate, ...candidate };

            candidate.interview_date = candidate.interview_date ? moment(candidate.interview_date).format("M/D/YYYY") : "";
            candidate.loi_sent_date = candidate.loi_sent_date ? moment(candidate.loi_sent_date).format("M/D/YYYY") : "";
            candidate.interviewed_by = candidate.interviewed_by.join(", ");
            candidate.potential_contracts = candidate.potential_contracts.join(", ");
            candidate.salary = candidate.salary ? atob(candidate.salary) : "";

            if (candidate.interviewed_by) {
                interviewed = `Interviewed on ${candidate.interview_date} by ${candidate.interviewed_by}.`;
            }

            if (candidate.loi_status === "accepted") {
                loi_message = `LOI was sent on ${candidate.loi_sent_date} by ${candidate.loi_sent_by}. LOI was accepted.`;
            }
            else if (candidate.loi_status === "sent") {
                loi_message = `LOI was sent on ${candidate.loi_sent_date} by ${candidate.loi_sent_by}.`;
            }
            else {
                loi_message = "LOI has not been sent.";
            }
        }

        return (
            <div>
                {candidate && (
                    <Segment attached padded>
                        <Segment vertical padded>
                            <Grid columns={2}>
                                <Grid.Column>
                                    <Header size="huge">
                                        {candidate.firstname} {candidate.lastname}
                                        <Header.Subheader>
                                            {candidate.level} {candidate.skill}
                                        </Header.Subheader>
                                        <Header.Subheader>Referred by {candidate.found_by}</Header.Subheader>
                                    </Header>
                                </Grid.Column>
                                <Grid.Column textAlign="right">{candidate.status.toUpperCase()}</Grid.Column>
                            </Grid>
                        </Segment>

                        <Segment vertical padded>
                            <Grid columns={2}>
                                <Grid.Column>
                                    <div>Current contract: {candidate.current_contract}</div>
                                    <div>Potential contracts: {candidate.potential_contracts}</div>
                                    <div>Salary: {candidate.salary}</div>
                                </Grid.Column>
                                <Grid.Column>
                                    <div>{interviewed}</div>
                                    <div>{loi_message}</div>
                                </Grid.Column>
                            </Grid>
                        </Segment>

                        <Segment vertical padded>
                            <div>
                                <h3>Management Notes:</h3>
                                {candidate.notes}
                            </div>
                            <div>
                                <h3>Follow up:</h3>
                                {candidate.next_steps}
                            </div>
                        </Segment>
                        <Segment vertical padded>
                            <div>
                                <h3>Documents</h3>
                                <Card.Group itemsPerRow={8}>
                                    <Card>
                                        <Card.Content textAlign="center">
                                            <Card.Header>
                                                <Icon name="paperclip" size="big" />
                                            </Card.Header>
                                            <Card.Description>Resume</Card.Description>
                                        </Card.Content>
                                    </Card>
                                    <Card>
                                        <Card.Content textAlign="center">
                                            <Card.Header>
                                                <Icon name="paperclip" size="big" />
                                            </Card.Header>
                                            <Card.Description>LOI</Card.Description>
                                        </Card.Content>
                                    </Card>
                                    <Card>
                                        <Card.Content textAlign="center">
                                            <Card.Header>
                                                <Icon name="paperclip" size="big" />
                                            </Card.Header>
                                            <Card.Description>Cover Letter</Card.Description>
                                        </Card.Content>
                                    </Card>
                                </Card.Group>
                            </div>
                        </Segment>
                    </Segment>
                )}
            </div>
        );
    }
}

export default CandidateProfile;
