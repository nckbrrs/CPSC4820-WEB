<?php

session_start();
$_SESSION = array();
session_destroy();

header("Location: /project4/login/logout_success.html");

?>
