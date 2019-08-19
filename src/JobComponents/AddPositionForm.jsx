import React, { useState } from "react";
import history from "../modules/history";
import { fbPositionsDB } from "../firebase/firebase.config";
import { tmplPosition } from "../constants/positionInfo";
import NavBar from "../NavBar";
import { Form, Container, Segment, Button, Message, Header } from "semantic-ui-react";

export default function AddPositionForm() {
    // const tmplPosition = {
    //     title: "test",
    //     description: "test",
    //     level: "",
    //     mandatory_certs: "",
    //     mandatory_skills: "",
    //     position_id: "",
    //     contract: "",
    //     pm: "",
    //     candidate_submitted: [],
    //     location: ""
    // };

    const [positioninfo, setPositioninfo] = useState(tmplPosition);

    const HandleTextInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        updatePositionInfo(name, value);
    };

    const updatePositionInfo = (name, value) => {
        const tmpPosition = { ...positioninfo };
        tmpPosition[name] = value;
        setPositioninfo(tmpPosition);
    };

    const AddNewPosition = () => {
        fbPositionsDB.push(positioninfo);
        history.push("/positions/");
    };

    return (
        <>
            <NavBar active="positions" />
            <Container>
                <Segment>
                    <Form>
                        <Segment>
                            <Header>Position Information</Header>
                            <Form.Input name="title" type="text" required label="Title" placeholder="Position title" onChange={HandleTextInput} value={positioninfo.title} />
                            <Form.TextArea name="description" label="Description" onChange={HandleTextInput} value={positioninfo.description}/>
                       </Segment>
                        <Segment>
                            <Header>Contract Information</Header>
                        </Segment>
                        <Segment>
                            <Button onClick={AddNewPosition}>Add New</Button>
                        </Segment>
                    </Form>
                </Segment>
            </Container>
        </>
    );
}
