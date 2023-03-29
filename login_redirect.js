async function test_redirect(user) {
    if (user) {
        if (REQUIRE_EMAIL_VERIFICATION&&!user.emailVerified) {
            signIn = document.getElementById("signin");
            verification = document.getElementById("verification");
            if (signIn) {
                user.sendEmailVerification().then((res) => {
                    document.getElementById("verification_email_sending_status").textContent = "Email sent";
                    signIn.style.display = "none";
                    verification.style.display = "block";
                }).catch((err) => {
                    console.log(err);
                    alert("Error attempting to send email");
                });
            }
        } else {
            redirect("activity-scheduler.html");
        }
        
    }
}
test_redirect(getAuthState());
firebase.auth().onAuthStateChanged(test_redirect);