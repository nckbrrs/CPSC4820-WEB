<?php

require "UserStore.php";

/*
function validate() {
  // only thing we need to check is that both fields are occupied
  if( !isset($_POST['username']) || !isset($_POST['password'])) {
    return "All fields are required.";
  }

  // open database
  $store = new UserStore("/data/users.json");

  // see if username exists in database
  $userObj = getUser($_POST['username']);
  if (!userObj) {
    return "No account with that username exists.";
  } else {
    $hash = hash("sha256",$_POST['password'].$userObj['salt']);
    if ($hash == $userObj['password']) {
      return "Wow good job."
    } else {
      return "Invalid password.";
    }
  }

  return true;
}
*/
//this is a variable that we write out to javascript later
//javascript will see it and decide whether to render an error box
//the string "false" here will print as
// <script type="text/javascript">var errorMessage = false;</script>
//which will make a global variable in javascript and set its value to the Boolean false
$errorMessage = "false";

/*
if(isset($_POST['comingBack'])){
  $valid = validate();

  if (isbool($valid) && $valid) {
    // create a session for user
    // redirect to /numverify/phoneNumber.php
  } else {
    if (is_string($valid)){
			$errorMessage = $valid;
		}
  }
}
*/
?>

<!DOCTYPE html>
<title>Login</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript">var errorMessage = <?php /*php executes this blob of code */echo $errorMessage; ?>;</script>
<style type="text/css">
  html {
    display: block;
    margin: auto;
    text-align: center;
    font-family: sans-serif;
  }
  .error{
		border: 1px solid;
		color: red;
	}
</style>
<h1>Login</h1>
<p id="instructions">fill out the form to login</p>
<div id="error" class="errorMessage" style="visibility: hidden;"></div>
<section>
	<form id="form" method="post" action="login.php">
		<label>Username: <input type="text" name="username" id="username"></label><br>
		<label>Password: <input type="password" name="password" id="password"></label><br>
		<input type="hidden" name="comingBack" value="1">
		<button id="submit" type="submit" name="submit">Submit</button>
	</form>
	<a href="register.php">Register</a>
</section>
<script type="text/javascript" src="login.js"></script>
