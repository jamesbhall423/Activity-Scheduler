
const redirect = (sub_url) => {
    href = window.location.href;
    console.log(href);
    host_url = href.substring(0,href.lastIndexOf("/"));
    console.log(host_url);
    window.location.replace(host_url+"/"+sub_url);
}
redirect("activity-scheduler.html")