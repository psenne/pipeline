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
                <Grid stackable columns="equal">
                    <Grid.Row>
                        <Grid.Column>
                            <LastCreated />
                        </Grid.Column>
                        <Grid.Column>
                            <LastModified />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </>
    );
};
