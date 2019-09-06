import React, { useState } from "react";
import { format } from "date-fns";
import history from "../modules/history";
import { fbPositionsDB } from "../firebase/firebase.config";
import tmplPosition from "../constants/positionInfo";
import NavBar from "../NavBar";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import CandidateDropdown from "../CandidateComponents/CandidateDropdown";
import { Form, Container, Segment, Button, Dropdown, Header, Message } from "semantic-ui-react";

export default function AddPositionForm() {
    const [positioninfo, setPositioninfo] = useState({ ...tmplPosition });
    const [formError, setformError] = useState(false);

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
        const tmpPosition = { ...positioninfo };
        tmpPosition[name] = value;
        setPositioninfo(tmpPosition);
    };

    const AddNewPosition = () => {
        if (positioninfo.title && positioninfo.contract) {
            fbPositionsDB.push(positioninfo).then(() => {
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
                                <Form.Input name="title" type="text" required label="Title" onChange={HandleTextInput} value={positioninfo.title} />
                                <Form.Input name="level" type="text" label="Level" onChange={HandleTextInput} value={positioninfo.level} />
                                <Form.Input name="location" type="text" label="Location" onChange={HandleTextInput} value={positioninfo.location} />
                            </Form.Group>
                            <Form.Group unstackable widths={2}>
                                <Form.Input name="skill_summary" type="text" label="Skill Summary" onChange={HandleTextInput} value={positioninfo.skill_summary} />
                            </Form.Group>
                            <Form.TextArea name="description" label="Description" onChange={HandleTextInput} value={positioninfo.description} />
                        </Segment>
                        <Segment>
                            <Header>Contract Information</Header>
                            <Form.Group unstackable widths={8}>
                                <Form.Input name="position_id" type="text" label="Position ID" placeholder="Position ID" onChange={HandleTextInput} value={positioninfo.position_id} />
                                <div className="field">
                                    <label>Contract</label>
                                    <ContractDropdown required selection onChange={HandleContractInput} value={positioninfo.contract} />
                                </div>
                            </Form.Group>
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
