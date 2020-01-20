const functions = require("firebase-functions");
const admin = require("firebase-admin");
const datefns = require('date-fns');
const atob = require("atob");

admin.initializeApp();

exports.updateCandidateStatus = functions.database.ref("/candidates/{candidateID}").onWrite((change, context) => {
    // Exit when the data is deleted.
    if (!change.after.exists()) {
        return null;
    }

    const ckey = context.params.candidateID;
    const candidateinfo = change.after.val();
    let status = candidateinfo.status;
    const interviewed = candidateinfo.loi_status == "notsent" && candidateinfo.interview_date;
    const loisent = candidateinfo.loi_status == "sent";
    const loiaccepted = candidateinfo.loi_status == "accepted";
    const submitted = candidateinfo.submitted_positions != null;

    if (submitted) {
        status = "processing";
    } else if (loiaccepted) {
        status = "active";
    } else if (loisent) {
        status = "recruiting";
    } else if (interviewed) {
        status = "interviewed";
    } else {
        status = "initial";
    }

    return change.after.ref.child("status").set(status).then(()=>{
        console.log(`Updated ${candidateinfo.firstname} ${candidateinfo.lastname} status to ${status}.`);
    }); //prettier-ignore
});

exports.addCreatedEvent = functions.database.ref("/candidates/{candidateID}").onCreate((snapshot, context) => {
    const username = context.auth.token.name;
    const candidatename = `${snapshot.val().firstname} ${snapshot.val().lastname}`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} added ${candidatename}.`,
        candidatename
    };

    return snapshot.ref.parent.parent.child("auditing").push(event).then(()=>{ 
        console.log(event);
    }) //prettier-ignore
});

exports.updateCandidateEvent = functions.database.ref("/candidates/{candidateID}").onUpdate(({ before, after }, context) => {
    const username = context.auth.token.name;
    const orgInfo = before.val();
    const newInfo = after.val();

    const candidatename = `${orgInfo.firstname} ${orgInfo.lastname}`;
    const now = new Date();

    //get fields that have changed
    const changedFields = Object.keys(orgInfo)
        .map(key => {
            if (orgInfo[key] !== newInfo[key] && key !== "modified_fields" && key !== "modified_date" && key !== "modified_by") {
                var beforeval = orgInfo[key];
                var afterval = newInfo[key];
                if (beforeval instanceof Array) {
                    if (!afterval.every(e => beforeval.includes(e)) || !beforeval.every(e => afterval.includes(e))) {
                        //if the array elements have changed, then add key to changedFields
                        return `${key.replace(/[_]/g," ").toUpperCase()} to "${afterval}"`;
                    }
                } else {
                    if(key === "interview_date" || key === "loi_sent_date" || key === "flagged_on"){
                        afterval = datefns.format(new Date(afterval), "MMM d, yyyy")
                    }
                    if(key === "salary"){
                        afterval = "$" + atob(afterval);
                    }
                    return `${key.replace(/[_]/g," ").toUpperCase()} to "${afterval}"`;
                }
            }
        })
        .filter(key => {
            if (key !== undefined) {
                return true;
            }
        });

    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} updated ${changedFields.join("; ")}.`,
        candidatename
    };

    //return () => console.info("All fields:", changedFields, newInfo);

    return after.ref.parent.parent.child("auditing").push(event).then(()=>{
        console.info(event);
    }) //prettier-ignore
});

exports.deletedCandidateEvent = functions.database.ref("/candidates/{candidateID}").onDelete((snapshot, context) => {
    const username = context.auth.token.name;
    const candidatename = `${snapshot.val().firstname} ${snapshot.val().lastname}`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} removed ${candidatename} from the database.`,
        candidatename
    };

    return snapshot.ref.parent.parent.child("auditing").push(event).then(()=>{ 
        console.info(event);
    }) //prettier-ignore
});
