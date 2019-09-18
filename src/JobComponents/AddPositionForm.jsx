import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import history from "../modules/history";
import { fbPositionsDB } from "../firebase/firebase.config";
import tmplPosition from "../constants/positionInfo";
import NavBar from "../NavBar";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import CandidateDropdown from "../CandidateComponents/CandidateDropdown";
import { Form, Container, Icon, Segment, Button, Dropdown, Header, Message } from "semantic-ui-react";

export default function AddPositionForm() {
    const [position, setposition] = useState(Object.assign({}, tmplPosition));
    const [formError, setformError] = useState(false);

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
        const candidateSubmissionInfo = { submission_date, candidate_name, candidate_key: candidate.key };
        const tmpPosition = { ...position };
        tmpPosition["candidate_submitted"].push(candidateSubmissionInfo);
        setposition(tmpPosition);
        //setCandidateSubmission([{ position_key: key, position_name: tmpPosition.title, position_contract: tmpPosition.contract, submission_date }, ...candidateSubmission]);
    };

    const RemoveCandidateFromPosition = key => {
        const tmpPosition = { ...position };
        const submissions = position.candidate_submitted;
        const selectedCandidate = submissions.filter(candidate => candidate.candidate_key === key);
        tmpPosition.candidate_submitted = submissions.filter(candidate => candidate.candidate_key !== key);

        if (window.confirm(`Are you sure you want to unsubmit ${selectedCandidate[0].candidate_name}?`)) {
            setposition(tmpPosition);
        }
    };

    const updatePositionInfo = (name, value) => {
        const tmpPosition = { ...position };
        tmpPosition[name] = value;
        setposition(tmpPosition);
    };

    const AddNewPosition = () => {
        if (position.title && position.contract) {
            const added_on = new Date();
            position.added_on = added_on;
            fbPositionsDB.push(position).then(() => {
                history.push("/positions/");
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
