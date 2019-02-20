import React, { Component } from "react";
import { Grid, Header, Segment } from "semantic-ui-react";
import classnames from "classnames";
import moment from "moment";
import { fbCandidatesDB } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import Files from "../CandidateComponents/Files";

class CandidateProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: { ...tmplCandidate }
        };
    }

    componentDidMount() {
        const { candidateID } = this.props;

        fbCandidatesDB.child(candidateID).on("value", data => {
            this.setState({
                candidate: Object.assign(tmplCandidate, data.val())
            });
        });
    }

    componentWillUnmount() {
        const { candidateID } = this.props;
        fbCandidatesDB.child(candidateID).off("value");
    }

    render() {
        let candidate = this.state.candidate;
        let interviewed = "Candidate has not been interviewed.";
        let loi_message = "LOI has not been sent.";
        let referedby = "";
        let company_info = "";

        candidate.interview_date = candidate.interview_date ? moment(candidate.interview_date).format("M/D/YYYY") : "";
        candidate.loi_sent_date = candidate.loi_sent_date ? moment(candidate.loi_sent_date).format("M/D/YYYY") : "";
        candidate.salary = candidate.salary ? atob(candidate.salary) : "";

        if (candidate.interviewed_by && candidate.interviewed_by.length > 0) {
            interviewed = `Interviewed on ${candidate.interview_date} by ${candidate.interviewed_by.join(", ")}.`;
        }

        if (candidate.found_by) {
            referedby = `Refered by ${candidate.found_by}`;
        }

        if (candidate.current_company) {
            company_info = ` with ${candidate.current_company}`;
        }

        if (candidate.loi_status === "accepted") {
            loi_message = `LOI was sent on ${candidate.loi_sent_date} by ${candidate.loi_sent_by}. LOI was accepted.`;
        } else if (candidate.loi_status === "sent") {
            loi_message = `LOI was sent on ${candidate.loi_sent_date} by ${candidate.loi_sent_by}.`;
        } else {
            loi_message = "LOI has not been sent.";
        }

        return (
            <>
                {candidate && (
                    <Segment attached padded>
                        <Segment vertical padded>
                            <Grid>
                                <Grid.Row verticalAlign="middle" columns={2}>
                                    <Grid.Column>
                                        <Header size="huge">
                                            {candidate.firstname} {candidate.lastname}
                                            <h5>{[candidate.emailaddress, candidate.telephone].filter(Boolean).join(" / ")}</h5>
                                        </Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <span className={classnames("padded-span", `status-${candidate.status}`)}>{candidate.status.toUpperCase()}</span>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row columns={1}>
                                    <Grid.Column>
                                        <Header.Subheader>
                                            {candidate.level} {candidate.skill} {company_info}
                                        </Header.Subheader>
                                        <Header.Subheader>{referedby}</Header.Subheader>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>

                        <Segment vertical padded>
                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <div>Current contract: {candidate.current_contract}</div>
                                        <div>Potential contracts: {candidate.potential_contracts.join(", ")}</div>
                                        <div>Prefered work location: {candidate.prefered_location}</div>
                                        <div>Salary: {candidate.salary}</div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <div>{interviewed}</div>
                                        <div>{loi_message}</div>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>

                        <Segment vertical padded>
                            <Grid>
                                <Grid.Row>
                                    <Grid.Column>
                                        <h3>Management Notes:</h3>
                                        {candidate.notes}
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column>
                                        <h3>Follow up:</h3>
                                        {candidate.next_steps}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                        <Segment vertical padded>
                            <h3>Documents</h3>
                            <Files candidateID={this.props.candidateID} filenames={candidate.filenames} />
                        </Segment>
                    </Segment>
                )}
            </>
        );
    }
}

export default CandidateProfile;
