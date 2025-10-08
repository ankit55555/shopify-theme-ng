(function(){
  'use strict';

  function initCarousel(section){
    if(!section) return;
    var scroller = section.querySelector('.ngi-scroller');
    if(!scroller) return;

    var slides = Array.prototype.slice.call(section.querySelectorAll('.ngi-slide'));
    if(!slides.length) return;

    var prevBtn = section.querySelector('.ngi-prev');
    var nextBtn = section.querySelector('.ngi-next');
    var dotsWrap = section.querySelector('.ngi-dots');

    function getCardWidth(){
      var first = slides[0];
      return first ? first.getBoundingClientRect().width : scroller.clientWidth;
    }

    function scrollBy(amount){
      scroller.scrollBy({left: amount, behavior: 'smooth'});
    }

    function onPrev(){ scrollBy(-getCardWidth()); }
    function onNext(){ scrollBy(getCardWidth()); }

    prevBtn && prevBtn.addEventListener('click', onPrev);
    nextBtn && nextBtn.addEventListener('click', onNext);

    // Dots (optional)
    var showDots = section.getAttribute('data-show-dots') === 'true';
    var dots = [];
    if(dotsWrap && showDots){
      slides.forEach(function(_, i){
        var dot = document.createElement('button');
        dot.className = 'ngi-dot';
        dot.type = 'button';
        dot.addEventListener('click', function(){
          scroller.scrollTo({left: i * getCardWidth(), behavior: 'smooth'});
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function updateDots(){
      if(!dots.length) return;
      var idx = Math.round(scroller.scrollLeft / getCardWidth());
      dots.forEach(function(d,i){ d.classList.toggle('is-active', i === idx); });
    }
    scroller.addEventListener('scroll', function(){
      window.requestAnimationFrame(updateDots);
    });
    updateDots();

    // Autoplay
    var autoplay = section.getAttribute('data-autoplay') === 'true';
    var loop = section.getAttribute('data-loop') === 'true';
    var interval = parseInt(section.getAttribute('data-interval') || '5000', 10);
    var timer = null;
    function start(){
      if(!autoplay) return;
      stop();
      timer = window.setInterval(function(){
        var maxScroll = scroller.scrollWidth - scroller.clientWidth - 2;
        if(scroller.scrollLeft >= maxScroll){
          if(loop) scroller.scrollTo({left: 0, behavior: 'smooth'});
          else stop();
        } else onNext();
      }, interval);
    }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    section.addEventListener('mouseenter', stop);
    section.addEventListener('mouseleave', start);
    start();

    // Keyboard
    section.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft') onPrev();
      else if(e.key === 'ArrowRight') onNext();
    });
  }

  function onReady(){
    document.querySelectorAll('.ng-insights').forEach(initCarousel);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


