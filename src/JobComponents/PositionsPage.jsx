import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import PositionsToolbar from "./PositionsToolbar";
import PositionsTable from "./PositionsTable";
import { fbPositionsDB } from "../firebase/firebase.config";
import tmplPosition from "../constants/positionInfo";

export default function PositionsPage() {
    const [positions, updatePositions] = useState([]);
    const [searchTerm, setsearchTerm] = useState("");
    const [contractFilter, setContractFilter] = useState("");

    useEffect(() => {
        fbPositionsDB.on("value", data => {
            let tmpitems = [];
            data.forEach(function(position) {
                tmpitems.push({ key: position.key, info: { ...tmplPosition, ...position.val() } });
            });
            updatePositions(tmpitems);
        });
        return () => fbPositionsDB.off("value");
    }, []);

    const searchPositions = ev => {
        setsearchTerm(ev.currentTarget.value);
    };

    const HandleContractChange = value => {
        setContractFilter(value);
    };

    return (
        <div>
            <NavBar active="positions" />
            <PositionsToolbar searchPositions={searchPositions} selectedContract={contractFilter} HandleContractChange={HandleContractChange} />
            <PositionsTable positions={positions} searchTerm={searchTerm} contractFilter={contractFilter} />
        </div>
    );
}
