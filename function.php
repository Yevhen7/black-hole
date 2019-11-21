<?php
function connect_db(){
	//підключення до бази даних
	$db = mysqli_connect('localhost','login','password','for_cart');
	if(!$db){
		exit('Error'.mysqli_error());
	}
	//Встановлення кодування запитів
	mysqli_query($db,"SET NAMES cp1251");
	return $db;
}
function get_goods($db){
	//запит на вибір всіх товарів
	$sql = "SELECT * FROM magazine";
	$result = mysqli_query($db,$sql);
	for($i=0;$i<mysqli_num_rows($result);$i++){
		$goods[] = mysqli_fetch_array($result);
	}
	return $goods;
}
function get_cart($db){
	$sql = "SELECT id,title FROM magazine ";
	$result = mysql_query($db,$sql);
	for($i=0;$i<mysqli_num_rows($result);$i++){
		$res = mysqli_fetch_array($result,MYSQLI_ASSOC);
		$_SESSION['cart'][$res['id']] = $res['title'];
	}
}
function zakaz($db){
	mysqli_autocommit($db, FALSE);
	try{
		foreach ($_SESSION ['cart'] as $key => $value) {
			$sql1 = "INSERT INTO zakazi (title) VALUES ('$value')";
			$result1 = mysqli_query($db,$sql1);
			if (!$result1){
				throw new Exception();
			}
			$sql2 = "UPDATE user_cach SET cash=cash-(SELECT price FROM magazine WHERE id='$key')";
			$result2 = mysqli_query($db,$sql2);
			if (!$result2){
				throw new Exception();
			}
			$sql3 = "INSERT INTO otpravleno (title) VALUES ('$value')";
			$result3 = mysqli_query($db,$sql3);
			if (!$result3){
				throw new Exception();
			}
			$sql4 = "UPDATE magazine SET kolvo=kolvo-1 WHERE id='$key'";
			$result4 = mysqli_query($db,$sql4);
			if (!$result4){
				throw new Exception();
			}
		}
	}	
		catch(Exception $e){
			mysqli_rollback($db);
		}

	mysqli_commit($db);
}
?>