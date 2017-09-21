var inputField;
var submitButton;

var onLoad = function() {
  inputField = document.getElementById("inputField");
  submitButton = document.getElementById("submitButton");
  submitButton.onclick = verifyNumber.bind(submitButton, inputField.value)
  inputField.addEventListener("keydown", function(event) {
    if (event.keyCode < 48 || event.keyCode > 57) {
      event.preventDefault();
    }
    if (event.keyCode == 13) {
      submitButton.click();
    }
  })
}

var verifyNumber = function() {
  console.log("Submitted!\n")
}

/* initialize input field and submit button when page is loaded */
window.addEventListener("load", onLoad);
