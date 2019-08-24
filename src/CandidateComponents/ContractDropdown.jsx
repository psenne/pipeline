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

    componentWillUnmount() {
        fbContractsDB.off("value");
    }

    onChange = (ev, selection) => {
        this.props.onChange(selection.value);
    }

    render() {
        const { text, value, multiple=false, clearable=false, selection=false, required=false } = this.props;
        const { contracts, selectedContract } = this.state;
        const contractList = contracts.map(({ key, info: contract }) => {
            return { key: key, text: contract.name, value: contract.name };
        });
        return <Dropdown text={text} value={value} required={required} clearable={clearable} multiple={multiple} selection={selection} options={contractList} onChange={this.onChange} />;
    }
}
