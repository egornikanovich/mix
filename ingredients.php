<?php

include 'bdconfig.php';
header("Content-Type: text/html; charset=UTF-8");
$function = $_GET['function'];
if ($function=='get') {
    $sql = 'SELECT ingredients.ingredient_ID, ingredient_name, GROUP_CONCAT(property_description) FROM ingredients JOIN ingredients_properties ON ingredients.ingredient_ID = ingredients_properties.ingredient_ID INNER JOIN properties ON properties.property_ID = ingredients_properties.property_ID GROUP BY ingredient_name ORDER by ingredients.ingredient_ID ASC';
    $res = mysqli_query($connect, $sql);
    $return_arr = array();
    while ($data = mysqli_fetch_assoc($res)) {
        $row_array['id'] = $data['ingredient_ID'];
        $row_array['name'] = $data['ingredient_name'];
        $row_array['property'] = $data['GROUP_CONCAT(property_description)'];
        array_push($return_arr,$row_array);
    }
    echo json_encode($return_arr, JSON_UNESCAPED_UNICODE);
} else {
    echo 'error';
}