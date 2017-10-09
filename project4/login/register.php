<?php
// pull in user store class
require "UserStore.php";

// if already logged in, redirect to phoneNumber.php
if (isset($_SESSION['username'])) {
  header("Location: /project4/numverify/phoneNumber.php", true, 302);
  return;
}

// validates post variables
// returns true or an error message
function validate(){
	if(!isset($_POST['username']) || !isset($_POST['password']) ||
		!isset($_POST['email']) || !isset($_POST['name'])){
		return "All fields are required.";
	}

	$username = $_POST['username'];
	$password = $_POST['password'];
	$email = $_POST['email'];
	$name = $_POST['name'];

	if(strlen($username) > 25){
		return "Your username cannot be longer than 25 characters.";
	}

	if(strlen($password) > 100){
		return "Your password cannot be longer than 100 characters.";
	}

	if(strlen($email) > 100){
		return "Your email cannot be longer than 100 characters.";
	}

	if(strlen($name) > 100){
		return "Your name cannot be longer than 100 characters.";
	}
	return true;
}

//takes a user object and attempts to write it to disk
function addUser($userObj){
	try {
		// instantiate user store with path to json file on disk
		// if file doesnt exist, this will create it for us
		$store = new UserStore("/data/users.json");

		// check to see if the user already exists
		// if so return false
		if($store->userIndex($userObj['username']) !== false){
			return false;
		}

		// add user to userStore
		$store->setUser($userObj);

		// write file to disk
		$store->save();
	} catch (Exception $e) {
		// if we encountered any exceptions, return false
		return false;
	}

	return true;
}

// if we have this post variable form the hidden input element, then we know
// that the form is being submitted, and we should deal with the submission.
// otherwise, we wouldn't do any more work and just render the HTML
if(isset($_POST['comingBack'])){
	// make sure POST variables are valid
	$valid = validate();

	// if we didn't get an error msg from validate
	if(is_bool($valid) && $valid){
		// generate a salt for our password hash
		$salt = rand(0,100000);

		// use this salt and the password to generate a unique sha256 fingerprint
		$hash = hash("sha256",$_POST['password'].$salt);

		// create a new user object and add it to our user store
		$result = addUser(array(
			'username' => $_POST['username'],
			'password' => $hash,
			'salt' => $salt,
			'email' => $_POST['email'],
			'name' => $_POST['name']
		));

		// error in adding user; set an error msg and render HTML
		if(!$result){
			$errorMessage = "An error occured while saving your account.";
		}else{
			// redirect to success; don't render any more HTML
			header("Location: /project4/login/register_success.html", true, 302);
			return;
		}
	}else{
		// error in validation; set an error msg and render HTML
		if(is_string($valid)){
			$errorMessage = $valid;
		}
	}
}

// to be written to javascript later
// in order to decide whether to render an error
$errorMessage = false;

?>

<!DOCTYPE html>
<title>Register</title>
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
<h1>Register</h1>
<p id="instructions">Fill out the form to register:</p>
<div id="error" class="errorMessage" style="visibility: hidden;"></div>
<br>
<section>
	<form id="form" method="post" action="/project4/login/register.php">
		<label>Desired Username: <input type="text" name="username" id="username"></label><br>
		<label>Desired Password: <input type="password" name="password" id="password"></label><br>
		<label>Confirm Password: <input type="password" id="confirm"></label><br>
		<label>Email Address: <input type="text" name="email" id="email"></label><br>
		<label>Name: <input type="text" name="name" id="name"></label><br>
		<input type="hidden" name="comingBack" value="1">
		<button id="submit" type="submit" name="submit">Submit</button>
	</form>
	<br>
	<a href="/project4/login/login.php">Login</a>
</section>
<script type="text/javascript" src="/project4/login/register.js"></script>
