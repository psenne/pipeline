import React, { Component } from "react";
import history from "../modules/history";
import { Grid, Header } from "semantic-ui-react";
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

        this.ViewCandidate = this.ViewCandidate.bind(this);
        this.ArchiveCandidate = this.ArchiveCandidate.bind(this);
    }

    ViewCandidate(ev, key) {
        ev.stopPropagation();
        const { filterByStatus, filterBySearch, filter } = this.props;
        history.push({ pathname: `/candidates/${key}`, state: { filter, filterBySearch, filterByStatus } });
    }

    ArchiveCandidate(ev, candidate, status) {
        ev.stopPropagation();
        this.props.ArchiveCandidate(candidate.key, { firstname: candidate.info.firstname, lastname: candidate.info.lastname }, status);
    }

    render() {
        const { filterByStatus, filterBySearch, filter } = this.props;
        return (
            <Grid columns={16} verticalAlign="middle" divided="vertically" className="hovered">
                {this.props.list
                    .filter(isFiltered(filterByStatus))
                    .filter(isSearched(filterBySearch))
                    .filter(item => {
                        return item.info.archived === filter;
                    })
                    .map(item => {
                        const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
                        const company = item.info.company ? `with ${item.info.company}` : "";
                        const current_contract = item.info.current_contract ? `on ${item.info.current_contract}` : "";
                        const toggleArchive = item.info.archived === "archived" ? "current" : "archived"; // set button text and actions for archive candidate button

                        return (
                            <Grid.Row columns={2} key={item.key} className={classnames("status-" + item.info.status, "candidate-table-row")} onClick={ev => this.ViewCandidate(ev, item.key)}>
                                <Grid.Column textAlign="center" width={1}>
                                    <MiniToolbar item={item} ArchiveCandidate={ev => this.ArchiveCandidate(ev, item, toggleArchive)} />
                                </Grid.Column>
                                <Grid.Column width={15}>
                                    <Header>
                                        <Header.Content>
                                            {item.info.firstname} {item.info.lastname}
                                        </Header.Content>

                                        <Header.Subheader>
                                            {item.info.level} {item.info.skill} {company} {current_contract}
                                        </Header.Subheader>
                                    </Header>
                                    <div>
                                        <span className="candidate-table-field">Potential contracts:</span> {potential_contracts}
                                    </div>
                                    <div>
                                        <span className="candidate-table-field">Notes:</span> {item.info.notes}
                                    </div>
                                    <div>
                                        <span className="candidate-table-field">Next steps:</span> {item.info.next_steps}
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        );
                    })}
            </Grid>
        );
    }
}

export default CandidatesTable;
