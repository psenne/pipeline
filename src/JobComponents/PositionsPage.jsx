import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import PositionsToolbar from "../JobComponents/PositionsToolbar";
import PositionsTable from "../JobComponents/PositionsTable";
import { fbPositionsDB } from "../firebase/firebase.config";

export default props => {
    const [positions, updatePositions] = useState([]);
    const [searchTerm, setsearchTerm] = useState("");

    useEffect(() => {
        fbPositionsDB.on("value", data => {
            let tmpitems = [];
            data.forEach(function(position) {
                tmpitems.push({ key: position.key, info: position.val() });
            });
            updatePositions(tmpitems);
        });
        return () => fbPositionsDB.off("value");
    });

    return (
        <div>
            <NavBar active="positions" />
            <PositionsToolbar />
            <PositionsTable positions={positions} searchTerm={searchTerm} />
        </div>
    );
};
