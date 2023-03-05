const firebaseConfig = {
  apiKey: "AIzaSyDAn3unLwDj4jQcDxw6oi7iF7teNIBTkBQ",
  authDomain: "activity-scheduler-database.firebaseapp.com",
  projectId: "activity-scheduler-database",
  storageBucket: "activity-scheduler-database.appspot.com",
  messagingSenderId: "309597686543",
  appId: "1:309597686543:web:33c1353919850c56ea8c7a",
  measurementId: "G-3R95HWSPJG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();
const auth = app.auth();

function testAndDeletePastEvent(event_doc) {
  var docData = event_doc.data();
  var currentTime = new Date();
  if (new Date(docData.startTime+" "+docData.date)<currentTime) {
    db.collection("events").doc(event_doc.id).delete().catch((err)=> console.log(err));
    return false;
  } else {
    return true;
  }
}
function shortenUserEventList(data, eventList, use_event_ids, email) {
  if (use_event_ids.length < eventList.length) {
    var shortened_events = eventList.filter((event_id)=>use_event_ids.includes(event_id));
    var shortened_events_seen = data.events_seen.filter((event_id)=>use_event_ids.includes(event_id));
    var shortened_events_deleted = data.events_deleted.filter((event_id)=>use_event_ids.includes(event_id));
    db.collection("users").doc(email).update({"events": shortened_events, "events_seen": shortened_events_seen, "events_deleted": shortened_events_deleted}).catch((err)=> {console.log(err);});
  }
}

function removePastEvents(doc, email) {
  var data = doc.data();
  var eventList = data.events;
  db.collection("events").where("people","array-contains",email).get().then((res) => {
    var active_events = res.docs.filter((item) => eventList.includes(item.id));
    var use_event_ids = active_events.filter(testAndDeletePastEvent).map((eventDoc => eventDoc.id));
    shortenUserEventList(data, eventList, use_event_ids, email);
  }).catch((err)=> {
    console.log(err);
  });
}

function initializeUserData() {
  if (auth.currentUser) {
    var email = auth.currentUser.email;
    db.collection("users").doc(email).get().then((doc) => {
      if (!doc.exists) {
          db.collection("users").doc(email).set({"other_access": [], "other_ref": [], "rules": [], "events": [], "events_seen": [], "events_deleted": []}).then((res) => {
              console.log("User data created");
          })
          .catch((err) => {
              console.log(err);
          });
      } else {
        removePastEvents(doc, email);
      }
    }).catch((err)=> {
      console.log(err);
  });
  }
  
}

function capitalize(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}
function createElementWithFeatures(type, features) {
  var out = document.createElement(type);
  Object.keys(features).map((key)=>out[key]=features[key]);
  return out;
}
function createContainerizedInput(classname, features) {
  var outer = createElementWithFeatures("div", {"class": classname});
  var inner = createElementWithFeatures("input", features);
  outer.appendChild(inner);
  return outer;
}
function toRegularTime(militaryTime) {
  var sections = militaryTime.split(":");
  var part1 = parseInt(sections[0])%12;
  if (part1 == 0) {
    part1 = 12;
  }
  var interval = " AM";
  if (sections[0]>="12") {
    interval = " PM";
  }
  return part1.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+":"+sections[1]+interval;
}
function toMilitaryTime(regularTime) {
  var intervalSections = regularTime.split(" ");
  var clockSections = intervalSections[0].split(":");
  var hour = parseInt(clockSections[0]);
  if (hour == 12) {
    hour -= 12;
  }
  if (intervalSections[1]=="PM") {
    hour += 12;
  }
  return hour.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) +":"+clockSections[1];
}