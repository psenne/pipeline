import React from "react";
import NavBar from "../NavBar";
import StatusTable from "./StatusTable";
import ContractsEditsTable from "./ContractsEditsTable";
import UsersEditsTable from "./UsersEditsTable";
import { Container, Divider } from "semantic-ui-react";

const AdminPage = () => {
    return (
        <div>
            <NavBar active="admin" />
            <Container>
                <StatusTable />
                <ContractsEditsTable />
                <UsersEditsTable />
                <Divider />
            </Container>
        </div>
    );
};

export default AdminPage;
