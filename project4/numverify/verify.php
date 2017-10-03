<?php

session_start();

// if not logged in, redirect to login page
if (!isset($_SESSION['username'])) {
  header("Location: /login/index.html", true, 302);
}

// numverify variables
$numverifyEndpoint = "http://apilayer.net/api/validate";
$numverifyKey = "f7280f3f9e7e4bef446722c1923f2179";

// call numverify API and send its response back to phoneNumber.js
$response = file_get_contents($numverifyEndpoint."?access_key=".$numverifyKey."&number=".$_GET['number']);
if ($response['data']['success'] == null) {
  header("HTTP/1.1 400 ".$response['data']['error']['info'], true, 400);
}
else {
  echo $response;
}

?>
