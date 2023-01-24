// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC7YP4k82LdUJiXqPlrr_Mx94I5ARZikrI",
    authDomain: "fir-font-end-test1.firebaseapp.com",
    projectId: "fir-font-end-test1",
    storageBucket: "fir-font-end-test1.appspot.com",
    messagingSenderId: "352017589370",
    appId: "1:352017589370:web:cff07e37a02c7543a0c7c3",
    measurementId: "G-99TRMJBP29"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

const db = app.firestore();
const auth = app.auth();

const login = () => {
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;
    auth.signInWithEmailAndPassword(email, password).then((res) => {
        console.log(res.user)
    })
    .catch((err) => {
        console.log(err.code);
        console.log(err.message);
    });
};
const createAccount = () => {
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;
    auth.createUserWithEmailAndPassword(email, password).then((res) => {
        console.log(res.user)
    })
    .catch((err) => {
        console.log(err.code);
        console.log(err.message);
    });
};
const logout = () => {
    auth.signOut().then((res) => {
        console.log("signed out");
    })
    .catch((err) => {
        console.log(err.code);
        console.log(err.message);
    });
};
const save = () => {
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;
    const user = firebase.auth().currentUser;

    if (user) {
        const uid = user.uid;
        db.collection("users").doc(uid).set({"email": email, "password": password, "user_id": uid}).then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    } else {
        console.log("Not signed in");
    }
    

};
const remove = () => {
    const user_id = document.getElementById("User_ID").value;
    
    db.collection("users").doc(user_id).delete().then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    });
};
const update = () => {
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;
    const user_id = document.getElementById("User_ID").value;
    
    db.collection("users").doc(user_id).update({"email": email, "password": password}).then((res) => {
        alert("Data Updated");
    })
    .catch((err) => {
        console.log(err);
    });
};
const update_user = () => {
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;
    const user_id = document.getElementById("User_ID").value;
    
    db.collection("users").where("email", "==", email).get().then((data) => {
        console.log(data.docs);
        console.log(data.docs[0]);
        console.log(data.docs[0].id);
        db.collection("users").doc(data.docs[0].id).update({"email": email, "password": password}).then((res) => {
            alert("Data Updated");
        })
    })
    .catch((err) => {
        console.log(err);
    });
};
const fetch = () => {
    const user = firebase.auth().currentUser;

    if (user) {
        const uid = user.uid;
        var docref = db.collection("users").doc(uid);
        docref.get().then(doc => {
            if (doc.exists) {
                console.log("data:",doc.data());
            } else {
                console.log("doc does not exist");
            }
        });
    } else {
        console.log("Not signed in");
    }
    
};
const fetch_specific = () => {
    const user = firebase.auth().currentUser;
    const id_to_fetch = document.getElementById("User_ID").value;
    if (user) {
        const uid = user.uid;
        var docref = db.collection("users").doc(id_to_fetch);
        docref.get().then(doc => {
            if (doc.exists) {
                console.log("data:",doc.data());
            } else {
                console.log("doc does not exist");
            }
        });
    } else {
        console.log("Not signed in");
    }
    
};
const read_all_data = () => {
    const user = firebase.auth().currentUser;
    if (user) {
        const uid = user.uid;
        
        db.collection("users").where("other_access","array-contains",uid)
        .get()
        .then((res) => {
            console.log(res.docs.map((item) => {
                return {... item.data(), id: item.id};
            }));
        })
        .catch((err) => {
            console.log(err);
        });
    } else {
        console.log("Not signed in");
    }
};