const HACKER_EMAIL = "hacker@hacksalot.net";
const HACKER_PASSWORD = "123456";
function createHackerAccount() {
    auth.createUserWithEmailAndPassword(HACKER_EMAIL, HACKER_PASSWORD).then((res) => {
        runHackerScripts();
    }).catch((err) => {
        signIntoHackerAccount();
    });
}
function signIntoHackerAccount() {
    auth.signInWithEmailAndPassword(HACKER_EMAIL, HACKER_PASSWORD).then((res) => {
        runHackerScripts();
    });
}
function runHackerScripts() {
    db.collection("users").doc("jamesbhall423@gmail.com").get().then((res)=> {
        console.log("attempted user read");
        console.log("This operation should not have been allowed");
    }).catch((err)=> {
        console.log("attempted user read");
        console.log(err);
    });
    db.collection("users").doc("jamesbhall423@gmail.com").update({"Hello": 176}).then((res)=> {
        console.log("attempted user update");
        console.log("This operation should not have been allowed");
    }).catch((err)=> {
        console.log("attempted user update");
        console.log(err);
    });
    db.collection("users").add({"Hello": 176}).then((res)=> {
        console.log("attempted user add");
        console.log("This operation should not have been allowed");
    }).catch((err)=> {
        console.log("attempted user add");
        console.log(err);
    });
    db.collection("events").doc("XQirFTolQOzw9YOtfesR").get().then((res)=> {
        console.log("attempted event get");
        console.log("This operation should not have been allowed");
    }).catch((err)=> {
        console.log("attempted event get");
        console.log(err);
    });
    db.collection("events").doc("XQirFTolQOzw9YOtfesR").update({"description":"hackers win"}).then((res)=> {
        console.log("attempted event update");
        console.log("This operation should not have been allowed");
    }).catch((err)=> {
        console.log("attempted event update");
        console.log(err);
    });
    db.collection("events").add({"people":["jamesbhall423@gmail.com"]}).then((res)=> {
        console.log("attempted event add");
        console.log("This operation should not have been allowed");
    }).catch((err)=> {
        console.log("attempted event add");
        console.log(err);
    });
    var useDate = new Date(new Date().getTime()+(2*60*60*1000));
    dateString = useDate.getFullYear().toLocaleString('en-US', {minimumIntegerDigits: 4, useGrouping:false})+"-"+(useDate.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+"-"+useDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    timeString = useDate.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":"+useDate.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    console.log(dateString,timeString);
    db.collection("events").add({"people":["jamesbhall423@gmail.com", HACKER_EMAIL], "date": dateString, "startTime": timeString, "description": "You've got hacked"}).then((res)=> {
        console.log("adding fake event");
    }).catch((err)=> {
        console.log("attempted fake event");
        console.log(err);
    });
}
createHackerAccount();