'use strict';

/**
 * Demo.
 */
var demo = (function(window, undefined) {

  /**
   * Enum of CSS selectors.
   */
  var SELECTORS = {
    pattern: '.pattern',
    card: '.card',
    cardImage: '.card__image',
    cardClose: '.card__btn-close',
  };

  /**
   * Enum of CSS classes.
   */
  var CLASSES = {
    patternHidden: 'pattern--hidden',
    polygon: 'polygon',
    polygonHidden: 'polygon--hidden'
  };

  /**
   * Map of svg paths and points.
   */
  // var polygonMap = {
  //   paths: null,
  //   points: null
  // };

  /**
   * Container of Card instances.
   */
  var layout = {};

  /**
   * Initialise demo.
   */
  function init() {
  _bindCards();
  };


  /**
   * Bind Card elements.
   * @private
   */
  function _bindCards() {

    var elements = $(SELECTORS.card);

    $.each(elements, function(card, i) {

      var instance = new Card(i, card);

      layout[i] = {
        card: instance
      };

      var cardImage = $(card).find(SELECTORS.cardImage);
      var cardClose = $(card).find(SELECTORS.cardClose);

      $(cardImage).on('click', _playSequence.bind(this, true, i));
      $(cardClose).on('click', _playSequence.bind(this, false, i));
    });
  };

  /**
   * Create a sequence for the open or close animation and play.
   * @param {boolean} isOpenClick Flag to detect when it's a click to open.
   * @param {number} id The id of the clicked card.
   * @param {Event} e The event object.
   * @private
   *
   */
  function _playSequence(isOpenClick, id, e) {
    // console.log(isOpenClick);
    // console.log(id);
    // console.log(e);
    var card = layout[id].card;
    // Prevent when card already open and user click on image.
    if (card._clip == undefined) return;
    if (card.isOpen && isOpenClick) return;
    

    // Create timeline for the whole sequence.
    var sequence = new TimelineLite({paused: true});

    var tweenOtherCards = _showHideOtherCards(id);

    if (!card.isOpen) {
      // Open sequence.

      sequence.add(tweenOtherCards);
      sequence.add(card.openCard(_onCardMove), 0);

    } else {
      // Close sequence.

      var closeCard = card.closeCard();
      var position = closeCard.duration() * 0.8; // 80% of close card tween.

      sequence.add(closeCard);
      sequence.add(tweenOtherCards, position);
    }

    sequence.play();
  };

  /**
   * Show/Hide all other cards.
   * @param {number} id The id of the clcked card to be avoided.
   * @private
   */
  function _showHideOtherCards(id) {

    var TL = new TimelineLite;

    var selectedCard = layout[id].card;

    for (var i in layout) {

      var card = layout[i].card;

      // When called with `openCard`.
      if (card.id !== id && !selectedCard.isOpen) {
        TL.add(card.hideCard(), 0);
      }

      // When called with `closeCard`.
      if (card.id !== id && selectedCard.isOpen) {
        TL.add(card.showCard(), 0);
      }
    }

    return TL;
  };

  /**
   * Callback to be executed on Tween update, whatever a polygon
   * falls into a circular area defined by the card width the path's
   * CSS class will change accordingly.
   * @param {Object} track The card sizes and position during the floating.
   * @private
   */
  function _onCardMove(track) {

    var radius = track.width / 2;

    var center = {
      x: track.x,
      y: track.y
    };

    // polygonMap.points.forEach(function(point, i) {
    // 
    //   if (_detectPointInCircle(point, radius, center)) {
    //     $(polygonMap.paths[i]).attr('class', CLASSES.polygon);
    //   } else {
    //     $(polygonMap.paths[i]).attr('class', CLASSES.polygon + ' ' + CLASSES.polygonHidden);
    //   }
    // });
  }

  /**
   * Detect if a point is inside a circle area.
   * @private
   */
  function _detectPointInCircle(point, radius, center) {

    var xp = point.x;
    var yp = point.y;

    var xc = center.x;
    var yc = center.y;

    var d = radius * radius;

    var isInside = Math.pow(xp - xc, 2) + Math.pow(yp - yc, 2) <= d;

    return isInside;
  };

  // Expose methods.
  return {
    init: init
  };

})(window);

// Kickstart Demo.
window.onload = demo.init;
