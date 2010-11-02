// Less Ugly JIRA 4.x
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "Hello World", and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Less Ugly JIRA 4.x
// @author        kef
// @namespace     http://github.com/tjackowiak
// @description   Makes JIRA a little less ugly
// @include       *jira*/browse/*-*
// @version       0.1
// ==/UserScript==


/**
 * Config
 */
const config ={
   // zamien glowne kolumny miejscami
   "switchColumns"     : true,
   // usuwanie naglowkow przy malej ilosci tekstu
   "removeFieldsTabs"  : true,
}

/**
 * Dorzucmy nieco stylu
 */
if(config["switchColumns"]){
   GM_addStyle(
      // zamieniamy kolumny miejscami za pomoca float'a
      "#primary,#secondary{float:right!important};"
   );
}
GM_addStyle([//{
/* Zalaczniki - zmniejszenie wolnej przestrzeni wokol */
"div.mod-content ol.item-attachments li{",
   "height:100%!important;",
   "padding:1px 5px!important;",
   "margin-bottom:0!important;",
"}",
"div.mod-content ol.item-attachments li div{",
   "height:100%!important;",
"}",

/* Nagłówki obszarow - zmniejszenie odstepow (Załączniki, Szczegóły) */
".mod-header {",
   "color: #3C78B5!important;",
   "background:url(\"http://" + window.location.hostname + "/s/531/3/1.0/_/images/mod_header_bg.png\") repeat-x scroll 0 13px #FFFFFF!important;",
   "padding: 0!important;",
"}",
".mod-header h3, .mod-header h3 a{",
   "color: #3C78B5!important;",
"}",

/* Opis zadania */
".item-details .twixified, #description-full{",
   "background-color: #f5f5f5!important;",
"}",

/* Opis zadania - pola wlasne */
"#customfieldmodule>div>ul li{",
   "border-right:1px solid;",
   "border-left:1px solid;",
   "border-bottom:1px solid;",
   "border-color: #eeeeee;",
   "display: table;",
   "float: none!important;",
"}",
"#customfieldmodule>div>ul li>div{",
   "display: table-row;",
"}",
"#customfieldmodule>div>ul li>div>*{",
   "display: table-cell;",
   "float: none!important;",
"}",
// pierwsza kolumna - nazwa pola
"#customfieldmodule>div>ul li>div>*:first-child{",
   "background-color:#F5F5F5;",
   "padding: 5px!important;",
"}",
// pole z krotkim komentarzem (bez mozliwosci zwijania)
"#customfieldmodule>div>ul li>div.wrap>div:not(.twixified){",
   "padding-left:1.25em!important;",
"}",
"#customfieldmodule>div>ul li>div.wrap>div:not(.twixified)>div.twixi-block{",
   "margin-left:-1.25em!important;",
"}",
"#customfieldmodule .concise .flooded{",
   "white-space:normal!important;",
"}",

/* Szczegoly zadania - spis w jednej kolumnie */
".two-cols .item {",
   "width: 100%!important;",
"}",
".two-cols .item-right .wrap {",
   "padding-left: 12em!important;",
   "border: 0!important;",
"}",

/* Komentarze - główny blok z całym wpisem */
".issue-data-block{",
   "background-color: #fefefe!important;",
   "border: 1px solid #eeeeee!important;",
   "padding:0!important;",
   "margin:0 0 0.5em 0!important;",   
"}",
".issue-data-block.focused{",
   "background-color: #f5f5f5!important;",
"}",
/* Komentarze - belka z autorem, datą i linkami akcji (edytuj, usuń)*/
".action-details{",
   "background-color: #eeeeee;",
"}",

/* Glowne kolumny */
//zwezamy boczna kolumne do 20%
"#secondary{width:20%!important;}",
"#primary{width:80%!important;}",

/* Drobne poprawki */
".tabwrap{ margin:0px!important;}",
".mod-header, .mod-content, .mod-footer {padding:0!important;}",
"ul.item-details li dl dt {width:50%!important;}",

].join("\n"));//}

/**
 * Na poczatek przenosimy node'a z podstawowymi
 * szczegolami zadania do bocznej kolumny
 */
// Oczywiscie jak na zlosc nie ma nadanego Id
tmp = document.getElementById('primary').firstElementChild.firstElementChild
// namierzamy prawa kolumne
rCol = document.getElementById('secondary').firstElementChild
// i wrzucamy info na gore 
rCol.insertBefore(tmp, rCol.firstElementChild)

/**
 * Czesc rzeczy wymaga jQuery. Znaczy nie wymaga, ale tak jest prosciej,
 * wiec wstrzykniemy je na koniec strony gdy domyslne skrypty JIRA
 * juz sie zaladowaly
 */
function makeMagic(){

   $ = window.jQuery;
   /**
    * Opis zadania wymaga ladniejszej oprawy
    * der ju goł
    */
   $("#issue-description ul li dl dt").replaceWith("<div class='mod-header'><h3>Opis</h3></div>")

   /**
    * Sprawdzmy czy strona zaladowana jest z hash-tagiem
    * Jesli tak to przyda sie przesunac okno
    * o wysokosc tego gownianego diva na gorze
    */
   if(/#\w+/.test(window.location.hash)){
      offsetElem = $("#stalker");
      offsetElemHeight=offsetElem.outerHeight();
      $(window).scrollTop($(window).scrollTop()-offsetElemHeight)
   }

   /**
    * Sa sobie takie zakladki nad dodatkowymi polami opisu
    * (np. opis incydentu, sposob rozwiazanie itd.)
    * ogolnie tylko zawadzaja, wiec gdy samego tekstu jest malo
    * to je wywalamy :)
    */
   customFieldTabs=$("#customfieldmodule div.tabwrap");
   customField=$("#customfieldmodule div.mod-content");
   if(removeFieldsTabs){
      if(customField.outerHeight() - customFieldTabs.outerHeight() < 200){
         customFieldTabs.remove();
      }
   } else{
      /**
       * JIRA ma buga. Domyslnie pokazuje tekst
       * ze wszystkich zakladek
       * Wlaczmy wiec pierwsza z nich
       */
      showTab(1);
   }
}

/**
 * Pozostalo wykonac wstrzykniecie
 * Ciii, nie bedzie bolalo ;)
 */
var inject = document.createElement("script");
inject.setAttribute("type", "text/javascript");
inject.appendChild(document.createTextNode("var removeFieldsTabs="+config["removeFieldsTabs"]+";"));
inject.appendChild(document.createTextNode("(" + makeMagic + ")()"));
document.body.appendChild(inject);