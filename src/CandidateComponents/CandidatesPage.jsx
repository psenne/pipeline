import React, { Component } from "react";
import { fbCandidatesDB } from "../firebase/firebase.config";
import NavBar from "../NavBar";
import CandidateToolbar from "./CandidateToolbar";
import CandidatesTable from "./CandidatesTable";

class CandidatesPage extends Component {
    constructor(props) {
        super(props);

        this.orderedCandidates = fbCandidatesDB.orderByChild("lastname"); //used for sorting and populating candidate table.

        /***
        
        candidateList: array of candidates pulled from firebase
        viewArchived: current or archived. used to be true or false, but the dropdown didn't like boolean values. sent to CandidatesTable component
        filterTerm: searchbar field. sent to CandidatesTable component
        statusFilter: status filter field. sent to CandidatesTable component
        
        ***/

        this.state = {
            selectedCandidateKey: null,
            activeRow: null,
            candidateList: [],
            viewArchived: "current",
            filterTerm: "",
            statusFilter: "",
            formButtonName: ""
        };

        this.filterCandidates = this.filterCandidates.bind(this);
        this.HandleDropdownInput = this.HandleDropdownInput.bind(this);
        this.filterByStatus = this.filterByStatus.bind(this);
        this.ArchiveCandidate = this.ArchiveCandidate.bind(this);
    }

    //callback function for search bar
    filterCandidates(ev, data) {
        this.setState({
            filterTerm: data.value
        });
    }

    //callback function for status dropdown
    filterByStatus(ev, data) {
        this.setState({
            statusFilter: data.value
        });
    }

    //callback function for archived dropdown. initially the only dropdown, hence the generic name.
    HandleDropdownInput(ev, data) {
        this.setState({
            viewArchived: data.value
        });
    }

    ArchiveCandidate(key, status) {
        fbCandidatesDB.child(key).update({ archived: status });
    }

    componentDidMount() {
        this.orderedCandidates.on("value", data => {
            let tmpitems = [];
            data.forEach(function(candidate) {
                tmpitems.push({ key: candidate.key, info: candidate.val() });
            });

            this.setState({
                candidateList: tmpitems
            });
            //this.props.showLoader(false);
        }); //update candidate table when data in firebase changes.
    }

    render() {
        return (
            <div>
                <NavBar active="candidates" />
                <CandidateToolbar candidates={this.state.candidateList} AddCandidate={this.AddCandidate} filterByArchived={this.HandleDropdownInput} viewArchived={this.state.viewArchived} filterByStatus={this.filterByStatus} searchCandidates={this.filterCandidates} searchTerm={this.state.filterTerm} />
                <CandidatesTable ArchiveCandidate={this.ArchiveCandidate} filter={this.state.viewArchived} filterBySearch={this.state.filterTerm} filterByStatus={this.state.statusFilter} list={this.state.candidateList} />
            </div>
        );
    }
}

export default CandidatesPage;
