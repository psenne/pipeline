import React from "react";
import history from "../modules/history";
import { fbFlagNotes, fbCandidatesDB, fbAuditTrailDB } from "../firebase/firebase.config";
import { format } from "date-fns";

import classnames from "classnames";
import FlagMessage from "./FlagMessage";
import UserContext from "../contexts/UserContext";
import { Icon, Menu } from "semantic-ui-react";

export default class MiniToolbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            flagOpen: false
        };

        this.ShowMenu = this.ShowMenu.bind(this);
        this.HideMenu = this.HideMenu.bind(this);
        this.addFlagMessage = this.addFlagMessage.bind(this);
        this.openFlagMessage = this.openFlagMessage.bind(this);
        this.closeFlagMessage = this.closeFlagMessage.bind(this);
    }

    openFlagMessage(ev) {
        ev.stopPropagation();
        this.setState({
            flagOpen: true
        });
    }

    closeFlagMessage() {
        this.setState({
            flagOpen: false
        });
    }

    addFlagMessage(ev, flag_note, currentuser) {
        ev.stopPropagation();
        const { item } = this.props;
        const key = item.key;
        const candidate_name = item.info.firstname + " " + item.info.lastname;
        const now = new Date();
        let flag = {};
        let candidateflag = {};
        let newEvent = {};

        if (flag_note) {
            flag = {
                candidate_name,
                flag_note,
                flagged_by: currentuser.displayName,
                flagged_on: now.toJSON()
            };
            candidateflag = {
                isFlagged: true,
                flagged_by: currentuser.displayName,
                flag_note,
                flagged_on: now.toJSON(),
                modified_date: now.toJSON(),
                modified_by: currentuser.displayName,
                modified_fields: ["flag_note"]
            };
            newEvent = {
                eventdate: now.toJSON(),
                username: currentuser.displayName,
                eventinfo: `${currentuser.displayName} flagged candidate with note: ${flag_note}`,
                candidatename: candidate_name
            };

            fbFlagNotes.child(key).update(flag);
            fbAuditTrailDB.push(newEvent);
            fbCandidatesDB.child(key).update(candidateflag);
        } else {
            candidateflag = {
                isFlagged: false,
                flagged_by: "",
                flag_note: "",
                flagged_on: "",
                modified_date: now.toJSON(),
                modified_by: currentuser.displayName,
                modified_fields: ["flag"]
            };
            newEvent = {
                eventdate: now.toJSON(),
                username: currentuser.displayName,
                eventinfo: `${currentuser.displayName} removed flag from candidate.`,
                candidatename: candidate_name
            };

            fbFlagNotes.child(key).remove();
            fbAuditTrailDB.push(newEvent);
            fbCandidatesDB.child(key).update(candidateflag);
        }
        this.closeFlagMessage();
    }

    ShowMenu(ev) {
        ev.stopPropagation();
        setTimeout(() => {
            this.setState({
                visible: true
            });
        }, 100);
    }

    HideMenu(ev) {
        ev.stopPropagation();
        this.setState({
            visible: false
        });
    }

    render() {
        const { item } = this.props;
        const { flagOpen } = this.state;
        const flagDate = format(new Date(item.info.flagged_on), "M/D/YYYY");
        const flagNote = `${item.info.flagged_by} (${flagDate}): ${item.info.flag_note}`;
        const title = item.info.flag_note ? flagNote : "Add follow up note";
        const setArchiveStatusText = item.info.archived === "archived" ? "Unarchive" : "Archive";
        return (
            <div className="set-flag" onMouseEnter={this.ShowMenu} onMouseLeave={this.HideMenu}>
                <Menu icon borderless className={classnames({ "minitoolbar-switch-flagged": item.info.isFlagged }, "minitoolbar-switch")}>
                    <Menu.Item>
                        <Icon name="flag" />
                    </Menu.Item>
                </Menu>
                <Menu icon className={classnames({ "minitoolbar-hidden": !this.state.visible }, "minitoolbar-inline")}>
                    <UserContext.Consumer>
                        {currentuser => (
                            <FlagMessage open={flagOpen} currentuser={currentuser} handleClose={this.closeFlagMessage} AddNote={this.addFlagMessage} candidate={item}>
                                <Menu.Item name="flag" className="minitoolbar-flag" title={title} onClick={this.openFlagMessage}>
                                    <Icon link name="flag" />
                                </Menu.Item>
                            </FlagMessage>
                        )}
                    </UserContext.Consumer>
                    <Menu.Item
                        name="edit"
                        title="Edit candidate"
                        className="minitoolbar-edit"
                        onClick={ev => {
                            ev.stopPropagation();
                            history.push(`/candidates/${item.key}/edit`);
                        }}>
                        <Icon link name="edit" />
                    </Menu.Item>
                    <Menu.Item name="archive" className="minitoolbar-archive" title={`${setArchiveStatusText} candidate`} onClick={this.props.ArchiveCandidate}>
                        <Icon link name="archive" />
                    </Menu.Item>
                </Menu>
            </div>
        );
    }
}
