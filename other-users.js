elementCount = 0;
function remove(elementID) {
    console.log("Remove "+elementID+" pressed");
    email = document.getElementById('other_email'+elementID).textContent;
    removeFromDatabase(email);
    removeFromHTML(elementID);
}
function addInputOther() {
    console.log("Add Pressed");
    email = document.getElementById("input_email").value;
    authorized = document.getElementById("input_authorized").checked;
    addOtherUserToDatabase(email, authorized);
    addOtherToPage([email], [authorized]);
}
function setOtherAuthorization(elementID) {
    other_email = document.getElementById("other_email"+elementID).textContent;
    authorized = document.getElementById("user_authorized"+elementID).checked;
    console.log("Authorizing "+other_email + " to "+authorized);
    user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        data = res.data();
        other_access = data.other_access;
        console.log(other_access);
        if (authorized && !other_access.includes(other_email)) {
            other_access.push(other_email);
        }
        if (authorized) {
            console.log("Authorized");
        }
        if (other_access.includes(other_email)) {
            console.log(other_email+" in "+other_access);
        } else {
            console.log(other_email+" not in "+other_access)
        }
        if (!authorized && other_access.includes(other_email)) {
            console.log("removing other email: "+other_email+" "+other_access.indexOf(other_email));
            other_access.splice(other_access.indexOf(other_email),1);
        }
        console.log(other_access);
        db.collection("users").doc(user_email).update({"other_access": other_access}).then((res) => {
            console.log("data updated");
        });
    });
}
function addOtherUserToDatabase(other_email, authorization) {
    user_email = auth.currentUser.email;
    console.log("Adding "+other_email + " to database with status "+authorization);
    db.collection("users").doc(user_email).get().then((res) => {
        data = res.data();
        other_access = data.other_access;
        other_ref = data.other_ref;
        other_ref.push(other_email);
        if (authorization) {
            other_access.push(other_email);
        }
        db.collection("users").doc(user_email).update({"other_access": other_access, "other_ref": other_ref}).then((res) => {
            console.log("data updated");
        });
    });
}
function addOtherToPage(other_emails, user_authorized) {
    email = auth.currentUser.email;
    db.collection("users")
    .where(firebase.firestore.FieldPath.documentId(), "in", other_emails)
    .where("other_access","array-contains",email)
    .get()
    .then((res) => {
        console.log(res.docs.map((item) => {
            return {... item.data(), id: item.id};
        }));
        console.log(res.docs.length);
        docIDs = res.docs.map((item) => item.id);
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
    openingHTML = '<div class="user"> <div class = "user-item">';
    emailHTML = '<p id="other_email'+elementCount+'">'+other_email+'</p>';
    userAuthorizationHTML = '<input type = "checkbox" ';
    if (user_authorized) {
        userAuthorizationHTML+='checked='+user_authorized;
    }
    userAuthorizationHTML+=' id = "user_authorized'+elementCount+'" onclick = "setOtherAuthorization('+elementCount+')">';
    otherAuthorizationHTML = '<img src = "images/transparent_not_icon.png" alt="not authorized by other" id="other_authorized'+elementCount+'">';
    if (other_authorized) {
        otherAuthorizationHTML = '<img src="https://www.freeiconspng.com/uploads/check-confirm-ok-button-tick-yes-icon--18.png" alt="authorized by other" id=other_authorized'+elementCount+'">';
    }
    deleteHTML = '<input type = "image" src = "images/delete.png" alt="delete user from list" onclick = "remove('+elementCount+')">';
    closingHTML = '</div></div>';
    toAddHTML = openingHTML+emailHTML+userAuthorizationHTML+otherAuthorizationHTML+deleteHTML+closingHTML;
    toAdd = document.createElement("li");
    toAdd.id = "other_user"+elementCount;
    toAdd.innerHTML = toAddHTML
    scrollList = document.getElementById("other_user_scroll_list");
    scrollList.appendChild(toAdd);
}
function removeFromDatabase(other_email) {
    console.log("Removing "+other_email+" from database");
    user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        data = res.data();
        other_access = data.other_access;
        other_ref = data.other_ref;
        console.log(other_access);
        console.log(other_ref);
        if (other_access.includes(other_email)) {
            other_access.splice(other_access.indexOf(other_email),1);
        }
        if (other_ref.includes(other_email)) {
            other_ref.splice(other_ref.indexOf(other_email),1);
        }
        console.log(other_access);
        console.log(other_ref);
        db.collection("users").doc(user_email).update({"other_access": other_access, "other_ref": other_ref}).then((res) => {
            console.log("data updated");
        });
    });
}
function removeFromHTML(elementID) {
    document.getElementById("other_user"+elementID).remove();
}
function buildFromDatabase(user) {
    user_email = user.email;
    db.collection("users").doc(user_email).get().then((res) => {
        data = res.data();
        other_ref = data.other_ref;
        other_access = data.other_access;
        console.log(other_ref);
        console.log(other_access);
        user_authorizations = other_ref.map((other_email) => {
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
