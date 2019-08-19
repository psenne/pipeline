import React from "react";

// position:
//     title: "",
//     description: "",
//     level: "",
//     mandatory_certs: "",
//     mandatory_skills: "",
//     position_id: "",
//     contract: "",
//     pm: "",
//     candidate_submitted: [],
//     location: ""

export default function PositionsTable({ positions, searchTerm }) {
    return (
        <ul>
            {positions.map(position => {
                return <li key={position.key}>{position.info.title}</li>;
            })}
        </ul>
    );
}
