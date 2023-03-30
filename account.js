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
        console.log("Email sent");
        document.getElementById("signin").style.display = "none";
        document.getElementById("email_link_waiting").style.display = "block";
        // ...
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
       console.log(errorCode, errorMessage)
    });
}
function continue_after_verification() {
    test_redirect(auth.currentUser);
}
function cancel_verification() {
    logout();
    document.getElementById("signin").style.display = "grid";
    document.getElementById("verification").style.display = "none";
}
function cancel_email_link() {
    window.localStorage.removeItem('emailForSignIn', email);
    document.getElementById("signin").style.display = "grid";
    document.getElementById("email_link_waiting").style.display = "none";
}
// Confirm the link is a sign-in with email link.
if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    // Additional state parameters can also be passed via URL.
    // This can be used to continue the user's intended action before triggering
    // the sign-in operation.
    // Get the email if available. This should be available if the user completes
    // the flow on the same device where they started it.
    var email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      // User opened the link on a different device. To prevent session fixation
      // attacks, ask the user to provide the associated email again. For example:
      email = window.prompt('Please provide your email for confirmation');
    }
    // The client SDK will parse the code from the link for you.
    firebase.auth().signInWithEmailLink(email, window.location.href)
      .then((result) => {
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
        // You can access the new user via result.user
        // Additional user info profile not available via:
        // result.additionalUserInfo.profile == null
        // You can check if the user is new or existing:
        // result.additionalUserInfo.isNewUser
      })
      .catch((error) => {
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
      });
  }