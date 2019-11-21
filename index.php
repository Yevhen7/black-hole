<?
//Відкриваєм сесію
session_start();
unset($_SESSION['cart']);
//підключаємо файл функцій
include 'function.php';
$db = connect_db();
$goods = get_goods($db);

$cart = get_cart($db);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>PHP| MySQL |</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="wrap">
    <div id="header">
      <h2>Інтернет магазин годиників</h2>
      <p>Годиники на любий слак!!!</p>
    </div>
    <div id="content">
      <div id="main">
        <ul id="tovar">
          <? foreach ($goods as $item) :?>
           <li>
            <img src="images/<?=$item['img'];?>">
            <p id="title"><?=$item['title'];?></p>
            <p id="price"><?=$item['price'];?>грн</p>
            <p class="kolvo">Кількість - <?=$item['kolvo'];?></p>
            <p id="remove_cart">Видалити</p>
          </li>
         <? endforeach;?>
        </ul>
      </div>
      edfadwa <div>
        dasdasdp  
      </div>
    </div>
  </div>
