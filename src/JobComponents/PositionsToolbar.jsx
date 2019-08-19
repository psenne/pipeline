import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Input, Icon, Menu } from "semantic-ui-react";
import ExportToExcel from "../modules/ExportToExcel";

export default class PositionsToolbar extends Component {
    render() {
        const { positions, searchTerm, searchPositions } = this.props;
        return (
            <Menu className="no-print">
                <Menu.Item title="Add new position" link>
                    <Link to="/positions/add">
                        <Icon name="plus" />
                    </Link>
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item>
                        <Input placeholder="Search" value={searchTerm} onChange={searchPositions} />
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name="external" link onClick={() => ExportToExcel(positions)} title="Export to Excel" content="Export to Excel" />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        );
    }
}

