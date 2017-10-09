<?php
session_start();

// if not logged in, redirect to login page
if (!isset($_SESSION['username'])) {
  header("Location: /project4/login/index.html", true, 302);
  return;
}

?>

<!DOCTYPE html>
<title>Numverify Phone Number Verification</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<style type="text/css">
  html {
    display: block;
    margin: auto;
    text-align: center;
    font-family: sans-serif;
  }
  #top {
    display:flex;
    width: 100%;
  }
  #filler {
    width:10%;
  }
  #header {
    width: 80%;
    text-align:center;
  }
  #logout {
    width:10%;
    text-align:right;
  }
  #countryMap {
    visibility: hidden;
    width: 75%;
    height: 450px;
    style: "border:0";
  }
</style>
<div id="top">
  <div id="filler"></div>
  <h1 id="header">Numverify Phone Number Verification</h1>
  <a id="logout"href="/project4/login/logout.php">Logout</a>
</div>
<p id="instructions">Enter any phone number (including country code) and click Submit:</p>
<div id="error" class="errorMessage" style="visibility:hidden;"></div>
<br>
<div>
  <input type="tel" id="inputField"><br>
  <button id="submitButton">Submit</button>
</div>
<div>
  <h4 id="numEntered">&nbsp;</h4>
  <h5 id="numValidity">&nbsp;</h5>
  <h5 id="countryName">&nbsp;</h5>
  <h5 id="lineType">&nbsp;</h5>
</div>
<div>
  <iframe id="countryMap" src="http://example.com"></iframe>
</div>
<script src="/project4/numverify/phoneNumber.js"></script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
