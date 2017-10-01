
<?php
class UserStore
{

	//array of users
	private $users;

	//path to file to read and write from
	private $filePath;

	//use the filepath to load the json if it exists
	//or default to empty array and make sure we can modify the file
	function __construct($path) {
		$this->filePath = $path;

		//basic can-I-modify-file check
		//updates the timestamp on the file if it exists
		//tries to create it otherwise
		if(!touch($this->filePath)){
			throw new Exception("Cannot touch file ".$this->filePath.".");
		}

		//if file exists load it into $users
		if(file_exists($this->filePath)){
			$json = file_get_contents($this->filePath);
			$this->users = json_decode($json, true);

			//something went wrong, but we could touch above,
			//assume file is corrupted and start an empty one
			if(!is_array($this->users)){
				$this->users = array();
			}
		}else{
			//file didn't exists, create empty array
			$this->users = array();
		}

	}

	//save $users to disk as json
	public function save() {

		//convert $users to json
		$json = json_encode($this->users);

		//open and write to given file path
		$file = fopen($this->filePath,'w');
		if(!fwrite($file, $json)){
			throw Exception("Failed to save file $filePath.");
		}
		fclose($file);
	}

	//check $users for a specific username, returns the index if exists
	//otherwise returns false
	public function userIndex($username){
		for($i=0,$c=count($this->users);$i<$c;$i++){
			if($this->users[$i]['username'] == $username){
				return $i;
			}
		}
		return false;
	}

	//returns a COPY of a user object looked up by username
	//or false if username didnt exist
	public function getUser($username){
		$index = $this->userIndex($username);

		if($index === false){
			return false;
		}

		return $this->users[$index];
	}

	//adds a user object to users if that username doesnt exist,
	//overwrites user object if the username does exist.
	public function setUser($userObj){
		$index = $this->userIndex($userObj['username']);

		if($index === false){
			array_push($this->users, $userObj);
			return;
		}

		$this->users[$index] = $userObj;
	}
}
?>
