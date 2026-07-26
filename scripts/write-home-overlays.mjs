/**
 * Writes complete, high-quality home.json locale overlays (all sections).
 * Run: node scripts/write-home-overlays.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(root, 'src/assets/json/locales');

/** @type {Record<string, object>} */
const HOME = {
  de: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Private Luxusreisen in Sri Lanka',
      metaDescription:
        'Planen Sie eine private Sri-Lanka-Reise mit Hai Sri Lanka Tours. Luxuriöse Mehrtagesrouten, kuratierte Tagestouren und erfahrene lokale Gastgeber.',
    },
    hero: {
      eyebrow: 'Private Inbound-Reisen · Sri Lanka',
      title: 'Entdecken Sie Ceylon in ruhigem Luxus',
      subtitle:
        'Maßgeschneiderte Reisen durch Tempel, Teelandschaften, Wildnis und Küste — im Tempo anspruchsvoller Reisender.',
      primaryCta: { label: 'Touren entdecken' },
      secondaryCta: { label: 'Mit uns planen' },
    },
    whyChoose: {
      eyebrow: 'Warum Hai Sri Lanka',
      title: 'Gastfreundschaft für privates Reisen',
      subtitle:
        'Wir gestalten ruhige, nahtlose Reisen — nie überfüllte Gruppenbusse — mit Gastgebern, die jede kurvenreiche Straße kennen.',
      items: [
        {
          id: 'private',
          title: 'Vollständig private Erlebnisse',
          description:
            'Ihr Fahrzeug, Ihr Tempo, Ihre Vorlieben. Jede Tour ist ausschließlich für Ihre Gruppe reserviert.',
        },
        {
          id: 'experts',
          title: 'Erfahrene lokale Gastgeber',
          description:
            'Chauffeur-Guides mit Feingefühl für Geschichten, Sicherheit und ruhige Luxushospitalität auf der ganzen Insel.',
        },
        {
          id: 'tailored',
          title: 'Maßgeschneiderte Routen',
          description:
            'Wir stimmen Hotels, Timing und versteckte Stopps darauf ab, wie Sie am liebsten reisen.',
        },
        {
          id: 'care',
          title: 'Betreuung von Anfang bis Ende',
          description:
            'Vom Empfang am Flughafen bis zum Abschiedstransfer begleitet Sie ein festes Team an jedem Reisetag.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Tourkategorien',
      title: 'Wählen Sie, wie Sie Sri Lanka erleben',
      subtitle:
        'Von einem einzelnen Tag an der Küste bis zu zwei Wochen Hochland und Wildlife — starten Sie mit dem Stil, der zu Ihnen passt.',
      items: [
        {
          id: 'day',
          title: 'Tagestouren',
          description:
            'Private Tagesausflüge ab Colombo und Küstenbasen — Festungen, Tempel und malerische Fahrten.',
          image: { alt: 'Private Tagestour entlang der sri-lankischen Küste' },
        },
        {
          id: 'multi',
          title: 'Mehrtägige Touren',
          description:
            'Kuratierte Inselrouten mit Kultur, Teelandschaft, Wildlife und Aufenthalten an der Küste.',
          image: { alt: 'Mehrtägige Reise durch das Hochland Sri Lankas' },
        },
        {
          id: 'wildlife',
          title: 'Wildlife-Reisen',
          description:
            'Safaritage und Übernachtungslodges bei Yala, Wilpattu und Udawalawe.',
          image: { alt: 'Jeep-Safari in sri-lankischen Nationalparks' },
        },
        {
          id: 'honeymoon',
          title: 'Flitterwochen & Auszeit',
          description:
            'Abgelegene Boutique-Unterkünfte, Spa-Rituale und entspannte Abende an der Küste.',
          image: { alt: 'Luxuriöse Strandauszeit für Paare in Sri Lanka' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Ausgewählte Reisen',
      title: 'Beliebte mehrtägige Touren',
      subtitle:
        'Private Signatur-Routen mit Raum für Kultur, Hochland und Küste im Gleichgewicht.',
      viewAllLabel: 'Alle mehrtägigen Touren ansehen',
    },
    featuredDay: {
      eyebrow: 'Ein perfekter Tag',
      title: 'Ausgewählte Tagestouren',
      subtitle:
        'Private Tageserlebnisse ab Colombo und der Westküste — ruhiges Tempo, unvergessliche Stopps.',
      viewAllLabel: 'Alle Tagestouren ansehen',
    },
    destinations: {
      eyebrow: 'Reiseziele',
      title: 'Orte, die Sri Lanka prägen',
      subtitle:
        'Vom Löwenfelsen bis zu holländischen Festungsmauern — entdecken Sie die Regionen großer Reiserouten.',
      viewAllLabel: 'Reiseziele entdecken',
    },
    cta: {
      eyebrow: 'Hier beginnen',
      title: 'Sagen Sie uns, wie Sie reisen möchten',
      subtitle:
        'Teilen Sie Termine, Tempo und Interessen — wir gestalten eine private Sri-Lanka-Reise, die die Anreise wert ist.',
      primaryCta: { label: 'Unsere Planer kontaktieren' },
      secondaryCta: { label: 'Touren durchsuchen' },
    },
  },

  fr: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Circuits privés de luxe au Sri Lanka',
      metaDescription:
        'Planifiez un voyage privé au Sri Lanka avec Hai Sri Lanka Tours. Itinéraires plurijournaliers, excursions d’une journée et hôtes locaux experts.',
    },
    hero: {
      eyebrow: 'Voyage inbound privé · Sri Lanka',
      title: 'Découvrez Ceylan dans un luxe discret',
      subtitle:
        'Voyages sur mesure entre temples, pays du thé, faune et côte — au rythme des voyageurs exigeants.',
      primaryCta: { label: 'Explorer les circuits' },
      secondaryCta: { label: 'Planifier avec nous' },
    },
    whyChoose: {
      eyebrow: 'Pourquoi Hai Sri Lanka',
      title: 'Une hospitalité pensée pour le voyage privé',
      subtitle:
        'Nous concevons des voyages calmes et fluides — jamais de bus de groupe bondés — avec des hôtes qui connaissent chaque route sinueuse.',
      items: [
        {
          id: 'private',
          title: 'Expériences entièrement privées',
          description:
            'Votre véhicule, votre rythme, vos préférences. Chaque circuit est réservé exclusivement à votre groupe.',
        },
        {
          id: 'experts',
          title: 'Hôtes locaux experts',
          description:
            'Chauffeurs-guides formés au récit, à la sécurité et à une hospitalité de luxe discret sur toute l’île.',
        },
        {
          id: 'tailored',
          title: 'Itinéraires sur mesure',
          description:
            'Nous affinons hôtels, timing et étapes secrètes selon votre façon de voyager.',
        },
        {
          id: 'care',
          title: 'Accompagnement de bout en bout',
          description:
            'De l’accueil à l’aéroport au transfert d’adieu, une équipe dédiée vous soutient chaque jour.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Catégories de circuits',
      title: 'Choisissez comment découvrir le Sri Lanka',
      subtitle:
        'D’une journée côtière à quinze jours de hautes terres et de faune — commencez par le style qui vous convient.',
      items: [
        {
          id: 'day',
          title: 'Excursions d’une journée',
          description:
            'Escapades privées depuis Colombo et les bases côtières — forts, temples et routes panoramiques.',
          image: { alt: 'Excursion privée le long de la côte sri-lankaise' },
        },
        {
          id: 'multi',
          title: 'Circuits plurijournaliers',
          description:
            'Circuits d’île combinant culture, pays du thé, faune et séjours littoraux.',
          image: { alt: 'Voyage plurijournalier dans les hautes terres du Sri Lanka' },
        },
        {
          id: 'wildlife',
          title: 'Voyages wildlife',
          description:
            'Journées safari et lodges près de Yala, Wilpattu et Udawalawe.',
          image: { alt: 'Safari en jeep dans les parcs du Sri Lanka' },
        },
        {
          id: 'honeymoon',
          title: 'Lune de miel & escapade',
          description:
            'Adresses boutique isolées, rituels spa et soirées côtières sans précipitation.',
          image: { alt: 'Escapade balnéaire de luxe pour couples au Sri Lanka' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Voyages phares',
      title: 'Circuits plurijournaliers préférés',
      subtitle:
        'Itinéraires privés signature avec culture, hautes terres et côte en équilibre.',
      viewAllLabel: 'Voir tous les circuits plurijournaliers',
    },
    featuredDay: {
      eyebrow: 'Une journée parfaite',
      title: 'Excursions d’une journée phares',
      subtitle:
        'Expériences privées depuis Colombo et la côte ouest — rythme soigné, étapes mémorables.',
      viewAllLabel: 'Voir toutes les excursions',
    },
    destinations: {
      eyebrow: 'Destinations',
      title: 'Des lieux qui définissent le Sri Lanka',
      subtitle:
        'Du Rocher du Lion aux remparts hollandais — explorez les régions de grands itinéraires.',
      viewAllLabel: 'Explorer les destinations',
    },
    cta: {
      eyebrow: 'Commencer ici',
      title: 'Dites-nous comment vous voulez voyager',
      subtitle:
        'Partagez dates, rythme et centres d’intérêt — nous créerons un voyage privé digne du trajet.',
      primaryCta: { label: 'Contacter nos planificateurs' },
      secondaryCta: { label: 'Parcourir les circuits' },
    },
  },

  es: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Tours privados de lujo en Sri Lanka',
      metaDescription:
        'Planifica un viaje privado por Sri Lanka con Hai Sri Lanka Tours. Itinerarios de varios días, tours de un día y anfitriones locales expertos.',
    },
    hero: {
      eyebrow: 'Viaje inbound privado · Sri Lanka',
      title: 'Descubre Ceilán con lujo sereno',
      subtitle:
        'Viajes a medida entre templos, country del té, vida silvestre y costa, al ritmo de viajeros exigentes.',
      primaryCta: { label: 'Explorar tours' },
      secondaryCta: { label: 'Planifica con nosotros' },
    },
    whyChoose: {
      eyebrow: 'Por qué Hai Sri Lanka',
      title: 'Hospitalidad pensada para viajes privados',
      subtitle:
        'Diseñamos viajes calmados y fluidos — nunca buses de grupo abarrotados — con anfitriones que conocen cada carretera sinuosa.',
      items: [
        {
          id: 'private',
          title: 'Experiencias totalmente privadas',
          description:
            'Tu vehículo, tu ritmo, tus preferencias. Cada tour está reservado exclusivamente para tu grupo.',
        },
        {
          id: 'experts',
          title: 'Anfitriones locales expertos',
          description:
            'Chóferes-guía formados en relato, seguridad y hospitalidad de lujo sereno en toda la isla.',
        },
        {
          id: 'tailored',
          title: 'Itinerarios a medida',
          description:
            'Afinamos hoteles, tiempos y paradas ocultas según cómo prefieres viajar.',
        },
        {
          id: 'care',
          title: 'Cuidado de principio a fin',
          description:
            'Desde la bienvenida en el aeropuerto hasta el traslado de despedida, un equipo dedicado te acompaña cada día.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Categorías de tours',
      title: 'Elige cómo conocer Sri Lanka',
      subtitle:
        'Desde un día en la costa hasta dos semanas de tierras altas y vida silvestre — empieza con el estilo que te encaje.',
      items: [
        {
          id: 'day',
          title: 'Tours de un día',
          description:
            'Escapadas privadas desde Colombo y bases costeras — fuertes, templos y rutas panorámicas.',
          image: { alt: 'Tour privado de un día por la costa de Sri Lanka' },
        },
        {
          id: 'multi',
          title: 'Tours de varios días',
          description:
            'Circuitos por la isla que combinan cultura, té, vida silvestre y estancias en la costa.',
          image: { alt: 'Viaje de varios días por las tierras altas de Sri Lanka' },
        },
        {
          id: 'wildlife',
          title: 'Viajes de fauna',
          description:
            'Días de safari y lodges cerca de Yala, Wilpattu y Udawalawe.',
          image: { alt: 'Safari en jeep en parques de Sri Lanka' },
        },
        {
          id: 'honeymoon',
          title: 'Luna de miel y escape',
          description:
            'Estancias boutique apartadas, rituales de spa y atardeceres costeros sin prisa.',
          image: { alt: 'Escape de playa de lujo para parejas en Sri Lanka' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Viajes destacados',
      title: 'Tours de varios días favoritos',
      subtitle:
        'Itinerarios privados con espacio para cultura, tierras altas y costa en equilibrio.',
      viewAllLabel: 'Ver todos los tours de varios días',
    },
    featuredDay: {
      eyebrow: 'Un día perfecto',
      title: 'Tours de un día destacados',
      subtitle:
        'Experiencias privadas desde Colombo y la costa oeste — ritmo cuidado, paradas memorables.',
      viewAllLabel: 'Ver todos los tours de un día',
    },
    destinations: {
      eyebrow: 'Destinos',
      title: 'Lugares que definen Sri Lanka',
      subtitle:
        'Desde Lion Rock hasta murallas holandesas — explora las regiones de grandes itinerarios.',
      viewAllLabel: 'Explorar destinos',
    },
    cta: {
      eyebrow: 'Empieza aquí',
      title: 'Cuéntanos cómo quieres viajar',
      subtitle:
        'Comparte fechas, ritmo e intereses — crearemos un viaje privado que valga la pena.',
      primaryCta: { label: 'Contactar a nuestros planificadores' },
      secondaryCta: { label: 'Explorar tours' },
    },
  },

  it: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Tour privati di lusso in Sri Lanka',
      metaDescription:
        'Pianifica un viaggio privato in Sri Lanka con Hai Sri Lanka Tours. Itinerari plurigiornalieri, tour giornalieri e host locali esperti.',
    },
    hero: {
      eyebrow: 'Viaggio inbound privato · Sri Lanka',
      title: 'Scopri Ceylon nel lusso discreto',
      subtitle:
        'Viaggi su misura tra templi, tea country, wildlife e costa, al ritmo di viaggiatori esigenti.',
      primaryCta: { label: 'Esplora i tour' },
      secondaryCta: { label: 'Pianifica con noi' },
    },
    whyChoose: {
      eyebrow: 'Perché Hai Sri Lanka',
      title: 'Ospitalità pensata per il viaggio privato',
      subtitle:
        'Progettiamo viaggi calmi e fluidi — mai bus di gruppo affollati — con host che conoscono ogni strada tortuosa.',
      items: [
        {
          id: 'private',
          title: 'Esperienze completamente private',
          description:
            'Il tuo veicolo, il tuo ritmo, le tue preferenze. Ogni tour è riservato esclusivamente al tuo gruppo.',
        },
        {
          id: 'experts',
          title: 'Host locali esperti',
          description:
            'Autisti-guida formati in narrazione, sicurezza e ospitalità di lusso discreto in tutta l’isola.',
        },
        {
          id: 'tailored',
          title: 'Itinerari su misura',
          description:
            'Affiniamo hotel, tempi e tappe nascoste in base a come preferisci viaggiare.',
        },
        {
          id: 'care',
          title: 'Cura dall’inizio alla fine',
          description:
            'Dall’accoglienza in aeroporto al trasferimento di saluto, un team dedicato ti supporta ogni giorno.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Categorie di tour',
      title: 'Scegli come incontrare lo Sri Lanka',
      subtitle:
        'Da un giorno sulla costa a due settimane di highland e wildlife — inizia con lo stile che fa per te.',
      items: [
        {
          id: 'day',
          title: 'Tour giornalieri',
          description:
            'Escursioni private da Colombo e basi costiere — forti, templi e percorsi panoramici.',
          image: { alt: 'Tour giornaliero privato lungo la costa dello Sri Lanka' },
        },
        {
          id: 'multi',
          title: 'Tour plurigiornalieri',
          description:
            'Circuiti sull’isola con cultura, tea country, wildlife e soggiorni sulla costa.',
          image: { alt: 'Viaggio plurigiornaliero nelle highland dello Sri Lanka' },
        },
        {
          id: 'wildlife',
          title: 'Viaggi wildlife',
          description:
            'Giornate safari e lodge vicino a Yala, Wilpattu e Udawalawe.',
          image: { alt: 'Safari in jeep nei parchi dello Sri Lanka' },
        },
        {
          id: 'honeymoon',
          title: 'Luna di miele & fuga',
          description:
            'Soggiorni boutique appartati, rituali spa e serate costiere senza fretta.',
          image: { alt: 'Fuga balneare di lusso per coppie in Sri Lanka' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Viaggi in evidenza',
      title: 'Tour plurigiornalieri preferiti',
      subtitle:
        'Itinerari privati signature con spazio per cultura, highland e costa in equilibrio.',
      viewAllLabel: 'Vedi tutti i tour plurigiornalieri',
    },
    featuredDay: {
      eyebrow: 'Un giorno perfetto',
      title: 'Tour giornalieri in evidenza',
      subtitle:
        'Esperienze private da Colombo e la costa ovest — ritmo curato, tappe memorabili.',
      viewAllLabel: 'Vedi tutti i tour giornalieri',
    },
    destinations: {
      eyebrow: 'Destinazioni',
      title: 'Luoghi che definiscono lo Sri Lanka',
      subtitle:
        'Dalla Roccia del Leone alle mura olandesi — esplora le regioni dei grandi itinerari.',
      viewAllLabel: 'Esplora le destinazioni',
    },
    cta: {
      eyebrow: 'Inizia qui',
      title: 'Dicci come vuoi viaggiare',
      subtitle:
        'Condividi date, ritmo e interessi — creeremo un viaggio privato che merita il viaggio.',
      primaryCta: { label: 'Contatta i nostri planner' },
      secondaryCta: { label: 'Sfoglia i tour' },
    },
  },

  nl: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Privé luxe tours in Sri Lanka',
      metaDescription:
        'Plan een privéreis door Sri Lanka met Hai Sri Lanka Tours. Meerdaagse routes, dagtrips en deskundige lokale hosts.',
    },
    hero: {
      eyebrow: 'Privé inbound travel · Sri Lanka',
      title: 'Ontdek Ceylon in stille luxe',
      subtitle:
        'Op maat gemaakte reizen langs tempels, theegebied, wildlife en kust — in het tempo van veeleisende reizigers.',
      primaryCta: { label: 'Tours verkennen' },
      secondaryCta: { label: 'Plan met ons' },
    },
    whyChoose: {
      eyebrow: 'Waarom Hai Sri Lanka',
      title: 'Gastvrijheid voor privéreizen',
      subtitle:
        'Wij ontwerpen kalme, naadloze reizen — nooit volle groepsbussen — met hosts die elke bochtige weg kennen.',
      items: [
        {
          id: 'private',
          title: 'Volledig privé-ervaringen',
          description:
            'Uw voertuig, uw tempo, uw voorkeuren. Elke tour is exclusief voor uw gezelschap gereserveerd.',
        },
        {
          id: 'experts',
          title: 'Deskundige lokale hosts',
          description:
            'Chauffeur-gidsen getraind in storytelling, veiligheid en stille luxe-gastvrijheid over het hele eiland.',
        },
        {
          id: 'tailored',
          title: 'Routes op maat',
          description:
            'We verfijnen hotels, timing en verborgen stops naar hoe u het liefst reist.',
        },
        {
          id: 'care',
          title: 'Zorg van begin tot eind',
          description:
            'Van luchthavenwelkom tot afscheidstransfer ondersteunt een vast team elke dag van uw reis.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Tourcategorieën',
      title: 'Kies hoe u Sri Lanka ontmoet',
      subtitle:
        'Van één kustdag tot twee weken hooglanden en wildlife — begin met de stijl die bij u past.',
      items: [
        {
          id: 'day',
          title: 'Dagtrips',
          description:
            'Privé dagtrips vanuit Colombo en kustbases — forten, tempels en panoramaroutes.',
          image: { alt: 'Privé dagtrip langs de Sri Lankaanse kust' },
        },
        {
          id: 'multi',
          title: 'Meerdaagse tours',
          description:
            'Samengestelde eilandcircuits met cultuur, theegebied, wildlife en kustverblijven.',
          image: { alt: 'Meerdaagse reis door de hooglanden van Sri Lanka' },
        },
        {
          id: 'wildlife',
          title: 'Wildlife-reizen',
          description:
            'Safaridagen en lodges bij Yala, Wilpattu en Udawalawe.',
          image: { alt: 'Jeepsafari in Sri Lankaanse parken' },
        },
        {
          id: 'honeymoon',
          title: 'Huwelijksreis & escape',
          description:
            'Afgelegen boutique-verblijven, spa-rituelen en onhaaste kustavonden.',
          image: { alt: 'Luxe strandespace voor stellen in Sri Lanka' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Uitgelichte reizen',
      title: 'Geliefde meerdaagse tours',
      subtitle:
        'Privé signature-routes met ruimte voor cultuur, hooglanden en kust in balans.',
      viewAllLabel: 'Alle meerdaagse tours bekijken',
    },
    featuredDay: {
      eyebrow: 'Eén perfecte dag',
      title: 'Uitgelichte dagtrips',
      subtitle:
        'Privé dagervaringen vanuit Colombo en de westkust — rustig tempo, memorabele stops.',
      viewAllLabel: 'Alle dagtrips bekijken',
    },
    destinations: {
      eyebrow: 'Bestemmingen',
      title: 'Plekken die Sri Lanka bepalen',
      subtitle:
        'Van Lion Rock tot Hollandse vestingmuren — ontdek de regio’s van grote routes.',
      viewAllLabel: 'Bestemmingen verkennen',
    },
    cta: {
      eyebrow: 'Begin hier',
      title: 'Vertel ons hoe u wilt reizen',
      subtitle:
        'Deel data, tempo en interesses — wij maken een privéreis die de reis waard is.',
      primaryCta: { label: 'Neem contact op met onze planners' },
      secondaryCta: { label: 'Tours bekijken' },
    },
  },

  pl: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Prywatne luksusowe wycieczki po Sri Lance',
      metaDescription:
        'Zaplanuj prywatną podróż po Sri Lance z Hai Sri Lanka Tours. Wielodniowe trasy, wycieczki jednodniowe i lokalni gospodarze.',
    },
    hero: {
      eyebrow: 'Prywatne podróże inbound · Sri Lanka',
      title: 'Odkryj Cejlon w spokojnym luksusie',
      subtitle:
        'Podróże szyte na miarę: świątynie, herbaciane wzgórza, przyroda i wybrzeże — w tempie wymagających podróżników.',
      primaryCta: { label: 'Przeglądaj wycieczki' },
      secondaryCta: { label: 'Zaplanuj z nami' },
    },
    whyChoose: {
      eyebrow: 'Dlaczego Hai Sri Lanka',
      title: 'Gościnność stworzona do prywatnych podróży',
      subtitle:
        'Projektujemy spokojne, płynne podróże — nigdy zatłoczone autokary grupowe — z gospodarzami, którzy znają każdą krętą drogę.',
      items: [
        {
          id: 'private',
          title: 'W pełni prywatne doświadczenia',
          description:
            'Twój pojazd, Twoje tempo, Twoje preferencje. Każda wycieczka jest zarezerwowana wyłącznie dla Waszej grupy.',
        },
        {
          id: 'experts',
          title: 'Doświadczeni lokalni gospodarze',
          description:
            'Kierowcy-przewodnicy wyszkoleni w opowiadaniu historii, bezpieczeństwie i spokojnej luksusowej gościnności.',
        },
        {
          id: 'tailored',
          title: 'Trasy szyte na miarę',
          description:
            'Dopasowujemy hotele, timing i ukryte postoje do tego, jak lubicie podróżować.',
        },
        {
          id: 'care',
          title: 'Opieka od początku do końca',
          description:
            'Od powitania na lotnisku po transfer pożegnalny dedykowany zespół wspiera każdy dzień podróży.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Kategorie wycieczek',
      title: 'Wybierz, jak poznać Sri Lankę',
      subtitle:
        'Od jednego dnia na wybrzeżu po dwa tygodnie wyżyn i przyrody — zacznij od stylu, który do Ciebie pasuje.',
      items: [
        {
          id: 'day',
          title: 'Wycieczki jednodniowe',
          description:
            'Prywatne jednodniowe wypady z Colombo i baz nadmorskich — forty, świątynie i malownicze trasy.',
          image: { alt: 'Prywatna wycieczka jednodniowa wzdłuż wybrzeża Sri Lanki' },
        },
        {
          id: 'multi',
          title: 'Wycieczki wielodniowe',
          description:
            'Kuratorowane trasy po wyspie łączące kulturę, herbatę, przyrodę i pobyty nad morzem.',
          image: { alt: 'Wielodniowa podróż po wyżynach Sri Lanki' },
        },
        {
          id: 'wildlife',
          title: 'Podróże przyrodnicze',
          description:
            'Dni safari i lodże w pobliżu Yala, Wilpattu i Udawalawe.',
          image: { alt: 'Safari jeepem w parkach Sri Lanki' },
        },
        {
          id: 'honeymoon',
          title: 'Miesiąc miodowy i ucieczka',
          description:
            'Ustronne boutique’owe miejsca, rytuały spa i niespieszne wieczory nad oceanem.',
          image: { alt: 'Luksusowa ucieczka na plażę dla par na Sri Lance' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Wyróżnione podróże',
      title: 'Ulubione wycieczki wielodniowe',
      subtitle:
        'Prywatne trasy signature z miejscem na kulturę, wyżyny i wybrzeże w równowadze.',
      viewAllLabel: 'Zobacz wszystkie wycieczki wielodniowe',
    },
    featuredDay: {
      eyebrow: 'Jeden idealny dzień',
      title: 'Wyróżnione wycieczki jednodniowe',
      subtitle:
        'Prywatne doświadczenia z Colombo i zachodniego wybrzeża — spokojne tempo, niezapomniane postoje.',
      viewAllLabel: 'Zobacz wszystkie wycieczki jednodniowe',
    },
    destinations: {
      eyebrow: 'Destynacje',
      title: 'Miejsca, które definiują Sri Lankę',
      subtitle:
        'Od Lion Rock po holenderskie mury fortów — odkryj regiony wielkich tras.',
      viewAllLabel: 'Odkrywaj destynacje',
    },
    cta: {
      eyebrow: 'Zacznij tutaj',
      title: 'Powiedz nam, jak chcecie podróżować',
      subtitle:
        'Podzielcie się datami, tempem i zainteresowaniami — stworzymy prywatną podróż wartą drogi.',
      primaryCta: { label: 'Skontaktuj się z naszymi planistami' },
      secondaryCta: { label: 'Przeglądaj wycieczki' },
    },
  },

  sv: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Privata lyxturer i Sri Lanka',
      metaDescription:
        'Planera en privat resa i Sri Lanka med Hai Sri Lanka Tours. Flerdagarsrutter, dagsutflykter och lokala värdar.',
    },
    hero: {
      eyebrow: 'Privat inbound-resa · Sri Lanka',
      title: 'Upptäck Ceylon i stillsam lyx',
      subtitle:
        'Skräddarsydda resor genom tempel, tedistrikt, wildlife och kust — i tempo för kräsna resenärer.',
      primaryCta: { label: 'Utforska turer' },
      secondaryCta: { label: 'Planera med oss' },
    },
    whyChoose: {
      eyebrow: 'Varför Hai Sri Lanka',
      title: 'Gästfrihet formad för privata resor',
      subtitle:
        'Vi designar lugna, sömlösa resor — aldrig fulla gruppbussar — med värdar som känner varje slingrande väg.',
      items: [
        {
          id: 'private',
          title: 'Helt privata upplevelser',
          description:
            'Ert fordon, er takt, era preferenser. Varje tur är reserverad enbart för er grupp.',
        },
        {
          id: 'experts',
          title: 'Erfarna lokala värdar',
          description:
            'Chaufförguider tränade i berättande, säkerhet och stillsam lyxgästfrihet över hela ön.',
        },
        {
          id: 'tailored',
          title: 'Skräddarsydda resplaner',
          description:
            'Vi finjusterar hotell, timing och dolda stopp efter hur ni vill resa.',
        },
        {
          id: 'care',
          title: 'Omsorg från början till slut',
          description:
            'Från flygplatsvälkomst till avskedstransfer stöttar ett dedikerat team varje dag av er resa.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Turkategorier',
      title: 'Välj hur ni möter Sri Lanka',
      subtitle:
        'Från en kustdag till två veckor av highland och wildlife — börja med stilen som passar er.',
      items: [
        {
          id: 'day',
          title: 'Dagsutflykter',
          description:
            'Privata dagsutflykter från Colombo och kustbaser — fort, tempel och sceniska vägar.',
          image: { alt: 'Privat dagsutflykt längs Sri Lankas kust' },
        },
        {
          id: 'multi',
          title: 'Flerdagsturer',
          description:
            'Kuraterade ö-cirklar med kultur, te, wildlife och kustvistelser.',
          image: { alt: 'Flerdagarsresa genom Sri Lankas highland' },
        },
        {
          id: 'wildlife',
          title: 'Wildlife-resor',
          description:
            'Safaridagar och lodger nära Yala, Wilpattu och Udawalawe.',
          image: { alt: 'Jeepsafari i Sri Lankas parker' },
        },
        {
          id: 'honeymoon',
          title: 'Smekmånad & escape',
          description:
            'Avskilda boutiqueboenden, spa-ritualer och ostressade kustkvällar.',
          image: { alt: 'Lyxig strandescape för par i Sri Lanka' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Utvalda resor',
      title: 'Älskade flerdagsturer',
      subtitle:
        'Privata signaturrutter med utrymme för kultur, highland och kust i balans.',
      viewAllLabel: 'Visa alla flerdagsturer',
    },
    featuredDay: {
      eyebrow: 'En perfekt dag',
      title: 'Utvalda dagsutflykter',
      subtitle:
        'Privata dagsupplevelser från Colombo och västkusten — finjusterad takt, minnesvärda stopp.',
      viewAllLabel: 'Visa alla dagsutflykter',
    },
    destinations: {
      eyebrow: 'Destinationer',
      title: 'Platser som definierar Sri Lanka',
      subtitle:
        'Från Lion Rock till holländska murar — utforska regionerna bakom stora resplaner.',
      viewAllLabel: 'Utforska destinationer',
    },
    cta: {
      eyebrow: 'Börja här',
      title: 'Berätta hur ni vill resa',
      subtitle:
        'Dela datum, tempo och intressen — vi skapar en privat resa värd färden.',
      primaryCta: { label: 'Kontakta våra planerare' },
      secondaryCta: { label: 'Bläddra bland turer' },
    },
  },

  ru: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours | Частные люксовые туры по Шри-Ланке',
      metaDescription:
        'Спланируйте частное путешествие по Шри-Ланке с Hai Sri Lanka Tours. Многодневные маршруты, однодневные туры и местные хозяева.',
    },
    hero: {
      eyebrow: 'Частный inbound-туризм · Шри-Ланка',
      title: 'Откройте Цейлон в тихой роскоши',
      subtitle:
        'Индивидуальные путешествия по храмам, чайным холмам, дикой природе и побережью — в темпе взыскательных путешественников.',
      primaryCta: { label: 'Смотреть туры' },
      secondaryCta: { label: 'Спланировать с нами' },
    },
    whyChoose: {
      eyebrow: 'Почему Hai Sri Lanka',
      title: 'Гостеприимство для частного путешествия',
      subtitle:
        'Мы создаём спокойные, бесшовные поездки — никогда переполненные групповые автобусы — с хозяевами, знающими каждую извилистую дорогу.',
      items: [
        {
          id: 'private',
          title: 'Полностью частные впечатления',
          description:
            'Ваш автомобиль, ваш темп, ваши предпочтения. Каждый тур зарезервирован только для вашей группы.',
        },
        {
          id: 'experts',
          title: 'Опытные местные хозяева',
          description:
            'Водители-гиды, обученные рассказу, безопасности и тихой люксовой гостеприимности по всему острову.',
        },
        {
          id: 'tailored',
          title: 'Индивидуальные маршруты',
          description:
            'Мы подбираем отели, тайминг и скрытые остановки под ваш стиль путешествия.',
        },
        {
          id: 'care',
          title: 'Забота от начала до конца',
          description:
            'От встречи в аэропорту до прощального трансфера выделенная команда поддерживает вас каждый день.',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'Категории туров',
      title: 'Выберите, как познакомиться со Шри-Ланкой',
      subtitle:
        'От одного дня на побережье до двух недель высокогорья и дикой природы — начните со стиля, который вам подходит.',
      items: [
        {
          id: 'day',
          title: 'Однодневные туры',
          description:
            'Частные дневные поездки из Коломбо и прибрежных баз — форты, храмы и живописные дороги.',
          image: { alt: 'Частный однодневный тур вдоль побережья Шри-Ланки' },
        },
        {
          id: 'multi',
          title: 'Многодневные туры',
          description:
            'Кураторские маршруты по острову: культура, чай, дикая природа и отдых у моря.',
          image: { alt: 'Многодневное путешествие по высокогорью Шри-Ланки' },
        },
        {
          id: 'wildlife',
          title: 'Путешествия к дикой природе',
          description:
            'Дни сафари и лоджи рядом с Ялой, Вилпатту и Удавалаве.',
          image: { alt: 'Джип-сафари в парках Шри-Ланки' },
        },
        {
          id: 'honeymoon',
          title: 'Медовый месяц и побег',
          description:
            'Уединённые бутик-отели, спа-ритуалы и неспешные вечера у океана.',
          image: { alt: 'Роскошный пляжный отдых для пар на Шри-Ланке' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'Избранные путешествия',
      title: 'Любимые многодневные туры',
      subtitle:
        'Частные фирменные маршруты с местом для культуры, высокогорья и побережья в балансе.',
      viewAllLabel: 'Смотреть все многодневные туры',
    },
    featuredDay: {
      eyebrow: 'Один идеальный день',
      title: 'Избранные однодневные туры',
      subtitle:
        'Частные дневные впечатления из Коломбо и западного побережья — спокойный темп, памятные остановки.',
      viewAllLabel: 'Смотреть все однодневные туры',
    },
    destinations: {
      eyebrow: 'Направления',
      title: 'Места, которые определяют Шри-Ланку',
      subtitle:
        'От Львиной скалы до голландских стен фортов — исследуйте регионы великих маршрутов.',
      viewAllLabel: 'Исследовать направления',
    },
    cta: {
      eyebrow: 'Начните здесь',
      title: 'Расскажите, как хотите путешествовать',
      subtitle:
        'Поделитесь датами, темпом и интересами — мы создадим частное путешествие, ради которого стоит ехать.',
      primaryCta: { label: 'Связаться с нашими планировщиками' },
      secondaryCta: { label: 'Смотреть туры' },
    },
  },

  ja: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours｜スリランカのプライベートラグジュアリーツアー',
      metaDescription:
        'Hai Sri Lanka Toursでスリランカのプライベート旅を。周遊ルート、日帰りツアー、地元ホストがサポートします。',
    },
    hero: {
      eyebrow: 'プライベートインバウンド旅行 · スリランカ',
      title: '静かなるラグジュアリーでセイロンを発見',
      subtitle:
        '寺院、茶畑、野生動物、海岸を、目の肥えた旅人のペースで巡るオーダーメイドの旅。',
      primaryCta: { label: 'ツアーを見る' },
      secondaryCta: { label: '一緒に計画する' },
    },
    whyChoose: {
      eyebrow: 'なぜ Hai Sri Lanka か',
      title: 'プライベート旅行のためのホスピタリティ',
      subtitle:
        '穏やかでスムーズな旅を設計します。混雑したグループバスではなく、曲がりくねった道を知り尽くしたホストと共に。',
      items: [
        {
          id: 'private',
          title: '完全プライベート体験',
          description:
            '専用車、ご希望のペース、お好みどおり。すべてのツアーはお客様のパーティー専用です。',
        },
        {
          id: 'experts',
          title: '熟練のローカルホスト',
          description:
            'ストーリーテリング、安全、静かなラグジュアリーホスピタリティに精通したドライバーガイド。',
        },
        {
          id: 'tailored',
          title: 'オーダーメイド行程',
          description:
            'ホテル、時間配分、隠れた立ち寄り先をご希望の旅のスタイルに合わせて調整します。',
        },
        {
          id: 'care',
          title: '最初から最後までサポート',
          description:
            '空港でのお出迎えからお見送りまで、専任チームが旅の毎日を支えます。',
        },
      ],
    },
    tourCategories: {
      eyebrow: 'ツアーカテゴリー',
      title: 'スリランカとの出会い方を選ぶ',
      subtitle:
        '海岸の一日から、高地と野生動物の二週間まで。あなたに合うスタイルから始めましょう。',
      items: [
        {
          id: 'day',
          title: '日帰りツアー',
          description:
            'コロンボや沿岸拠点からのプライベート日帰り — 要塞、寺院、絶景ドライブ。',
          image: { alt: 'スリランカ沿岸のプライベート日帰りツアー' },
        },
        {
          id: 'multi',
          title: '周遊ツアー',
          description:
            '文化、茶畑、野生動物、海岸滞在を組み合わせた島の周遊ルート。',
          image: { alt: 'スリランカ高地を巡る周遊の旅' },
        },
        {
          id: 'wildlife',
          title: '野生動物の旅',
          description:
            'ヤラ、ウィルパットゥ、ウダワラウェ周辺のサファリとロッジ滞在。',
          image: { alt: 'スリランカ国立公園でのジープサファリ' },
        },
        {
          id: 'honeymoon',
          title: 'ハネムーン＆エスケープ',
          description:
            '静かなブティック滞在、スパ、ゆったりした海岸の夜。',
          image: { alt: 'スリランカのカップル向けラグジュアリービーチ滞在' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: 'おすすめの旅',
      title: '人気の周遊ツアー',
      subtitle:
        '文化・高地・海岸のバランスを大切にしたプライベートなシグネチャー行程。',
      viewAllLabel: '周遊ツアーをすべて見る',
    },
    featuredDay: {
      eyebrow: '完璧な一日',
      title: 'おすすめ日帰りツアー',
      subtitle:
        'コロンボと西海岸からのプライベート日帰り — 穏やかなペース、記憶に残る立ち寄り。',
      viewAllLabel: '日帰りツアーをすべて見る',
    },
    destinations: {
      eyebrow: '行き先',
      title: 'スリランカを形づくる場所',
      subtitle:
        'ライオンロックからオランダ要塞の城壁まで — 名行程を支える地域を巡る。',
      viewAllLabel: '行き先を見る',
    },
    cta: {
      eyebrow: 'ここから始める',
      title: 'どんな旅にしたいか教えてください',
      subtitle:
        '日程・ペース・興味をお知らせください。旅する価値のあるプライベートなスリランカを一緒に作ります。',
      primaryCta: { label: 'プランナーに連絡' },
      secondaryCta: { label: 'ツアーを見る' },
    },
  },

  zh: {
    seo: {
      metaTitle: 'Hai Sri Lanka Tours｜斯里兰卡私人奢华行程',
      metaDescription:
        '与 Hai Sri Lanka Tours 规划私人斯里兰卡之旅。多日行程、一日游与专业本地向导。',
    },
    hero: {
      eyebrow: '私人入境旅行 · 斯里兰卡',
      title: '以静奢发现锡兰',
      subtitle:
        '为品味旅人量身定制：寺庙、茶园、野生动物与海岸，从容前行。',
      primaryCta: { label: '探索行程' },
      secondaryCta: { label: '与我们规划' },
    },
    whyChoose: {
      eyebrow: '为什么选择 Hai Sri Lanka',
      title: '为私人旅行而设计的待客之道',
      subtitle:
        '我们打造平静顺畅的旅程——绝非拥挤的团体巴士——由熟悉每条弯路的主人相伴。',
      items: [
        {
          id: 'private',
          title: '完全私人体验',
          description:
            '专属车辆、您的节奏、您的偏好。每次行程仅供您的同行宾客专享。',
        },
        {
          id: 'experts',
          title: '专业本地向导',
          description:
            '精通讲述、安全与静奢待客的司机向导，遍布全岛。',
        },
        {
          id: 'tailored',
          title: '量身定制行程',
          description:
            '我们按您的出行方式精调酒店、时间安排与隐秘停留点。',
        },
        {
          id: 'care',
          title: '全程贴心照料',
          description:
            '从机场迎接到送机，专属团队陪伴旅程的每一天。',
        },
      ],
    },
    tourCategories: {
      eyebrow: '行程分类',
      title: '选择你与斯里兰卡相遇的方式',
      subtitle:
        '从海岸一日到高地与野生动物的两周——从适合你的风格开始。',
      items: [
        {
          id: 'day',
          title: '一日游',
          description:
            '从科伦坡与海岸基地出发的私人一日行程——要塞、寺庙与风景公路。',
          image: { alt: '斯里兰卡海岸私人一日游' },
        },
        {
          id: 'multi',
          title: '多日游',
          description:
            '结合文化、茶园、野生动物与海岸停留的精选环岛路线。',
          image: { alt: '穿越斯里兰卡高地的多日旅程' },
        },
        {
          id: 'wildlife',
          title: '野生动物之旅',
          description:
            '亚拉、威尔帕图与乌达瓦拉韦附近的狩猎日与营地住宿。',
          image: { alt: '斯里兰卡国家公园吉普车狩猎' },
        },
        {
          id: 'honeymoon',
          title: '蜜月与度假',
          description:
            '隐秘精品住宿、水疗仪式与从容的海岸夜晚。',
          image: { alt: '斯里兰卡情侣奢华海滩度假' },
        },
      ],
    },
    featuredMultiDay: {
      eyebrow: '精选旅程',
      title: '旅客喜爱的多日游',
      subtitle:
        '留有呼吸空间的私人招牌行程：文化、高地与海岸平衡兼顾。',
      viewAllLabel: '查看全部多日游',
    },
    featuredDay: {
      eyebrow: '完美的一天',
      title: '精选一日游',
      subtitle:
        '从科伦坡与西海岸出发的私人一日体验——从容节奏，难忘停留。',
      viewAllLabel: '查看全部一日游',
    },
    destinations: {
      eyebrow: '目的地',
      title: '定义斯里兰卡的地方',
      subtitle:
        '从狮子岩到荷兰要塞城墙——探索塑造精彩行程的区域。',
      viewAllLabel: '探索目的地',
    },
    cta: {
      eyebrow: '从这里开始',
      title: '告诉我们你想怎样旅行',
      subtitle:
        '分享日期、节奏与兴趣——我们将打造值得远行的私人斯里兰卡旅程。',
      primaryCta: { label: '联系我们的规划师' },
      secondaryCta: { label: '浏览行程' },
    },
  },
};

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

for (const [lang, overlay] of Object.entries(HOME)) {
  writeJson(path.join(outRoot, lang, 'home.json'), overlay);
  console.log('wrote', lang, 'home.json');
}
console.log('Done.');
