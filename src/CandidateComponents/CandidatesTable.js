import React, { Component } from "react";
import history from "../modules/history";
import { Table, Icon } from "semantic-ui-react";
import classnames from "classnames";
import MiniToolbar from "./MiniToolbar";

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
        const { filterByStatus, filterBySearch, filter } = this.props;
        history.push({ pathname: `/candidates/${key}`, state: { filter, filterBySearch, filterByStatus } });
    }

    ArchiveCandidate(ev, key, status) {
        ev.stopPropagation();
        this.props.ArchiveCandidate(key, status);
    }

    SetFlag(ev, item) {
        ev.stopPropagation();
        console.log(item);
    }

    render() {
        const { filterByStatus, filterBySearch, filter } = this.props;
        return (
            <Table attached className="hovered candidate-table" compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell textAlign="center">
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
                        .filter(isFiltered(filterByStatus))
                        .filter(isSearched(filterBySearch))
                        .map(item => {
                            const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
                            const viewingCurrent = filter === item.info.archived; //item.info.archived is either "current" or "archived"

                            // set button text and actions for archive candidate button
                            const toggleArchive = item.info.archived === "archived" ? "current" : "archived";
                            if (viewingCurrent) {
                                //show only those candidates whose info.archived matches with archived/current dropdown. could've used the filter property
                                return (
                                    <Table.Row key={item.key} className={classnames("status-" + item.info.status, "candidate-table-row")} onClick={ev => this.ViewCandidate(ev, item.key)}>
                                        <Table.Cell textAlign="center">
                                            <MiniToolbar item={item} ArchiveCandidate={ev => this.ArchiveCandidate(ev, item.key, toggleArchive)} AddNote={ev => this.SetFlag(ev, item)} />
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
