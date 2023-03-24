const login = () => {
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;
    auth.signInWithEmailAndPassword(email, password).then((res) => {
        console.log(res.user);
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
        console.log(res.user);
        initializeUserData();
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
const deleteAccount = () => {
    console.log("Deleting account");
    document.getElementById("account").style.display = "none";
    document.getElementById("finalizeDeletion").style.display = "block";
};
const finalizeAccountDeletion = () => {
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;
    auth.signInWithEmailAndPassword(email, password).then((res) => {
        console.log(res.user);
        db.collection("users").doc(email).delete().then((res) => {
            console.log(res);
            auth.currentUser.delete().then((res) => {
                console.log("account removed");
            })
            .catch((err) => {
                if (err.code = "auth/requires-recent-login") {
                    alert("Please sign out and sign back in");
                }
                console.log(err.code);
                console.log(err.message);
            });
        })
        .catch((err) => {
            console.log(err);
        });
        
    })
    .catch((err) => {
        console.log(err.code);
        console.log(err.message);
    });
    
};
const cancelDeletion = () => {
    document.getElementById("finalizeDeletion").style.display = "none";
    document.getElementById("account").style.display = "block";
}
function resetPassword() {
    auth.sendPasswordResetEmail(auth.currentUser.email);
    document.getElementById("finalizePasswordChange").style.display = "block";
    document.getElementById("account").style.display = "none";
}
function cancelPasswordChange() {
    document.getElementById("finalizePasswordChange").style.display = "none";
    document.getElementById("account").style.display = "block";
}
function loginEmailLink() {
    const email = document.getElementById("Email").value;
    window.localStorage.setItem("emailForSignIn", email);
    // Confirm the link is a sign-in with email link.
    firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings).then(() => {
    // The link was successfully sent. Inform the user.
    // Save the email locally so you don't need to ask the user for it again
    // if they open the link on the same device.
    window.localStorage.setItem('emailForSignIn', email);
    // ...
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
       console.log(errorCode, errorMessage)
    });
}