import React from "react";
import history from "../modules/history";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Grid, Header, Label } from "semantic-ui-react";
import classnames from "classnames";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function (item) {
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.info.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.description.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.skill_summary.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.level.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

// filters candidates by status
function isFiltered(searchTerm) {
    return function (item) {
        return !searchTerm || item.info.contract === searchTerm;
    };
}

// position:
//     title: "",
//     description: "",
//     level: "",
//     position_id: "",
//     contract: "",
//     candidate_submitted: [],
//     location: ""

export default function PositionsTable({ positions, searchTerm, contractFilter }) {
    // const ViewPosition = (ev, key) => {
    //     //ev.preventDefault();
    //     //history.push(`/positions/${key}`);
    // };

    // const GoToCandidate = (ev, key) => {
    //     ev.stopPropagation();
    //     //history.push(`/candidates/${key}`);
    // }

    return (
        <Grid columns={16} verticalAlign="middle" divided="vertically" className="hovered">
            {positions
                .filter(isFiltered(contractFilter))
                .filter(isSearched(searchTerm))
                .map(item => {
                    const position_id = item.info.position_id ? `(${item.info.position_id})` : "";
                    const contract = item.info.contract ? `${item.info.contract} - ` : "";
                    const level = item.info.level ? item.info.level : "";
                    const dash = item.info.level && item.info.skill_summary ? "-" : "";
                    const location = item.info.location ? `Location: ${item.info.location}` : "";

                    return (
                        <Grid.Row columns={2} key={item.key} centered className={classnames({ "candidate-submitted": item.candidate_submitted }, "candidate-table-row")}>
                            <Grid.Column width={15}>
                                <Link to={`/positions/${item.key}`}>
                                    <Header>
                                        <Header.Content>
                                            {contract} {item.info.title} {position_id}
                                        </Header.Content>
                                        <Header.Subheader>
                                            <div>
                                                {level} {dash} {item.info.skill_summary}
                                            </div>
                                            <div>{location}</div>
                                        </Header.Subheader>
                                    </Header>
                                    <div>{item.info.description}</div>
                                    <Header sub >
                                        Candidates submitted:
                                        {item.info.candidate_submitted.map(candidate => {
                                            return (
                                                <Link to={`/candidates/${candidate.candidate_key}`}>
                                                    <Label as="a" color="blue" key={candidate.candidate_key} content={candidate.candidate_name} icon='user secret' />
                                                </Link>
                                            );
                                        })}
                                    </Header>
                                </Link>
                            </Grid.Column>
                        </Grid.Row>
                    );
                })}
        </Grid>
    );
}
