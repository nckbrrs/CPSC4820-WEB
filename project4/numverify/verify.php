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
 <h1>VERIFY</h1>
