<?php
session_start();

// if not logged in, redirect to login page
if (!isset($_SESSION['username'])) {
  header("Location: login/index.html");
}

?>

<!DOCTYPE html>
<title>numverify Phone Number Verification</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<style type="text/css">
  html {
    display: block;
    margin: auto;
    text-align: center;
    font-family: sans-serif;
  }
</style>
<h1>numverify</h1>
<p id="instructions">Enter any phone number (including country code) and click Submit:</p>
<div id="error" class="errorMessage" style="visibility:hidden;"></div>
<br>
<section>
  <form id="form" method="get" action="verify.php">
    <input type="tel" name="phoneNumber" id="phoneNumber"><br>
    <button id="submit" type="submit" name="submit">Submit</button>
  </form>
</section>
<div>
  <h4 id="numEntered">&nbsp;</h4>
  <h5 id="numValidity">&nbsp;</h5>
  <h5 id="countryName">&nbsp;</h5>
  <h5 id="lineType">&nbsp;</h5>
</div>
<div>
  <iframe id="countryMap"></iframe>
</div>
<script src="numverify/phoneNumber.js"></script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
