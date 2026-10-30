# Harp_portfolio – marrywithharp.pl

Nowa wersja strony [marrywithharp.pl](https://marrywithharp.pl/) – Justyna Sasnal, harfa na ślubie.
Statyczna strona (HTML + CSS + odrobina JS), bez frameworków i bez kroku budowania.

## Animacje

Wszystkie animacje przewijania to czyste **CSS Scroll-driven Animations**
(`animation-timeline: scroll()` / `view()`), bez bibliotek JS:

| Sekcja | Efekt |
| --- | --- |
| Nagłówek | przejście z przezroczystego w kremowy + pasek postępu czytania |
| Hero | zoom/paralaksa zdjęcia, tekst unosi się i zanika |
| O mnie | „struny harfy” rysowane kolejno, łukowe zdjęcie odsłaniane `clip-path`, złote podkreślenia kluczowych fraz |
| Cytat | paralaksa tła, cytat wyostrza się w centrum ekranu |
| Posłuchaj | karty wideo z rozłożoną paralaksą; na telefonie karuzela `view(inline)` |
| Repertuar | karty wjeżdżają wachlarzem; na telefonie karuzela `view(inline)` |
| Galeria | przewijanie pionowe przesuwa przypiętą poziomą taśmę zdjęć |
| Opinie | karty „układające się w stos” (desktop) |
| Pytania | pytania wsuwają się kolejno; akordeon `<details name>` z animacją wysokości (`::details-content`) |
| Pasek „Zadzwoń / Napisz” (telefon) | pojawia się po hero, chowa się przy sekcji Kontakt (`timeline-scope`) |

Przeglądarki bez wsparcia (np. Firefox bez flagi) dostają pełną, statyczną wersję strony.
`prefers-reduced-motion: reduce` wyłącza ruch.

## Podgląd lokalny

```sh
python -m http.server 8000
# http://localhost:8000
```

## Struktura

```
index.html
assets/css/style.css   – style + animacje
assets/js/main.js      – menu mobilne, lightbox, odtwarzacz wideo, wysyłka formularza
assets/img/            – zdjęcia WebP (kilka rozmiarów, srcset)
assets/video/          – filmy H.264 720p (+faststart)
assets/fonts/          – Cormorant Garamond, Montserrat (lokalnie, latin + latin-ext)
```

Formularz kontaktowy wysyła wiadomości przez [FormSubmit](https://formsubmit.co/) na `marrywithharp@gmail.com`
(pierwsze zgłoszenie wymaga kliknięcia linku aktywacyjnego w mailu).
