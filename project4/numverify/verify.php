<?php
sesssion_start();

if (!isset($_SESSION['username'])) {
  header("Location: /project4/login/index.html", true, 302)
}

$numverifyEndpoint = "http://apilayer.net/api/validate";
$numverifyKey = "f7280f3f9e7e4bef446722c1923f2179";

//$fgc = file_get_contents("http://apilayer.net/api/validate?access_key=f7280f3f9e7e4bef446722c1923f2179&number=".$_GET['number'])
echo "hi there";
return "hi there";
 ?>

<!DOCTYPE html>
<title>Hi</title>
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
<h1>Hi</h1>
