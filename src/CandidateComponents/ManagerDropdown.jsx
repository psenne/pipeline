import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbUsersDB } from "../firebase/firebase.config";

export default class ManagerDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            managers: []
        };
    }

    componentDidMount() {
        fbUsersDB.on("value", data => {
            let managers = [];
            data.forEach(function(manager) {
                const val = manager.val();
                managers.push({
                    key: manager.key,
                    text: val.name,
                    value: val.name
                });
            });

            this.setState({
                managers
            });
        });
    }

    render() {
        const { managers } = this.state;
        const { name, placeholder, multiple, value, onChange } = this.props;
        return <Dropdown name={name} multiple={multiple} options={managers} selection closeOnChange placeholder={placeholder} value={value} onChange={(ev, selection) => onChange(name, selection.value)} />;
    }
}
