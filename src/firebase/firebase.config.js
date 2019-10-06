import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var prodconfig = {
    apiKey: "AIzaSyCNMMcb5kK1Mc-8v-_LjxI6gl7RDLbfj98",
    authDomain: "staffing-pipeline.firebaseapp.com",
    databaseURL: "https://staffing-pipeline.firebaseio.com",
    projectId: "staffing-pipeline",
    storageBucket: "staffing-pipeline.appspot.com",
    messagingSenderId: "403362370549"
};

var devconfig = {
    apiKey: "AIzaSyCzu1yAol8hre3s8SGINGzf0BwVFhxrIbY",
    authDomain: "staffing-pipeline-dev.firebaseapp.com",
    databaseURL: "https://staffing-pipeline-dev.firebaseio.com",
    projectId: "staffing-pipeline-dev",
    storageBucket: "staffing-pipeline-dev.appspot.com",
    messagingSenderId: "90337545773"
};

// eslint-disable-next-line
const config = process.env.NODE_ENV === "production" ? prodconfig : devconfig;
// const config = process.env.NODE_ENV === "production" ? devconfig : devconfig;

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

const fbStorage = firebase.storage().ref();

const fbUsersDB = firebase.database().ref("users");
const fbLoginsDB = firebase.database().ref("logins");
const fbCandidatesDB = firebase.database().ref("candidates");
const fbPositionsDB = firebase.database().ref("positions");
const fbAuditTrailDB = firebase.database().ref("auditing");
const fbStatusesDB = firebase.database().ref("statuses");
const fbContractsDB = firebase.database().ref("contracts");
const fbLOIStatusesDB = firebase.database().ref("loistatuses");
const fbFlagNotes = firebase.database().ref("flagnotes");

const fbauth = firebase.auth();

/////// query to filter by data value ///////////
// fbCandidatesDB
//     .orderByChild("height")
//     .equalTo(25)
//     .on("value", function(candidates) {
//         console.log(candidates.val());
//     });

//callback function for clicking Login Button
const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider(); //strictly use Google's Authentication service (built in to Firebase)
    return fbauth.signInWithPopup(provider);
};

//callback function for clicking profile avatar (logout button)
const SignOutWithGoogle = () => {
    return fbauth.signOut();
};

export default firebase;
export { fbStorage, fbLoginsDB, fbUsersDB, fbauth, fbCandidatesDB, fbPositionsDB, fbAuditTrailDB, fbFlagNotes, fbStatusesDB, fbContractsDB, fbLOIStatusesDB, SignInWithGoogle, SignOutWithGoogle };
