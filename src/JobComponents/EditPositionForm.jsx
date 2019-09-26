import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import history from "../modules/history";
import { Link } from "react-router-dom";
import { fbPositionsDB, fbCandidatesDB, fbAuditTrailDB } from "../firebase/firebase.config";
import tmplPosition from "../constants/positionInfo";
import { tmplCandidate } from "../constants/candidateInfo";
import NavBar from "../NavBar";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import CandidateDropdown from "../CandidateComponents/CandidateDropdown";
import { Form, Container, Segment, Button, Header, Message, Icon } from "semantic-ui-react";

export default function EditPositionForm({ match }) {
    const key = match.params.id;
    const [position, setposition] = useState(Object.assign({}, tmplPosition));
    const [candidateSubmission, setcandidateSubmission] = useState([]);
    const [formError, setformError] = useState(false);

    useEffect(() => {
        const key = match.params.id;
        const listener = fbPositionsDB.child(key).on("value", data => {
            if (data.val()) {
                setposition(Object.assign({}, position, data.val()));
            } else {
                fbPositionsDB.off("value", listener);
                history.push("/positions/add");
            }
        });
        return () => {
            fbPositionsDB.off("value", listener);
        };
    }, []);

    const HandleTextInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        updatePositionInfo(name, value);
    };

    const HandleContractInput = value => {
        updatePositionInfo("contract", value);
    };

    const AddCandidateToPosition = candidate => {
        const submission_date = format(new Date());
        const candidate_name = candidate.info.firstname + " " + candidate.info.lastname;
        const tmpPosition = Object.assign({}, position);
        tmpPosition["candidate_submitted"].push({ submission_date, candidate_name, candidate_key: candidate.key });
        setposition(tmpPosition);
        setcandidateSubmission([{ candidate_key: candidate.key, position_key: key, position_id: tmpPosition.position_id, position_name: tmpPosition.title, position_contract: tmpPosition.contract, submission_date }, ...candidateSubmission]);
    };

    const RemoveCandidateFromPosition = key => {
        const tmpPosition = Object.assign({}, position);
        const submissions = position.candidate_submitted;
        const selectedCandidate = submissions.filter(candidate => candidate.candidate_key === key);
        tmpPosition.candidate_submitted = submissions.filter(candidate => candidate.candidate_key !== key);

        if (window.confirm(`Are you sure you want to unsubmit ${selectedCandidate[0].candidate_name}?`)) {
            setposition(tmpPosition);
        }
    };

    const updatePositionInfo = (name, value) => {
        const tmpPosition = Object.assign({}, position);
        tmpPosition[name] = value;
        setposition(tmpPosition);
    };

    const UpdatePosition = () => {
        if (position.title && position.contract) {
            const added_on = new Date();
            position.added_on = added_on;

            fbPositionsDB
                .child(key)
                .update(position)
                .then(() => {
                    candidateSubmission.forEach(submission => {
                        //add position into candidate's record. yay firebase for having me do this in two places!
                        fbCandidatesDB.child(submission.candidate_key).once("value", candidate => {
                            const ckey = candidate.key;
                            const cinfo = Object.assign({}, tmplCandidate, candidate.val());
                            const csub = [...cinfo.submitted_positions];
                            const pkeys = cinfo.submitted_positions.map(i => i.position.key); //array of position keys to check if position was already added to candidate
                            //if (pkeys.includes(submission.position_key)) {
                            csub.push(submission);
                            cinfo.submitted_positions = csub;
                            cinfo.status = "processing";
                            //fbCandidatesDB.child(ckey).update(cinfo);
                            console.log(cinfo);
                            //}
                        });
                    });
                })
                .then(() => {
                    tmplPosition.candidate_submitted = [];
                    setposition(Object.assign({}, tmplPosition));
                    setcandidateSubmission([]);
                    console.log("done");
                    //history.push("/positions/");
                });
        } else {
            setformError(true);
        }
    };

    const DeletePosition = () => {
        if (window.confirm(`Are you sure you want to delete ${position.name}?`)) {
            fbPositionsDB
                .child(key)
                .remove()
                .then(() => {
                    history.push("/positions/");
                });
        }
    };

    return (
        <>
            <NavBar active="positions" />
            <Container>
                <Segment>
                    <Form>
                        <Segment>
                            <Header>Position Information</Header>
                            <Form.Group unstackable widths={3}>
                                <Form.Input name="title" type="text" required label="Title" onChange={HandleTextInput} value={position.title} />
                                <Form.Input name="level" type="text" label="Level" onChange={HandleTextInput} value={position.level} />
                                <Form.Input name="location" type="text" label="Location" onChange={HandleTextInput} value={position.location} />
                            </Form.Group>
                            <Form.Group unstackable widths={2}>
                                <Form.Input name="skill_summary" type="text" label="Skill Summary" onChange={HandleTextInput} value={position.skill_summary} />
                            </Form.Group>
                            <Form.TextArea name="description" label="Description" onChange={HandleTextInput} value={position.description} />
                        </Segment>
                        <Segment>
                            <Header>Contract Information</Header>
                            <Form.Group unstackable widths={8}>
                                <Form.Input name="position_id" type="text" label="Position ID" placeholder="Position ID" onChange={HandleTextInput} value={position.position_id} />
                                <div className="field">
                                    <label>Contract</label>
                                    <ContractDropdown required selection onChange={HandleContractInput} value={position.contract} />
                                </div>
                            </Form.Group>
                            <Header>Candidate submission</Header>
                            {position.candidate_submitted.map(candidate => {
                                return (
                                    <p key={candidate.candidate_key}>
                                        <Link to={`/candidates/${candidate.candidate_key}`}>
                                            {candidate.candidate_name} - submitted on {format(candidate.submission_date, "MMMM D, YYYY")}
                                        </Link>{" "}
                                        <Icon name="close" color="red" link onClick={() => RemoveCandidateFromPosition(candidate.candidate_key)} />
                                    </p>
                                );
                            })}

                            <CandidateDropdown selection filters={[{ archived: "current" }, { status: "active" }]} removecandidates={position.candidate_submitted} onChange={AddCandidateToPosition} />
                        </Segment>
                        <Segment>
                            {formError && <Message error floating compact icon="warning" header="Required fields missing" content="Title and contract are both required." />}
                            <Button type="submit" icon="save" positive content="Update" onClick={UpdatePosition} />
                            <Button type="submit" icon="trash" negative content="Delete" onClick={DeletePosition} />
                            <Button type="submit" icon="cancel" content="Cancel" onClick={() => history.goBack()} />
                        </Segment>
                    </Form>
                </Segment>
            </Container>
        </>
    );
}
