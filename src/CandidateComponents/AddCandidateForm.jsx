import React from "react";
import history from "../modules/history";
import { fbCandidatesDB, fbStorage } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import NavBar from "../NavBar";
import ContractDropdown from "./ContractDropdown";
import { Form, Container, Segment, Button, Message, Header } from "semantic-ui-react";

class CandidateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: { ...tmplCandidate },
            formError: false
        };

        this.handleInterviewDateChange = this.handleInterviewDateChange.bind(this);
        this.handleLOIDateChange = this.handleLOIDateChange.bind(this);
        this.HandleTextInput = this.HandleTextInput.bind(this);
        this.HandleTextInputUpper = this.HandleTextInputUpper.bind(this);
        this.HandleSalaryInput = this.HandleSalaryInput.bind(this);
        this.HandlePContractInput = this.HandlePContractInput.bind(this);
        this.HandleManagerDropdown = this.HandleManagerDropdown.bind(this);
        this.HandleLOIStatusChange = this.HandleLOIStatusChange.bind(this);
        this.HandleCheckbox = this.HandleCheckbox.bind(this);
        this.HandleFileUpload = this.HandleFileUpload.bind(this);
        this.ValidateAndSubmit = this.ValidateAndSubmit.bind(this);
        this.updateSelectedCandidate = this.updateSelectedCandidate.bind(this);
    }

    updateSelectedCandidate(name, value) {
        this.setState(prevState => {
            let candidateinfo = prevState.candidate; //get candidate info
            candidateinfo[name] = value; //update with onChange info
            return { candidate: candidateinfo };
        });
    }

    HandleTextInput(ev) {
        const name = ev.target.name;
        const value = ev.target.value;
        this.updateSelectedCandidate(name, value);
    }

    HandleTextInputUpper(ev) {
        const name = ev.target.name;
        const value = ev.target.value;

        this.updateSelectedCandidate(name, value.toUpperCase());
    }

    //callback for Salary field. This changes the value to base64, so non-authorized users can't read the data when getting value from firebase.
    HandleSalaryInput(ev) {
        const value = ev.target.value;
        this.updateSelectedCandidate("salary", btoa(value));
    }

    //generic callback for dropdowns
    HandlePContractInput(value) {
        this.updateSelectedCandidate("potential_contracts", value);
    }

    HandleLOIStatusChange(value) {
        this.updateSelectedCandidate("loi_status", value);
    }

    HandleManagerDropdown(name, value) {
        this.updateSelectedCandidate(name, value);
    }

    //callback for checkbox for setting candidate to archive
    HandleCheckbox(ev, data) {
        const name = data.name;
        const value = data.checked ? "archived" : "current";

        this.updateSelectedCandidate(name, value);
    }

    //callback for interview date.
    handleInterviewDateChange(date) {
        if (date) {
            date = date.toJSON();
        }
        this.updateSelectedCandidate("interview_date", date);
    }

    //callback for LOI date.
    handleLOIDateChange(date) {
        if (date) {
            date = date.toJSON();
        }
        this.updateSelectedCandidate("loi_sent_date", date);
    }

    HandleFileUpload(ev, f_input) {
        console.log(f_input);
    }

    //callback function when form editing is done.
    updateDB() {
        const { candidate } = this.state;
        //this.props.showLoader(true, "Processing data"); //trigger loading component from App. Because loading is done via App state, The next part needs to wait for App state to get update. Maybe add a While loop waiting for True to be returned

        fbCandidatesDB.push(candidate).then(newcandidate => {
            history.push("/candidates/" + newcandidate.key); //go to new candidate
        });
    }

    // only required fields are first and last name of candidate. If those aren't set return false and show error message
    ValidateAndSubmit() {
        this.setState(
            {
                formError: false
            },
            () => {
                const candidate = this.state.candidate;

                if (candidate.firstname.length > 0 && candidate.lastname.length > 0) {
                    this.updateDB();
                } else {
                    this.setState({
                        formError: true
                    });
                }
            }
        );
    }

    render() {
        const { candidate } = this.state;
        return (
            <>
                <NavBar active="candidates" />
                <Container>
                    <Segment>
                        <Form>
                            <Header>Personal Information</Header>
                            <Segment>
                                <Form.Input name="firstname" type="text" required placeholder="First name" onChange={this.HandleTextInput} value={candidate.firstname} />
                                <Form.Input name="lastname" type="text" required placeholder="Last name" onChange={this.HandleTextInput} value={candidate.lastname} />
                                <Form.Input name="emailaddress" type="email" label="Email Address:" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.HandleTextInput} value={candidate.emailaddress} />
                                <Form.Input name="telephone" type="tel" label="Phone Number:" icon="phone" iconPosition="left" placeholder="XXX-XXX-XXXX" onChange={this.HandleTextInput} value={candidate.telephone} />
                                <Form.Input name="prefered_location" type="text" label="Prefered work location:" icon="globe" iconPosition="left" placeholder="City / State" onChange={this.HandleTextInput} value={candidate.prefered_location} />
                            </Segment>

                            <Header>Hiring Information</Header>
                            <Segment>
                                <Form.Group inline>
                                    <Form.Input inline type="text" name="skill" label="Skill / Role:" onChange={this.HandleTextInput} value={candidate.skill} /> <Form.Input inline type="text" name="current_company" label="with current company" onChange={this.HandleTextInput} value={candidate.current_company} />
                                </Form.Group>
                                <Form.Input inline type="text" name="level" label="Level:" onChange={this.HandleTextInput} value={candidate.level} />
                                <Form.Input inline type="text" name="current_contract" label="Current contract:" onChange={this.HandleTextInput} value={candidate.current_contract} />
                                <Form.Group inline>
                                    <label>Potential contracts: </label>
                                    <ContractDropdown onChange={this.HandlePContractInput} value={candidate.potential_contracts} />
                                </Form.Group>
                                <Form.Group inline>
                                    <label>Add document:</label>
                                    <Form.Input name="doc_filename" type="file" onChange={this.HandleFileUpload} />
                                </Form.Group>
                            </Segment>

                            <Header>Notes</Header>
                            <Segment>
                                <Form.TextArea name="notes" label="Notes" onChange={this.HandleTextInput} value={candidate.notes} />
                                <Form.TextArea name="next_steps" label="Next Steps" onChange={this.HandleTextInput} value={candidate.next_steps} />
                                <Form.Input name="found_by" type="text" label="Referred By" onChange={this.HandleTextInput} value={candidate.found_by} />
                            </Segment>
                        </Form>
                    </Segment>
                    <Segment>
                        {this.state.formError && <Message error floating compact icon="warning" header="Required fields missing" content="First and last names are both required." />}
                        <Button type="submit" icon="save" positive content="Add" onClick={this.ValidateAndSubmit} />
                    </Segment>
                </Container>
            </>
        );
    }
}

export default CandidateForm;
