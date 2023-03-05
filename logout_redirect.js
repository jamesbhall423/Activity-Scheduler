test_redirect = (user) => {
    if (!user) {
        redirect("index.html");
    } else {
        initializeUserData();
    }
};
test_redirect(getAuthState());
firebase.auth().onAuthStateChanged(test_redirect);