<?php
session_start();

/*
// if already logged in, redirect to phoneNumber.php
if (isset($_SESSION['username'])) {
  header("Location: /project4/numverify/phoneNumber.php");
}
*/

// pull in user store class
require "UserStore.php";

// to be written to javascript later
// in order to decide whether to render an error
$errorMessage = "false";

// validates post variables
// returns true or an error message
function validate() {
  if(!isset($_POST['username']) || !isset($_POST['password'])) {
    return "All fields are required.";
  }

  return true;
}


function authenticate() {
  try {
    // instantiate user store with path to json file on disk
    // if file doesn't exist, this will create it for us
    $store = new UserStore("/data/users.json");
    $userObj= $store->getUser($_POST['username']);

    if (!$userObj) {
      return "No account with that username exists.";
    } else {
      $hash = hash("sha256", $_POST['password'].$userObj['salt']);
      if ($hash == $userObj['password']) {
        return true;
      } else {
        return "Invalid password.";
      }
    }
  } catch (Exception $e) {
    // if we encountered any exceptions, return its message
    return "Exception: ".$e->getMessage();
  }
}

// if we have this post variable form the hidden input element, then we know
// that the form is being submitted, and we should deal with the submission.
// otherwise, we wouldn't do any more work and just render the HTML
if(isset($_POST['comingBack'])){
  // make sure POST variables are valid
  $valid = validate();

  // if we didn't get an error msg from validate
  if (is_bool($valid) && $valid) {
    // make sure username and password are correct
    $authenticated = authenticate();

    // if we didn't get an error msg from authenticate
    if (is_bool($authenticated) && $authenticated) {
      // create a session for UserStore
      // redirect to /numverify/phoneNumber.php
      $_SESSION['username'] = $_POST['username'];
      header("Location: /numverify/phoneNumber.php", true, 302);
      return;
    } else {
      // error in authentication; set an error msg and render HTML
      if (is_string($authenticated)) {
        $errorMessage = $authenticated;
      }
    }

  } else {
    // error in validation; set an error msg and render HTML
    if (is_string($valid)){
			$errorMessage = $valid;
		}
  }
}

?>

<!DOCTYPE html>
<title>Login</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript">var errorMessage = "<?php echo $errorMessage; ?>";</script>
<style type="text/css">
  html {
    display: block;
    margin: auto;
    text-align: center;
    font-family: sans-serif;
  }
</style>
<h1>Login</h1>
<p id="instructions">Enter your username and password to login:</p>
<div id="error" class="errorMessage" style="visibility:hidden;"></div>
<br>
<section>
	<form id="form" method="post" action="login.php">
		<label>Username: <input type="text" name="username" id="username"></label><br>
		<label>Password: <input type="password" name="password" id="password"></label><br>
		<input type="hidden" name="comingBack" value="1">
		<button id="submit" type="submit" name="submit">Submit</button>
	</form>
  <br>
	<a href="register.php">Register</a>
</section>
<script type="text/javascript" src="login.js"></script>
