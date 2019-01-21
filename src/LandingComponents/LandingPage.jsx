import React from "react";
import NavBar from "../NavBar";
import { Container } from "semantic-ui-react";

const lp = () => {
    return (
        <>
            <NavBar active="dashboard" />
            <Container>
                <h1>Landing Page</h1>
            </Container>
        </>
    );
};

export default lp;
