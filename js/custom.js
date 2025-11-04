
  (function ($) {
  
  "use strict";

    // NAVBAR
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });

    $(function() {
      $('.hero-slides').vegas({
          slides: [
              { src: 'images/bible_with_leaves.jpg' },
              { src: 'images/books.jpg' },
              { src: 'images/bibles.jpg' },
          ],
          timer: false,
          delay: 15e3,
          animation: 'kenburns',
      });
    });
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
      var el = $(this).attr('href');
      var elWrapped = $(el);
  
      scrollToDiv(elWrapped);
      return false;
  
      function scrollToDiv(element){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });
  
  })(window.jQuery);


