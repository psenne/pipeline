const tmplCandidate = {
    current_contract: "",
    current_company: "",
    firstname: "",
    lastname: "",
    emailaddress: "",
    telephone: "",
    title: "",
    found_by: "",
    filenames: [],
    interview_date: "",
    interviewed_by: [],
    last_update_date: "",
    level: "",
    loi_status: "notsent",
    loi_sent_date: "",
    loi_sent_by: "",
    location: "",
    next_steps: "",
    notes: "",
    potential_contracts: [],
    prefered_location: "",
    skill: "",
    salary: "",
    status: "initial",
    archived: "current",
    isFlagged: false,
    flagged_comment: "",
    created_date: "",
    created_by: "",
    modified_date: "",
    modified_by: "",
    modified_fields: []
};

// prettier-ignore
const tmplLOIStatus = [
    { key: "notsent", text: "Not Sent", value: "notsent" },
    { key: "sent", text: "Sent", value: "sent" },
    { key: "accepted", text: "Accepted", value: "accepted" }
];

export { tmplCandidate, tmplLOIStatus };
