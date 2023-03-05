elementCount = 0;
function remove(elementID) {
    var email = document.getElementById('other_email'+elementID).textContent;
    removeFromDatabase(email);
    removeFromHTML(elementID);
}
function addInputOther() {
    var email = document.getElementById("input_email").value;
    var authorized = document.getElementById("input_authorized").checked;
    addOtherUserToDatabase(email, authorized);
    addOtherToPage([email], [authorized]);
}
function setOtherAuthorization(elementID) {
    var other_email = document.getElementById("other_email"+elementID).textContent;
    var authorized = document.getElementById("user_authorized"+elementID).checked;
    var user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        data = res.data();
        other_access = data.other_access;
        if (authorized && !other_access.includes(other_email)) {
            other_access.push(other_email);
        }
        if (!authorized && other_access.includes(other_email)) {
            other_access.splice(other_access.indexOf(other_email),1);
        }
        db.collection("users").doc(user_email).update({"other_access": other_access}).then((res) => {
            console.log("data updated");
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}
function addOtherUserToDatabase(other_email, authorization) {
    var user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var other_access = data.other_access;
        var other_ref = data.other_ref;
        other_ref.push(other_email);
        if (authorization) {
            other_access.push(other_email);
        }
        db.collection("users").doc(user_email).update({"other_access": other_access, "other_ref": other_ref}).then((res) => {
            console.log("data updated");
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}
function addOtherToPage(other_emails, user_authorized) {
    var email = auth.currentUser.email;
    db.collection("users")
    .where("other_access","array-contains",email)
    .get()
    .then((res) => {
        var docIDs = res.docs.map((item) => item.id).filter((id)=> other_emails.includes(id));
        other_emails.map((other_email,i) => {
            addUserHTML(other_email,user_authorized[i],docIDs.includes(other_email));
        });
    })
    .catch((err) => {
        console.log(err);
    });
}
function addUserHTML(other_email,user_authorized,other_authorized) {
    elementCount += 1;
    var openingHTML = '<div class="user"> <div class = "user-item">';
    var emailHTML = '<p id="other_email'+elementCount+'">'+other_email+'</p>';
    var userAuthorizationHTML = '<input type = "checkbox" ';
    if (user_authorized) {
        userAuthorizationHTML+='checked='+user_authorized;
    }
    userAuthorizationHTML+=' id = "user_authorized'+elementCount+'" onclick = "setOtherAuthorization('+elementCount+')">';
    var otherAuthorizationHTML = '<img src = "images/transparent_not_icon.png" alt="not authorized by other" id="other_authorized'+elementCount+'">';
    if (other_authorized) {
        otherAuthorizationHTML = '<img src="https://www.freeiconspng.com/uploads/check-confirm-ok-button-tick-yes-icon--18.png" alt="authorized by other" id=other_authorized'+elementCount+'">';
    }
    var deleteHTML = '<input type = "image" src = "images/delete.png" alt="delete user from list" onclick = "remove('+elementCount+')">';
    var closingHTML = '</div></div>';
    var toAddHTML = openingHTML+emailHTML+userAuthorizationHTML+otherAuthorizationHTML+deleteHTML+closingHTML;
    var toAdd = document.createElement("li");
    toAdd.id = "other_user"+elementCount;
    toAdd.innerHTML = toAddHTML
    var scrollList = document.getElementById("other_user_scroll_list");
    scrollList.appendChild(toAdd);
}
function removeFromDatabase(other_email) {
    const user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var other_access = data.other_access;
        var other_ref = data.other_ref;
        if (other_access.includes(other_email)) {
            other_access.splice(other_access.indexOf(other_email),1);
        }
        if (other_ref.includes(other_email)) {
            other_ref.splice(other_ref.indexOf(other_email),1);
        }
        db.collection("users").doc(user_email).update({"other_access": other_access, "other_ref": other_ref}).then((res) => {
            console.log("data updated");
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}
function removeFromHTML(elementID) {
    document.getElementById("other_user"+elementID).remove();
}
function buildFromDatabase(user) {
    const user_email = user.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var other_ref = data.other_ref;
        var other_access = data.other_access;
        var user_authorizations = other_ref.map((other_email) => {
            return other_access.includes(other_email);
        });
        addOtherToPage(other_ref,user_authorizations);
    }).catch((err) => {
        console.log(err);
    });
}
if (auth.currentUser) {
    buildFromDatabase(auth.currentUser);
} else {
    auth.onAuthStateChanged(buildFromDatabase);
}
