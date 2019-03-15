import React from "react";
import { Header } from "semantic-ui-react";
import AuditTrail from "./AuditTrail";

export default function AuditTrailPage() {
    return (
        <>
            <Header>Pipeline history</Header>
            <AuditTrail />
        </>
    );
}
