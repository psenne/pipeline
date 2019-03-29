import React, { Component } from "react";
import { Modal, Header, Icon, Button, Form, TextArea } from "semantic-ui-react";

export default class FlagMessage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.candidate.info.flag_note
        };
    }

    updateText = ev => {
        this.setState({
            text: ev.currentTarget.value
        });
    };

    AddNote = ev => {
        const { text } = this.state;
        const { currentuser } = this.props;
        this.props.AddNote(ev, text, currentuser);
        this.setState({ text: "" });
    };

    RemoveNote = ev => {
        const { currentuser } = this.props;
        this.props.AddNote(ev, "", currentuser);
        this.setState({ text: "" });
    };

    render() {
        const { candidate } = this.props;
        const { text } = this.state;

        let button;
        if (candidate.info.isFlagged) {
            button = (
                <Button color="red" onClick={this.RemoveNote}>
                    <Icon name="delete" /> Remove Note
                </Button>
            );
        } else {
            button = (
                <Button color="green" onClick={this.AddNote}>
                    <Icon name="checkmark" /> Add Note
                </Button>
            );
        }

        return (
            <Modal trigger={this.props.children} open={this.props.open} onClick={ev => ev.stopPropagation()} onClose={this.props.handleClose} size="small">
                <Header icon="flag" color="red" content={`Add follow up note for ${candidate.info.firstname} ${candidate.info.lastname}.`} />
                <Modal.Content>
                    <Form>
                        <TextArea value={text} onChange={this.updateText} />
                    </Form>
                </Modal.Content>
                <Modal.Actions>{button}</Modal.Actions>
            </Modal>
        );
    }
}
