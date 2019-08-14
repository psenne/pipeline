import React, { Component } from "react";
import { Modal, Header, Icon, Button, Form } from "semantic-ui-react";
import { fbFlagNotes, fbAuditTrailDB, fbCandidatesDB } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import tmplFlagNote from "../constants/flagnote";

export default class FlagMessagePopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: "",
            actioned_to: "",
            flaginfo: { ...tmplFlagNote },
            candidateinfo: { ...tmplCandidate },
            auditinfo: "",
            iseditingnote: false
        };

        // this.props = {
        //     currentuser
        //     flagkey
        // }
    }

    componentDidMount() {
        const { flagkey } = this.props;
        fbCandidatesDB.child(flagkey).on("value", data => {
            this.setState({
                candidateinfo: { ...tmplCandidate, ...data.val() } //replace template with firebase data
            });
        });

        fbFlagNotes.child(flagkey).on("value", data => {
            if (data.val()) {
                this.setState({
                    flaginfo: data.val(),
                    text: data.val().flag_note,
                    actioned_to: data.val().actioned_to
                });
            }
        });
    }

    componentWillUnmount() {
        fbFlagNotes.off("value");
        fbCandidatesDB.off("value");
    }

    updateText = ev => {
        this.setState({
            text: ev.currentTarget.value,
            iseditingnote: true
        });
    };

    updateAction = ev => {
        this.setState({
            actioned_to: ev.currentTarget.value,
            iseditingnote: true
        });
    };

    addFlagMessage(ev, flag_note, currentuser) {
        ev.stopPropagation();
        const { candidateinfo, actioned_to } = this.state;
        const { flagkey } = this.props;
        const flag_history = candidateinfo.isFlagged
            ? [
                  {
                      actioned_to: candidateinfo.actioned_to,
                      flag_note: candidateinfo.flag_note,
                      flagged_by: candidateinfo.flagged_by,
                      flagged_on: candidateinfo.flagged_on
                  },
                  ...candidateinfo.flag_history
              ]
            : candidateinfo.flag_history; //only add new historical flag if candidate is currently flagged, otherwise it adds a blank flag
        const candidate_name = candidateinfo.firstname + " " + candidateinfo.lastname;
        const now = new Date();
        let flag = {};
        let candidateflag = {};
        let newEvent = {};

        if (flag_note) {
            flag = {
                candidate_name,
                actioned_to,
                flag_note,
                flagged_by: currentuser.displayName,
                flagged_on: now.toJSON()
            };
            candidateflag = {
                isFlagged: true,
                actioned_to,
                flagged_by: currentuser.displayName,
                flag_note,
                flagged_on: now.toJSON(),
                flag_history
            };

            newEvent = {
                eventdate: now.toJSON(),
                eventinfo: `${currentuser.displayName} flagged candidate with note: ${flag_note}. Actioned to: ${actioned_to}`,
                candidatename: candidate_name
            };

            fbFlagNotes.child(flagkey).update(flag);
            fbAuditTrailDB.push(newEvent);
            fbCandidatesDB.child(flagkey).update(candidateflag);
        } else {
            candidateflag = {
                isFlagged: false,
                flagged_by: "",
                flag_note: "",
                flagged_on: "",
                actioned_to: "",
                flag_history
            };
            newEvent = {
                eventdate: now.toJSON(),
                eventinfo: `${currentuser.displayName} removed flag from candidate.`,
                candidatename: candidate_name
            };

            fbFlagNotes.child(flagkey).remove();
            fbAuditTrailDB.push(newEvent);
            fbCandidatesDB.child(flagkey).update(candidateflag);
        }
        this.props.handleClose();
    }

    AddNote = ev => {
        const { text } = this.state;
        const { currentuser } = this.props;
        this.addFlagMessage(ev, text, currentuser);
        this.setState({ text: "", iseditingnote: false });
    };

    RemoveNote = ev => {
        const { currentuser } = this.props;
        this.addFlagMessage(ev, "", currentuser);
        this.setState({ text: "", iseditingnote: false });
    };

    render() {
        const { text, actioned_to, candidateinfo, iseditingnote } = this.state;
        let button;
        if (candidateinfo.isFlagged) {
            if (iseditingnote) {
                button = (
                    <Button color="green" onClick={this.AddNote}>
                        <Icon name="edit" /> Edit Note
                    </Button>
                );
            } else {
                button = (
                    <Button color="red" onClick={this.RemoveNote}>
                        <Icon name="delete" /> Remove Note
                    </Button>
                );
            }
        } else {
            button = (
                <Button color="green" onClick={this.AddNote}>
                    <Icon name="checkmark" /> Add Note
                </Button>
            );
        }

        return (
            <Modal dimmer="blurring" trigger={this.props.children} open={this.props.open} onClick={ev => ev.stopPropagation()} onClose={this.props.handleClose} size="small">
                <Header icon="flag" color="red" content={`Add follow up note for ${candidateinfo.firstname} ${candidateinfo.lastname}.`} />
                <Modal.Content>
                    <Form>
                        <Form.Input type="text" label="Action for:" fluid value={actioned_to} onChange={this.updateAction} />
                        <Form.TextArea label="Note:" value={text} onChange={this.updateText} />
                    </Form>
                </Modal.Content>
                <Modal.Actions>{button}</Modal.Actions>
            </Modal>
        );
    }
}
