var googleMapsEndpoint = 'https://www.google.com/maps/embed/v1/place';
var googleMapsKey = 'AIzaSyD4lO2enIyK50vGbUHfM969s6Z4m_OfBUo';

var inputFieldElement
var submitButtonElement;
var numEnteredElement;
var numValidityElement;
var countryNameElement;
var lineTypeElement;
var countryMapElement;

var onLoad = function() {
  inputFieldElement = document.getElementById('inputField');
  submitButtonElement = document.getElementById('submitButton');
  numEnteredElement = document.getElementById('numEntered');
  numValidityElement = document.getElementById('numValidity');
  countryNameElement = document.getElementById('countryName');
  lineTypeElement = document.getElementById('lineType');
  countryMapElement = document.getElementById('countryMap');

  submitButton.onclick = verifyNumber.bind(submitButtonElement, inputField.value)
  inputField.addEventListener('keydown', function(event) {
    if ((event.keyCode < 48 || event.keyCode > 57) && event.keyCode != 8) {
      event.preventDefault();
    }
    if (event.keyCode == 13) {
      submitButton.click();
    }
  })
}

var verifyNumber = function() {
  var numEntered, numValidity, countryName, lineType, nonsuccessfulCall, errorMsg;

  axios.get('/numverify/verify.php', {
      params: {
        number: inputField.value
      }
    })
    .then(function (response) {
      console.log(response);
      /*
      nonsuccessfulCall = (response['data']['success'] != null);
      if (nonsuccessfulCall) {
        errorMsg = response['data']['error']['info'];
        numEnteredElement.innerHTML = "Error! " + errorMsg;
      } else {
        numEntered = response['data']['number'];
        numValidity = response['data']['valid'];
        countryName = response['data']['country_name'];
        lineType = response['data']['line_type'];
        numEnteredElement.innerHTML = "You requested: " + numEntered;

        if (numValidity == true) {
          numValidityElement.innerHTML = "Validity: VALID";
        } else {
          numValidityElement.innerHTML = "Validity: INVALID";
        }

        if (countryName.length != 0) {
          countryNameElement.innerHTML = "Country Name: " + countryName.toUpperCase();
          countryMapElement.src = googleMapsEndpoint + '?key=' + googleMapsKey + '&q=' + countryName;
          countryMapElement.style.visibility = 'visible';
        } else {
          countryNameElement.innerHTML = "Country Name: UNAVAILABLE";
          countryMapElement.style.visibility = 'hidden';
        }
        if (lineType != null) {
          lineTypeElement.innerHTML = "Line Type: " + lineType.toUpperCase();
        } else {
          lineTypeElement.innerHTML = "Line Type: UNAVAILABLE";
        }
      }*/
    })
    .catch(function (error) {
      console.log(error);
    });
}

window.addEventListener('load', onLoad);
