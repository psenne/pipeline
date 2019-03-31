import React from "react";
import { fbCandidatesDB, fbAuditTrailDB, fbFlagNotes } from "../firebase/firebase.config";
import history from "../modules/history";
import { format } from "date-fns";
import classnames from "classnames";
import FlagMessagePopup from "./FlagMessagePopup";
import UserContext from "../contexts/UserContext";
import { Icon, Menu } from "semantic-ui-react";

export default class MiniToolbar extends React.Component {
    constructor(props) {
        super(props);

        // this.props = {
        //     item, currentuser
        // }

        this.state = {
            visible: false,
            flagOpen: false
        };

        this.ShowMenu = this.ShowMenu.bind(this);
        this.HideMenu = this.HideMenu.bind(this);
        this.openFlagMessage = this.openFlagMessage.bind(this);
        this.closeFlagMessage = this.closeFlagMessage.bind(this);
        this.ArchiveCandidate = this.ArchiveCandidate.bind(this);
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

    ArchiveCandidate(ev) {
        ev.stopPropagation();
        
        const { currentuser, item } = this.props;
        const key = item.key;
        const candidate = item.info;
        const now = new Date();
        const status = candidate.archived === "archived" ? "current" : "archived"; // set button text and actions for archive candidate button


        let eventinfo = "";
        eventinfo = `${currentuser.displayName} set candidate to ${status}.`;

        const newEvent = {
            eventdate: now.toJSON(),
            eventinfo: eventinfo,
            candidatename: `${candidate.firstname} ${candidate.lastname}`
        };

        let updatedinfo;
        if (candidate.archived === "current") {
            //remove flag if setting canddiate to archived. Otherwise there's no way to filter the FlaggedCandidates cpnt.
            updatedinfo = {
                archived: "archived",
                isFlagged: false,
                flagged_by: "",
                flag_note: "",
                flagged_on: "",
                actioned_to: ""
            };
            fbFlagNotes.child(key).remove();
        } else {
            updatedinfo = {
                archived: "current"
            };
        }

        fbCandidatesDB
            .child(key)
            .update(updatedinfo)
            .then(() => {
                fbAuditTrailDB.push(newEvent);
            })
            .catch(err => console.error("CandidatesPage, line 102: ", err));
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
                            <FlagMessagePopup open={flagOpen} flagkey={item.key} currentuser={currentuser} handleClose={this.closeFlagMessage}>
                                <Menu.Item name="flag" className="minitoolbar-flag" title={title} onClick={this.openFlagMessage}>
                                    <Icon link name="flag" />
                                </Menu.Item>
                            </FlagMessagePopup>
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
                    <Menu.Item name="archive" className="minitoolbar-archive" title={`${setArchiveStatusText} candidate`} onClick={this.ArchiveCandidate}>
                        <Icon link name="archive" />
                    </Menu.Item>
                </Menu>
            </div>
        );
    }
}
