import React, { Component } from "react";
import { Grid, Header, Segment, Icon, Message } from "semantic-ui-react";
import classnames from "classnames";
import moment from "moment";
import { format } from "date-fns";
import { fbFlagNotes, fbAuditTrailDB, fbCandidatesDB } from "../firebase/firebase.config";
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
                candidate: Object.assign({}, tmplCandidate, data.val())
            });
        });
    }

    componentWillUnmount() {
        const { candidateID } = this.props;
        fbCandidatesDB.child(candidateID).off("value");
    }

    removeFlag = ev => {
        ev.stopPropagation();
        const { candidate } = this.state;
        const { currentuser, candidateID } = this.props;

        const candidate_name = candidate.firstname + " " + candidate.lastname;
        const now = new Date();
        let candidateflag = {};
        let newEvent = {};

        const removeflag = window.confirm(`Are you sure you want to remove the flag for ${candidate_name}?`);

        if (removeflag) {
            candidateflag = {
                isFlagged: false,
                flagged_by: "",
                flag_note: "",
                flagged_on: "",
                actioned_to: ""
            };
            newEvent = {
                eventdate: now.toJSON(),
                eventinfo: `${currentuser.displayName} removed flag from candidate.`,
                candidatename: candidate_name
            };

            fbFlagNotes.child(candidateID).remove();
            fbAuditTrailDB.push(newEvent);
            fbCandidatesDB.child(candidateID).update(candidateflag);
        }
    };

    render() {
        let candidate = this.state.candidate;
        let interviewed = "Candidate has not been interviewed.";
        let loi_message = "LOI has not been sent.";
        let referedby = "";
        let company_info = "";

        let interview_date = candidate.interview_date ? moment(candidate.interview_date).format("M/D/YYYY") : "";
        let loi_sent_date = candidate.loi_sent_date ? moment(candidate.loi_sent_date).format("M/D/YYYY") : "";
        let salary = candidate.salary !== "" ? atob(candidate.salary) : "";

        if (candidate.interviewed_by && candidate.interviewed_by.length > 0) {
            interviewed = `Interviewed on ${interview_date} by ${candidate.interviewed_by.join(", ")}.`;
        }

        if (candidate.found_by) {
            referedby = `Refered by ${candidate.found_by}`;
        }

        if (candidate.current_company) {
            company_info = ` with ${candidate.current_company}`;
        }

        // if (candidate.loi_status === "accepted") {
        //     loi_message = `LOI was sent on ${loi_sent_date} by ${candidate.loi_sent_by}. LOI was accepted.`;
        // } else if (candidate.loi_status === "sent") {
        //     loi_message = `LOI was sent on ${loi_sent_date} by ${candidate.loi_sent_by}.`;
        // } else {
        //     loi_message = "LOI has not been sent.";
        // }
        
        if (candidate.loi_status === "accepted") {
            loi_message = `LOI was sent on ${loi_sent_date}. LOI was accepted.`;
        } else if (candidate.loi_status === "sent") {
            loi_message = `LOI was sent on ${loi_sent_date}.`;
        } else {
            loi_message = "LOI has not been sent.";
        }

        const action = candidate.actioned_to ? <Message.Header>Actioned to: {candidate.actioned_to}</Message.Header> : "";

        return (
            <>
                {candidate && (
                    <Segment attached padded className={classnames(`status-${candidate.archived}`)}>
                        <Segment vertical padded>
                            <Grid>
                                {candidate.isFlagged && (
                                    <Grid.Row>
                                        <Message icon onDismiss={this.removeFlag}>
                                            <Icon name="flag" color="red" />
                                            <Message.Content>
                                                {action}
                                                <div>{candidate.flag_note}</div>
                                                <div style={{ color: "#808080" }}>
                                                    Added by {candidate.flagged_by} on {format(candidate.flagged_on, "MMM DD, YYYY")}
                                                </div>
                                            </Message.Content>
                                        </Message>
                                    </Grid.Row>
                                )}
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
                                        <div>Salary: {salary}</div>
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
                                        <h3>Next Steps:</h3>
                                        {candidate.next_steps}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                        <Segment vertical padded className={classnames({ "form-hidden": candidate.filenames.length === 0 }, "minitoolbar-inline")}>
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
