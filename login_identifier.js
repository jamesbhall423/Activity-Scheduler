function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}
function getAuthState() {
    return getCookie("authState") != "";
}
function setAuthState(state) {
    if (state) {
        setCookie("authState", "auth");
    } else {
        setCookie("authState", "");
    }
}
firebase.auth().onAuthStateChanged(setAuthState);