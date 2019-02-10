import React from "react";
import history from "../modules/history";
import NavBar from "../NavBar";
import LOIStatusDropdown from "./LOIStatusDropdown";
import ContractDropdown from "./ContractDropdown";
import ManagerDropdown from "./ManagerDropdown";
import { Form, Container, Segment, Button, Message, Header } from "semantic-ui-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker-cssmodules.css";

import { fbCandidatesDB } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";

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
        this.ValidateAndSubmit = this.ValidateAndSubmit.bind(this);
        this.HandleDelete = this.HandleDelete.bind(this);
        this.HandleFileSelection = this.HandleFileSelection.bind(this);
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

    HandleFileSelection(ev, data) {
        console.log(ev, data);
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

    //callback function when form editing is done.
    updateDB() {
        const { candidate } = this.state;

        //this.props.showLoader(true, "Processing data"); //trigger loading component from App. Because loading is done via App state, The next part needs to wait for App state to get update. Maybe add a While loop waiting for True to be returned

        fbCandidatesDB.push(candidate).then(newcandidate => {
            history.push("/candidates/" + newcandidate.key);
            //go to new candidate
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

    //callback function when delete candidate button is click in form.
    DeleteCandidate(key) {
        fbCandidatesDB
            .child(key)
            .remove()
            .then(() => {
                this.props.resetForm();
            }) //reset sidebar and table
            .catch(function(error) {
                console.error(error);
            });
    }

    //callback for Delete button. needed this for confirmation prompt
    HandleDelete() {
        const key = this.props.ckey;
        const candidate = this.state.candidate;
        const confirmationMsg = "Are you sure you want to delete " + candidate.firstname + " " + candidate.lastname + "?";
        const deleteConfirmed = window.confirm(confirmationMsg);

        if (deleteConfirmed) {
            this.DeleteCandidate(key);
        }
    }

    render() {
        const { candidate } = this.state;
        const interview_date = candidate.interview_date ? new Date(candidate.interview_date) : null;
        const loi_sent_date = candidate.loi_sent_date ? new Date(candidate.loi_sent_date) : null;
        const salary = candidate.salary ? atob(candidate.salary) : "";
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
                            </Segment>

                            <Header>Hiring Information</Header>
                            <Segment>
                                <Form.Field>
                                    <label>Potential contracts: </label>
                                    <ContractDropdown onChange={this.HandlePContractInput} />
                                </Form.Field>
                                <Form.Input type="text" name="skill" label="Skill / Role:" onChange={this.HandleTextInput} value={candidate.skill} />
                                <Form.Input type="text" name="current_contract" label="Current contract:" onChange={this.HandleTextInput} value={candidate.current_contract} />
                                <Form.Input type="text" name="level" label="Level:" onChange={this.HandleTextInput} value={candidate.level} />
                                <Form.Group inline widths="equal">
                                    <Form.Field>
                                        <label>Interview date / Interviewers: </label>
                                        <DatePicker inline name="interview_date" dateFormat="MMM D, YYYY" maxDate={new Date()} placeholderText="Click to select a date" selected={interview_date} onChange={this.handleInterviewDateChange} />
                                        <ManagerDropdown name="interviewed_by" multiple={true} placeholder="Interviewed by" value={candidate.interviewed_by} onChange={this.HandleManagerDropdown} />
                                    </Form.Field>
                                </Form.Group>
                                <Form.Field>
                                    <label>LOI Status / Sent by:</label>
                                    <LOIStatusDropdown name="loi_status" value={candidate.loi_status} onChange={this.HandleLOIStatusChange} />
                                    <ManagerDropdown name="loi_sent_by" multiple={false} placeholder="Who sent LOI?" value={candidate.loi_sent_by} disabled={candidate.loi_status === "notsent"} onChange={this.HandleManagerDropdown} />
                                    <DatePicker name="loi_sent_date" dateFormat="MMM D, YYYY" placeholderText="Date LOI Sent" maxDate={new Date()} selected={loi_sent_date} disabled={candidate.loi_status === "notsent"} onChange={this.handleLOIDateChange} />
                                </Form.Field>
                                <Form.Field>
                                    <label>Resume:</label>
                                    <Form.Input name="resume_filename" type="file" onChange={this.HandleFileSelection} />
                                </Form.Field>

                                <Form.Input name="salary" type="text" icon="dollar" iconPosition="left" label="Salary Requirement" onChange={this.HandleSalaryInput} value={salary} />
                            </Segment>

                            <Header>Notes</Header>
                            <Segment>
                                <Form.TextArea name="notes" label="Notes" onChange={this.HandleTextInput} value={candidate.notes} />
                                <Form.TextArea name="next_steps" label="Next Steps" onChange={this.HandleTextInput} value={candidate.next_steps} />
                                <Input name="found_by" type="text" label="Referred By" onChange={this.HandleTextInput} value={candidate.found_by} />
                            </Segment>
                        </Form>
                    </Segment>
                    <Button type="submit" icon="save" positive content="Add" onClick={this.ValidateAndSubmit} />
                    {this.state.formError && <Message error floating compact icon="warning" header="Required fields missing" content="First and last names are both required." />}
                </Container>
            </>
        );
    }
}

export default CandidateForm;
