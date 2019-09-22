import React, { Component } from "react";
import { fbCandidatesDB } from "../firebase/firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { Loader, Dimmer } from "semantic-ui-react";
import NavBar from "../NavBar";
import CandidateToolbar from "./CandidateToolbar";
import CandidatesTable from "./CandidatesTable";

class CandidatesPage extends Component {
    static contextType = CandidateSearchContext;

    constructor(props) {
        super(props);

        this.orderedCandidates = fbCandidatesDB.orderByChild("firstname"); //used for sorting and populating candidate table.

        this.state = {
            candidateList: [],
            pageLoading: false
        };
    }

    componentDidMount() {
        this.setState({ pageLoading: true });
        this.orderedCandidates.on("value", data => {
            let tmpitems = [];
            data.forEach(function(candidate) {
                tmpitems.push({ key: candidate.key, info: Object.assign({}, tmplCandidate, candidate.val()) });
            });

            this.setState({ candidateList: tmpitems }, () => {
                this.setState({ pageLoading: false });
            });
        });

        this.orderedCandidates.on("child_changed", data => {
            this.setState({ pageLoading: true });

            const { candidateList } = this.state;
            const index = candidateList.findIndex(item => item.key === data.key);
            candidateList[index].info = data.val();

            this.setState({ candidateList }, () => {
                this.setState({ pageLoading: false });
            });
        });
    }

    componentWillUnmount() {
        this.orderedCandidates.off("value");
        this.orderedCandidates.off("child_changed");
    }

    render() {
        const { candidateList, pageLoading } = this.state;
        const flaggedCandidates = candidateList.filter(candidate => {
            return candidate.info.isFlagged;
        });
        const unflaggedCandidates = candidateList.filter(candidate => {
            return !candidate.info.isFlagged;
        });

        return (
            <>
                <Dimmer active={pageLoading}>
                    <Loader>Loading candidates...</Loader>
                </Dimmer>
                <NavBar active="candidates" />
                <CandidateToolbar candidates={this.state.candidateList} />
                <CandidatesTable list={flaggedCandidates} />
                <CandidatesTable list={unflaggedCandidates} />
            </>
        );
    }
}

export default CandidatesPage;
