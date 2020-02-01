<?php

	class MyDB extends SQLite3
	{
		function __construct()
		{
			$this->open('mysqlitedb.db');
		}
	}

	if(isSet($_POST)){
		$db = new MyDB();
		
		
		$login=SQLite3::escapestring( isSet($_POST['login'])?htmlentities($_POST['login']):'');
		//$password=sqlite_escape_string( isSet($_POST['password'])?htmlentities($_POST['password']):'');
		$password=$_POST['password'];
		echo "$login </br>".password_hash($password, PASSWORD_BCRYPT);
		$query="INSERT INTO users (login, password) VALUES ('$login', '".password_hash($password, PASSWORD_BCRYPT)."')";
		
		if($db->exec($query)){
			echo"</br> good";
		}else{
			echo "</br>".$db->lastErrorMsg();
		}
		
		$query = "SELECT * FROM users";
		if($results = $db->query($query)){
			while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
				echo"</br>";
				var_dump($row);
				echo"</br>";
				echo $row['id'];
			}
		}else{
			echo "</br>".$db->lastErrorMsg();
		}
		/*
		$request = $_SERVER['REMOTE_HOST'];
		$referer = $_SERVER['HTTP_REFERER'];
		$user = $_SERVER['HTTP_USER_AGENT'];
		echo "request: $request </br>referer: $referer </br>user: $user";
		*/
		/*
		$execute = sqlite_exec($dbhandle, $query);
		if (!$execute) die("Cos nie pykło :c");
		sqlite_close($dbhandle);
		*/
	}

?>