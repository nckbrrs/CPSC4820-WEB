<?php

session_start();

// if not logged in, redirect to login page
if (!isset($_SESSION['username'])) {
  header("Location: /project4/login/index.html", true, 302);
}

// numverify variables
$numverifyEndpoint = "http://apilayer.net/api/validate";
$numverifyKey = "f7280f3f9e7e4bef446722c1923f2179";

// call numverify API and send its response back to phoneNumber.js
echo file_get_contents($numverifyEndpoint."?access_key=".$numverifyKey."&number=".$_GET['number']);

?>

<!DOCTYPE html>
<title>Verify</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
<style type="text/css">
  html {
    display: block;
    margin: auto;
    text-align: center;
    font-family: sans-serif;
  }
</style>
<h1>Numverify Phone Number Verification</h1>
<a href="/project4/numverify/phoneNumber.php">Click here to go to phone number verification page.</a>
