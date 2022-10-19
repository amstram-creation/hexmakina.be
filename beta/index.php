<?php 

$l = parse_ini_file('language.eng.ini', true);
$phone_number_crypt = 'DGXOHYWVU';
$email_adress_crypt = 'touch__hexmakina_be';
$site_url = 'https://hexmakina.eu';

if($_SERVER['REQUEST_METHOD'] === 'POST')
{
	; // do something for the mail
}

function make_card($i, $opened = false)
{
	global $l;

	$replace = $with = [];
	$replace[] = '{iterator}';
	$with[] = $i;

	foreach($l["card_$i"] as $r => $w)
	{
		$replace []= '{'.$r.'}';
		$with []= $w;
	}

	ob_start();
	include('card.tpl');
	$card = ob_get_clean();

	return str_replace($replace, $with, $card);
}

// header('Cache-Control: max-age=31557600');

?>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" dir="ltr">
<head>
<meta name="robots" content="index,nofollow" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="Cache-control" content="public">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="author" content="HexMakina" />

<title>HexMakina</title>

<?php include '_ui/favicons/favicon.htm'; ?>

<style type="text/css">
<?php
foreach([
	'css/normalize.css', 
	'css/demo.css', 
	'css/card.css', 
	'css/form.css', 
	'css/hexmakina.css'] as $css_file){
		include($css_file);	
}
?>
</style>

<!--[if IE]>
  <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<script>
	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
	var root = document.getElementsByTagName('html')[0];
	root.setAttribute('class', 'ff');
	};
</script>
	
</head>

<body>
	<div class="container" id="hexmakina">

		<div id="header">
	    <h1>{ hex makina</h1>
	    <h2>&mdash; <span id="subtitle" data-text="<?= $l['header']['subtitle_alt'];?>"><?= $l['header']['subtitle'];?></span> }</h2>
		</div>
		
		<div id="intro">
			<div id="turing-machine">
				<img src="_ui/turing-machine-bw-small.png"   alt="Visual representation of a Turing Machine" />
			</div>
			<blockquote id="turing-quote">
				<p>
					<span>a man,</span>
					<span>provided with paper,</span>
					<span>pencil and rubber,</span>
					<span>and subject to strict discipline,</span>
					<span>is in effect a universal machine.</span>
        </p>
				<img src="_ui/Alan_Turing_signature.svg" alt="signature of Alan Mathison Turing" />
			</blockquote>


			<hr />
		</div>
		
		
		<?php include('_ui/divider_odd.htm');?>
	
	
		<div id="aboutus">
			<?= $l['intro']['content']; ?>
		</div>
		
		
		<?php include('_ui/divider_even.htm');?>
		
		
		<h3><?= $l['process']['title']; ?></h3>
		<div class="content">
			<div class="wrapper">
				<?php for ($i=1; $i<=6; ++$i){ echo make_card($i); }?>
			</div>
		</div>


		<?php include('_ui/divider_odd.htm');?>

		
	  <div class="section" id="touch">
	    <h3 class="">touch</h3>
	
			<p id="touch_intro"><?= $l['touch']['intro']; ?></p>		
			
			<div id="touch_short">
				
				<div class="card_link">
				<a id="mailto" href="#touch_form">
					<img src="_ui/aecons/shutterstock_216001777_4_mail.png" />
		      <span class=""><?= $l['touch']['write']; ?></span>
					<small><a class="decyph_email"><?= $email_adress_crypt;?></a></small>
				</a>
				</div>
				
				<div class="card_link">
					<a class="decyph_phone" href="#">
						<img src="_ui/aecons/shutterstock_216001777_8_mobile.png" />
		        <span class=""><?= $l['touch']['call']; ?></span>
						<small class="decyph_phone"><?=$phone_number_crypt;?></small>
					</a>
				</div>
				
				<div class="card_link last">
					<a>
						<img src="_ui/aecons/shutterstock_216001777_1_building.png" />
		        <small><?= $l['address']['street']; ?><br/>1210 <?= $l['address']['city']; ?></small>
					</a>
				</div>

				<hr/>
			</div>
			
			<a name="touch_form"></a>
			<form action="index.php"  method="POST">
				<div class="input-container">
					<div class="styled-input wide">
						<input type="text" name="contact" required />
						<label><?= $l['touch']['form_pointofcontact']; ?></label> 
					</div>
					<div class="styled-input wide">
						<textarea required></textarea>
						<label><?= $l['touch']['form_message']; ?></label>
					</div>
					<hr />
					<div style="text-align:center">
					<button type="submit"><?= $l['touch']['form_submit']; ?></button>
					</div>
				</div>
				<hr />
			</form>
	  </div>


		<?php include('_ui/divider_odd.htm');?>

		<div class="section card_link">
			<a class="toggler" href="#legal">
				<img src="_ui/aecons/shutterstock_202454893_5_sword_book.png" />
	      <span class=""><?= $l['legal']['title']; ?></span>
			</a>
			<div id="legal" style="display:none;">
		    <address>
					<dl>
						<dt><?= $l['address']['site_editor']; ?></dt>
						<dd>Sammy Dieleman</dd>
						<dd><?= $l['address']['street']; ?> &mdash; 1210 <?= $l['address']['city']; ?>, <?= $l['address']['country']; ?></dd>
						<dd>Tel: <span id="tel_data" class="decyph_phone"><?=$phone_number_crypt;?></span></dd>
						<dd>Mail: <span id="email_data" class="decyph_email"><?=$email_adress_crypt;?></span></dd>
						<dd>Site: https://hexmakina.eu</dd>
						<dd>BCE 0678.421.364</dd>

						<dt><?= $l['address']['site_host']; ?></dt>
						<dd>GANDI SAS</dd>
						<dd>63-65 boulevard Massena &mdash; 75013 Paris, FRANCE</dd>
						<dd>https://gandi.net</dd>
					</dl>
				</address>
				<?php include 'legal.htm';?>
			</div>
		</div>

		<p style="text-align:center;">&copy <?=date('Y');?></p>
		
	<script type="text/javascript">
	<?php
	foreach([
		'js/vendors/TweenMax.min.js', 
		'js/vendors/ScrollToPlugin.min.js', 
		'js/vendors/cash.min.js', 
		'js/Card-circle.js', 
		'js/demo.js', 
		'js/hexmakina.js'] as $js_file){
			include($js_file);	
	}
	?>
	</script>
</body>
</html>
