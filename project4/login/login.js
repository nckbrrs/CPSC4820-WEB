var showError = (msg) =>{
	var errorNode = document.getElementById("error");
	if(msg == "" || msg == "false"){
		//hide error
		errorNode.style = "visibility: hidden;";
		return;
	}
	errorNode.innerText = msg;
	errorNode.style = "color: red;";
};

var validate = () =>{
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;

	// only thing we need to check is that both fields are occupied
	if(username === "" || password === "" ){
		showError("All fields are required.");
		return false;
	}

	//we're here, no errors, hide error box
	showError("false");

	return true;
};

var onSubmit = () =>{
	if(!validate()){
		return false;
	}

	var buttonNode = document.getElementById("submit");
	buttonNode.innerText = "Submitting, please wait...";

	return true;
};

var onLoad = () => {
	var formNode = document.getElementById("form");

	formNode.onsubmit = onSubmit;

	if (errorMessage != "false"){
		showError(errorMessage);
	}
};
window.addEventListener("load",onLoad,false);
