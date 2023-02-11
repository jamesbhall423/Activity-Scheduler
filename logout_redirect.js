test_redirect = (user) => {
    if (!user) {
        console.log("Hello");
        console.log(user);
        redirect("index.html");
    } else {
        initializeUserData();
    }
};
test_redirect(getAuthState());
firebase.auth().onAuthStateChanged(test_redirect);