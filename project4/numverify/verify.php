<?php

session_start();

if (!isset($_SESSION['username'])) {
  header("Location: /project4/login/index.html", true, 302);
}

$numverifyEndpoint = "http://apilayer.net/api/validate";
$numverifyKey = "f7280f3f9e7e4bef446722c1923f2179";

echo file_get_contents($numverifyEndpoint."?access_key=".$numverifyKey."&number=".$_GET['number']);
?>

<!DOCTYPE html>
<title>test</title>
<h1>test</h1>
