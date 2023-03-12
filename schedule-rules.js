const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function remove(elementID) {
    removeFromDatabase(elementID);
    removeFromHTML(elementID);
}
function addInputRule() {
    var user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var ruleset = data.rules;
        var rule = {"days": {"Sunday": false,"Monday": false,"Tuesday": false,"Wednesday": false,"Thursday": false,"Friday": false,"Saturday": false, "isActive": true}};
        var ruleIndex = 0;
        while (ruleset[ruleIndex]) {
            ruleIndex++;
        }
        ruleset[ruleIndex] = rule;
        db.collection("users").doc(user_email).update({"rules": ruleset}).then((res) => {
            console.log("data updated");
        }).catch((err) => {
            console.log(err);
        });
        addRuleHTML(ruleIndex, rule);
    });
}
function updateElementInDatabase(elementIndex, elementReference, elementValue, isWeekday) {
    var user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var ruleset = data.rules;
        if (isWeekday) {
            ruleset[elementIndex]["days"][elementReference] = elementValue;
        } else {
            ruleset[elementIndex][elementReference] = elementValue;
        }
        db.collection("users").doc(user_email).update({"rules": ruleset}).then((res) => {
            console.log("data updated");
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}
function updateCheckmark(elementReference, elementIndex, elementID, isWeekday) {
    var checked = document.getElementById(elementID).checked;
    updateElementInDatabase(elementIndex,elementReference,checked, isWeekday);
}
function updateDataEntry(elementReference, elementIndex, elementID) {
    var value = document.getElementById(elementID).value;
    updateElementInDatabase(elementIndex,elementReference,value);
}
function addRuleToPage(rules) {
    Object.entries(rules).map((rule, index) => addRuleHTML(index, rules[index]));
}
function addRuleHTML(ruleKey, rule) {
    if (!rule) {
        return;
    }
    var openingHTML = '<div class="rule" id = "rulediv'+ruleKey+'"> <div class = "rules_form">';
    var fromHTML = '<div class="From"><h3>From</h3><input type="date" id = "fromDate'+ruleKey+'"><input type="time" id = "fromTime'+ruleKey+'"></div>';
    var toHTML = '<div class="To"><h3>To</h3><input type="date" id = "toDate'+ruleKey+'"><input type="time" id = "toTime'+ruleKey+'"></div>';
    var isActiveRef = "'isActive'";
    var isActiveIDRef = "'ruleActive"+ruleKey+"'";
    var activeHTML = '<div class = "checkbox"><input type="checkbox" id = "ruleActive'+ruleKey+ '" onclick = "updateCheckmark('+isActiveRef+', '+ruleKey+','+isActiveIDRef+')"';
    if (rule.isActive) {
        activeHTML += ' checked=true';
    }
    activeHTML+='></div>';                 
    var removeHTML = '<div class = "image"><input type="image" src="images/delete.png" alt="delete rule" onclick = "remove('+ruleKey+')"></div>';
    var weekdayTransitionHTML = '</div><div class="weekday_rules">';
    var weekdayHTML = '<div class="on"><h3>On</h3></div>';
    WEEKDAYS.map(day => {
        dayRef = "'"+day+"'";
        dayIDRef = "'"+day+ruleKey+"'";
        weekdayHTML += '<div class="rule_weekday"><label>'+day[0]+'</label><input type="checkbox" id = "'+day+ruleKey+'" onclick = "updateCheckmark('+dayRef+', '+ruleKey+','+dayIDRef+',true)"';
        if (rule["days"][day]) {
            weekdayHTML += ' checked=true';
        }
        weekdayHTML += ' id = "'+day+ruleKey+'"></div>';
    });                     
    var closingHTML = '</div></div>';
    var toAddHTML = openingHTML+fromHTML+toHTML+activeHTML+removeHTML+weekdayTransitionHTML+weekdayHTML+closingHTML;
    var toAdd = document.createElement("li");
    toAdd.id = "rule"+ruleKey;
    toAdd.innerHTML = toAddHTML;
    var scrollList = document.getElementById("schedule_rules_scroll_list");
    scrollList.appendChild(toAdd);
    var dateTimeTypes = ["fromDate","toDate","fromTime","toTime"];
    dateTimeTypes.map((label) => {
        document.getElementById(label+ruleKey).value = rule[label];
    });
    dateTimeTypes.map((value) => addDataListener(value,ruleKey));
}
function addDataListener(label,index) {
    document.getElementById(label+index).addEventListener("change",() => {
        updateDataEntry(label, index, label+index);
    });
}
function removeFromDatabase(elementID) {
    var user_email = auth.currentUser.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var ruleset = data.rules;
        ruleset[elementID] = null;
        db.collection("users").doc(user_email).update({"rules": ruleset}).then((res) => {
            console.log("data updated");
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}
function removeFromHTML(elementID) {
    document.getElementById("rule"+elementID).remove();
}
function buildFromDatabase(user) {
    var user_email = user.email;
    db.collection("users").doc(user_email).get().then((res) => {
        var data = res.data();
        var rules = data.rules;
        addRuleToPage(rules);
    }).catch((err) => {
        console.log(err);
    });
}
if (auth.currentUser) {
    buildFromDatabase(auth.currentUser);
} else {
    auth.onAuthStateChanged(buildFromDatabase);
}