function mailMe(){
    var name = document.getElementById("name").value;
	var email = document.getElementById("name").value;
	
	body = "Hi, I am"+name+"\nMail Regarding"
	document.location.href = "mailto:abhimanyus1997@gmail.com?subject='Mail From "
        + encodeURIComponent(email)
        + "&body=" + encodeURIComponent(body);
}