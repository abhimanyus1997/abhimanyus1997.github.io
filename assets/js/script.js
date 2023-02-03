function mailMe(){
    var name = document.getElementById("name").value;
	var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var msg = document.getElementById("msg").value;

    body = "Hi, I am " + name +"\nMail Regarding: " + msg
	document.location.href = "mailto:abhimanyus1997@gmail.com?subject='Mail From "
        + encodeURIComponent(`${email}(${phone})`)
        + "&body=" + encodeURIComponent(msg);
}