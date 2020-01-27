const functions = require("firebase-functions");
const admin = require("firebase-admin");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

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
    const changedFields = Object.keys({ ...orgInfo, ...newInfo }) //grab all keys
        .map(key => {
            var beforeval = orgInfo[key];
            var afterval = newInfo[key];
            if (beforeval !== afterval && key !== "submitted_positions" && key !== "isFlagged" && key !== "flag_history" && key !== "status" && key !== "modified_fields" && key !== "modified_date" && key !== "modified_by") {
                if (beforeval === undefined && afterval instanceof Array) {
                    //field was filled in
                    return `added "${afterval.join(", ")}" to ${key.replace(/[_]/g, " ").toUpperCase()}`;
                } else if (beforeval instanceof Array && afterval === undefined) {
                    //field was erased
                    return `erased "${beforeval.join(", ")}" from ${key.replace(/[_]/g, " ").toUpperCase()}`;
                } else if (beforeval instanceof Array && afterval instanceof Array) {
                    //field was added to or removed from
                    if (!afterval.every(e => beforeval.includes(e)) || !beforeval.every(e => afterval.includes(e))) {
                        //if the array elements have changed, then add key to changedFields
                        return `updated ${key.replace(/[_]/g, " ").toUpperCase()} to "${afterval.join(", ")}"`;
                    }
                } else {
                    //field is not multiple selection
                    if (key === "interview_date" || key === "loi_sent_date" || key === "flagged_on") {
                        afterval = afterval !== "" ? datefns.format(new Date(afterval), "MMM d, yyyy") : "";
                    }
                    if (key === "salary") {
                        afterval = afterval !== "" ? "$" + atob(afterval) : "";
                    }
                    if (beforeval !== "" && afterval === "") {
                        return `erased "${beforeval}" from ${key.replace(/[_]/g, " ").toUpperCase()}`;
                    } else if (beforeval === "" && afterval !== "") {
                        return `added "${afterval}" to ${key.replace(/[_]/g, " ").toUpperCase()}`;
                    } else {
                        return `updated ${key.replace(/[_]/g, " ").toUpperCase()} to "${afterval}"`;
                    }
                }
            }
        })
        .filter(key => {
            if (key !== undefined) {
                return true;
            }
        });

    if (changedFields.length > 0) {
        var eventinfo = `${username} ${changedFields.join(", ")}`;
        const event = {
            eventdate: now.toJSON(),
            eventinfo,
            candidatename
        };

        //return () => console.info("All fields:", changedFields, newInfo);

        return after.ref.parent.parent.child("auditing").push(event).then(()=>{
            console.info(event);
        }) //prettier-ignore
    }
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

/** Position trigger section */

exports.addPositionCreatedEvent = functions.database.ref("/positions/{positionID}").onCreate((snapshot, context) => {
    const username = context.auth.token.name;
    const positionname = `${snapshot.val().level} ${snapshot.val().title} (${snapshot.val().contract})`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} added ${positionname}.`,
        candidatename: positionname
    };

    return snapshot.ref.parent.parent.child("auditing").push(event).then(()=>{ 
        console.log(event);
    }) //prettier-ignore
});

exports.deletedPositionEvent = functions.database.ref("/positions/{positionID}").onDelete((snapshot, context) => {
    const username = context.auth.token.name;
    const positionname = `${snapshot.val().level} ${snapshot.val().title} (${snapshot.val().contract})`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} removed ${positionname} from the database.`,
        candidatename: positionname
    };

    return snapshot.ref.parent.parent.child("auditing").push(event).then(()=>{ 
        console.info(event);
    }) //prettier-ignore
});

exports.updatePositionEvent = functions.database.ref("/positions/{positionID}").onUpdate(({ before, after }, context) => {
    const username = context.auth.token.name;
    const orgInfo = before.val();
    const newInfo = after.val();

    const positionname = `${newInfo.level} ${newInfo.title} (${newInfo.contract})`;
    const now = new Date();

    //get fields that have changed
    const changedFields = Object.keys({ ...orgInfo, ...newInfo }) //grab all keys
        .map(key => {
            var beforeval = orgInfo[key];
            var afterval = newInfo[key];
            if (!_.isEqual(beforeval, afterval) && key !== "added_on") {
                if (key === "candidates_submitted") {
                    if (afterval instanceof Object) {
                        //candidates submitted section
                        var new_candidates_keys = Object.keys(afterval);
                        if(beforeval !== undefined){
                            new_candidates_keys = _.reduce(afterval, (result, value, key) => (_.isEqual(value, beforeval[key]) ? result : result.concat(key)), []); // https://stackoverflow.com/questions/31683075/how-to-do-a-deep-comparison-between-2-objects-with-lodash
                        }
                        return new_candidates_keys.length > 0 ? new_candidates_keys.map(ckey => `submitted ${afterval[ckey].candidate_name} on ${datefns.format(new Date(afterval[ckey].submission_date), "MMM d, yyyy")}`).join(", ") : undefined; //create event description. undefined if no candidates were added. otherwise join returns ""
                    }
                } 
                else {
                    //other than candidate submissions
                    if (beforeval !== "" && afterval === "") {
                        return `erased "${beforeval}" from ${key.replace(/[_]/g, " ").toUpperCase()}`;
                    } else if (beforeval === "" && afterval !== "") {
                        return `added "${afterval}" to ${key.replace(/[_]/g, " ").toUpperCase()}`;
                    } else {
                        return `updated ${key.replace(/[_]/g, " ").toUpperCase()} to "${afterval}"`;
                    }
                }
            } 
        })
        .filter(key => {
            if (key !== undefined) {
                return true;
            }
        });

    if (changedFields.length > 0) {
        var eventinfo = `${username} ${changedFields.join(", ")}`;
        event = {
            eventdate: now.toJSON(),
            eventinfo,
            candidatename: positionname
        };
        return after.ref.parent.parent.child("auditing").push(event).then(()=>{
            console.info(event);
        }) //prettier-ignore
    } 
    else {
        return () => console.info("No substantial changes.");
    }
});
