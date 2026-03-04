
  (function ($) {
  
  "use strict";

    // NAVBAR
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });

    $(function() {
      const heroVerses = [
        {
          text: '"...Ako ostanete u Mojoj reči, zaista ste Moji učenici;<br>I upoznaćete istinu i istina će vas osloboditi."',
          ref: 'Jevanđelje po Jovanu 8:31-32',
        },
        {
          text: '"I tražićete me i naći ćete me, jer ćete me tražiti svim srcem svojim."',
          ref: 'Knjiga proroka Jeremije 29:13',
        },
        {
          text: '"Dođite k Meni svi koji ste umorni i opterećeni, i Ja ću vas odmoriti."',
          ref: 'Jevanđelje po Mateju 11:28',
        },
      ];

      const $heroVerseText = $('.hero-verse-text');
      const $heroVerseRef = $('.hero-verse-ref');
      const $heroSlides = $('.hero-slides');

      function updateHeroVerse(slideIndex) {
        const verse = heroVerses[slideIndex % heroVerses.length];

        if (!$heroVerseText.length || !$heroVerseRef.length || !verse) {
          return;
        }

        $heroVerseText.html(verse.text);
        $heroVerseRef.text(verse.ref);
      }

      $heroSlides.vegas({
          slides: [
              { src: 'images/bible_with_leaves.jpg' },
              { src: 'images/books.jpg' },
              { src: 'images/bibles.jpg' },
          ],
          timer: false,
          delay: 15e3,
          animation: 'kenburns',
      });

      updateHeroVerse(0);

      $heroSlides.on('vegaswalk', function (event, index) {
        updateHeroVerse(index);
      });
    });
    
    // CUSTOM LINK
    $('.smoothscroll[href^="#"]').click(function(){
      const el = $(this).attr('href');
      const elWrapped = $(el);

      if (!elWrapped.length) {
        return true;
      }
  
      scrollToDiv(elWrapped);
      return false;
  
      function scrollToDiv(element){
        const offset = element.offset();
        const offsetTop = offset.top;
        const totalScroll = offsetTop;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });
  
  })(window.jQuery);
