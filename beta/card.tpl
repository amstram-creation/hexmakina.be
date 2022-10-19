<div class="card">
<div class="card__container card__container--closed">

  <svg class="card__image" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <clipPath id="clipPath{iterator}">
        <!-- r = 992 = hyp = Math.sqrt(960*960+250*250) -->
        <circle class="clip" cx="960" cy="250" r="992"></circle>
      </clipPath>
    </defs>
    <image clip-path="url(#clipPath{iterator})" width="100%" height="333" xlink:href="_ui/aecons/{aecon}"></image>
  </svg>
  
  <div class="card__content">
    <strong class="card__btn-close" >&times;</strong>
    <div class="card__caption">
      <h4 class="card__title">{title}</h4>
      <p class="card__subtitle">{subtitle}</p>
    </div>
    <div class="card__copy">
      <div class="meta">
        <img class="meta__avatar" src="_ui/aecons/shutterstock_218641882_7_font_K_64.png" alt="{author}" />
        <span class="meta__author">{author}</span>
        <span class="meta__date">{timestamp}</span>
      </div>
      <p><q>{quote}<span class="author">{quote_author}</span></q></p>
      
      {content}

    </div>
    <strong class="card__btn-close" >&times;</strong>
  </div>
  <hr/>
  <div class="section-divider">
  <span><strong>&#9714;</strong><strong>&#9713;</strong></span>
  <span><strong>&#9715;</strong><strong>&#9712;</strong></span>
  </div>

</div>
</div>
