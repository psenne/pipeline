import React from "react";
import { Route, Switch } from "react-router-dom";

import LandingPage from "./LandingComponents/LandingPage";
import CandidatesPage from "./CandidateComponents/CandidatesPage";
import JobsPage from "./JobComponents/JobsPage";
import CandidateDetailPage from "./CandidateComponents/CandidateDetailPage";
import AddCandidateForm from "./CandidateComponents/AddCandidateForm";
import EditCandidateForm from "./CandidateComponents/EditCandidateForm";
import AdminPage from "./AdminComponents/AdminPage";
import noMatch from "./nomatch";

export default function AppRoutes() {
    return (
        <Switch>
            <Route exact path="/" component={CandidatesPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/candidates/add" component={AddCandidateForm} />
            <Route exact path="/candidates/:id/edit" component={EditCandidateForm} />
            <Route path="/candidates/:id" component={CandidateDetailPage} />
            <Route path="/candidates" component={CandidatesPage} />
            <Route path="/jobs" component={JobsPage} />
            <Route component={noMatch} />
        </Switch>
    );
}
