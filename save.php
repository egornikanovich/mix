<?php

include 'bdconfig.php';
$_POST = json_decode(file_get_contents('php://input'), true);
if (isset($_POST['name']) && isset($_POST['ingredients']) && isset($_POST['volumes'])) {
    $name = strip_tags($_POST['name']); 
    $ingredients=$_POST['ingredients'];
    $volumes=$_POST['volumes'];
    $sqlInsertMixtureList = "INSERT INTO `mixtures` (`mixture_ID`, `mixture_name`) VALUES (NULL, '$name')";
    $addedToMixtureList = mysqli_query($connect, $sqlInsertMixtureList); 
    $sqlGetID = "SELECT MAX(mixture_ID) FROM mixtures";
    $resID = mysqli_query($connect, $sqlGetID);
    $data = mysqli_fetch_assoc($resID);
    $currentID = reset($data);
    for ($i=0; $i<sizeof($ingredients); $i++) {
    $sqlInsertMixtureIngredients = "INSERT INTO `mixtures_ingredients` (`mixture_ID`, `ingredient_ID`, `ingredient_volume`) VALUES ('$currentID', '$ingredients[$i]', '$volumes[$i]')";
    $addedMixtureIng= mysqli_query($connect, $sqlInsertMixtureIngredients); 
    }
} 

