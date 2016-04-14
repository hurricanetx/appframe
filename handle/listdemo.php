<?PHP
    $page = intval($_GET['page'],10);
    if($page < 10){
        $output = '{"code":0,"message":"done","data":[';
        for($i=0;$i<10;$i++){
            if($i==0) 
                $output.='{"name":"示例内容'.($page*10+$i).',这里是　第'.($page+1).'页"}';
            else{
                $output.=',{"name":"示例内容'.($page*10+$i).',请往下看"}';
            }
        }
        $output.=']}';
        echo $output;
    }else
echo <<<STR
{"code":-1,"message":"没有更多了","data":[]}
STR;
?>