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
    const [addedCandidates, setaddedCandidates] = useState([]); //candidates that are added when using this form
    const [removedCandidates, setremovedCandidates] = useState([]); //candidates that are removed when using this form
    const [formError, setformError] = useState(false);

    useEffect(() => {
        const key = match.params.id;
        const listener = fbPositionsDB.child(key).on("value", data => {
            if (data.val()) {
                setposition(Object.assign({}, position, data.val()));
                //setaddedCandidates(data.val().candidate_submitted);
            } else {
                fbPositionsDB.off("value", listener);
                history.push("/positions/add");
            }
        });
        return () => {
            fbPositionsDB.off("value", listener);
        };
    }, []);

    useEffect(() => {
        setaddedCandidates([...position.candidate_submitted]);
    }, [position]);

    const HandleTextInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        updatePositionInfo(name, value);
    };

    const HandleContractInput = value => {
        updatePositionInfo("contract", value);
    };

    const updatePositionInfo = (name, value) => {
        const tmpPosition = Object.assign({}, position);
        tmpPosition[name] = value;
        setposition(tmpPosition);
    };

    const AddCandidateToPosition = candidate => {
        const submission_date = format(new Date());
        const candidate_name = candidate.info.firstname + " " + candidate.info.lastname;

        setaddedCandidates([{ submission_date, candidate_name, candidate_key: candidate.key }, ...addedCandidates]);
    };

    const RemoveCandidateFromPosition = ckey => {
        const selectedCandidate = addedCandidates.filter(candidate => candidate.candidate_key === ckey); //get removed candidate info for prompt and fbCandidate update
        const remainingCandidates = addedCandidates.filter(candidate => candidate.candidate_key !== ckey); //remove the candidate from submission list

        if (window.confirm(`Are you sure you want to unsubmit ${selectedCandidate[0].candidate_name}?`)) {
            setaddedCandidates([...remainingCandidates]);
            setremovedCandidates([...selectedCandidate, ...removedCandidates]); //add candidate to to-be-removed list
        }
    };

    const UpdatePosition = () => {
        if (position.title && position.contract) {
            const added_on = new Date();
            const promises = []; //array of firebase promises that will be resolved after they are all updated.
            position.added_on = added_on;
            position.candidate_submitted = [...addedCandidates];

            fbPositionsDB
                .child(key)
                .update(position)
                .then(() => {
                    addedCandidates.forEach(submission => {
                        //add position into candidate's record. yay firebase for having me do this in two places!
                        fbCandidatesDB.child(submission.candidate_key).once("value", candidate => {
                            const tmpCandidateRecord = Object.assign({}, tmplCandidate, candidate.val());
                            const pkeys = tmpCandidateRecord.submitted_positions.map(i => i.position_key); //array of position keys to check if position was already added to candidate
                            tmpCandidateRecord.submitted_positions.push({ candidate_key: candidate.key, position_key: key, position_id: position.position_id, position_name: position.title, position_contract: position.contract, submission_date: submission.submission_date });
                            tmpCandidateRecord.status = "processing";
                            console.log(tmpCandidateRecord);
                            promises.push(fbCandidatesDB.child(candidate.key).update(tmpCandidateRecord)); //push to array so we can use Promise.All to wait until they're all resolved
                        });
                    });

                    removedCandidates.forEach(removedone => {
                        fbCandidatesDB.child(removedone.candidate_key).once("value", candidate => {
                            const tmpCandidateRecord = Object.assign({}, tmplCandidate, candidate.val());
                            tmpCandidateRecord.status = "active";
                            //also need to update submitted_positions
                            fbCandidatesDB.child(removedone.candidate_key).update(tmpCandidateRecord);
                        });
                    });
                });
            Promise.all(promises).then(() => {
                tmplPosition.candidate_submitted = [];
                setposition(Object.assign({}, tmplPosition));
                setaddedCandidates([]);
                setremovedCandidates([]);
                console.log("resolved");
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
                    //need to remove position from candidate's record as well
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
                                <Form.Input name="title" type="text" label="Title" onChange={HandleTextInput} value={position.title} />
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
                            {addedCandidates.map(candidate => {
                                return (
                                    <p key={candidate.candidate_key}>
                                        <Link to={`/candidates/${candidate.candidate_key}`}>
                                            {candidate.candidate_name} - submitted on {format(candidate.submission_date, "MMMM D, YYYY")}
                                        </Link>
                                        <Icon name="close" color="red" link onClick={() => RemoveCandidateFromPosition(candidate.candidate_key)} />
                                    </p>
                                );
                            })}

                            <CandidateDropdown selection filters={[{ archived: "current" }, { status: "active" }]} removecandidates={addedCandidates} onChange={AddCandidateToPosition} />
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
