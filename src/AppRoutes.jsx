import React, { Suspense, lazy } from "react";
import { Route, Switch, Router } from "react-router-dom";
import history from "./modules/history";
import UserContext from "./contexts/UserContext";

import { Loader, Dimmer } from "semantic-ui-react";
import "semantic-ui-css/semantic.css";

// import LandingPage from "./LandingComponents/LandingPage";
// import CandidatesPage from "./CandidateComponents/CandidatesPage";
// import JobsPage from "./JobComponents/JobsPage";
// import CandidateDetailPage from "./CandidateComponents/CandidateDetailPage";
// import AddCandidateForm from "./CandidateComponents/AddCandidateForm";
// import EditCandidateForm from "./CandidateComponents/EditCandidateForm";
// import AdminPage from "./AdminComponents/AdminPage";
// import noMatch from "./nomatch";

const LandingPage = lazy(() => import("./LandingComponents/LandingPage"));
const CandidatesPage = lazy(() => import("./CandidateComponents/CandidatesPage"));
const CandidateDetailPage = lazy(() => import("./CandidateComponents/CandidateDetailPage"));
const AddCandidateForm = lazy(() => import("./CandidateComponents/AddCandidateForm"));
const EditCandidateForm = lazy(() => import("./CandidateComponents/EditCandidateForm"));
const AdminPage = lazy(() => import("./AdminComponents/AdminPage"));
const JobsPage = lazy(() => import("./JobComponents/JobsPage"));
const NoMatch = lazy(() => import("./nomatch"));

export default function AppRoutes() {
    return (
        <Router history={history}>
            <Suspense
                fallback={
                    <Dimmer>
                        <Loader>Loading...</Loader>
                    </Dimmer>
                }>
                <Switch>
                    <Route exact path="/" render={props => <LandingPage {...props} />} />
                    <Route path="/admin" render={props => <AdminPage {...props} />} />
                    <Route path="/candidates/add" render={props => <UserContext.Consumer>{currentuser => <AddCandidateForm currentuser={currentuser} {...props} />}</UserContext.Consumer>} />
                    <Route exact path="/candidates/:id/edit" render={props => <UserContext.Consumer>{currentuser => <EditCandidateForm currentuser={currentuser} {...props} />}</UserContext.Consumer>} />
                    <Route path="/candidates/:id" render={props => <CandidateDetailPage {...props} />} />
                    <Route path="/candidates" render={props => <UserContext.Consumer>{currentuser => <CandidatesPage currentuser={currentuser} {...props} />}</UserContext.Consumer>} />
                    <Route path="/jobs" render={props => <JobsPage {...props} />} />
                    <Route render={() => <NoMatch />} />
                </Switch>
            </Suspense>
        </Router>
    );
}
