const tmplCandidate = {
    current_contract: "",
    firstname: "",
    lastname: "",
    emailaddress: "",
    telephone: "",
    title: "",
    found_by: "",
    interview_date: "",
    interviewed_by: [],
    level: "",
    loi_status: "notsent",
    loi_sent_date: "",
    loi_sent_by: "",
    location: "",
    next_steps: "",
    notes: "",
    potential_contracts: [],
    skill: "",
    resume_filename: "",
    resume_type: [],
    salary: "",
    status: "initial",
    archived: "current",
    isFlagged: false,
    flagged_comment: ""
};

// prettier-ignore
const tmplLOIStatus = [
    { key: "notsent", text: "Not Sent", value: "notsent" },
    { key: "sent", text: "Sent", value: "sent" },
    { key: "accepted", text: "Accepted", value: "accepted" }
];


export  { tmplCandidate,  tmplLOIStatus };
