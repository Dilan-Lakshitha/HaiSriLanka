/**
 * Generates full Transloco UI files for all non-English locales
 * and content overlay JSON under src/assets/json/locales/{lang}/.
 *
 * Run: node scripts/generate-i18n-and-overlays.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const i18nDir = path.join(root, 'src/assets/i18n');
const jsonDir = path.join(root, 'src/assets/json');
const localesRoot = path.join(jsonDir, 'locales');

const LANGS = ['de', 'fr', 'es', 'it', 'nl', 'pl', 'sv', 'ru', 'ja', 'zh'];

/** Deep-clone */
const clone = (v) => JSON.parse(JSON.stringify(v));

/** Recursively collect string leaves with paths */
function collectStrings(obj, prefix = '', out = []) {
  if (typeof obj === 'string') {
    out.push({ path: prefix, value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectStrings(item, `${prefix}[${i}]`, out));
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      collectStrings(v, next, out);
    }
  }
  return out;
}

function setByPath(obj, dotted, value) {
  const parts = dotted.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const n = parts[i + 1];
    if (cur[p] == null) cur[p] = /^\d+$/.test(n) ? [] : {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

/** Manual high-quality UI dictionaries (full en.json tree replacements). */
const UI = {
  de: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Premium Inbound-Reisen durch Sri Lanka' },
    nav: {
      home: 'Startseite', tours: 'Touren', dayTours: 'Tagestouren', multiDayTours: 'Mehrtägige Touren',
      destinations: 'Reiseziele', experiences: 'Aktivitäten', blog: 'Journal', reviews: 'Bewertungen',
      gallery: 'Galerie', contact: 'Kontakt', about: 'Über uns', faq: 'FAQ',
      privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', travelGuide: 'Reiseführer',
      bookNow: 'Jetzt buchen', language: 'Sprache', openMenu: 'Menü öffnen', closeMenu: 'Menü schließen',
      skipToContent: 'Zum Inhalt springen', whatsapp: 'WhatsApp', viewAllTours: 'Alle Touren anzeigen',
      toursMegaCopy: 'Private Tagestouren und mehrtägige Reisen durch Sri Lanka.',
      primary: 'Hauptnavigation', contactLabel: 'Kontakt', social: 'Soziale Medien',
    },
    footer: {
      explore: 'Entdecken', company: 'Unternehmen', legal: 'Rechtliches',
      rights: 'Alle Rechte vorbehalten.', contactCta: 'Reise planen',
      newsletterThanks: 'Danke — Sie stehen auf der Liste.',
    },
    common: {
      loading: 'Laden…', learnMore: 'Mehr erfahren', viewAll: 'Alle anzeigen', from: 'Ab',
      perPerson: 'pro Person', comingSoon: 'Diese Seite ist vorbereitet. Inhalte folgen in der nächsten Phase.',
      backHome: 'Zur Startseite', notFoundTitle: 'Seite nicht gefunden',
      notFoundBody: 'Die angeforderte Seite existiert nicht oder wurde verschoben.',
      freeCancellation: 'Kostenlose Stornierung', payAtDestination: 'Zahlung vor Ort',
      toursCount: '{{count}} Touren', toursReady: '{{count}} Touren buchbereit',
      noTours: 'Derzeit keine Touren verfügbar.', noToursCategory: 'In dieser Kategorie derzeit keine Touren.',
      openFullDayList: 'Vollständige Tagesliste öffnen', openFullMultiList: 'Vollständige Mehrtagesliste öffnen',
      quickView: 'Schnellansicht', compare: 'Vergleichen', compared: 'Verglichen',
      wishlist: 'Merkliste', saved: 'Gespeichert', allTours: 'Alle Touren',
    },
    booking: {
      title: 'Tour buchen', eyebrow: 'Diese Tour buchen', privateInquiry: 'Private Anfrage',
      travelers: 'Reisende', date: 'Reisedatum', details: 'Angaben zu den Reisenden',
      summary: 'Buchungsübersicht', confirm: 'Buchung bestätigen', success: 'Buchungsanfrage gesendet',
      perPerson: 'Preis pro Person', total: 'Gesamt',
      emailNote: 'Sie und unser Team erhalten eine Bestätigung per E-Mail.',
      freeCancel: 'Kostenlos stornieren', payLater: 'Später zahlen',
      payAtDestination: 'Zahlung vor Ort', whatsappAdmin: 'Tour-Administrator per WhatsApp',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Grundlage bereit' },
  },
  fr: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Voyages inbound premium à travers le Sri Lanka' },
    nav: {
      home: 'Accueil', tours: 'Circuits', dayTours: 'Excursions d’une journée', multiDayTours: 'Circuits plurijournaliers',
      destinations: 'Destinations', experiences: 'À faire', blog: 'Journal', reviews: 'Avis',
      gallery: 'Galerie', contact: 'Contact', about: 'À propos', faq: 'FAQ',
      privacy: 'Confidentialité', terms: 'Conditions', travelGuide: 'Guide de voyage',
      bookNow: 'Réserver', language: 'Langue', openMenu: 'Ouvrir le menu', closeMenu: 'Fermer le menu',
      skipToContent: 'Aller au contenu', whatsapp: 'WhatsApp', viewAllTours: 'Voir tous les circuits',
      toursMegaCopy: 'Excursions privées d’une journée et voyages plurijournaliers au Sri Lanka.',
      primary: 'Navigation principale', contactLabel: 'Contact', social: 'Réseaux sociaux',
    },
    footer: {
      explore: 'Explorer', company: 'Entreprise', legal: 'Mentions légales',
      rights: 'Tous droits réservés.', contactCta: 'Planifier votre voyage',
      newsletterThanks: 'Merci — vous êtes sur la liste.',
    },
    common: {
      loading: 'Chargement…', learnMore: 'En savoir plus', viewAll: 'Tout voir', from: 'À partir de',
      perPerson: 'par personne', comingSoon: 'Cette page est prête. Le contenu arrive bientôt.',
      backHome: 'Retour à l’accueil', notFoundTitle: 'Page introuvable',
      notFoundBody: 'La page demandée n’existe pas ou a été déplacée.',
      freeCancellation: 'Annulation gratuite', payAtDestination: 'Paiement sur place',
      toursCount: '{{count}} circuits', toursReady: '{{count}} circuits prêts à réserver',
      noTours: 'Aucun circuit disponible pour le moment.', noToursCategory: 'Aucun circuit dans cette catégorie.',
      openFullDayList: 'Ouvrir la liste des journées', openFullMultiList: 'Ouvrir la liste plurijournalière',
      quickView: 'Aperçu rapide', compare: 'Comparer', compared: 'Comparé',
      wishlist: 'Favoris', saved: 'Enregistré', allTours: 'Tous les circuits',
    },
    booking: {
      title: 'Réservez votre circuit', eyebrow: 'Réserver ce circuit', privateInquiry: 'Demande privée',
      travelers: 'Voyageurs', date: 'Date de voyage', details: 'Coordonnées des voyageurs',
      summary: 'Récapitulatif', confirm: 'Confirmer la réservation', success: 'Demande envoyée',
      perPerson: 'Prix par personne', total: 'Total',
      emailNote: 'Vous et notre équipe recevrez une confirmation par e-mail.',
      freeCancel: 'Annulation gratuite', payLater: 'Payer plus tard',
      payAtDestination: 'Paiement sur place', whatsappAdmin: 'WhatsApp administrateur du circuit',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Fondation prête' },
  },
  es: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Viajes inbound premium por Sri Lanka' },
    nav: {
      home: 'Inicio', tours: 'Tours', dayTours: 'Tours de un día', multiDayTours: 'Tours de varios días',
      destinations: 'Destinos', experiences: 'Qué hacer', blog: 'Diario', reviews: 'Reseñas',
      gallery: 'Galería', contact: 'Contacto', about: 'Nosotros', faq: 'FAQ',
      privacy: 'Privacidad', terms: 'Términos', travelGuide: 'Guía de viaje',
      bookNow: 'Reservar', language: 'Idioma', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú',
      skipToContent: 'Saltar al contenido', whatsapp: 'WhatsApp', viewAllTours: 'Ver todos los tours',
      toursMegaCopy: 'Tours privados de un día y viajes de varios días por Sri Lanka.',
      primary: 'Navegación principal', contactLabel: 'Contacto', social: 'Redes sociales',
    },
    footer: {
      explore: 'Explorar', company: 'Empresa', legal: 'Legal',
      rights: 'Todos los derechos reservados.', contactCta: 'Planifica tu viaje',
      newsletterThanks: 'Gracias — estás en la lista.',
    },
    common: {
      loading: 'Cargando…', learnMore: 'Más información', viewAll: 'Ver todo', from: 'Desde',
      perPerson: 'por persona', comingSoon: 'Esta página está lista. El contenido llega pronto.',
      backHome: 'Volver al inicio', notFoundTitle: 'Página no encontrada',
      notFoundBody: 'La página solicitada no existe o se ha movido.',
      freeCancellation: 'Cancelación gratuita', payAtDestination: 'Pago en destino',
      toursCount: '{{count}} tours', toursReady: '{{count}} tours listos para reservar',
      noTours: 'No hay tours disponibles ahora.', noToursCategory: 'No hay tours en esta categoría.',
      openFullDayList: 'Abrir lista de un día', openFullMultiList: 'Abrir lista de varios días',
      quickView: 'Vista rápida', compare: 'Comparar', compared: 'Comparado',
      wishlist: 'Lista de deseos', saved: 'Guardado', allTours: 'Todos los tours',
    },
    booking: {
      title: 'Reserva tu tour', eyebrow: 'Reservar este tour', privateInquiry: 'Consulta privada',
      travelers: 'Viajeros', date: 'Fecha de viaje', details: 'Datos del viajero',
      summary: 'Resumen de reserva', confirm: 'Confirmar reserva', success: 'Solicitud enviada',
      perPerson: 'Precio por persona', total: 'Total',
      emailNote: 'Tú y nuestro equipo recibiréis confirmación por correo.',
      freeCancel: 'Cancelación gratis', payLater: 'Pagar después',
      payAtDestination: 'Pago en destino', whatsappAdmin: 'WhatsApp administrador del tour',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Base lista' },
  },
  it: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Viaggi inbound premium in Sri Lanka' },
    nav: {
      home: 'Home', tours: 'Tour', dayTours: 'Tour giornalieri', multiDayTours: 'Tour plurigiornalieri',
      destinations: 'Destinazioni', experiences: 'Cose da fare', blog: 'Diario', reviews: 'Recensioni',
      gallery: 'Galleria', contact: 'Contatti', about: 'Chi siamo', faq: 'FAQ',
      privacy: 'Privacy', terms: 'Termini', travelGuide: 'Guida di viaggio',
      bookNow: 'Prenota', language: 'Lingua', openMenu: 'Apri menu', closeMenu: 'Chiudi menu',
      skipToContent: 'Vai al contenuto', whatsapp: 'WhatsApp', viewAllTours: 'Vedi tutti i tour',
      toursMegaCopy: 'Tour giornalieri privati e viaggi plurigiornalieri in Sri Lanka.',
      primary: 'Navigazione principale', contactLabel: 'Contatti', social: 'Social media',
    },
    footer: {
      explore: 'Esplora', company: 'Azienda', legal: 'Note legali',
      rights: 'Tutti i diritti riservati.', contactCta: 'Pianifica il viaggio',
      newsletterThanks: 'Grazie — sei in lista.',
    },
    common: {
      loading: 'Caricamento…', learnMore: 'Scopri di più', viewAll: 'Vedi tutto', from: 'Da',
      perPerson: 'a persona', comingSoon: 'Questa pagina è pronta. I contenuti arriveranno presto.',
      backHome: 'Torna alla home', notFoundTitle: 'Pagina non trovata',
      notFoundBody: 'La pagina richiesta non esiste o è stata spostata.',
      freeCancellation: 'Cancellazione gratuita', payAtDestination: 'Pagamento a destinazione',
      toursCount: '{{count}} tour', toursReady: '{{count}} tour pronti da prenotare',
      noTours: 'Nessun tour disponibile al momento.', noToursCategory: 'Nessun tour in questa categoria.',
      openFullDayList: 'Apri elenco giornaliero', openFullMultiList: 'Apri elenco plurigiornaliero',
      quickView: 'Anteprima rapida', compare: 'Confronta', compared: 'Confrontato',
      wishlist: 'Preferiti', saved: 'Salvato', allTours: 'Tutti i tour',
    },
    booking: {
      title: 'Prenota il tour', eyebrow: 'Prenota questo tour', privateInquiry: 'Richiesta privata',
      travelers: 'Viaggiatori', date: 'Data di viaggio', details: 'Dati del viaggiatore',
      summary: 'Riepilogo prenotazione', confirm: 'Conferma prenotazione', success: 'Richiesta inviata',
      perPerson: 'Prezzo a persona', total: 'Totale',
      emailNote: 'Tu e il nostro team riceverete conferma via e-mail.',
      freeCancel: 'Cancellazione gratuita', payLater: 'Paga dopo',
      payAtDestination: 'Pagamento a destinazione', whatsappAdmin: 'WhatsApp amministratore tour',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Fondazione pronta' },
  },
  nl: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Premium inbound-reizen door Sri Lanka' },
    nav: {
      home: 'Home', tours: 'Tours', dayTours: 'Dagtrips', multiDayTours: 'Meerdaagse tours',
      destinations: 'Bestemmingen', experiences: 'Activiteiten', blog: 'Journal', reviews: 'Reviews',
      gallery: 'Galerie', contact: 'Contact', about: 'Over ons', faq: 'FAQ',
      privacy: 'Privacy', terms: 'Voorwaarden', travelGuide: 'Reisgids',
      bookNow: 'Boeken', language: 'Taal', openMenu: 'Menu openen', closeMenu: 'Menu sluiten',
      skipToContent: 'Naar inhoud', whatsapp: 'WhatsApp', viewAllTours: 'Alle tours bekijken',
      toursMegaCopy: 'Privé dagtrips en meerdaagse reizen door Sri Lanka.',
      primary: 'Hoofdnavigatie', contactLabel: 'Contact', social: 'Sociale media',
    },
    footer: {
      explore: 'Ontdekken', company: 'Bedrijf', legal: 'Juridisch',
      rights: 'Alle rechten voorbehouden.', contactCta: 'Plan je reis',
      newsletterThanks: 'Bedankt — je staat op de lijst.',
    },
    common: {
      loading: 'Laden…', learnMore: 'Meer info', viewAll: 'Alles bekijken', from: 'Vanaf',
      perPerson: 'per persoon', comingSoon: 'Deze pagina is klaar. Content volgt binnenkort.',
      backHome: 'Terug naar home', notFoundTitle: 'Pagina niet gevonden',
      notFoundBody: 'De gevraagde pagina bestaat niet of is verplaatst.',
      freeCancellation: 'Gratis annuleren', payAtDestination: 'Betalen op bestemming',
      toursCount: '{{count}} tours', toursReady: '{{count}} tours klaar om te boeken',
      noTours: 'Geen tours beschikbaar.', noToursCategory: 'Geen tours in deze categorie.',
      openFullDayList: 'Volledige daglijst openen', openFullMultiList: 'Volledige meerdaagse lijst openen',
      quickView: 'Snel bekijken', compare: 'Vergelijken', compared: 'Vergeleken',
      wishlist: 'Verlanglijst', saved: 'Opgeslagen', allTours: 'Alle tours',
    },
    booking: {
      title: 'Boek je tour', eyebrow: 'Boek deze tour', privateInquiry: 'Privéaanvraag',
      travelers: 'Reizigers', date: 'Reisdatum', details: 'Reizigersgegevens',
      summary: 'Boekingsoverzicht', confirm: 'Boeking bevestigen', success: 'Aanvraag verzonden',
      perPerson: 'Prijs per persoon', total: 'Totaal',
      emailNote: 'Jij en ons team ontvangen bevestiging per e-mail.',
      freeCancel: 'Gratis annuleren', payLater: 'Later betalen',
      payAtDestination: 'Betalen op bestemming', whatsappAdmin: 'WhatsApp tourbeheerder',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Basis klaar' },
  },
  pl: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Premiumowe podróże inbound po Sri Lance' },
    nav: {
      home: 'Strona główna', tours: 'Wycieczki', dayTours: 'Wycieczki jednodniowe', multiDayTours: 'Wycieczki wielodniowe',
      destinations: 'Destynacje', experiences: 'Atrakcje', blog: 'Dziennik', reviews: 'Opinie',
      gallery: 'Galeria', contact: 'Kontakt', about: 'O nas', faq: 'FAQ',
      privacy: 'Prywatność', terms: 'Regulamin', travelGuide: 'Przewodnik',
      bookNow: 'Zarezerwuj', language: 'Język', openMenu: 'Otwórz menu', closeMenu: 'Zamknij menu',
      skipToContent: 'Przejdź do treści', whatsapp: 'WhatsApp', viewAllTours: 'Zobacz wszystkie wycieczki',
      toursMegaCopy: 'Prywatne wycieczki jednodniowe i wielodniowe po Sri Lance.',
      primary: 'Nawigacja główna', contactLabel: 'Kontakt', social: 'Media społecznościowe',
    },
    footer: {
      explore: 'Odkrywaj', company: 'Firma', legal: 'Prawne',
      rights: 'Wszelkie prawa zastrzeżone.', contactCta: 'Zaplanuj podróż',
      newsletterThanks: 'Dziękujemy — jesteś na liście.',
    },
    common: {
      loading: 'Ładowanie…', learnMore: 'Dowiedz się więcej', viewAll: 'Zobacz wszystko', from: 'Od',
      perPerson: 'za osobę', comingSoon: 'Ta strona jest gotowa. Treści wkrótce.',
      backHome: 'Wróć do strony głównej', notFoundTitle: 'Nie znaleziono strony',
      notFoundBody: 'Żądana strona nie istnieje lub została przeniesiona.',
      freeCancellation: 'Bezpłatna anulacja', payAtDestination: 'Płatność na miejscu',
      toursCount: '{{count}} wycieczek', toursReady: '{{count}} wycieczek gotowych do rezerwacji',
      noTours: 'Brak dostępnych wycieczek.', noToursCategory: 'Brak wycieczek w tej kategorii.',
      openFullDayList: 'Otwórz listę jednodniową', openFullMultiList: 'Otwórz listę wielodniową',
      quickView: 'Szybki podgląd', compare: 'Porównaj', compared: 'Porównano',
      wishlist: 'Lista życzeń', saved: 'Zapisano', allTours: 'Wszystkie wycieczki',
    },
    booking: {
      title: 'Zarezerwuj wycieczkę', eyebrow: 'Zarezerwuj tę wycieczkę', privateInquiry: 'Zapytanie prywatne',
      travelers: 'Podróżni', date: 'Data podróży', details: 'Dane podróżnych',
      summary: 'Podsumowanie rezerwacji', confirm: 'Potwierdź rezerwację', success: 'Zapytanie wysłane',
      perPerson: 'Cena za osobę', total: 'Razem',
      emailNote: 'Ty i nasz zespół otrzymacie potwierdzenie e-mailem.',
      freeCancel: 'Bezpłatna anulacja', payLater: 'Zapłać później',
      payAtDestination: 'Płatność na miejscu', whatsappAdmin: 'WhatsApp administratora wycieczki',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Podstawa gotowa' },
  },
  sv: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Premium inbound-resor genom Sri Lanka' },
    nav: {
      home: 'Hem', tours: 'Turer', dayTours: 'Dagsutflykter', multiDayTours: 'Flerdagsturer',
      destinations: 'Destinationer', experiences: 'Att göra', blog: 'Journal', reviews: 'Omdömen',
      gallery: 'Galleri', contact: 'Kontakt', about: 'Om oss', faq: 'FAQ',
      privacy: 'Integritet', terms: 'Villkor', travelGuide: 'Reseguide',
      bookNow: 'Boka', language: 'Språk', openMenu: 'Öppna meny', closeMenu: 'Stäng meny',
      skipToContent: 'Hoppa till innehåll', whatsapp: 'WhatsApp', viewAllTours: 'Visa alla turer',
      toursMegaCopy: 'Privata dagsutflykter och flerdagsresor genom Sri Lanka.',
      primary: 'Huvudnavigering', contactLabel: 'Kontakt', social: 'Sociala medier',
    },
    footer: {
      explore: 'Utforska', company: 'Företag', legal: 'Juridiskt',
      rights: 'Alla rättigheter förbehållna.', contactCta: 'Planera din resa',
      newsletterThanks: 'Tack — du är på listan.',
    },
    common: {
      loading: 'Laddar…', learnMore: 'Läs mer', viewAll: 'Visa alla', from: 'Från',
      perPerson: 'per person', comingSoon: 'Sidan är redo. Innehåll kommer snart.',
      backHome: 'Tillbaka till hem', notFoundTitle: 'Sidan hittades inte',
      notFoundBody: 'Den begärda sidan finns inte eller har flyttats.',
      freeCancellation: 'Gratis avbokning', payAtDestination: 'Betala på plats',
      toursCount: '{{count}} turer', toursReady: '{{count}} turer redo att boka',
      noTours: 'Inga turer tillgängliga just nu.', noToursCategory: 'Inga turer i denna kategori.',
      openFullDayList: 'Öppna full daglista', openFullMultiList: 'Öppna full flerdagslista',
      quickView: 'Snabbvy', compare: 'Jämför', compared: 'Jämförd',
      wishlist: 'Önskelista', saved: 'Sparad', allTours: 'Alla turer',
    },
    booking: {
      title: 'Boka din tur', eyebrow: 'Boka denna tur', privateInquiry: 'Privat förfrågan',
      travelers: 'Resenärer', date: 'Resedatum', details: 'Resenärsuppgifter',
      summary: 'Bokningsöversikt', confirm: 'Bekräfta bokning', success: 'Förfrågan skickad',
      perPerson: 'Pris per person', total: 'Totalt',
      emailNote: 'Du och vårt team får bekräftelse via e-post.',
      freeCancel: 'Gratis avbokning', payLater: 'Betala senare',
      payAtDestination: 'Betala på plats', whatsappAdmin: 'WhatsApp turadministratör',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Grund klar' },
  },
  ru: {
    brand: { name: 'Hai Sri Lanka', tagline: 'Премиальные inbound-путешествия по Шри-Ланке' },
    nav: {
      home: 'Главная', tours: 'Туры', dayTours: 'Однодневные туры', multiDayTours: 'Многодневные туры',
      destinations: 'Направления', experiences: 'Чем заняться', blog: 'Журнал', reviews: 'Отзывы',
      gallery: 'Галерея', contact: 'Контакты', about: 'О нас', faq: 'FAQ',
      privacy: 'Конфиденциальность', terms: 'Условия', travelGuide: 'Путеводитель',
      bookNow: 'Забронировать', language: 'Язык', openMenu: 'Открыть меню', closeMenu: 'Закрыть меню',
      skipToContent: 'К содержимому', whatsapp: 'WhatsApp', viewAllTours: 'Все туры',
      toursMegaCopy: 'Частные однодневные и многодневные путешествия по Шри-Ланке.',
      primary: 'Основная навигация', contactLabel: 'Контакты', social: 'Соцсети',
    },
    footer: {
      explore: 'Обзор', company: 'Компания', legal: 'Правовая информация',
      rights: 'Все права защищены.', contactCta: 'Спланировать поездку',
      newsletterThanks: 'Спасибо — вы в списке.',
    },
    common: {
      loading: 'Загрузка…', learnMore: 'Подробнее', viewAll: 'Смотреть все', from: 'От',
      perPerson: 'с человека', comingSoon: 'Страница готова. Контент появится позже.',
      backHome: 'На главную', notFoundTitle: 'Страница не найдена',
      notFoundBody: 'Запрошенная страница не существует или была перемещена.',
      freeCancellation: 'Бесплатная отмена', payAtDestination: 'Оплата на месте',
      toursCount: '{{count}} туров', toursReady: '{{count}} туров готовы к бронированию',
      noTours: 'Туры сейчас недоступны.', noToursCategory: 'В этой категории нет туров.',
      openFullDayList: 'Открыть полный список дней', openFullMultiList: 'Открыть полный многодневный список',
      quickView: 'Быстрый просмотр', compare: 'Сравнить', compared: 'Сравнено',
      wishlist: 'Избранное', saved: 'Сохранено', allTours: 'Все туры',
    },
    booking: {
      title: 'Забронируйте тур', eyebrow: 'Забронировать этот тур', privateInquiry: 'Частный запрос',
      travelers: 'Путешественники', date: 'Дата поездки', details: 'Данные путешественников',
      summary: 'Сводка бронирования', confirm: 'Подтвердить бронирование', success: 'Запрос отправлен',
      perPerson: 'Цена с человека', total: 'Итого',
      emailNote: 'Вы и наша команда получите подтверждение по электронной почте.',
      freeCancel: 'Бесплатная отмена', payLater: 'Оплатить позже',
      payAtDestination: 'Оплата на месте', whatsappAdmin: 'WhatsApp администратора тура',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: 'Основа готова' },
  },
  ja: {
    brand: { name: 'Hai Sri Lanka', tagline: 'スリランカを巡るプレミアムインバウンド旅' },
    nav: {
      home: 'ホーム', tours: 'ツアー', dayTours: '日帰りツアー', multiDayTours: '周遊ツアー',
      destinations: '行き先', experiences: '体験', blog: 'ジャーナル', reviews: 'レビュー',
      gallery: 'ギャラリー', contact: 'お問い合わせ', about: '会社概要', faq: 'FAQ',
      privacy: 'プライバシー', terms: '利用規約', travelGuide: '旅行ガイド',
      bookNow: '予約する', language: '言語', openMenu: 'メニューを開く', closeMenu: 'メニューを閉じる',
      skipToContent: '本文へ', whatsapp: 'WhatsApp', viewAllTours: 'すべてのツアーを見る',
      toursMegaCopy: 'スリランカのプライベート日帰り＆周遊ツアー。',
      primary: 'メインナビ', contactLabel: 'お問い合わせ', social: 'ソーシャルメディア',
    },
    footer: {
      explore: '探す', company: '会社', legal: '法務',
      rights: '無断転載を禁じます。', contactCta: '旅を計画する',
      newsletterThanks: '登録ありがとうございます。',
    },
    common: {
      loading: '読み込み中…', learnMore: '詳しく見る', viewAll: 'すべて見る', from: '〜から',
      perPerson: 'お一人様', comingSoon: 'このページは準備済みです。コンテンツは近日公開。',
      backHome: 'ホームへ戻る', notFoundTitle: 'ページが見つかりません',
      notFoundBody: 'お探しのページは存在しないか移動しました。',
      freeCancellation: '無料キャンセル', payAtDestination: '現地払い',
      toursCount: '{{count}} ツアー', toursReady: '予約可能なツアー {{count}} 件',
      noTours: '現在ツアーはありません。', noToursCategory: 'このカテゴリにツアーはありません。',
      openFullDayList: '日帰り一覧を開く', openFullMultiList: '周遊一覧を開く',
      quickView: 'クイックビュー', compare: '比較', compared: '比較済み',
      wishlist: 'ウィッシュリスト', saved: '保存済み', allTours: 'すべてのツアー',
    },
    booking: {
      title: 'ツアーを予約', eyebrow: 'このツアーを予約', privateInquiry: 'プライベートお問い合わせ',
      travelers: '人数', date: '旅行日', details: '旅行者情報',
      summary: '予約概要', confirm: '予約を確認', success: 'リクエスト送信済み',
      perPerson: 'お一人様料金', total: '合計',
      emailNote: 'ご本人と当社にメールで確認が届きます。',
      freeCancel: '無料キャンセル', payLater: '後払い',
      payAtDestination: '現地払い', whatsappAdmin: 'ツアー管理者に WhatsApp',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: '準備完了' },
  },
  zh: {
    brand: { name: 'Hai Sri Lanka', tagline: '斯里兰卡高端入境私人旅程' },
    nav: {
      home: '首页', tours: '行程', dayTours: '一日游', multiDayTours: '多日游',
      destinations: '目的地', experiences: '体验', blog: '日志', reviews: '评价',
      gallery: '图库', contact: '联系', about: '关于我们', faq: '常见问题',
      privacy: '隐私政策', terms: '服务条款', travelGuide: '旅行指南',
      bookNow: '立即预订', language: '语言', openMenu: '打开菜单', closeMenu: '关闭菜单',
      skipToContent: '跳到内容', whatsapp: 'WhatsApp', viewAllTours: '查看全部行程',
      toursMegaCopy: '斯里兰卡私人一日游与多日旅程。',
      primary: '主导航', contactLabel: '联系', social: '社交媒体',
    },
    footer: {
      explore: '探索', company: '公司', legal: '法律',
      rights: '版权所有。', contactCta: '规划旅程',
      newsletterThanks: '谢谢 — 您已加入名单。',
    },
    common: {
      loading: '加载中…', learnMore: '了解更多', viewAll: '查看全部', from: '起价',
      perPerson: '每人', comingSoon: '页面已就绪，内容即将上线。',
      backHome: '返回首页', notFoundTitle: '页面未找到',
      notFoundBody: '您请求的页面不存在或已移动。',
      freeCancellation: '免费取消', payAtDestination: '目的地付款',
      toursCount: '{{count}} 个行程', toursReady: '{{count}} 个行程可预订',
      noTours: '暂无行程。', noToursCategory: '该分类暂无行程。',
      openFullDayList: '打开一日游列表', openFullMultiList: '打开多日游列表',
      quickView: '快速预览', compare: '对比', compared: '已对比',
      wishlist: '心愿单', saved: '已保存', allTours: '全部行程',
    },
    booking: {
      title: '预订行程', eyebrow: '预订此行程', privateInquiry: '私人咨询',
      travelers: '旅客', date: '出行日期', details: '旅客信息',
      summary: '预订摘要', confirm: '确认预订', success: '请求已发送',
      perPerson: '每人价格', total: '合计',
      emailNote: '您与我们的团队将收到电子邮件确认。',
      freeCancel: '免费取消', payLater: '稍后付款',
      payAtDestination: '目的地付款', whatsappAdmin: 'WhatsApp 行程管理员',
    },
    placeholder: { pageTitle: '{{page}}', foundationReady: '基础已就绪' },
  },
};

/** SEO translations (titles/descriptions) per lang — keep structure of en.seo */
function seoFor(lang, enSeo) {
  const labels = {
    de: { Tours: 'Touren', Destinations: 'Reiseziele', Contact: 'Kontakt', Reviews: 'Bewertungen', Blog: 'Blog', FAQ: 'FAQ', About: 'Über uns', Gallery: 'Galerie', Booking: 'Buchung', Privacy: 'Datenschutz', Terms: 'Nutzungsbedingungen', Guide: 'Reiseführer', 'Things To Do': 'Aktivitäten', 'Day Tours': 'Tagestouren', 'Multi-Day': 'Mehrtägige', 'Page Not Found': 'Seite nicht gefunden', Travel: 'Reisen' },
    fr: { Tours: 'Circuits', Destinations: 'Destinations', Contact: 'Contact', Reviews: 'Avis', Blog: 'Blog', FAQ: 'FAQ', About: 'À propos', Gallery: 'Galerie', Booking: 'Réservation', Privacy: 'Confidentialité', Terms: 'Conditions', Guide: 'Guide', 'Things To Do': 'À faire', 'Day Tours': 'Excursions', 'Multi-Day': 'Plurijournaliers', 'Page Not Found': 'Page introuvable', Travel: 'Voyage' },
    es: { Tours: 'Tours', Destinations: 'Destinos', Contact: 'Contacto', Reviews: 'Reseñas', Blog: 'Blog', FAQ: 'FAQ', About: 'Nosotros', Gallery: 'Galería', Booking: 'Reserva', Privacy: 'Privacidad', Terms: 'Términos', Guide: 'Guía', 'Things To Do': 'Qué hacer', 'Day Tours': 'Tours de un día', 'Multi-Day': 'Varios días', 'Page Not Found': 'Página no encontrada', Travel: 'Viajes' },
    it: { Tours: 'Tour', Destinations: 'Destinazioni', Contact: 'Contatti', Reviews: 'Recensioni', Blog: 'Blog', FAQ: 'FAQ', About: 'Chi siamo', Gallery: 'Galleria', Booking: 'Prenotazione', Privacy: 'Privacy', Terms: 'Termini', Guide: 'Guida', 'Things To Do': 'Cose da fare', 'Day Tours': 'Tour giornalieri', 'Multi-Day': 'Plurigiornalieri', 'Page Not Found': 'Pagina non trovata', Travel: 'Viaggi' },
    nl: { Tours: 'Tours', Destinations: 'Bestemmingen', Contact: 'Contact', Reviews: 'Reviews', Blog: 'Blog', FAQ: 'FAQ', About: 'Over ons', Gallery: 'Galerie', Booking: 'Boeken', Privacy: 'Privacy', Terms: 'Voorwaarden', Guide: 'Gids', 'Things To Do': 'Activiteiten', 'Day Tours': 'Dagtrips', 'Multi-Day': 'Meerdaags', 'Page Not Found': 'Pagina niet gevonden', Travel: 'Reizen' },
    pl: { Tours: 'Wycieczki', Destinations: 'Destynacje', Contact: 'Kontakt', Reviews: 'Opinie', Blog: 'Blog', FAQ: 'FAQ', About: 'O nas', Gallery: 'Galeria', Booking: 'Rezerwacja', Privacy: 'Prywatność', Terms: 'Regulamin', Guide: 'Przewodnik', 'Things To Do': 'Atrakcje', 'Day Tours': 'Jednodniowe', 'Multi-Day': 'Wielodniowe', 'Page Not Found': 'Nie znaleziono', Travel: 'Podróże' },
    sv: { Tours: 'Turer', Destinations: 'Destinationer', Contact: 'Kontakt', Reviews: 'Omdömen', Blog: 'Blogg', FAQ: 'FAQ', About: 'Om oss', Gallery: 'Galleri', Booking: 'Bokning', Privacy: 'Integritet', Terms: 'Villkor', Guide: 'Guide', 'Things To Do': 'Att göra', 'Day Tours': 'Dagsutflykter', 'Multi-Day': 'Flerdagars', 'Page Not Found': 'Sidan hittades inte', Travel: 'Resor' },
    ru: { Tours: 'Туры', Destinations: 'Направления', Contact: 'Контакты', Reviews: 'Отзывы', Blog: 'Блог', FAQ: 'FAQ', About: 'О нас', Gallery: 'Галерея', Booking: 'Бронирование', Privacy: 'Конфиденциальность', Terms: 'Условия', Guide: 'Путеводитель', 'Things To Do': 'Развлечения', 'Day Tours': 'Однодневные', 'Multi-Day': 'Многодневные', 'Page Not Found': 'Страница не найдена', Travel: 'Путешествия' },
    ja: { Tours: 'ツアー', Destinations: '行き先', Contact: 'お問い合わせ', Reviews: 'レビュー', Blog: 'ブログ', FAQ: 'FAQ', About: '会社概要', Gallery: 'ギャラリー', Booking: '予約', Privacy: 'プライバシー', Terms: '利用規約', Guide: 'ガイド', 'Things To Do': '体験', 'Day Tours': '日帰り', 'Multi-Day': '周遊', 'Page Not Found': 'ページが見つかりません', Travel: '旅行' },
    zh: { Tours: '行程', Destinations: '目的地', Contact: '联系', Reviews: '评价', Blog: '博客', FAQ: '常见问题', About: '关于我们', Gallery: '图库', Booking: '预订', Privacy: '隐私', Terms: '条款', Guide: '指南', 'Things To Do': '体验', 'Day Tours': '一日游', 'Multi-Day': '多日游', 'Page Not Found': '页面未找到', Travel: '旅行' },
  };
  const map = labels[lang] || {};
  const out = clone(enSeo);
  for (const [key, block] of Object.entries(out)) {
    if (block.title) {
      let t = block.title;
      for (const [en, loc] of Object.entries(map)) t = t.split(en).join(loc);
      block.title = t;
    }
    if (block.description) {
      // Prefix locale marker for clarity while keeping readable English fallback structure localized lightly
      block.description = localizeSentence(block.description, lang);
    }
  }
  return out;
}

/** Lightweight sentence localization for content overlays */
const PHRASE = {
  de: [
    [/Private /gi, 'Private '], [/day tour/gi, 'Tagestour'], [/multi-day/gi, 'mehrtägige'],
    [/Sri Lanka/g, 'Sri Lanka'], [/Free cancellation/gi, 'Kostenlose Stornierung'],
    [/Pay at destination/gi, 'Zahlung vor Ort'], [/From /g, 'Ab '], [/per person/gi, 'pro Person'],
    [/Discover Ceylon in quiet luxury/gi, 'Entdecken Sie Ceylon in ruhigem Luxus'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Maßgeschneiderte Reisen durch Tempel, Teelandschaften, Wildnis und Küste — im Tempo anspruchsvoller Reisender.'],
    [/Private inbound travel · Sri Lanka/gi, 'Private Inbound-Reisen · Sri Lanka'],
    [/Explore tours/gi, 'Touren entdecken'], [/Plan with us/gi, 'Mit uns planen'],
    [/Hospitality shaped for private travel/gi, 'Gastfreundschaft für privates Reisen'],
    [/WHY HAI SRI LANKA/gi, 'WARUM HAI SRI LANKA'],
  ],
  fr: [
    [/Discover Ceylon in quiet luxury/gi, 'Découvrez Ceylan dans un luxe discret'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Voyages sur mesure entre temples, pays du thé, faune et côte — au rythme des voyageurs exigeants.'],
    [/Private inbound travel · Sri Lanka/gi, 'Voyage inbound privé · Sri Lanka'],
    [/Explore tours/gi, 'Explorer les circuits'], [/Plan with us/gi, 'Planifier avec nous'],
    [/Hospitality shaped for private travel/gi, 'Une hospitalité pensée pour le voyage privé'],
    [/WHY HAI SRI LANKA/gi, 'POURQUOI HAI SRI LANKA'],
    [/Free cancellation/gi, 'Annulation gratuite'], [/Pay at destination/gi, 'Paiement sur place'],
  ],
  es: [
    [/Discover Ceylon in quiet luxury/gi, 'Descubre Ceilán con lujo sereno'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Viajes a medida entre templos, country del té, vida silvestre y costa, al ritmo de viajeros exigentes.'],
    [/Private inbound travel · Sri Lanka/gi, 'Viaje inbound privado · Sri Lanka'],
    [/Explore tours/gi, 'Explorar tours'], [/Plan with us/gi, 'Planifica con nosotros'],
    [/Hospitality shaped for private travel/gi, 'Hospitalidad pensada para viajes privados'],
    [/WHY HAI SRI LANKA/gi, 'POR QUÉ HAI SRI LANKA'],
    [/Free cancellation/gi, 'Cancelación gratuita'], [/Pay at destination/gi, 'Pago en destino'],
  ],
  it: [
    [/Discover Ceylon in quiet luxury/gi, 'Scopri Ceylon nel lusso discreto'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Viaggi su misura tra templi, tea country, wildlife e costa, al ritmo di viaggiatori esigenti.'],
    [/Private inbound travel · Sri Lanka/gi, 'Viaggio inbound privato · Sri Lanka'],
    [/Explore tours/gi, 'Esplora i tour'], [/Plan with us/gi, 'Pianifica con noi'],
    [/Hospitality shaped for private travel/gi, 'Ospitalità pensata per il viaggio privato'],
    [/WHY HAI SRI LANKA/gi, 'PERCHÉ HAI SRI LANKA'],
  ],
  nl: [
    [/Discover Ceylon in quiet luxury/gi, 'Ontdek Ceylon in stille luxe'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Op maat gemaakte reizen langs tempels, theegebied, wildlife en kust — in het tempo van veeleisende reizigers.'],
    [/Private inbound travel · Sri Lanka/gi, 'Privé inbound travel · Sri Lanka'],
    [/Explore tours/gi, 'Tours verkennen'], [/Plan with us/gi, 'Plan met ons'],
    [/Hospitality shaped for private travel/gi, 'Gastvrijheid voor privéreizen'],
  ],
  pl: [
    [/Discover Ceylon in quiet luxury/gi, 'Odkryj Cejlon w spokojnym luksusie'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Podróże szyte na miarę: świątynie, herbaciane wzgórza, przyroda i wybrzeże — w tempie wymagających podróżników.'],
    [/Private inbound travel · Sri Lanka/gi, 'Prywatne podróże inbound · Sri Lanka'],
    [/Explore tours/gi, 'Przeglądaj wycieczki'], [/Plan with us/gi, 'Zaplanuj z nami'],
  ],
  sv: [
    [/Discover Ceylon in quiet luxury/gi, 'Upptäck Ceylon i stillsam lyx'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Skräddarsydda resor genom tempel, tedistrikt, wildlife och kust — i tempo för kräsna resenärer.'],
    [/Private inbound travel · Sri Lanka/gi, 'Privat inbound-resa · Sri Lanka'],
    [/Explore tours/gi, 'Utforska turer'], [/Plan with us/gi, 'Planera med oss'],
  ],
  ru: [
    [/Discover Ceylon in quiet luxury/gi, 'Откройте Цейлон в тихой роскоши'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      'Индивидуальные путешествия по храмам, чайным холмам, дикой природе и побережью — в темпе взыскательных путешественников.'],
    [/Private inbound travel · Sri Lanka/gi, 'Частный inbound-туризм · Шри-Ланка'],
    [/Explore tours/gi, 'Смотреть туры'], [/Plan with us/gi, 'Спланировать с нами'],
  ],
  ja: [
    [/Discover Ceylon in quiet luxury/gi, '静かなるラグジュアリーでセイロンを発見'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      '寺院、茶畑、野生動物、海岸を、目の肥えた旅人のペースで巡るオーダーメイドの旅。'],
    [/Private inbound travel · Sri Lanka/gi, 'プライベートインバウンド旅行 · スリランカ'],
    [/Explore tours/gi, 'ツアーを見る'], [/Plan with us/gi, '一緒に計画する'],
  ],
  zh: [
    [/Discover Ceylon in quiet luxury/gi, '以静奢发现锡兰'],
    [/Tailor-made journeys through temples, tea country, wildlife, and coast paced for discerning travelers\./gi,
      '为品味旅人量身定制：寺庙、茶园、野生动物与海岸，从容前行。'],
    [/Private inbound travel · Sri Lanka/gi, '私人入境旅行 · 斯里兰卡'],
    [/Explore tours/gi, '探索行程'], [/Plan with us/gi, '与我们规划'],
  ],
};

function localizeSentence(text, lang) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  const rules = PHRASE[lang] || [];
  for (const [re, rep] of rules) out = out.replace(re, rep);
  // Language tag for remaining long English (readable + indicates locale layer applied)
  if (lang !== 'en' && out === text && text.length > 40) {
    const prefixes = {
      de: '[DE] ', fr: '[FR] ', es: '[ES] ', it: '[IT] ', nl: '[NL] ',
      pl: '[PL] ', sv: '[SV] ', ru: '[RU] ', ja: '[JA] ', zh: '[ZH] ',
    };
    // Prefer actual translation wrappers for titles rather than tags — use bilingual style
    out = translateGeneric(text, lang);
  }
  return out;
}

function translateGeneric(text, lang) {
  // Common tourism title patterns
  const patterns = {
    de: (t) => t
      .replace(/(\d+)-Day/gi, '$1-Tage')
      .replace(/(\d+) Days?/gi, '$1 Tage')
      .replace(/(\d+) Nights?/gi, '$1 Nächte')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'mit 4-STERNE-Hotels & Privattransport')
      .replace(/Ceylon Escape/gi, 'Ceylon-Auszeit')
      .replace(/Classic Ceylon/gi, 'Klassisches Ceylon')
      .replace(/Sri Lanka Highlights/gi, 'Sri-Lanka-Highlights')
      .replace(/Sri Lanka Explorer/gi, 'Sri-Lanka-Entdecker')
      .replace(/Wilpattu to Coast/gi, 'Wilpattu zur Küste')
      .replace(/Grand Sri Lanka/gi, 'Großes Sri Lanka')
      .replace(/Day Tour/gi, 'Tagestour')
      .replace(/Private Transport/gi, 'Privattransport'),
    fr: (t) => t
      .replace(/(\d+)-Day/gi, '$1 jours')
      .replace(/(\d+) Days?/gi, '$1 jours')
      .replace(/(\d+) Nights?/gi, '$1 nuits')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'avec hôtels 4 ÉTOILES et transport privé')
      .replace(/Ceylon Escape/gi, 'Évasion à Ceylan')
      .replace(/Classic Ceylon/gi, 'Ceylan classique')
      .replace(/Sri Lanka Highlights/gi, 'Temps forts du Sri Lanka')
      .replace(/Sri Lanka Explorer/gi, 'Explorateur du Sri Lanka')
      .replace(/Wilpattu to Coast/gi, 'Wilpattu à la côte')
      .replace(/Day Tour/gi, 'Excursion d’une journée')
      .replace(/Private Transport/gi, 'Transport privé'),
    es: (t) => t
      .replace(/(\d+)-Day/gi, '$1 días')
      .replace(/(\d+) Days?/gi, '$1 días')
      .replace(/(\d+) Nights?/gi, '$1 noches')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'con hoteles 4 ESTRELLAS y transporte privado')
      .replace(/Ceylon Escape/gi, 'Escapada a Ceilán')
      .replace(/Classic Ceylon/gi, 'Ceilán clásico')
      .replace(/Sri Lanka Highlights/gi, 'Lo mejor de Sri Lanka')
      .replace(/Sri Lanka Explorer/gi, 'Explorador de Sri Lanka')
      .replace(/Wilpattu to Coast/gi, 'Wilpattu a la costa')
      .replace(/Day Tour/gi, 'Tour de un día')
      .replace(/Private Transport/gi, 'Transporte privado'),
    it: (t) => t
      .replace(/(\d+)-Day/gi, '$1 giorni')
      .replace(/(\d+) Days?/gi, '$1 giorni')
      .replace(/(\d+) Nights?/gi, '$1 notti')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'con hotel 4 STELLE e trasporto privato')
      .replace(/Ceylon Escape/gi, 'Fuga a Ceylon')
      .replace(/Classic Ceylon/gi, 'Ceylon classico')
      .replace(/Day Tour/gi, 'Tour giornaliero')
      .replace(/Private Transport/gi, 'Trasporto privato'),
    nl: (t) => t
      .replace(/(\d+)-Day/gi, '$1 dagen')
      .replace(/(\d+) Days?/gi, '$1 dagen')
      .replace(/(\d+) Nights?/gi, '$1 nachten')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'met 4-STERREN hotels en privévervoer')
      .replace(/Day Tour/gi, 'Dagtrip')
      .replace(/Private Transport/gi, 'Privévervoer'),
    pl: (t) => t
      .replace(/(\d+)-Day/gi, '$1 dni')
      .replace(/(\d+) Days?/gi, '$1 dni')
      .replace(/(\d+) Nights?/gi, '$1 noce')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'z hotelami 4-GWIAZDKOWYMI i prywatnym transportem')
      .replace(/Day Tour/gi, 'Wycieczka jednodniowa')
      .replace(/Private Transport/gi, 'Prywatny transport'),
    sv: (t) => t
      .replace(/(\d+)-Day/gi, '$1 dagar')
      .replace(/(\d+) Days?/gi, '$1 dagar')
      .replace(/(\d+) Nights?/gi, '$1 nätter')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'med 4-STJÄRNIGA hotell och privat transport')
      .replace(/Day Tour/gi, 'Dagsutflykt')
      .replace(/Private Transport/gi, 'Privat transport'),
    ru: (t) => t
      .replace(/(\d+)-Day/gi, '$1 дней')
      .replace(/(\d+) Days?/gi, '$1 дней')
      .replace(/(\d+) Nights?/gi, '$1 ночей')
      .replace(/with 4 STAR Hotels & Private Transport/gi, 'с отелями 4 ЗВЕЗДЫ и частным трансфером')
      .replace(/Day Tour/gi, 'Однодневный тур')
      .replace(/Private Transport/gi, 'Частный транспорт'),
    ja: (t) => t
      .replace(/(\d+)-Day/gi, '$1日間')
      .replace(/(\d+) Days?/gi, '$1日間')
      .replace(/(\d+) Nights?/gi, '$1泊')
      .replace(/with 4 STAR Hotels & Private Transport/gi, '（4つ星ホテル＆専用車）')
      .replace(/Day Tour/gi, '日帰りツアー')
      .replace(/Private Transport/gi, '専用車'),
    zh: (t) => t
      .replace(/(\d+)-Day/gi, '$1日')
      .replace(/(\d+) Days?/gi, '$1天')
      .replace(/(\d+) Nights?/gi, '$1晚')
      .replace(/with 4 STAR Hotels & Private Transport/gi, '含四星酒店与私人交通')
      .replace(/Day Tour/gi, '一日游')
      .replace(/Private Transport/gi, '私人交通'),
  };
  return (patterns[lang] || ((x) => x))(text);
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function localizeObjectStrings(obj, lang, keysOnly = null) {
  const out = clone(obj);
  const strings = collectStrings(out);
  for (const { path: p, value } of strings) {
    if (keysOnly && !keysOnly.some((k) => p === k || p.endsWith(`.${k}`) || p.includes(`.${k}.`) || p.includes(`.${k}[`))) {
      // allow if last segment matches
      const last = p.split('.').pop().replace(/\[\d+\]/g, '');
      if (!keysOnly.includes(last)) continue;
    }
    setByPath(out, p, localizeSentence(translateGeneric(value, lang), lang));
  }
  return out;
}

const TEXT_KEYS = [
  'title', 'subtitle', 'eyebrow', 'description', 'shortDescription', 'overview', 'seoTitle',
  'metaDescription', 'metaTitle', 'label', 'name', 'content', 'question', 'answer', 'summary',
  'excerpt', 'body', 'alt', 'tagline', 'ctaLabel', 'viewAllLabel', 'primaryCta', 'secondaryCta',
  'highlights', 'included', 'excluded', 'includes', 'excludes',
];

function pickOverlay(base, localized) {
  // Keep only differing string fields / nested objects with diffs — simplify: return localized text fields structure
  function walk(b, l) {
    if (typeof l === 'string') {
      return l !== b ? l : undefined;
    }
    if (Array.isArray(l)) {
      if (!Array.isArray(b)) return l;
      const arr = l.map((item, i) => walk(b[i], item)).filter((x) => x !== undefined);
      // keep array shape for itinerary etc if any child changed
      const changed = l.some((item, i) => {
        const w = walk(b[i], item);
        return w !== undefined;
      });
      if (!changed) return undefined;
      return l.map((item, i) => {
        const w = walk(b[i], item);
        return w === undefined ? (typeof item === 'object' ? {} : item) : w;
      });
    }
    if (l && typeof l === 'object') {
      const out = {};
      let any = false;
      for (const k of Object.keys(l)) {
        const w = walk(b?.[k], l[k]);
        if (w !== undefined) {
          out[k] = w;
          any = true;
        }
      }
      return any ? out : undefined;
    }
    return undefined;
  }
  return walk(base, localized) || {};
}

function localizeTour(tour, lang) {
  const overlay = {
    title: translateGeneric(tour.title, lang),
    seoTitle: translateGeneric(tour.seoTitle || tour.title, lang),
    metaDescription: localizeSentence(tour.metaDescription || tour.shortDescription, lang),
    shortDescription: localizeSentence(tour.shortDescription, lang),
    overview: localizeSentence(tour.overview || tour.description, lang),
    description: localizeSentence(tour.description || tour.overview, lang),
    duration: translateGeneric(tour.duration, lang),
    travelStyle: tour.travelStyle, // keep
    highlights: (tour.highlights || []).map((h) => localizeSentence(h, lang)),
    included: (tour.included || tour.includes || []).map((h) => localizeSentence(h, lang)),
    excluded: (tour.excluded || tour.excludes || []).map((h) => localizeSentence(h, lang)),
    seo: tour.seo
      ? {
          metaTitle: translateGeneric(tour.seo.metaTitle || tour.seoTitle || tour.title, lang),
          metaDescription: localizeSentence(tour.seo.metaDescription || tour.metaDescription, lang),
        }
      : undefined,
  };
  if (Array.isArray(tour.itinerary)) {
    overlay.itinerary = tour.itinerary.map((day) => ({
      title: localizeSentence(day.title || '', lang),
      summary: day.summary ? localizeSentence(day.summary, lang) : undefined,
      description: day.description ? localizeSentence(day.description, lang) : undefined,
      activities: Array.isArray(day.activities)
        ? day.activities.map((a) => localizeSentence(a, lang))
        : undefined,
    }));
  }
  if (Array.isArray(tour.faqs || tour.faq)) {
    const faqs = tour.faqs || tour.faq;
    overlay.faqs = faqs.map((f) => ({
      question: localizeSentence(f.question, lang),
      answer: localizeSentence(f.answer, lang),
    }));
  }
  return overlay;
}

function main() {
  const en = JSON.parse(fs.readFileSync(path.join(i18nDir, 'en.json'), 'utf8'));

  for (const lang of LANGS) {
    const ui = clone(UI[lang]);
    ui.seo = seoFor(lang, en.seo);
    // Ensure all nav keys from en exist
    for (const k of Object.keys(en.nav)) {
      if (ui.nav[k] == null) ui.nav[k] = en.nav[k];
    }
    for (const k of Object.keys(en.common)) {
      if (ui.common[k] == null) ui.common[k] = en.common[k];
    }
    writeJson(path.join(i18nDir, `${lang}.json`), ui);
    console.log('i18n', lang);
  }

  // Content overlays
  const home = JSON.parse(fs.readFileSync(path.join(jsonDir, 'home.json'), 'utf8'));
  const company = JSON.parse(fs.readFileSync(path.join(jsonDir, 'company.json'), 'utf8'));
  const destinations = JSON.parse(fs.readFileSync(path.join(jsonDir, 'destinations.json'), 'utf8'));
  const experiences = fs.existsSync(path.join(jsonDir, 'experiences.json'))
    ? JSON.parse(fs.readFileSync(path.join(jsonDir, 'experiences.json'), 'utf8'))
    : null;
  const blogs = fs.existsSync(path.join(jsonDir, 'blogs.json'))
    ? JSON.parse(fs.readFileSync(path.join(jsonDir, 'blogs.json'), 'utf8'))
    : null;
  const lists = JSON.parse(fs.readFileSync(path.join(jsonDir, 'tours/lists.json'), 'utf8'));
  const tourFiles = fs.readdirSync(path.join(jsonDir, 'tours/items')).filter((f) => f.endsWith('.json'));

  for (const lang of LANGS) {
    const base = path.join(localesRoot, lang);
    const homeLoc = localizeObjectStrings(home, lang, TEXT_KEYS);
    writeJson(path.join(base, 'home.json'), pickOverlay(home, homeLoc));

    const companyLoc = {
      tagline: localizeSentence(company.tagline || en.brand.tagline, lang),
      description: company.description ? localizeSentence(company.description, lang) : undefined,
      seo: company.seo
        ? {
            metaTitle: translateGeneric(company.seo.metaTitle || '', lang),
            metaDescription: localizeSentence(company.seo.metaDescription || '', lang),
          }
        : undefined,
    };
    writeJson(path.join(base, 'company.json'), companyLoc);

    if (Array.isArray(destinations)) {
      writeJson(
        path.join(base, 'destinations.json'),
        destinations.map((d) => ({
          slug: d.slug,
          title: localizeSentence(d.title || d.name, lang),
          name: d.name ? localizeSentence(d.name, lang) : undefined,
          shortDescription: d.shortDescription ? localizeSentence(d.shortDescription, lang) : undefined,
          description: d.description ? localizeSentence(d.description, lang) : undefined,
          seo: d.seo
            ? {
                metaTitle: translateGeneric(d.seo.metaTitle || d.title || '', lang),
                metaDescription: localizeSentence(d.seo.metaDescription || '', lang),
              }
            : undefined,
        })),
      );
    }

    if (Array.isArray(experiences)) {
      writeJson(
        path.join(base, 'experiences.json'),
        experiences.map((e) => ({
          slug: e.slug,
          title: localizeSentence(e.title, lang),
          shortDescription: e.shortDescription ? localizeSentence(e.shortDescription, lang) : undefined,
          description: e.description ? localizeSentence(e.description, lang) : undefined,
          seo: e.seo
            ? {
                metaTitle: translateGeneric(e.seo.metaTitle || e.title || '', lang),
                metaDescription: localizeSentence(e.seo.metaDescription || '', lang),
              }
            : undefined,
        })),
      );
    }

    if (Array.isArray(blogs)) {
      writeJson(
        path.join(base, 'blogs.json'),
        blogs.map((b) => ({
          slug: b.slug,
          title: localizeSentence(b.title, lang),
          excerpt: b.excerpt ? localizeSentence(b.excerpt, lang) : undefined,
          content: b.content ? localizeSentence(b.content, lang) : undefined,
          seo: b.seo
            ? {
                metaTitle: translateGeneric(b.seo.metaTitle || b.title || '', lang),
                metaDescription: localizeSentence(b.seo.metaDescription || '', lang),
              }
            : undefined,
        })),
      );
    }

    writeJson(path.join(base, 'tours/lists.json'), localizeObjectStrings(lists, lang, TEXT_KEYS));

    for (const file of tourFiles) {
      const tour = JSON.parse(fs.readFileSync(path.join(jsonDir, 'tours/items', file), 'utf8'));
      writeJson(path.join(base, 'tours/items', file), localizeTour(tour, lang));
    }

    console.log('overlays', lang);
  }

  console.log('Done.');
}

main();
