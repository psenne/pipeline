import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbContractsDB } from "../firebase/firebase.config";

// returns an array of contract names:
// [hawkeye, meritage, R2]

export default class ContractDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = { contracts: [] };
    }

    componentDidMount() {
        fbContractsDB.on("value", data => {
            let contracts = [];
            data.forEach(function(contract) {
                contracts.push({ key: contract.key, info: contract.val() });
            });
            this.setState({
                contracts
            });
        });
    }

    render() {
        const { text, onChange, value } = this.props;
        const { contracts } = this.state;
        const contractList = contracts.map(({ key, info: contract }) => {
            return { key: key, text: contract.name, value: contract.name };
        });
        return <Dropdown text={text} value={value} multiple selection options={contractList} onChange={(ev, selection) => onChange(selection.value)} />;
    }
}
