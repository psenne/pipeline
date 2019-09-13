import React, { Suspense, lazy } from "react";
import { Route, Switch, Router } from "react-router-dom";
import history from "./modules/history";
import UserContext from "./contexts/UserContext";

import { Loader, Dimmer } from "semantic-ui-react";
import "semantic-ui-css/semantic.css";

const LandingPage = lazy(() => import("./LandingComponents/LandingPage"));
const CandidatesPage = lazy(() => import("./CandidateComponents/CandidatesPage"));
const CandidateDetailPage = lazy(() => import("./CandidateComponents/CandidateDetailPage"));
const AddCandidateForm = lazy(() => import("./CandidateComponents/AddCandidateForm"));
const EditCandidateForm = lazy(() => import("./CandidateComponents/EditCandidateForm"));
const AdminPage = lazy(() => import("./AdminComponents/AdminPage"));
const LoginHistory = lazy(() => import("./AdminComponents/LoginHistory"));
const PositionsPage = lazy(() => import("./JobComponents/PositionsPage"));
const AddPositionForm = lazy(() => import("./JobComponents/AddPositionForm"));
const EditPositionForm = lazy(() => import("./JobComponents/EditPositionForm"));
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
                    <Route path="/candidates/:id" render={props => <UserContext.Consumer>{currentuser => <CandidateDetailPage currentuser={currentuser} {...props} />}</UserContext.Consumer>} />
                    <Route path="/candidates" render={props => <CandidatesPage {...props} />} />
                    <Route path="/positions/add" render={props => <UserContext.Consumer>{currentuser => <AddPositionForm currentuser={currentuser} {...props} />}</UserContext.Consumer>} />
                    <Route path="/positions/:id" render={props => <UserContext.Consumer>{currentuser => <EditPositionForm currentuser={currentuser} {...props} />}</UserContext.Consumer>} />
                    <Route path="/positions" render={props => <PositionsPage {...props} />} />
                    <Route path="/loginhistory" render={props => <LoginHistory {...props} />} />
                    <Route render={() => <NoMatch />} />
                </Switch>
            </Suspense>
        </Router>
    );
}
