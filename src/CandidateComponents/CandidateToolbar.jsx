import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Input, Icon, Menu } from "semantic-ui-react";
import StatusDropdown from "./StatusDropdown";
import ManagerDropdown from "./ManagerDropdown";
import ExportToExcel from "../modules/ExportToExcel";

// populates the dropdown options for filtering by current or archived candidates in the table
// prettier-ignore
const filterOptions = [
    { key: "current", text: "View Current", value: "current" }, 
    { key: "archived", text: "View Archived", value: "archived" }
];

class CandidateToolbar extends Component {
    render() {
        const { candidates, viewArchived, searchTerm, searchCandidates, filterByArchived, filterByStatus } = this.props;
        return (
            <Menu attached="top" className="no-print">
                <Menu.Item title="Add new candidate" link>
                    <Link to="/candidates/add">
                        <Icon name="plus" />
                    </Link>
                </Menu.Item>
                <Menu.Item>
                    <StatusDropdown text="Filter by Status" onChange={filterByStatus} />
                </Menu.Item>
                <Menu.Item>
                    <Dropdown options={filterOptions} value={viewArchived} onChange={filterByArchived} />
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item>
                        <Input placeholder="Search" value={searchTerm} onChange={searchCandidates} />
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name="external" link onClick={() => ExportToExcel(candidates)} title="Export to Excel" content="Export to Excel" />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        );
    }
}

export default CandidateToolbar;
