import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import history from "../modules/history";
import { Link } from "react-router-dom";
import firebase, { fbPositionsDB } from "../firebase/firebase.config";
import tmplPosition from "../constants/positionInfo";
import NavBar from "../NavBar";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import CandidateDropdown from "../CandidateComponents/CandidateDropdown";
import { Form, Container, Icon, Segment, Button, Header, Message } from "semantic-ui-react";

export default function AddPositionForm() {
    const [position, setposition] = useState(Object.assign({}, tmplPosition));
    const [addedCandidates, setaddedCandidates] = useState([]); //candidates that are added when using this form
    const [removedCandidates, setremovedCandidates] = useState([]); //candidates that are removed when using this form
    const [formError, setformError] = useState(false);

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
        const tmpCandidate = { key: candidate.key, info: { submission_date, candidate_name } };
        setaddedCandidates([{ ...tmpCandidate }, ...addedCandidates]);
    };

    const RemoveCandidateFromPosition = ckey => {
        const selectedCandidate = addedCandidates.filter(candidate => candidate.key === ckey); //get removed candidate info for prompt and fbCandidate update
        const remainingCandidates = addedCandidates.filter(candidate => candidate.key !== ckey); //remove the candidate from submission list
        if (window.confirm(`Are you sure you want to unsubmit ${selectedCandidate[0].info.candidate_name}?`)) {
            setaddedCandidates([...remainingCandidates]);
            setremovedCandidates([...selectedCandidate, ...removedCandidates]); //add candidate to to-be-removed list
        }
    };

    const AddNewPosition = () => {
        if (position.title && position.contract) {
            const added_on = new Date();
            position.added_on = added_on;

            fbPositionsDB.push(position).then(newposition => {
                const pkey = newposition.key;
                var dbUpdate = {};
                addedCandidates.forEach(submission => {
                    dbUpdate[`/candidates/${submission.key}/submitted_positions/${pkey}`] = {
                        position_id: position.position_id,
                        position_name: position.title,
                        position_contract: position.contract,
                        submission_date: submission.info.submission_date
                    };
                    dbUpdate[`/positions/${pkey}/candidates_submitted/${submission.key}`] = {
                        submission_date: submission.info.submission_date,
                        candidate_name: submission.info.candidate_name
                    };
                });

                //prettier-ignore
                firebase.database().ref().update(dbUpdate).then(() => {
                        history.push("/positions/");
                    });
            });
        } else {
            setformError(true);
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
                            {addedCandidates.map(candidate => {
                                return (
                                    <p key={candidate.key}>
                                        <Link to={`/candidates/${candidate.key}`}>
                                            {candidate.info.candidate_name} - submitted on {format(parseISO(candidate.info.submission_date), "MMMM d, yyyy")}
                                        </Link>
                                        <Icon name="close" color="red" link onClick={() => RemoveCandidateFromPosition(candidate.key)} />
                                    </p>
                                );
                            })}

                            <CandidateDropdown selection filters={[{ archived: ["current"] }, { status: ["active", "processing"] }]} removecandidates={addedCandidates} onChange={AddCandidateToPosition} />
                        </Segment>
                        <Segment>
                            {formError && <Message error floating compact icon="warning" header="Required fields missing" content="Title and contract are both required." />}
                            <Button type="submit" icon="plus" positive content="Add" onClick={AddNewPosition} />
                            <Button icon="close" content="Cancel" onClick={() => history.push("/positions")} />
                        </Segment>
                    </Form>
                </Segment>
            </Container>
        </>
    );
}
// const tmplPosition = {
//     title: "test",
//     description: "test",
//     level: "",
//     skills_summary: "",
//     position_id: "",
//     contract: "",
//     pm: "",
//     candidate_submitted: [{name, date}],
//     location: ""
// };
