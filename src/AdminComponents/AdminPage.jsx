import React from "react";
import NavBar from "../NavBar";
import { Tab } from "semantic-ui-react";
import DBManagement from "./DBManagement";
import AuditTrailPage from "./AuditTrailPage";

const panes = [
    {
        menuItem: "DB Management",
        render: () => (
            <Tab.Pane>
                <DBManagement />
            </Tab.Pane>
        )
    },
    {
        menuItem: "History",
        render: () => (
            <Tab.Pane>
                <AuditTrailPage />
            </Tab.Pane>
        )
    }
];

const AdminPage = () => {
    return (
        <>
            <NavBar active="admin" />
            <Tab menu={{ attached: true }} panes={panes} />
        </>
    );
};

export default AdminPage;
