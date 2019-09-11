import React, { useState } from "react";

const CandidateSearchContext = React.createContext({});

const useCandidateFilters = () => useContext(CandidateSearchContext);

//callback function for search bar
const SearchCandidates = (ev, data) => {
    setsearchterm(data.value);
};

//callback function for status dropdown
const StatusFilter = (ev, data) => {
    setstatus(data.value);
};

//callback function for archived dropdown.
const ArchiveFilter = (ev, data) => {
    setarchived(data.value);
};

const CandidateTableFilters = ({ children }) => {
    const [searchterm, setsearchterm] = useState();
    const [status, setstatus] = useState();
    const [archived, setarchived] = useState();

    return <CandidateSearchContext.Provider value={value}>{children}</CandidateSearchContext.Provider>;
};
export default CandidateSearchContext;
