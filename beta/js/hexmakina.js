'use strict';

// mail spam
decyph_email();
decyph_phone();
enable_toggler();

console.log('Hello there, you have a curious mind.');
console.log('We do too. Get in touch.');

function enable_toggler()
{
	var attr ='';
	var hidden = '';
	for (link of document.getElementsByClassName('toggler'))
	{
		link.onclick = function() {
			attr = document.getElementById(this.getAttribute('href').replace('#', ''));
			attr.style.display = attr.style.display == 'none'? 'block' : 'none';
			return false;
	   };
	}
}

function decyph_phone()
{
	var phone_number = document.getElementById("tel_data").innerHTML;
	var phone_decyph = '+32 ';

	for(i=0; i<phone_number.length; ++i)
	{
		phone_decyph += (phone_number.charCodeAt(i)-'A'.charCodeAt(0) + 1)%9;
		if(i%3 == 2)
			phone_decyph += ' ';
	}

	for (phone of document.getElementsByClassName("decyph_phone"))
	{
		if(phone.nodeName == 'A')
			phone.setAttribute('href', 'tel:' + phone_decyph);
		else
			phone.innerHTML = phone_decyph;
	}
}

function decyph_email()
{
	var email_address = document.getElementById("email_data").innerHTML;
	var email_decyph = email_address.replace('__', '@').replace('_', '.')

	for (email of document.getElementsByClassName("decyph_email"))
	{
		if(email.nodeName == 'A')
			email.setAttribute('href', 'mailto:' + email_decyph);
		email.innerHTML = email_decyph;
	}
}



// casual causal
(function loop() {
  var rand = Math.round(Math.random() * (3000 - 500)) + 1000;
	// console.log(rand);
  setTimeout(function() {
          theoldswitcheroo();
          loop();  
  }, rand);
}());

function theoldswitcheroo()
{
	var subtitle = document.getElementById("subtitle");
	var temp = '';
	temp = subtitle.innerHTML;
	subtitle.innerHTML = subtitle.getAttribute('data-text');
	subtitle.setAttribute('data-text', temp);

}
