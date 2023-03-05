userData = [];
otherDocs = [];
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DISPLAYTIMES = getDisplayTimes();
function getDisplayTimes() {
    var output = [];
    for (var hour = 0; hour < 24; hour++) {
        output.push((hour).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":00");
        output.push((hour).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":30");
    }
    return output;
}

function dateToNumber(string) {
    var sections = string.split("-");
    return parseInt(sections[0]+sections[1]+sections[2]);
}
function timeToNumber(string) {
    var sections = string.split(":");
    return parseInt(sections[0]+sections[1]);
}
function numberToTime(num) {
    var time = Math.floor(num/100).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":"+(num%100).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    return time;
}
function dateChronological(date1,date2) {
    return dateToNumber(date2) >= dateToNumber(date1);
}
function timeChronological(time1,time2) {
    return timeToNumber(time2) >= timeToNumber(time1);
}

function ruleContains(rule, date, time, weekday) {
    return ruleContainsDate(rule, date, weekday) && timeChronological(rule.fromTime,time) && timeChronological(time, rule.toTime);
}
function ruleContainsDate(rule, date, weekday) {
    return dateChronological(rule.fromDate,date) && dateChronological(date, rule.toDate) && rule["days"][weekday] && rule.isActive;
}
function validRules(ruleSet, date, time, weekday) {
    return ruleSet.filter((rule)=>ruleContains(rule,date,time,weekday));
}
function atLeastOneRuleContains(ruleSet, date, time, weekday) {
    var output = validRules(ruleSet, date, time, weekday);
    return output.length>0;
}
function dateTimeSatisfiesAllActiveUsers(date, time, weekday) {
    return atLeastOneRuleContains(userData.rules, date, time, weekday) && otherDocs.filter((doc)=>{return document.getElementById("using_"+doc.id).checked&&!atLeastOneRuleContains(doc.data().rules,date, time, weekday)}).length==0;
}
function atLeastOneRuleContainsDate(ruleSet, date, weekday) {
    return ruleSet.filter((rule)=>ruleContainsDate(rule,date,weekday)).length>0;
}
function dateSatisfiesAllActiveUsers(date, weekday) {
    return atLeastOneRuleContainsDate(userData.rules, date, weekday) && otherDocs.filter((doc)=>{return document.getElementById("using_"+doc.id).checked&&!atLeastOneRuleContainsDate(doc.data().rules,date, weekday)}).length==0;
}
function getWeekday(date, time) {
    var dateObj = new Date(date+" "+time);
    var weekday = WEEKDAYS[dateObj.getDay()];
    return weekday;
}
function redisplayItems() {
    var date = document.getElementById("activity_date").value;
    var time = document.getElementById("activity_time").value;
    if (date && time) {
        document.getElementById("activity_times").textContent="";
        var weekday = getWeekday(date, time);
        if (dateSatisfiesAllActiveUsers(date, weekday)) {
            DISPLAYTIMES.filter((displayTime) => timeChronological(time, displayTime)).map((displayTime) => {
                addTimeHTML(displayTime, dateTimeSatisfiesAllActiveUsers(date, displayTime, weekday));
            });
        }
    }
}
function addTimeHTML(displayMilitaryTime, canCreateActivity) {
    var displayRegularTime = toRegularTime(displayMilitaryTime);
    var openingHTML = "<div>";
    var labelHTML = "<label>"+displayRegularTime+"</label>";
    var createArg = "'"+displayMilitaryTime+"'";
    var inputHTML = '<input type = "image" src = "images/output-onlinepngtools-add.png" alt="create activity" onclick = "createActivity('+createArg+')">';
    var closingHTML = "</div>";
    var toAdd = document.createElement("li");
    if (canCreateActivity) {
        toAdd.innerHTML = openingHTML+labelHTML+inputHTML+closingHTML; 
    } else {
        toAdd.innerHTML = openingHTML+labelHTML+closingHTML; 
    }
    var scrollList = document.getElementById("activity_times");
    scrollList.appendChild(toAdd);
}
function otherActiveDocs() {
    return otherDocs.filter((doc)=>{return document.getElementById("using_"+doc.id).checked});
}
function activeUsers() {
    var output = otherActiveDocs().map((doc)=>doc.id);
    output.push(auth.currentUser.email);
    return output;
}
function createActivity(startTime) {
    var date = document.getElementById("activity_date").value;
    document.getElementById("activity-scheduler").style.display = "none";
    document.getElementById("create_activity").style.display = "block";
    document.getElementById("activity_start").textContent = date+"\t"+toRegularTime(startTime);
    var latestEndTime = getLatestEndTime(date, startTime);
    document.getElementById("activity_end").min = toRegularTime(startTime);
    document.getElementById("activity_end").max = latestEndTime;
    document.getElementById("end_label").textContent = "END up to "+toRegularTime(latestEndTime);
    document.getElementById("activity_participants").textContent = activeUsers().reduce((store,current, index)=>{
        if (index==0) {
            return store+current;
        } else {
            return current+", "+store;
        }
    },"");
}
function activeDataItems() {
    var items = otherActiveDocs().map((doc) => doc.data());
    items.push(userData);
    return items;
}
function getLatestEndTime(date, startTime) {
    return numberToTime(Math.min(... activeDataItems().map((data) => {
        return Math.max(... validRules(data.rules,date,startTime,getWeekday(date,startTime)).map((rule) => {
            return timeToNumber(rule.toTime);
        }));
    })));
}
function cancelActivityCreation() {
    document.getElementById("create_activity").style.display = "none";
    document.getElementById("activity-scheduler").style.display = "block";
}
function finishCreatingEvent() {
    var activityEndElement = document.getElementById("activity_end");
    var startDateTime = document.getElementById("activity_start").textContent.split("\t");
    var endTime = activityEndElement.value;
    if (endTime < activityEndElement.min || endTime > activityEndElement.max) {
        alert("End time must be between "+activityEndElement.min+" and "+activityEndElement.max);
    } else {
        var date = startDateTime[0];
        var startTime = toMilitaryTime(startDateTime[1]);
        var endTime = document.getElementById("activity_end").value
        var description = document.getElementById("activity_description").value;
        var users = activeUsers();
        db.collection("events").add({"people": users, "date": date, "startTime": startTime, "endTime": endTime, "description": description}).then((res) => {
            eventId = res.id;
            users.map((email)=>updateUserEventData(email, eventId));
        }).catch((err) => {
            console.log(err);
        });
        document.getElementById("create_activity").style.display = "none";
        document.getElementById("activity-scheduler").style.display = "block";
    }
    
}
function updateUserEventData(email, eventId) {
    db.collection("users").doc(email).get().then((res) => {
        var events = res.data().events;
        events.push(eventId);
        db.collection("users").doc(email).update({"events": events}).then((res) => {
            console.log("Data updated");
        })
        .catch((err) => {
            console.log(err);
        });;
    });
}
function addUserHTML(other_email) {
    var toAddHTML = '<div><label>'+other_email+'</label><input id="using_'+other_email+'" type="checkbox" onclick="redisplayItems()"></input></div>';
    var toAdd = document.createElement("li");
    toAdd.innerHTML = toAddHTML;
    var scrollList = document.getElementById("other_activity_members");
    scrollList.appendChild(toAdd);
}
function addOtherUsersToPage(other_emails) {
    const email = auth.currentUser.email;
    db.collection("users")
    .where("other_access","array-contains",email)
    .get()
    .then((res) => {
        otherDocs = res.docs.filter((item)=> other_emails.includes(item.id));
        var docIDs = res.docs.map((item) => item.id);
        other_emails.map((other_email) => {
            if (docIDs.includes(other_email)) {
                addUserHTML(other_email);
            }
        });
    })
    .catch((err) => {
        console.log(err);
    });
}
function buildFromDatabase(user) {
    const user_email = user.email;
    db.collection("users").doc(user_email).get().then((res) => {
        data = res.data();
        other_access = data.other_access;
        userData = data;
        addOtherUsersToPage(other_access);
    }).catch((err) => {
        console.log(err);
    });
    document.getElementById("activity_date").addEventListener("change",redisplayItems);
    document.getElementById("activity_time").addEventListener("change",redisplayItems);
}
if (auth.currentUser) {
    buildFromDatabase(auth.currentUser);
} else {
    auth.onAuthStateChanged(buildFromDatabase);
}