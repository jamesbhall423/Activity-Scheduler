
const redirect = (sub_url) => {
    host_url = window.location.hostname;
    console.log(host_url);
    window.location.replace("/"+sub_url);
}
redirect("activity-scheduler.html")