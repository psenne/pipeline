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
        const { filters } = this.props;

        fbCandidatesDB.on("value", data => {
            const filteredData = [];
            data.forEach(function(candidate) {
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

    componentWillUnmount() {
        fbCandidatesDB.off("value");
    }

    onChange = (ev, selection) => {
        this.props.onChange(selection.value);
    };

    render() {
        const { text, value, multiple = false, clearable = false, selection = false, required = false } = this.props;
        const { candidates, selectedCandidate } = this.state;
        const candidateList = candidates.map(({ key, info: candidate }) => {
            return { key: key, text: candidate.firstname + " " + candidate.lastname, value: key };
        });
        return <Dropdown text={text} value={value} required={required} clearable={clearable} multiple={multiple} selection={selection} options={candidateList} onChange={this.onChange} />;
    }
}
