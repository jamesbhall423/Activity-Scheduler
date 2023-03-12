function displayDate(date_in) {
    parts = date_in.split("-");
    return parts[1]+"/"+parts[2]+"/"+parts[0].substring(2);
}

function deleteEvent(event_id) {
    var user_email = auth.currentUser.email;
    console.log("deleting "+event_id);
    db.collection("users").doc(user_email).get().then((res)=> {
        var event_list = res.data().events_deleted;
        event_list.push(event_id);
        db.collection("users").doc(user_email).update({"events_deleted": event_list}).then((res)=> {
            console.log("event registered deleted in database");
        }).catch((err) => {
            console.log(err);
        });
        setEventCenterLinkHighlight(res.data().events, res.data().events_seen, event_list);
    }).catch((err) => {
        console.log(err);
    });
    document.getElementById("event_"+event_id).remove();
}

function addEventToPage(event, events_seen) {
    var data = event.data();
    var listElement = document.createElement("li");
    listElement.id = "event_"+event.id;
    var time = toRegularTime(data.startTime);
    var deleteOnclick = "deleteEvent('"+event.id+"')";
    toAddHTML = '<div class="notification"><div>'+time+' '+displayDate(data.date)+'</div> <div>'+data.description+'</div> <input type = "image" src="images/delete.png" alt = "delete event notification" onclick="'+deleteOnclick+'"></div>';
    listElement.innerHTML = toAddHTML;
    document.getElementById("notification-scroll-list").appendChild(listElement);
    
}

function buildFromDatabase(user) {
    var user_email = user.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var events = data.events;
        var events_seen = data.events_seen;
        var events_deleted = data.events_deleted;
        read_ids = events.filter((item) => !(events_deleted.includes(item)));
        db.collection("events").where("people","array-contains",user_email).get().then((res)=> {
            res.docs.filter((item)=> read_ids.includes(item.id)).map((item)=>addEventToPage(item, events_seen));
        }).catch((err) => {
            console.log(err);
        });
        db.collection("users").doc(user_email).update({"events_seen": events}).then((res)=> {
            console.log("All events recorded as being seen");
        }).catch((err) => {
            console.log(err);
        });
        setEventCenterLinkHighlight(events, events, events_deleted);
    }).catch((err) => {
        console.log(err);
    });
}
if (auth.currentUser) {
    buildFromDatabase(auth.currentUser);
} else {
    auth.onAuthStateChanged(buildFromDatabase);
}