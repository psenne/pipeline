import React, { useState, useEffect } from "react";

const CandidateSearchContext = React.createContext({});

const CandidateTableFilters = ({ children }) => {
    const [searchterm, setsearchterm] = useState("");
    const [status, setstatus] = useState("");
    const [archived, setarchived] = useState("current");
    const value = { searchterm, setsearchterm, archived, setarchived, status, setstatus };

    return <CandidateSearchContext.Provider value={value}>{children}</CandidateSearchContext.Provider>;
};
export default CandidateSearchContext;
export { CandidateTableFilters };
