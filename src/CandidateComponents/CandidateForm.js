import React from "react";
import { fbCandidatesDB } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import NavBar from "../NavBar";
import LOIStatusDropdown from "./LOIStatusDropdown";
import ContractDropdown from "./ContractDropdown";
import { Form, Icon, Segment, Button, Message, Header } from "semantic-ui-react";

import DatePicker from "react-datepicker";
import moment from "moment";

import "react-datepicker/dist/react-datepicker-cssmodules.css";

class CandidateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: { ...tmplCandidate },
            formError: false
        };
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
    HandleDropdownInput(ev, data) {
        const name = data.name;
        const value = data.value;

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

    //callback function when form editing is done.
    updateDB() {
        const { candidate } = this.state;

        this.props.showLoader(true, "Processing data"); //trigger loading component from App. Because loading is done via App state, The next part needs to wait for App state to get update. Maybe add a While loop waiting for True to be returned

        fbCandidatesDB.push(candidate).then(newcandidate => {
            console.log(newcandidate);
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
                }
                else {
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
        const interview_date = candidate.interview_date ? moment(candidate.interview_date) : "";
        const loi_sent_date = candidate.loi_sent_date ? moment(candidate.loi_sent_date) : "";
        const salary = candidate.salary ? atob(candidate.salary) : "";
        return (
            <div>
                <NavBar active="candidates" />
                <Segment>
                    <Form>
                        <Header>
                            <Icon name="dropdown" />
                            Personal Information
                        </Header>
                        <Segment>
                            <Form.Input name="firstname" type="text" required placeholder="First name" onChange={this.HandleTextInput} value={candidate.firstname} />
                            <Form.Input name="lastname" type="text" required placeholder="Last name" onChange={this.HandleTextInput} value={candidate.lastname} />
                            <Form.Input name="emailaddress" type="email" label="Email Address:" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.HandleTextInput} value={candidate.emailaddress} />
                            <Form.Input name="telephone" type="tel" label="Phone Number:" icon="phone" iconPosition="left" placeholder="XXX-XXX-XXXX" onChange={this.HandleTextInput} value={candidate.telephone} />
                        </Segment>

                        <Header>
                            <Icon name="dropdown" />
                            Hiring Information
                        </Header>
                        <Segment>
                            <Form.Field>
                                <label>Potential contracts: </label>
                                <ContractDropdown onChange={this.HandleDropdownInput} />
                            </Form.Field>
                            <Form.Input type="text" name="skill" label="Skill / Role:" onChange={this.HandleTextInput} value={candidate.skill} />
                            <Form.Input type="text" name="current_contract" label="Current contract:" onChange={this.HandleTextInput} value={candidate.current_contract} />
                            <Form.Input type="text" name="level" label="Level:" onChange={this.HandleTextInput} value={candidate.level} />
                            <Form.Field>
                                <label>Interview date / Interviewers: </label>
                                <DatePicker name="interview_date" dateFormat="MMM D, YYYY" maxDate={moment()} selected={interview_date} onChange={this.handleInterviewDateChange} />
                            </Form.Field>
                            <Form.Dropdown name="interviewed_by" multiple selection closeOnChange placeholder="Interviewed by" options={tmplManager} value={candidate.interviewed_by} onChange={this.HandleDropdownInput} />
                            <Form.Field>
                                <label>LOI Status / Sent by:</label>
                                <LOIStatusDropdown onChange={this.HandleDropdownInput} />
                                <Form.Select name="loi_sent_by" options={tmplManager} placeholder="Who sent LOI?" value={candidate.loi_sent_by} disabled={candidate.loi_status === "notsent"} onChange={this.HandleDropdownInput} />
                                <DatePicker name="loi_sent_date" dateFormat="MMM D, YYYY" placeholderText="Date LOI Sent" maxDate={moment()} selected={loi_sent_date} disabled={candidate.loi_status === "notsent"} onChange={this.handleLOIDateChange} />
                            </Form.Field>
                            <Form.Field>
                                <label>Resume:</label>
                                <Form.Input disabled name="resume_filename" type="file" />
                            </Form.Field>

                            <Form.Input name="salary" type="text" icon="dollar" iconPosition="left" label="Salary Requirement" onChange={this.HandleSalaryInput} value={salary} />
                        </Segment>

                        <Header>
                            <Icon name="dropdown" />
                            Notes
                        </Header>
                        <Segment>
                            <Form.TextArea name="notes" label="Notes" onChange={this.HandleTextInput} value={candidate.notes} />
                            <Form.TextArea name="next_steps" label="Next Steps" onChange={this.HandleTextInput} value={candidate.next_steps} />
                            <Form.Input name="found_by" type="text" label="Referred By" onChange={this.HandleTextInput} value={candidate.found_by} />
                        </Segment>
                    </Form>
                </Segment>
                <Segment>
                    <Button.Group fluid>
                        <Button type="submit" icon="save" positive content="Save" onClick={this.ValidateAndSubmit} />
                        <Button icon="trash" negative content="Delete" onClick={this.HandleDelete} />
                    </Button.Group>
                    {this.state.formError && <Message error floating compact icon="warning" header="Required fields missing" content="First and last names are both required." />}
                </Segment>
            </div>
        );
    }
}

export default CandidateForm;
