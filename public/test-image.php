<?php
$images = glob($_SERVER['DOCUMENT_ROOT'] . '/PruebaTecnica/public/uploads/*.{jpg,jpeg,png,gif}', GLOB_BRACE);

echo "<h1>Imágenes en uploads/</h1>";
echo "<ul>";
foreach ($images as $image) {
    $url = str_replace($_SERVER['DOCUMENT_ROOT'], '', $image);
    echo "<li><a href='$url' target='_blank'>$url</a></li>";
    echo "<img src='$url' style='max-width: 200px; display: block; margin: 10px 0;'>";
}
echo "</ul>";