import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbCandidatesDB } from "../firebase/firebase.config";

// returns an array of contract names:
// [hawkeye, meritage, R2]

export default class CandidateDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = { candidates: [] };
    }

    componentDidMount() {
        const { filters, removecandidates } = this.props;

        fbCandidatesDB.once("value", data => {
            const filteredData = [];
            data.forEach(function (candidate) {
                const info = candidate.val();
                const key = candidate.key;
                let meetsCriteria = true;

                filters.forEach(filter => {
                    const field = Object.keys(filter)[0]; //get fieldname from props filter
                    const value = Object.values(filter)[0]; //get corresponding value from props filter
                    if (info[field] === value) {
                        meetsCriteria = meetsCriteria && true;
                    } else {
                        meetsCriteria = meetsCriteria && false;
                    }
                });

                if (meetsCriteria) filteredData.push({ key, info });
            });

            this.setState({
                candidates: filteredData
            });
        });
    }

    onChange = (ev, selection) => {
        const { candidates } = this.state;
        if (selection.value) this.props.onChange(candidates.filter(c => c.key === selection.value)[0]);
    };

    render() {
        const { removecandidates, text, value, multiple = false, clearable = false, selection = false, required = false } = this.props;
        const { candidates } = this.state;
        const candidateList = candidates.filter(ReturnRemainingCandidates(removecandidates)).map(({ key, info: candidate }) => {
            const candidatename = candidate.firstname + " " + candidate.lastname;
            return { key: key, text: candidatename, value: key };
        });
        return <Dropdown text={text} selectOnBlur={false} placeholder="Select Candidate" value={value} required={required} clearable={clearable} multiple={multiple} selection={selection} options={candidateList} onChange={this.onChange} />;
    }
}

function ReturnRemainingCandidates(removecandidates) {
    return function (candidate) {
        return !removecandidates.map(rc => rc.candidate_key).includes(candidate.key);
    }
}