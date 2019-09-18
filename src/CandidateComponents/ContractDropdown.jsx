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
        this.listener = fbContractsDB.on("value", data => {
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
        fbContractsDB.off("value", this.listener);
    }

    onChange = (ev, selection) => {
        this.props.onChange(selection.value);
    };

    render() {
        const { contracts, selectedContract } = this.state;
        const { onChange, ...rest } = this.props;
        const contractList = contracts.map(({ key, info: contract }) => {
            return { key: key, text: contract.name, value: contract.name };
        });
        return <Dropdown {...rest} selectOnBlur={false} options={contractList} onChange={this.onChange} />;
    }
}
