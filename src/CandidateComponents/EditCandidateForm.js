import React from "react";
import history from "../modules/history";
import classnames from "classnames";
import { sentence } from "to-case";

import NavBar from "../NavBar";
import LOIStatusDropdown from "../CandidateComponents/LOIStatusDropdown";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import ManagerDropdown from "../CandidateComponents/ManagerDropdown";
import Files from "../CandidateComponents/Files";
import firebase, { fbCandidatesDB, fbStorage, fbFlagNotes } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";

import { Form, Container, Segment, Button, Message, Header, Menu, Icon, Checkbox } from "semantic-ui-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default class EditCandidateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: Object.assign({}, tmplCandidate),
            key: null,
            files: "",
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
        this.ToggleArchive = this.ToggleArchive.bind(this);
        this.HandleFileUpload = this.HandleFileUpload.bind(this);
        this.ValidateAndSubmit = this.ValidateAndSubmit.bind(this);
        this.HandleDelete = this.HandleDelete.bind(this);
        this.updateSelectedCandidate = this.updateSelectedCandidate.bind(this);
    }

    componentDidMount() {
        const candidateID = this.props.match.params.id;

        fbCandidatesDB.child(candidateID).on("value", data => {
            if (data.val()) {
                this.setState({ candidate: Object.assign({}, tmplCandidate, data.val(), { modified_fields: [] }), key: data.key });
            } else {
                history.replace("/candidates");
            }
        });
    }

    componentWillUnmount() {
        const candidateID = this.props.match.params.id;
        fbCandidatesDB.child(candidateID).off("value");
    }

    updateSelectedCandidate(name, value) {
        this.setState(prevState => {
            let candidateinfo = prevState.candidate; //get candidate info
            candidateinfo[name] = value; //update with onChange info

            if (!candidateinfo["modified_fields"].includes(name)) candidateinfo["modified_fields"].push(name);

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
        if (value === "notsent") this.updateSelectedCandidate("status", "interviewed"); //if LOI was not sent, update status to interviewed
        if (value === "sent") this.updateSelectedCandidate("status", "recruiting"); //if LOI was sent, update status to recruiting
        if (value === "accepted") this.updateSelectedCandidate("status", "active"); //if LOI was accepted, update status to active
    }

    HandleManagerDropdown(name, value) {
        this.updateSelectedCandidate(name, value);
    }

    //callback for interview date.
    handleInterviewDateChange(date) {
        //date is null if input is cleared
        if (date) {
            date = date.toJSON();
        }
        this.updateSelectedCandidate("interview_date", date);
        if (this.state.candidate.status === "initial" && date) {
            this.updateSelectedCandidate("status", "interviewed"); //if interview took place, set status to interviewed
        }
        if (date === null) {
            this.updateSelectedCandidate("status", "initial"); //if no interview date has been entered, set status to initial
        }
    }

    //callback for LOI date.
    handleLOIDateChange(date) {
        if (date) {
            date = date.toJSON();
        }
        this.updateSelectedCandidate("loi_sent_date", date);
    }

    HandleFileUpload(ev) {
        //add files to state for later uploading
        const files = ev.target.files;
        const { filenames } = this.state.candidate;

        this.setState({
            files
        });

        //add filenames to candidate info for later retrieving
        let newfilenames = [];
        for (var i = 0; i < files.length; i++) {
            newfilenames.push(files[i].name);
        }
        this.updateSelectedCandidate("filenames", [...newfilenames, ...filenames]);
    }

    //callback for Delete button. needed this for confirmation prompt
    HandleDelete() {
        const key = this.props.match.params.id;
        const candidate = this.state.candidate;
        const confirmationMsg = "Are you sure you want to delete " + candidate.firstname + " " + candidate.lastname + "?";
        const deleteConfirmed = window.confirm(confirmationMsg);

        if (deleteConfirmed) {
            this.DeleteCandidate(key, candidate.filenames);
        }
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

    //callback function when form editing is done.
    updateDB() {
        const { candidate, key, files } = this.state;
        const { currentuser } = this.props;
        const now = new Date();

        candidate["modified_by"] = currentuser.displayName;
        candidate["modified_date"] = now.toJSON();

        fbCandidatesDB
            .child(key)
            .update(candidate)
            .then(() => {
                const uploadedFiles = [];
                for (var i = 0; i < files.length; i++) {
                    let file = files[i];
                    const fileRef = fbStorage.child(key + "/" + file.name);
                    uploadedFiles.push(fileRef.put(file, { contentType: file.type })); //add file upload promise to array, so that we can use promise.all() for one returned promise
                }
                Promise.all(uploadedFiles)
                    // .then(() => {
                    //     newEvents.forEach(newEvent => {
                    //         fbAuditTrailDB.push(newEvent);
                    //     });
                    // })
                    .then(() => {
                        history.push("/candidates/" + key); //wait until all files have been uploaded, then go to profile page.
                    });
            })
            .catch(err => console.error("EditCandidate, line 167: ", err));
    }

    //callback for checkbox for setting candidate to archive
    ToggleArchive(ev, data) {
        const { candidate, key } = this.state;
        
        candidate.archived = data.checked ? "archived" : "current";
        fbCandidatesDB
            .child(key)
            .update(candidate)
            .catch(err => console.error("EditCandidate, line 250: ", err));
    }

    //callback function when delete candidate button is click in form.
    DeleteCandidate(key, filenames) {
        const { candidate } = this.state;

        const positionDBUpdate = {};
        Object.keys(candidate.submitted_positions).forEach(pkey => {
            positionDBUpdate[`/positions/${pkey}/candidates_submitted/${key}`] = null; //firebase object to remove candidate from position when deleted.
        });
        fbCandidatesDB
            .child(key)
            .remove()
            .then(() => {
                filenames.forEach(filename => {
                    fbStorage
                        .child(key + "/" + filename)
                        .delete()
                        .catch(function(error) {
                            console.error("Error deleting files:", error);
                        });
                });
            })
            .then(()=>{
                fbFlagNotes.child(key).remove();
            })
            .then(() => {
                //prettier-ignore
                firebase.database().ref().update(positionDBUpdate) //prettier-ignore
            })
            .catch(function(error) {
                console.error("Error deleting candidate:", error);
            });
    }

    render() {
        const { candidate } = this.state;
        const interview_date = candidate.interview_date ? new Date(candidate.interview_date) : null;
        const loi_sent_date = candidate.loi_sent_date ? new Date(candidate.loi_sent_date) : null;
        const salary = candidate.salary !== "" ? atob(candidate.salary) : "";
        const archiveLabel = candidate.archived === "archived" ? "Unarchive Candidate" : "Archive Candidate";

        return (
            <>
                <NavBar active="candidates" />
                {candidate && (
                    <Container>
                        <Menu fluid attached="top" size="huge" borderless className={classnames("no-print", `status-${candidate.status}`)}>
                            <Menu.Item>
                                <Header>
                                    {candidate.firstname} {candidate.lastname} ({sentence(candidate.status)})
                                </Header>
                            </Menu.Item>
                            <Menu.Menu position="right">
                                <Menu.Item>
                                    <Checkbox toggle label={archiveLabel} checked={candidate.archived === "archived" ? true : false} onChange={this.ToggleArchive} />
                                </Menu.Item>
                                <Menu.Item title="Close" onClick={() => history.goBack()}>
                                    <Icon name="cancel" />
                                </Menu.Item>
                            </Menu.Menu>
                        </Menu>
                        <Segment attached>
                            <Form action="#">
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
                                        <Form.Input inline type="text" name="skill" label="Skill / Role:" onChange={this.HandleTextInput} value={candidate.skill} /> <Form.Input type="text" name="current_company" label="with current company" onChange={this.HandleTextInput} value={candidate.current_company} />
                                    </Form.Group>
                                    <Form.Input inline type="text" name="level" label="Level:" onChange={this.HandleTextInput} value={candidate.level} />
                                    <Form.Input inline type="text" name="current_contract" label="Current contract:" onChange={this.HandleTextInput} value={candidate.current_contract} />
                                    <Form.Group inline>
                                        <label>Potential contracts: </label>
                                        <ContractDropdown multiple selection value={candidate.potential_contracts} onChange={this.HandlePContractInput} />
                                    </Form.Group>
                                    <Form.Group inline>
                                        <label>Interview date / Interviewers: </label>
                                        <Form.Field>
                                            <DatePicker name="interview_date" dateFormat="MMM d, yyyy" maxDate={new Date()} placeholderText="Click to select a date" selected={interview_date} onChange={this.handleInterviewDateChange} />
                                        </Form.Field>
                                        <Form.Field>
                                            <ManagerDropdown name="interviewed_by" multiple={true} placeholder="Interviewed by" value={candidate.interviewed_by} onChange={this.HandleManagerDropdown} />
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group inline className={classnames({ "form-hidden": ["initial"].includes(candidate.status) })}>
                                        <label>LOI Status / Sent by:</label>
                                        <LOIStatusDropdown name="loi_status" value={candidate.loi_status} onChange={this.HandleLOIStatusChange} />
                                        {/* <ManagerDropdown name="loi_sent_by" multiple={false} placeholder="Who sent LOI?" value={candidate.loi_sent_by} disabled={candidate.loi_status === "notsent"} onChange={this.HandleManagerDropdown} /> */}
                                        <DatePicker name="loi_sent_date" dateFormat="MMM d, yyyy" placeholderText="Date LOI Sent" maxDate={new Date()} selected={loi_sent_date} disabled={candidate.loi_status === "notsent"} onChange={this.handleLOIDateChange} />
                                    </Form.Group>
                                    <Form.Input inline name="salary" type="text" icon="dollar" iconPosition="left" label="Salary Requirement" onChange={this.HandleSalaryInput} value={salary} />
                                </Segment>
                                <Header>Documents</Header>
                                <Segment>
                                    <Form.Group inline>
                                        <label>Add document:</label>
                                        <Form.Input name="doc_filename" type="file" multiple onChange={this.HandleFileUpload} />
                                    </Form.Group>
                                    <Files deletable candidateID={this.props.match.params.id} filenames={candidate.filenames} />
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
                            <Button type="submit" icon="save" positive content="Update" onClick={this.ValidateAndSubmit} />
                            <Button type="submit" icon="trash" negative content="Delete" onClick={this.HandleDelete} />
                        </Segment>
                    </Container>
                )}
            </>
        );
    }
}
