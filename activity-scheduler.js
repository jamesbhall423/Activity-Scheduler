userData = [];
otherDocs = [];
currentEventData = {}; // Rule that event data be treated as negative rule conflicts somewhat with rule that other users do not have access to each others' event data.
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DISPLAYTIMES = getDisplayTimes();
const OTHER_ACCESS_EMPTY_MESSAGE = "No other users registered. Click to authorize and connect with your buddies";
const OTHER_ACCESS_NOT_RETURNED_MESSAGE = "None of your buddies returned your authorization. Click to check on their status.";
const SCHEDULE_AVAILABILITY_UNDEFINED_MESSAGE = "Please set up your availability before continuing";
const SCHEDULE_DATE_UNDEFINED_MESSAGE = "Enter a date and time to search for times that work for everyone";
const NO_AVAILABILITY_MESSAGE = "No available slots on the given date";
const MAX_DATE_NUM = 99999999;
const MAX_TIME_NUM = 9999;
var monthIndex = getCurrentMonth();
function getRules(data) {
    output = [];
    for (let rule of data.rules) {
        output.push(rule);
    }
    if (data.eventRules) {
        for (let rule of data.eventRules) {
            output.push(rule);
        }
    }
    return output;
}
function getEventRule(date, startTime, endTime, eventID) {
    rule = {};
    rule["days"] = {"Sunday": true, "Monday": true, "Tuesday": true, "Wednesday": true, "Thursday": true, "Friday": true, "Saturday": true};
    rule["fromDate"] = date;
    rule["toDate"] = date;
    rule["fromTime"] = startTime;
    rule["toTime"] = endTime;
    rule["isActive"] = true;
    rule["negSelect"] = "negative";
    rule["eventID"] = eventID;
    return rule;
}
function getDisplayTimes() {
    var output = [];
    for (var hour = 0; hour < 24; hour++) {
        output.push((hour).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":00");
        output.push((hour).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":30");
    }
    return output;
}

function dateToNumber(string, defaultVal) {
    if (string) {
        var sections = string.split("-");
        return parseInt(sections[0]+sections[1]+sections[2]);
    } else {
        return defaultVal;
    }
}
function timeToNumber(string, defaultVal) {
    if (string) {
        var sections = string.split(":");
        return parseInt(sections[0]+sections[1]);
    } else {
        return defaultVal;
    }
}
function numberToTime(num) {
    var time = Math.floor(num/100).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":"+(num%100).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    return time;
}
function dateChronological(date1,date2) {
    return dateToNumber(date2, MAX_DATE_NUM) >= dateToNumber(date1, 0);
}
function timeChronological(time1,time2) {
    return timeToNumber(time2, MAX_TIME_NUM) >= timeToNumber(time1, 0);
}

function ruleContains(rule, date, time, weekday) {
    return ruleContainsDate(rule, date, weekday) && timeChronological(rule.fromTime,time) && timeChronological(time, rule.toTime);
}
function ruleContainsDate(rule, date, weekday) {
    if (!rule) {
        return false;
    }
    return dateChronological(rule.fromDate,date) && dateChronological(date, rule.toDate) && rule["days"][weekday] && rule.isActive;
}
function validRules(ruleSet, date, time, weekday) {
    return ruleSet.filter((rule)=>ruleContains(rule,date,time,weekday));
}
function ruleStartsAfter(rule,date,time,weekday) {
    return ruleContainsDate(rule, date, weekday) && timeChronological(time,rule.fromTime);
}
function rulesStartingAfter(ruleSet, date, time, weekday) {
    return ruleSet.filter((rule)=>ruleStartsAfter(rule,date,time,weekday));
}
function atLeastOneRuleContains(ruleSet, date, time, weekday) {
    var output = validRules(ruleSet, date, time, weekday);
    return output.length>0;
}
function isNegativeRule(rule) {
    return rule && rule.negSelect && rule.negSelect == "negative";
}
function positiveRules(ruleSet) {
    return ruleSet.filter((rule) => !isNegativeRule(rule));
}
function negativeRules(ruleSet) {
    return ruleSet.filter((rule) => isNegativeRule(rule));
}
function dateTimeSatisfiesAllActiveUsers(date, time, weekday) {
    if (atLeastOneRuleContains(negativeRules(getRules(userData)), date, time, weekday) || otherDocs.filter((doc)=>{return document.getElementById("using_"+doc.id).checked&&atLeastOneRuleContains(negativeRules(getRules(doc.data())),date, time, weekday)}).length>0) {
        return false;
    }
    return atLeastOneRuleContains(positiveRules(getRules(userData)), date, time, weekday) && otherDocs.filter((doc)=>{return document.getElementById("using_"+doc.id).checked&&!atLeastOneRuleContains(positiveRules(getRules(doc.data())),date, time, weekday)}).length==0;
}
function atLeastOneRuleContainsDate(ruleSet, date, weekday) {
    return ruleSet.filter((rule)=>ruleContainsDate(rule,date,weekday)).length>0;
}
function dateSatisfiesAllActiveUsers(date, weekday) {
    return atLeastOneRuleContainsDate(positiveRules(getRules(userData)), date, weekday) && otherDocs.filter((doc)=>{return document.getElementById("using_"+doc.id).checked&&!atLeastOneRuleContainsDate(positiveRules(getRules(doc.data())),date, weekday)}).length==0;
}
function getWeekday(date, time) {
    var dateObj = new Date(date+" "+time);
    var weekday = WEEKDAYS[dateObj.getDay()];
    return weekday;
}
function redisplayItems() {
    var date = document.getElementById("activity_date").textContent;
    var time = document.getElementById("activity_time").value;
    if (date && time && date != "Set Date") {
        document.getElementById("activity_times").textContent="";
        var weekday = getWeekday(date, time);
        if (dateSatisfiesAllActiveUsers(date, weekday)) {
            DISPLAYTIMES.filter((displayTime) => timeChronological(time, displayTime)).map((displayTime) => {
                addTimeHTML(displayTime, dateTimeSatisfiesAllActiveUsers(date, displayTime, weekday));
            });
        } else {
            buildScheduleInstructions(NO_AVAILABILITY_MESSAGE);
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
    var date = document.getElementById("activity_date").textContent;
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
function getFirstListedNegativeTime(date, startTime) {
    return numberToTime(Math.min(... activeDataItems().map((data) => {
        var out = Math.max(... rulesStartingAfter(negativeRules(getRules(data)),date,startTime,getWeekday(date,startTime)).map((rule) => {
            var out2 = timeToNumber(rule.fromTime,MAX_TIME_NUM);
            return out2;
        }));
        if (out<0) {
            return MAX_TIME_NUM;
        }
        return out;
    })));
}
function getLatestEndTime(date, startTime) {
    var negEndTime = getFirstListedNegativeTime(date, startTime);
    var posEndTime = numberToTime(Math.min(... activeDataItems().map((data) => {
        return Math.max(... validRules(positiveRules(data.rules),date,startTime,getWeekday(date,startTime)).map((rule) => {
            return timeToNumber(rule.toTime,MAX_TIME_NUM);
        }));
    })));
    if (negEndTime < posEndTime) {
        return negEndTime;
    } else {
        return posEndTime;
    }
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
            var eventRule = getEventRule(date,startTime,endTime,res.id);
            if (!userData.eventRules) {
                userData.eventRules = [];
            }
            userData.eventRules.push(eventRule);
            users.map((email)=>updateUserEventData(email, eventRule));
            redisplayItems();
        }).catch((err) => {
            console.log(err);
        });
        document.getElementById("create_activity").style.display = "none";
        document.getElementById("activity-scheduler").style.display = "block";
    }
    
}
function updateUserEventData(email, eventRule) {
    db.collection("users").doc(email).get().then((res) => {
        var data = res.data();
        var events = data.events;
        var eventRules = data.eventRules;
        if (!eventRules) {
            eventRules = [];
        }
        eventRules.push(eventRule);
        events.push(eventRule.eventID);
        setEventCenterLinkHighlight(events, data.events_seen, data.events_deleted);
        db.collection("users").doc(email).update({"events": events, "eventRules": eventRules}).then((res) => {
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
    if (other_emails.length == 0) {
        buildOtherUserInstructions(OTHER_ACCESS_EMPTY_MESSAGE);
    } else {
        const email = auth.currentUser.email;
        db.collection("users")
        .where("other_access","array-contains",email)
        .get()
        .then((res) => {
            otherDocs = res.docs.filter((item)=> other_emails.includes(item.id));
            var docIDs = res.docs.map((item) => item.id);
            var toAdd = other_emails.filter((other_email) => docIDs.includes(other_email));
            toAdd.map((other_email) => addUserHTML(other_email));
            if (toAdd.length == 0) {
                buildOtherUserInstructions(OTHER_ACCESS_NOT_RETURNED_MESSAGE);
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }
}
function buildFromDatabase(user) {
    const user_email = user.email;
    db.collection("users").doc(user_email).get().then((res) => {
        data = res.data();
        other_access = data.other_access;
        userData = data;
        addOtherUsersToPage(other_access);
        if (data.rules.length == 0) {
            buildScheduleInstructionLink(SCHEDULE_AVAILABILITY_UNDEFINED_MESSAGE);
        } else {
            buildScheduleInstructions(SCHEDULE_DATE_UNDEFINED_MESSAGE);
        }
    }).catch((err) => {
        console.log(err);
        if (err) {
            buildOtherUserInstructions(OTHER_ACCESS_EMPTY_MESSAGE);
            buildScheduleInstructionLink(SCHEDULE_AVAILABILITY_UNDEFINED_MESSAGE);
        }
    });
    document.getElementById("activity_time").addEventListener("change",redisplayItems);
}
function buildOtherUserInstructions(message) {
    toAddElement = document.createElement("p");
    toAddElement.innerHTML = '<a href = "other-users.html" class = "special_instructions_link">'+message+'</a>';
    document.getElementById("other_activity_members").appendChild(toAddElement);
}
function buildScheduleInstructionLink(message) {
    toAddElement = document.createElement("p");
    toAddElement.innerHTML = '<a href = "schedule-rules.html" class = "special_instructions_link">'+message+'</a>';
    document.getElementById("activity_times").appendChild(toAddElement);
}
function buildScheduleInstructions(message) {
    toAddHTML = '<p class = "special_instructions_link">'+message+'</p>';
    document.getElementById("activity_times").innerHTML = toAddHTML;
}
function getCurrentMonth() {
    return new Date().getMonth();
}
function buildDateDisplay() {
    var currentTime = new Date();
    var year = currentTime.getFullYear();
    if (monthIndex < currentTime.getMonth()) {
        year+=1;
    }
    document.getElementById("event_creation_year").textContent = year;
    document.getElementById("event_creation_month").textContent = MONTHS[monthIndex];
    var days_week_start = new Date(year,monthIndex,1).getDay();
    var days_in_month = new Date(year, monthIndex+1, 0).getDate();
    var days_in_prior_month = new Date(year, monthIndex, 0).getDate();
    var toAddHTML = "";
    for (let i = days_in_prior_month-days_week_start; i < days_in_prior_month; i++) {
        args = "'"+getDateString(year, monthIndex-1, i+1)+"'";
        toAddHTML += '<button onclick = "setDate('+args+')" class = "priorMonthDateButton';
        toAddHTML += addRuleSatisfactionClassHTML(monthIndex-1,i+1,year);
        toAddHTML += '">'+(i+1)+'</button>';
    }
    for (let i = 1; i <= days_in_month; i++) {
        args = "'"+getDateString(year, monthIndex, i)+"'";
        toAddHTML += '<button onclick = "setDate('+args+')" class = "';
        toAddHTML += addRuleSatisfactionClassHTML(monthIndex,i,year);
        toAddHTML += '">'+i+'</button>';
    }
    document.getElementById("event_creation_day").innerHTML = toAddHTML;
}
function addRuleSatisfactionClassHTML(month, day, year) {
    var date = new Date(year, month, day);
    var weekday = WEEKDAYS[date.getDay()];
    var dateString = getDateString(year, month, day);
    if (dateSatisfiesAllActiveUsers(dateString, weekday)) {
        return "";
    } else {
        return ' irrelevantMonthDateButton';
    }

}
function setDate(dateString) {
    document.getElementById("activity_date").textContent = dateString;
    redisplayItems();
    cancelSetDate();
}
function getDateString(year, month, day) {
    var date = new Date(year, month, day);
    return date.getFullYear()+"-"+(date.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+"-"+date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
}
function cancelSetDate() {
    document.getElementById("date-display").style.display = "none";
    document.getElementById("activity-scheduler").style.display = "block";
}
function prevMonth() {
    monthIndex -= 1;
    if (monthIndex<0) {
        monthIndex += 12;
    }
    buildDateDisplay(monthIndex);
}
function nextMonth() {
    monthIndex = (monthIndex+1) % 12;
    buildDateDisplay(monthIndex);
}
function dateWindow() {
    buildDateDisplay();
    document.getElementById("activity-scheduler").style.display = "none";
    document.getElementById("date-display").style.display = "block";
}
if (auth.currentUser) {
    buildFromDatabase(auth.currentUser);
} else {
    auth.onAuthStateChanged(buildFromDatabase);
}