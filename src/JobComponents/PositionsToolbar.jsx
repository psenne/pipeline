import React from "react";
import { Link } from "react-router-dom";
import { Input, Icon, Menu } from "semantic-ui-react";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import ExportPositions from "../modules/ExportPositions";
import classnames from "classnames";

export default ({ positions, searchPositions, HandleContractChange, selectedContract, contracts }) => {
    return (
        <Menu className="no-print">
            <Menu.Item title="Add new position" link>
                <Link to="/positions/add">
                    <Icon name="plus" />
                </Link>
            </Menu.Item>
            <Menu.Item>
                <ContractDropdown text="Filter by Contract" clearable value={selectedContract} contractsoverride={contracts} onChange={HandleContractChange} />
            </Menu.Item>
            <Menu.Item className={classnames({ "form-hidden": !selectedContract })}>
                <label>{`Filtering for ${selectedContract}`}</label>
            </Menu.Item>
            <Menu.Menu position="right">
                <Menu.Item>
                    <Input placeholder="Search" onChange={searchPositions} />
                </Menu.Item>
                <Menu.Item>
                    <Icon
                        name="external"
                        link
                        onClick={() => {
                            ExportPositions(positions);
                        }}
                        title="Export to Excel"
                        content="Export to Excel"
                    />
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    );
};
