<?PHP
    $page = intval($_GET['page'],10);
    if($page < 2)
echo <<<STR
{"code":0,"message":"done","data":[{"userId":124497,"userName":"你管我","userFace":"http://file.pengsi.cn/user/portrait/97/44/12/124497/m.jpg","time":"1分钟前","comment":"这里是评论"},{"userId":124497,"userName":"你管我","userFace":"http://file.pengsi.cn/user/portrait/97/44/12/124497/m.jpg","time":"2分钟前","comment":"这里是评论2"},{"userId":124497,"userName":"你管我","userFace":"http://file.pengsi.cn/user/portrait/97/44/12/124497/m.jpg","time":"3分钟前","comment":"这里是评论3"},{"userId":124497,"userName":"你管我","userFace":"http://file.pengsi.cn/user/portrait/97/44/12/124497/m.jpg","time":"4分钟前","comment":"这里是评论4"}]}
STR;
    else
echo <<<STR
{"code":-1,"message":"没有更多了","data":[]}
STR;
?>