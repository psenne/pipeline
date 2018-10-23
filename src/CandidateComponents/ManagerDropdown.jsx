import React, { Component } from "react";
import { Select } from "semantic-ui-react";
import { fbUsersDB } from "../firebase/firebase.config";

// returns a string: "Not Sent"

export default class ManagerDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = { users: [] };
    }

    componentDidMount() {
        fbUsersDB.on("value", data => {
            let users = [];
            data.forEach(function(user) {
                users.push({ key: user.key, info: user.val() });
            });
            this.setState({
                users
            });
        });
    }

    render() {
        const { users } = this.state;
        const { name, placeholder, onChange } = this.props;
        return <Select name={name} multiple selection closeOnChange placeholder={placeholder} value={value} onChange={(ev, selection) => onChange(selection.value)} />;
    }
}
