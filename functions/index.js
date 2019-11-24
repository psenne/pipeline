const functions = require("firebase-functions");
const admin = require("firebase-admin");

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
    const changedFields = Object.keys(before).map(key => {
        if (before[key] !== after[key]) {
            return key;
        }
    });

    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} updated ${changedFields.join(", ")}.`,
        candidatename
    };

    return () => console.log(event);

    // return snapshot.ref.parent.parent.child("auditing").push(event).then(()=>{
    //     console.log(event);
    // }) //prettier-ignore
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
        console.log(event);
    }) //prettier-ignore
});
