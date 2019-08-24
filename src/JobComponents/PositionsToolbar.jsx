import React from "react";
import { Link } from "react-router-dom";
import { Input, Icon, Menu, Dropdown } from "semantic-ui-react";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import ExportToExcel from "../modules/ExportToExcel";
import classnames from "classnames";

export default ({ positions, searchPositions, HandleContractChange, selectedContract }) => {
    return (
        <Menu className="no-print">
            <Menu.Item title="Add new position" link>
                <Link to="/positions/add">
                    <Icon name="plus" />
                </Link>
            </Menu.Item>
            <Menu.Item>
                <label className={classnames({"form-hidden":selectedContract})}>Filter by Contract</label>
                <ContractDropdown clearable value={selectedContract} onChange={HandleContractChange} />
            </Menu.Item>
            <Menu.Menu position="right">
                <Menu.Item>
                    <Input placeholder="Search" onChange={searchPositions} />
                </Menu.Item>
                <Menu.Item>
                    <Icon name="external" link onClick={() => ExportToExcel(positions)} title="Export to Excel" content="Export to Excel" />
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    );
};
