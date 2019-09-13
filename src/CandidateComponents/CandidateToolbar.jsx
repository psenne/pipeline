import React, { Component } from "react";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { Link } from "react-router-dom";
import { Dropdown, Input, Icon, Menu } from "semantic-ui-react";
import StatusDropdown from "./StatusDropdown";
import ExportToExcel from "../modules/ExportToExcel";

// populates the dropdown options for filtering by current or archived candidates in the table
// prettier-ignore
const filterOptions = [
    { key: "current", text: "View Current", value: "current" }, 
    { key: "archived", text: "View Archived", value: "archived" }
];

class CandidateToolbar extends Component {
    static contextType = CandidateSearchContext;

    ClearFilters = () => {
        const { setsearchterm, setarchived, setstatus } = this.context;
        setarchived("current");
        setsearchterm("");
        setstatus("");
    };

    render() {
        const { candidates } = this.props;
        const { searchterm, setsearchterm, archived, setarchived, setstatus } = this.context;

        return (
            <Menu className="no-print">
                <Menu.Item title="Add new candidate" link>
                    <Link to="/candidates/add">
                        <Icon name="plus" />
                    </Link>
                </Menu.Item>
                <Menu.Item>
                    <StatusDropdown text="Filter by Status" onChange={(ev, data) => setstatus(data.value)} />
                </Menu.Item>
                <Menu.Item>
                    <Dropdown options={filterOptions} value={archived} onChange={(ev, data) => setarchived(data.value)} />
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item>
                        <Input placeholder="Search" value={searchterm} onChange={(ev, data) => setsearchterm(data.value)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Icon.Group onClick={this.ClearFilters} title="Clear filters">
                            <Icon name="filter" size="large" link />
                            <Icon name="dont" size="large" color="red" link />
                        </Icon.Group>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name="external" link onClick={() => ExportToExcel(candidates)} title="Export to Excel" />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        );
    }
}

export default CandidateToolbar;
