import React from "react";
import NavBar from "../NavBar";
import LastCreated from "./LastCreated";
import LastModified from "./LastModified";
import { Container, Grid } from "semantic-ui-react";
import UserContext from "../contexts/UserContext";

export default () => {
    return (
        <>
            <NavBar active="dashboard" />
            <Container>
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column width={6}>
                            <UserContext.Consumer>{currentuser => <LastCreated currentuser={currentuser} />}</UserContext.Consumer>
                        </Grid.Column>
                        <Grid.Column width={10}>
                            <UserContext.Consumer>{currentuser => <LastModified currentuser={currentuser} />}</UserContext.Consumer>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </>
    );
};
