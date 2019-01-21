import React, { Component } from "react";
import history from "../modules/history";
import { Table, Icon, Menu } from "semantic-ui-react";
import classnames from "classnames";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function(item) {
        const contracts = item.info.potential_contracts ? item.info.potential_contracts.join(":").toLowerCase() : "";
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.info.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.lastname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.skill.toLowerCase().includes(searchTerm.toLowerCase()) || contracts.includes(searchTerm.toLowerCase()) || item.info.level.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

// filters candidates by status
function isFiltered(searchTerm) {
    return function(item) {
        return !searchTerm || item.info.status.toLowerCase() === searchTerm.toLowerCase();
    };
}

class CandidatesTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };
    }

    ViewCandidate(ev, key) {
        ev.stopPropagation();
        this.props.history.push({ pathname: `/candidates/${key}` });
    }

    ArchiveCandidate(ev, key, status) {
        ev.stopPropagation();
        this.props.ArchiveCandidate(key, status);
    }

    SetFlag(ev, candidatekey) {
        ev.stopPropagation();
        this.setState({
            visible: !this.state.visible
        });
    }

    render() {
        return (
            <Table attached className="hovered candidate-table" compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={1} textAlign="center">
                            <Icon name="edit" color="grey" />
                        </Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Skill</Table.HeaderCell>
                        <Table.HeaderCell>Potential Contracts</Table.HeaderCell>
                        <Table.HeaderCell>Level</Table.HeaderCell>
                        <Table.HeaderCell>Current Contract</Table.HeaderCell>
                        <Table.HeaderCell>Notes</Table.HeaderCell>
                        <Table.HeaderCell>Follow Up</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.props.list
                        .filter(isFiltered(this.props.filterByStatus))
                        .filter(isSearched(this.props.filterBySearch))
                        .map(item => {
                            const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
                            const viewingCurrent = this.props.filter === item.info.archived; //item.info.archived is either "current" or "archived"

                            // set button text and actions for archive candidate button
                            let toggleArchive = "archived";
                            let setArchiveStatusText = "Archive";
                            if (item.info.archived === "archived") {
                                toggleArchive = "current";
                                setArchiveStatusText = "Unarchive";
                            }
                            if (viewingCurrent) {
                                //show only those candidates whose info.archived matches with archived/current dropdown. could've used the filter property
                                return (
                                    <Table.Row key={item.key} className={classnames("status-" + item.info.status)} onClick={ev => this.ViewCandidate(ev, item.key)}>
                                        <Table.Cell className="set-flag">
                                            <Menu icon>
                                                <Menu.Item name="flag" title="Add follow up note" onClick={ev => this.SetFlag(ev, item.key)}>
                                                    <Icon link name="flag" />
                                                </Menu.Item>

                                                <Menu.Item name="archive" title={`${setArchiveStatusText} candidate`} onClick={ev => this.ArchiveCandidate(ev, item.key, toggleArchive)}>
                                                    <Icon link name="archive" />
                                                </Menu.Item>
                                                <Menu.Item
                                                    name="edit"
                                                    title="Edit candidate"
                                                    onClick={ev => {
                                                        ev.stopPropagation();
                                                        history.push(`/candidates/${item.key}/edit`);
                                                    }}>
                                                    <Icon link name="edit" />
                                                </Menu.Item>
                                            </Menu>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.info.lastname}, {item.info.firstname}
                                        </Table.Cell>
                                        <Table.Cell>{item.info.skill}</Table.Cell>
                                        <Table.Cell>{potential_contracts}</Table.Cell>
                                        <Table.Cell>{item.info.level}</Table.Cell>
                                        <Table.Cell>{item.info.current_contract}</Table.Cell>
                                        <Table.Cell>{item.info.notes}</Table.Cell>
                                        <Table.Cell>{item.info.next_steps}</Table.Cell>
                                    </Table.Row>
                                );
                            } else {
                                return false;
                            }
                        })}
                </Table.Body>
            </Table>
        );
    }
}

export default CandidatesTable;
