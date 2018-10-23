import React, { Component } from "react";
import { Table, Icon } from "semantic-ui-react";
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

    ViewCandidate(ev, key) {
        ev.stopPropagation();
        this.props.history.push({pathname: `/candidates/${key}`});
    }
    SetFlag(ev, key) {
        ev.stopPropagation();
        console.log(key);
    }

    render() {
        return (
            <Table attached className="hovered candidate-table" compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            <Icon name="flag" color="grey" />
                        </Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Skill</Table.HeaderCell>
                        <Table.HeaderCell>Potential Contracts</Table.HeaderCell>
                        <Table.HeaderCell>Level</Table.HeaderCell>
                        <Table.HeaderCell>Current Contract</Table.HeaderCell>
                        <Table.HeaderCell>Notes</Table.HeaderCell>
                        <Table.HeaderCell>Next Steps</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.props.list
                        .filter(isFiltered(this.props.filterByStatus))
                        .filter(isSearched(this.props.filterBySearch))
                        .map(item => {
                            const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
                            const viewingCurrent = this.props.filter === item.info.archived; //item.info.archived is either "current" or "archived"

                            if (viewingCurrent) {
                                //show only those candidates whose info.archived matches with archived/current dropdown. could've used the filter property
                                return (
                                    <Table.Row key={item.key} className={classnames("status-" + item.info.status)} onClick={ev => this.ViewCandidate(ev, item.key)}>
                                        <Table.Cell className="set-flag">
                                            <Icon name="flag" link color="red" onClick={ev => this.SetFlag(ev, item.key)} />
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
                            }
                            else {
                                return false;
                            }
                        })}
                </Table.Body>
            </Table>
        );
    }
}

export default CandidatesTable;
