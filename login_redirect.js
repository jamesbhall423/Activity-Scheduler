test_redirect = (user) => {
    if (user) {
        redirect("activity-scheduler.html");
    }
};
test_redirect(getAuthState());
firebase.auth().onAuthStateChanged(test_redirect);