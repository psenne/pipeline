import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import history from "../modules/history";
import { fbPositionsDB } from "../firebase/firebase.config";
import tmplPosition from "../constants/positionInfo";
import NavBar from "../NavBar";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import CandidateDropdown from "../CandidateComponents/CandidateDropdown";
import { Form, Container, Segment, Button, Dropdown, Header, Message, DropdownDivider } from "semantic-ui-react";

export default function EditPositionForm({ match }) {
    const key = match.params.id;
    const [position, setposition] = useState({ ...tmplPosition });
    const [formError, setformError] = useState(false);

    useEffect(() => {
        const key = match.params.id;
        fbPositionsDB.child(key).on("value", data => {
            if (data.val()) {
                setposition({ ...tmplPosition, ...data.val() });
            } else {
                history.push("/positions/add");
            }
        });
        return () => fbPositionsDB.off("value");
    }, {});

    const HandleTextInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        updatePositionInfo(name, value);
    };

    const HandleContractInput = value => {
        updatePositionInfo("contract", value);
    };

    const HandleCandidateSubmission = key => {
        const submission_date = format(new Date());
        const submission = { candidate: key, submission_date };
        console.log(submission);
    };

    const updatePositionInfo = (name, value) => {
        const tmpPosition = { ...position };
        tmpPosition[name] = value;
        setposition(tmpPosition);
    };

    const UpdatePosition = () => {
        if (position.title && position.contract) {
            fbPositionsDB
                .child(key)
                .update(position)
                .then(() => {
                    history.push("/positions/");
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
                                    <ContractDropdown required clearable selection onChange={HandleContractInput} value={position.contract} />
                                </div>
                            </Form.Group>
                            <Header>Candidate submission</Header>
                            <Form.Group>
                                <CandidateDropdown selection clearable filters={[{ archived: "current" }, { status: "active" }]} onChange={HandleCandidateSubmission} />
                            </Form.Group>
                        </Segment>
                        <Segment>
                            {formError && <Message error floating compact icon="warning" header="Required fields missing" content="Title and contract are both required." />}
                            <Button type="submit" icon="save" positive content="Update" onClick={UpdatePosition} />
                            <Button type="submit" icon="trash" negative content="Delete" onClick={DeletePosition} />
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
