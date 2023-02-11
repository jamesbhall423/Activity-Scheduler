const firebaseConfig = {
  apiKey: "AIzaSyDAn3unLwDj4jQcDxw6oi7iF7teNIBTkBQ",
  authDomain: "activity-scheduler-database.firebaseapp.com",
  projectId: "activity-scheduler-database",
  storageBucket: "activity-scheduler-database.appspot.com",
  messagingSenderId: "309597686543",
  appId: "1:309597686543:web:33c1353919850c56ea8c7a",
  measurementId: "G-3R95HWSPJG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();
const auth = app.auth();

function initializeUserData() {
  if (auth.currentUser) {
    email = auth.currentUser.email;
    db.collection("users").doc(email).get().then((doc) => {
      if (!doc.exists) {
          db.collection("users").doc(email).set({"other_access": [], "other_ref": []}).then((res) => {
              console.log(res);
          })
          .catch((err) => {
              console.log(err);
          });
      }
    });
  }
  
}
