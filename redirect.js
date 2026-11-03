// club.armadaresidence.com → the club page of the Armada Residence website (3 Nov 2026). The whole query string is kept
// (the printed breakfast QR codes carry ?src=breakfast-airport / ?src=breakfast-shafa); ?lang=en opens the English page.
(function () {
  var base = 'https://armadaresidence.github.io/armadaresidence-website';
  var en = new URLSearchParams(location.search).get('lang') === 'en';
  location.replace(base + (en ? '/en' : '') + '/club/' + location.search + location.hash);
})();
