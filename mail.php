<?php 

$text = trim(stripslashes($_POST['message']));
$email = trim(stripslashes($_POST['email']));

$message = 'message sent';
if(strlen($text) === 0){
  $message = 'message empty';
}
else
{
  $send_mail_result = mail('touch@hexmakina.be', 'hexmakina.be form', "$text\n", 'From: <touch@hexmakina.be>');
  // $send_mail_result = true;
  if($send_mail_result===false)
    $message = 'error, try again';
}
echo '<h1 style="text-align:center; margin-top:11%;  font-family: courier;">'.$message.'</h1>';
echo '<a href="index.htm">hexmakina.be</a>';
die;

 ?>
