(function(){
  'use strict';

  function initCarousel(root){
    var track = root && root.querySelector('[data-carousel]');
    if(!track) return;

    // Basic drag/scroll snap for touch devices; arrows optional later
    var isDown = false, startX = 0, scrollLeft = 0;
    track.addEventListener('pointerdown', function(e){
      isDown = true; startX = e.pageX; scrollLeft = track.scrollLeft; track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function(e){
      if(!isDown) return; var dx = e.pageX - startX; track.scrollLeft = scrollLeft - dx;
    });
    track.addEventListener('pointerup', function(){ isDown = false; });
    track.addEventListener('pointercancel', function(){ isDown = false; });

    // Arrow navigation
    var prev = root.querySelector('.ng-pr__nav--prev');
    var next = root.querySelector('.ng-pr__nav--next');
    function scrollByCard(dir){
      var card = track.querySelector('.ng-pr__card');
      var cardWidth = card ? card.getBoundingClientRect().width + 16 : 300;
      track.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
    }
    if(prev){ prev.addEventListener('click', function(){ scrollByCard(-1); }); }
    if(next){ next.addEventListener('click', function(){ scrollByCard(1); }); }
  }

  function formatMoney(cents){
    try{ return Shopify.formatMoney ? Shopify.formatMoney(cents) : (cents/100).toFixed(2); }catch(e){ return (cents/100).toFixed(2); }
  }

  function withWidthParam(src, width){
    if(!src) return src;
    var join = src.indexOf('?') >= 0 ? '&' : '?';
    return src + join + 'width=' + (width || 900);
  }

  function initVariants(root){
    root.querySelectorAll('.ng-pr__card').forEach(function(card){
      var dataEl = card.querySelector('.ng-pr__data');
      if(!dataEl) return;
      var product = {};
      try{ product = JSON.parse(dataEl.textContent); }catch(e){ return; }

      var priceEl = card.querySelector('[data-price-current]');
      var compareEl = card.querySelector('[data-price-compare]');
      var imageEl = card.querySelector('.ng-pr__image img');
      var linkImage = card.querySelector('.ng-pr__image');
      var linkTitle = card.querySelector('.ng-pr__link');

      function applyVariant(variant){
        if(!variant) return;
        if(priceEl) priceEl.textContent = formatMoney(variant.price);
        if(compareEl){
          if(variant.compare_at_price > variant.price){
            compareEl.style.display='';
            compareEl.textContent = formatMoney(variant.compare_at_price);
          }else{
            compareEl.style.display='none';
          }
        }
        if(imageEl && variant.featured_image){
          var src = withWidthParam(variant.featured_image.src, 900);
          imageEl.src = src;
          imageEl.alt = variant.featured_image.alt || imageEl.alt || '';
        }

        // Update product links to selected variant
        var baseUrl = (product && product.url) || (linkImage && linkImage.getAttribute('href')) || '';
        if(baseUrl){
          var variantUrl = baseUrl + (baseUrl.indexOf('?')>=0 ? '&' : '?') + 'variant=' + variant.id;
          if(linkImage) linkImage.setAttribute('href', variantUrl);
          if(linkTitle) linkTitle.setAttribute('href', variantUrl);
        }
      }

      card.querySelectorAll('.ng-pr__swatch').forEach(function(btn){
        btn.addEventListener('click', function(){
          card.querySelectorAll('.ng-pr__swatch').forEach(function(b){ b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          var opt1 = btn.getAttribute('data-option1');
          var variant = product.variants && product.variants.find(function(v){ return v.option1 === opt1; });
          applyVariant(variant || product.variants && product.variants[0]);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.ng-pr').forEach(initCarousel);
    document.querySelectorAll('.ng-pr').forEach(initVariants);
  });

  if(window.Shopify && window.Shopify.designMode){
    document.addEventListener('shopify:section:load', function(e){
      var root = document.getElementById('ng-pr-' + e.detail.sectionId);
      if(root){ initCarousel(root); initVariants(root); }
    });
  }
})();


