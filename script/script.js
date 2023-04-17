let city = "Nyköping";
document.getElementById("header").innerHTML = "Sightseeing i " + city;

let drawapp = document.getElementById("drawapp");

// Element in html
let statusText;
let mapLink;
let iframe;
let places;
let buttons;
let getPoints;
let button;


//Global variables
let showDistanceToTarget;
let targetLocations;
let points = 0;
let latitude;
let longitude;
let accuracy;
let foundPlace;
let count = 0;


drawApp();

function drawApp() {

    drawapp.innerHTML = "";

    statusText = document.createElement("p");
    statusText.setAttribute("id", "status");

    mapLink = document.createElement("a");
    mapLink.setAttribute("id", "maplink");
    mapLink.setAttribute("target", "_blank");

    iframe = document.createElement("iframe");
    iframe.setAttribute("title", "map");
    iframe.setAttribute("id", "map");
    iframe.setAttribute("frameborder", 0);
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("marginheight", 0);
    iframe.setAttribute("marginwidth", 0);
    iframe.setAttribute("src", "");

    places = document.createElement("div");
    places.setAttribute("id", "places");

    getPoints = document.createElement("div");
    getPoints.setAttribute("id", "points");

    buttons = document.createElement("div");
    buttons.setAttribute("id", "buttons");

    drawapp.appendChild(statusText);
    drawapp.appendChild(mapLink);
    drawapp.appendChild(iframe);
    drawapp.appendChild(getPoints);
    drawapp.appendChild(places);
    drawapp.appendChild(buttons);
    geoFindMe();
}

/* options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0,
  }; */

function geoFindMe() {
    if (!navigator.geolocation) {
        statusText.innerHTML = "Finns ingen geo-funktionalitet";
    }
    else {
        statusText.innerHTML = "Söker position...";
        navigator.geolocation.watchPosition(success, error); // , options
    }
}

function success(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    accuracy = position.coords.accuracy;
    mapLink.href = "https://www.openstreetmap.org/#map=15/" + latitude + "/" + longitude;



    openStreetMap();
    targetPositions();

}



function targetPositions() {

    if (count < 1) {
        count++;
        fetch("./data/mappoints.json")
            .then(function (response) { return response.json(); })
            .then(function (data) {
                console.log("data från json-fil", data);

                targetLocations = data;
                places.innerHTML = "";
                buttons.innerHTML = "";

                //targetLocations = targetLocations.map((obj) => { return { ...obj, visited: false}})
                console.log("Ny jsonArray med boolean", targetLocations);
                targetLocations.map(function (place) {
                    console.log(place.info);

                    button = document.createElement("button");
                    button.setAttribute("class", "gotobutton");
                    button.innerHTML = "Gå till " + place.title;
                    button.setAttribute("onclick", "drawPlace(" + place.id + ")");

                    let distresult = getDistance(latitude, longitude, place.lat, place.long, "M");
                    console.log(distresult);
                    showDistanceToTarget = document.createElement("div");
                    showDistanceToTarget.setAttribute("class", "distancediv");

                    checkDistanceFromTarget(place.id, distresult);

                    getPoints.innerHTML = "Du har " + points + " poäng";
                    buttons.appendChild(button);
                    places.appendChild(showDistanceToTarget);
                })
            })
    }
    else {
        places.innerHTML = "";
        buttons.innerHTML = "";

        //targetLocations = targetLocations.map((obj) => { return { ...obj, visited: false}})
        console.log("Ny jsonArray med boolean", targetLocations);
        targetLocations.map(function (place) {
            console.log(place.info);


            button = document.createElement("button");
            button.setAttribute("class", "gotobutton");
            button.innerHTML = "Gå till " + place.title;
            button.setAttribute("onclick", "drawPlace(" + place.id + ")");

            let distresult = getDistance(latitude, longitude, place.lat, place.long, "M");
            console.log(distresult);
            showDistanceToTarget = document.createElement("div");
            showDistanceToTarget.setAttribute("class", "distancediv");

            checkDistanceFromTarget(place.id, distresult);

            getPoints.innerHTML = "Du har " + points + " poäng";
            buttons.appendChild(button);
            places.appendChild(showDistanceToTarget);
        })
    }
}

function checkDistanceFromTarget(id, distresult) {

    let place = targetLocations.find(x => x.id == id);
    for (let i = 0; i < targetLocations.length; i++) {
        if (distresult > 50) {
            if (place.visited == "true") { showDistanceToTarget.innerHTML = place.title + " [BESÖKT]"; }
            else { showDistanceToTarget.innerHTML = "Du är " + distresult + " meter från " + place.title; }
            console.log("place.visited i fetchen info", place.visited == "" ? "Tom" : place.visited);
        }
        else { drawPlace(place.id); }
    }

    let eastwest;
    let northsouth;
    if (longitude > place.long) { eastwest = "väst"; }
    else { eastwest = "öst"; }

    if (latitude > place.lat){ northsouth = "syd"; }
    else { northsouth = "nord"; }
    showDistanceToTarget.innerHTML += "<br> [Riktning: " + northsouth + eastwest + "]";
}

function drawPlace(id) {

    const application = document.getElementById("drawapp");
    application.innerHTML = "";

    foundPlace = targetLocations.find(place => place.id == id);

    foundPlace.visited = "true";

    console.log("kolla visited i drawPlace. Den som ska ha ändrats", foundPlace);
    console.log("kolla visited i drawPlace. Kolla igenom båda", targetLocations);


    if (foundPlace.id <= 1) { points += 15; }
    else if (foundPlace.id == 2) { points += 20; }    
    else if (foundPlace.id == 3) { points += 25; }
    else if (foundPlace.id == 4) { points += 30; }
    else if (foundPlace.id >= 5) { points += 35; }

    let img = document.createElement('img');
    img.setAttribute("class", "placeimg");
    img.setAttribute("title", foundPlace.title);
    img.src = foundPlace.image;

    let title = document.createElement('h1');
    title.setAttribute("class", "placetitle");
    title.innerHTML = "Välkommen till " + foundPlace.title;

    let infoText = document.createElement('p');
    infoText.setAttribute("class", "infotext");
    infoText.innerHTML = foundPlace.info;

    let backbutton = document.createElement("button");
    backbutton.setAttribute("class", "backbutton");
    backbutton.setAttribute("onclick", "drawApp()");
    backbutton.innerHTML = "Tillbaka till startsidan";

    application.appendChild(img);
    application.appendChild(title);
    application.appendChild(infoText);
    application.appendChild(backbutton);
}

function openStreetMap() {
    let latzoom = 0.01071819;
    let longzoom = 0.020256042;

    latzoom = latzoom / 6;
    longzoom = longzoom / 6;


    //let marker = latitude + "%2C" + longitude
    let bbox = (longitude - longzoom) + "%2C" + (latitude - latzoom) + "%2C" + (longitude + longzoom) + "%2C" + (latitude + latzoom);

    let url = "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox + "&amp;layer=mapnik&amp;"; //marker=" + marker
    console.log(url);
    document.getElementById("map").src = url;
    statusText.innerHTML = " Du är inom " + Math.round(accuracy) + " meter från denna position.";

}

function getDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344; }
    if (unit == "N") { dist = dist * 0.8684; }
    if (unit == "M") { dist = dist * 1609.344; dist = Math.round(dist); }
    console.log(dist);
    return dist;
}

function error(err) {
    alert(err.code + ": " + err.message);
}
