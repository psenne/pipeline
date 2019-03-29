import React, { Component } from "react";
import { fbCandidatesDB, fbAuditTrailDB } from "../firebase/firebase.config";
import NavBar from "../NavBar";
import CandidateToolbar from "./CandidateToolbar";
import CandidatesTable from "./CandidatesTable";

class CandidatesPage extends Component {
    constructor(props) {
        super(props);

        this.orderedCandidates = fbCandidatesDB.orderByChild("firstname"); //used for sorting and populating candidate table.

        /***
        
        candidateList: array of candidates pulled from firebase
        viewArchived: current or archived. used to be true or false, but the dropdown didn't like boolean values. sent to CandidatesTable component
        filterTerm: searchbar field. sent to CandidatesTable component
        statusFilter: status filter field. sent to CandidatesTable component
        
        ***/

        this.state = {
            candidateList: [],
            viewArchived: "current",
            filterTerm: "",
            statusFilter: ""
        };

        this.filterCandidates = this.filterCandidates.bind(this);
        this.HandleDropdownInput = this.HandleDropdownInput.bind(this);
        this.filterByStatus = this.filterByStatus.bind(this);
        this.ArchiveCandidate = this.ArchiveCandidate.bind(this);
    }

    componentDidMount() {
        const filter = this.props.location.state ? this.props.location.state.filter : "current";
        const filterBySearch = this.props.location.state ? this.props.location.state.filterBySearch : "";
        const filterByStatus = this.props.location.state ? this.props.location.state.filterByStatus : "";

        this.orderedCandidates.on("value", data => {
            let tmpitems = [];
            data.forEach(function(candidate) {
                tmpitems.push({ key: candidate.key, info: candidate.val() });
            });

            this.setState({
                candidateList: tmpitems,
                viewArchived: filter,
                filterTerm: filterBySearch,
                statusFilter: filterByStatus
            });
        }); //update candidate table when data in firebase changes.
    }

    componentWillUnmount() {
        this.orderedCandidates.off("value");
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

    ArchiveCandidate(key, candidate, status) {
        const { currentuser } = this.props;
        const now = new Date();
        let eventinfo = "";

        eventinfo = `${currentuser.displayName} set candidate to ${status}.`;

        const newEvent = {
            eventdate: now.toJSON(),
            username: currentuser.displayName,
            eventinfo: eventinfo,
            candidatename: `${candidate.firstname} ${candidate.lastname}`
        };

        fbCandidatesDB
            .child(key)
            .update({
                archived: status
            })
            .then(() => {
                fbAuditTrailDB.push(newEvent);
            })
            .catch(err => console.error("CandidatesPage, line 102: ", err));
    }

    render() {
        const { candidateList } = this.state;
        const flaggedCandidates = candidateList.filter(candidate => {
            return candidate.info.isFlagged;
        });
        const unflaggedCandidates = candidateList.filter(candidate => {
            return !candidate.info.isFlagged;
        });

        return (
            <div>
                <NavBar active="candidates" />
                <CandidateToolbar candidates={this.state.candidateList} AddCandidate={this.AddCandidate} filterByArchived={this.HandleDropdownInput} viewArchived={this.state.viewArchived} filterByStatus={this.filterByStatus} searchCandidates={this.filterCandidates} searchTerm={this.state.filterTerm} />
                <CandidatesTable ArchiveCandidate={this.ArchiveCandidate} filter={this.state.viewArchived} filterBySearch={this.state.filterTerm} filterByStatus={this.state.statusFilter} list={flaggedCandidates} />
                <CandidatesTable ArchiveCandidate={this.ArchiveCandidate} filter={this.state.viewArchived} filterBySearch={this.state.filterTerm} filterByStatus={this.state.statusFilter} list={unflaggedCandidates} />
            </div>
        );
    }
}

export default CandidatesPage;
