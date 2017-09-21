var inputField;
var submitButton;

var onLoad = function() {
  inputField = document.getElementById("inputField");
  submitButton = document.getElementById("submitButton");
  submitButton.onclick = verifyNumber.bind(submitButton, inputField.value)
  inputField.addEventListener("keyup", function(event) {
    if (event.keyCode == 13) {
      submitButton.click();
    }
  })
}

var verifyNumber = function() {
  console.log("i got this\n")
}

/* initialize game when page is loaded */
window.addEventListener("load", onLoad);
