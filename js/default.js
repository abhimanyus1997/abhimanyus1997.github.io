var i = 0;
var landpgtitle = "Abhimanyu Singh"
var speed = 200; /* The speed/duration of the effect in milliseconds */

function typeWriter() {
    landingPg()
}


// Function to type page titile
function landingPg() {
    if (i < landpgtitle.length) {
        document.getElementById("landingPg1").innerHTML += landpgtitle.charAt(i);
        // document.getElementsById("nav-title").innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
    }
    document.getElementById("landingPg2").style.animation = "text-flicker-in-glow 4s ease-in-out 6s infinite";
}

//start drone
function startdrone() {
    var btn = document.getElementById("welcome-msg");
    btn.style.backgroundColor = "green";
    btn.style.color = "white";
    dronedriver();
}

// Function to randomize drone path
function dronedriver() {
    var r = document.documentElement;
    var x = Math.round(Math.random() * 50);
    var y = Math.round(Math.random() * 50);
    r.style.setProperty("--drone-x",x+"vw");
    r.style.setProperty("--drone-y",y+"vh");

    // r.addEventListener("mousemove", e => {
    //     r.style.setProperty("--drone-x", e.clientX + "px");
    //     r.style.setProperty("--drone-y", e.clientY + "px");

    // }
}

function destroydrone(){
    document.getElementById("drone").style.display="none";
    var btn = document.getElementById("welcome-msg");
    btn.style.backgroundColor = "red";
    btn.style.color = "white";
    btn.innerHTML = "Drone Self Destructed";
}

//show mouse coordinafe
function showCoords(event) {
    var x = event.clientX;
    var y = event.clientY;
    var coords = "X coords: " + x + ", Y coords: " + y;
    console.log(coords);
}
