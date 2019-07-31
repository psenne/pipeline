import React, { useState, useContext } from "react";
import { Icon, Message } from "semantic-ui-react";
import { format } from "date-fns";
import FlagMessagePopup from "./FlagMessagePopup";
import UserContext from "../contexts/UserContext";

export default function FlagMessage({ onDismiss, candidate }) {
    const action = candidate.actioned_to ? <Message.Header>Actioned to: {candidate.actioned_to}</Message.Header> : "";
    const [flagOpen, setFlagOpen] = useState(false);
    const currentuser = useContext(UserContext);

    const openFlagMessage = () => {
        setFlagOpen(true);
    };

    const closeFlagMessage = () => {
        setFlagOpen(false);
    };
    
    return (
        <div style={{width: "100%", cursor: "pointer"}} title="Edit flag">
            <FlagMessagePopup open={flagOpen} flagkey={candidate.id} currentuser={currentuser} handleClose={closeFlagMessage}>
                <Message icon onClick={openFlagMessage} onDismiss={onDismiss}>
                    <Icon name="flag" color="red" />
                    <Message.Content>
                        {action}
                        <div>{candidate.flag_note}</div>
                        <div style={{ color: "#808080" }}>
                            Added by {candidate.flagged_by} on {format(candidate.flagged_on, "MMM DD, YYYY")}
                        </div>
                    </Message.Content>
                </Message>
            </FlagMessagePopup>
        </div>
    );
}
