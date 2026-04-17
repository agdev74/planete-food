// src/constants/translations.ts
// Template "Planet Food" — remplacer les valeurs par celles de votre restaurant.

export const translations = {
  fr: {
    nav: { home: "Accueil", restaurants: "Restaurants", menu: "La Carte", catering: "Traiteur", contact: "Contact" },
    hero: {
      badge: "🇨🇭 Genève · Livraison & Click & Collect",
      subtitle: "Le Food Court Digital de Genève",
      title_top: "Planet",
      title_bottom: "Food",
      tagline: "Plusieurs restaurants. Un seul panier. Une seule livraison.",
      desc: "Le meilleur de la food à Genève, livré chez vous. La qualité restaurant au prix juste — faites-vous plaisir sans casser la tirelire.",
      btnRestaurants: "Découvrir les Restaurants",
      btnMenu: "Découvrir la Carte",
      btnTraiteur: "Service Traiteur"
    },
    menu: {
      title: "La Carte",
      subtitle: "Une sélection rigoureuse pour un voyage culinaire d'exception.",
      all: "Tous",
      categories: {
        "Nos Spécialités": "Nos Spécialités",
        "Entrées": "Entrées",
        "Plats Principaux": "Plats Principaux",
        "Accompagnements": "Accompagnements",
        "Desserts": "Desserts",
        "Boissons": "Boissons",
        "Formules": "Formules",
        "À Partager": "À Partager"
      }
    },
    testimonials: {
      title: "La Parole à nos Convives",
      subtitle: "Ils ont goûté",
      rating: "Noté {note}/5 sur plus de 150 avis Google.",
      items: [
        { name: "Sophie M.", role: "Événement Privé", text: "Une prestation exceptionnelle pour notre événement. La qualité des plats a impressionné tous nos invités." },
        { name: "Thomas D.", role: "Entreprise", text: "Toujours ponctuel, magnifiquement présenté et délicieux. Le meilleur restaurant de la région." },
        { name: "Élodie & Marc", role: "Dîner en famille", text: "Un repas mémorable dans un cadre chaleureux. Une expérience culinaire que nous recommandons chaleureusement." }
      ]
    },
    cta: {
      title: "Prêt à commander ?",
      desc: "Notre équipe est prête à préparer votre commande. Livraison rapide ou à emporter.",
      call: "Appeler"
    },
    values: {
      subtitle: "Nos Engagements",
      title: "Pourquoi Planet Food ?",
      items: [
        { icon: "speed", title: "Livraison Express", desc: "Vos commandes préparées et livrées en moins de 30 min dans tout Genève." },
        { icon: "payment", title: "Paiement Sécurisé", desc: "Stripe certifié PCI-DSS. Vos données bancaires ne transitent jamais par nos serveurs." },
        { icon: "mobile", title: "Web & Mobile", desc: "Commandez depuis n'importe quel appareil. Application PWA disponible directement depuis votre navigateur." },
        { icon: "shared", title: "Panier Commun", desc: "Burgers, pizzas, tacos : mélangez plusieurs restaurants dans une seule commande." }
      ]
    },
    restaurants: {
      banner: "Nos Enseignes"
    },
    catering: {
      title: "Service Traiteur de Prestige",
      subtitle: "L'excellence gastronomique pour vos réceptions.",
      desc: "Mariages, cocktails dînatoires ou repas d'entreprise : nous créons des buffets raffinés pour tous vos événements.",
      btnHero: "Demander un devis gratuit",
      experienceTitle: "L'Art de Recevoir",
      blocs: [
        {
          tag: "01. SAVOIR-FAIRE & PASSION",
          title: "L'Excellence de nos Chefs",
          desc: "Nos chefs, passionnés et expérimentés, préparent chaque plat avec une rigueur absolue pour garantir une expérience gastronomique authentique."
        },
        {
          tag: "02. QUALITÉ IRRÉPROCHABLE",
          title: "Des Produits Soigneusement Sélectionnés",
          desc: "Nous sélectionnons nos ingrédients auprès des meilleurs producteurs pour vous offrir le meilleur, dans le respect strict des saveurs et de la fraîcheur."
        },
        {
          tag: "03. PRÉSENTATION SOIGNÉE",
          title: "L'Élégance dans l'Assiette",
          desc: "Nos dressages sont pensés pour sublimer votre table, mêlant esthétique moderne et raffinement pour ravir les yeux autant que les papilles."
        }
      ],
      formSection: {
        title: "Votre Devis Personnalisé",
        subtitle: "Parlez-nous de votre projet, nous vous répondrons avec une proposition sur-mesure sous 24h.",
        name: "Nom complet",
        email: "Email",
        type: "Type d'événement",
        types: ["Événement d'Entreprise", "Mariage", "Réception Privée", "Cocktail Dînatoire"],
        guests: "Nombre de convives",
        vision: "Détails de votre réception",
        visionPlaceholder: "Date, lieu, envies particulières...",
        submit: "Demander mon Devis",
        sending: "Envoi en cours...",
        successTitle: "Demande Envoyée",
        successDesc: "Merci de nous avoir contactés. Notre équipe étudie votre projet et vous recontactera très rapidement.",
        successBtn: "Nouvelle demande"
      }
    },
    contact: {
      title: "Contactez-nous",
      subtitle: "Une question ? Une réservation ?",
      address: "Adresse",
      opening: "Horaires",
      follow: "Suivez-nous"
    },
    footer: {
      desc: "L'excellence gastronomique à votre service. Une expérience unique, sur place ou chez vous.",
      linksTitle: "Navigation",
      contactTitle: "Nous trouver",
      rights: "© 2026 Planet Food. Tous droits réservés."
    }
  },
  en: {
    nav: { home: "Home", restaurants: "Restaurants", menu: "Menu", catering: "Catering", contact: "Contact" },
    hero: {
      badge: "🇨🇭 Geneva · Delivery & Click & Collect",
      subtitle: "Geneva's Digital Food Court",
      title_top: "Planet",
      title_bottom: "Food",
      tagline: "Multiple restaurants. One cart. One delivery.",
      desc: "The best food Geneva has to offer, delivered to your door. Restaurant quality at the right price — treat yourself without breaking the bank.",
      btnRestaurants: "Explore Restaurants",
      btnMenu: "Discover the Menu",
      btnTraiteur: "Catering Service"
    },
    menu: {
      title: "The Menu",
      subtitle: "A rigorous selection for an exceptional culinary journey.",
      all: "All",
      categories: {
        "Nos Spécialités": "Our Specialties",
        "Entrées": "Starters",
        "Plats Principaux": "Main Courses",
        "Accompagnements": "Side Dishes",
        "Desserts": "Desserts",
        "Boissons": "Drinks",
        "Formules": "Set Menus",
        "À Partager": "To Share"
      }
    },
    testimonials: {
      title: "What Our Guests Say",
      subtitle: "Reviews",
      rating: "Rated {note}/5 on over 150 Google reviews.",
      items: [
        { name: "Sophie M.", role: "Private Event", text: "Exceptional service for our event. The quality of the dishes impressed all our guests." },
        { name: "Thomas D.", role: "Corporate", text: "Always on time, beautifully presented and delicious. The best restaurant in the area." },
        { name: "Élodie & Marc", role: "Family Dinner", text: "A memorable meal in a warm atmosphere. A culinary experience we warmly recommend." }
      ]
    },
    cta: {
      title: "Ready to order?",
      desc: "Our team is ready to prepare your order. Fast delivery or takeaway.",
      call: "Call"
    },
    values: {
      subtitle: "Our Commitments",
      title: "Why Planet Food?",
      items: [
        { icon: "speed", title: "Express Delivery", desc: "Orders prepared and delivered in under 30 min across Geneva." },
        { icon: "payment", title: "Secure Payment", desc: "PCI-DSS certified Stripe. Your banking details never transit through our servers." },
        { icon: "mobile", title: "Web & Mobile", desc: "Order from any device. PWA application available directly from your browser." },
        { icon: "shared", title: "Shared Cart", desc: "Burgers, pizzas, tacos: mix multiple restaurants in a single order." }
      ]
    },
    restaurants: {
      banner: "Our Restaurants"
    },
    catering: {
      title: "Prestige Catering Service",
      subtitle: "Gastronomic excellence for your receptions.",
      desc: "Weddings, cocktail parties, or corporate events: we create refined buffets for all your occasions.",
      btnHero: "Request a free quote",
      experienceTitle: "The Art of Hosting",
      blocs: [
        {
          tag: "01. EXPERTISE & PASSION",
          title: "The Excellence of Our Chefs",
          desc: "Our passionate and experienced chefs prepare each dish with absolute rigor to guarantee an authentic gastronomic experience."
        },
        {
          tag: "02. IMPECCABLE QUALITY",
          title: "Carefully Selected Produce",
          desc: "We source our ingredients from the finest producers to offer you the very best, with strict respect for flavors and freshness."
        },
        {
          tag: "03. REFINED PRESENTATION",
          title: "Elegance on Your Plate",
          desc: "Our plating is designed to elevate your table, blending modern aesthetics with refinement to delight the eyes as much as the palate."
        }
      ],
      formSection: {
        title: "Your Personalized Quote",
        subtitle: "Tell us about your project, we will respond with a custom proposal within 24 hours.",
        name: "Full Name",
        email: "Email",
        type: "Event Type",
        types: ["Corporate Event", "Wedding", "Private Reception", "Cocktail Party"],
        guests: "Number of guests",
        vision: "Reception Details",
        visionPlaceholder: "Date, location, special requests...",
        submit: "Request my Quote",
        sending: "Sending...",
        successTitle: "Request Sent",
        successDesc: "Thank you for contacting us. Our team will study your project and get back to you shortly.",
        successBtn: "New Request"
      }
    },
    contact: {
      title: "Contact Us",
      subtitle: "A question? A reservation?",
      address: "Address",
      opening: "Hours",
      follow: "Follow Us"
    },
    footer: {
      desc: "Gastronomic excellence at your service. A unique experience, dine-in or at home.",
      linksTitle: "Links",
      contactTitle: "Find Us",
      rights: "© 2026 Planet Food. All rights reserved."
    }
  },
  es: {
    nav: { home: "Inicio", restaurants: "Restaurantes", menu: "La Carta", catering: "Catering", contact: "Contacto" },
    hero: {
      badge: "🇨🇭 Ginebra · Entrega & Click & Collect",
      subtitle: "El Food Court Digital de Ginebra",
      title_top: "Planet",
      title_bottom: "Food",
      tagline: "Varios restaurantes. Un solo carrito. Una sola entrega.",
      desc: "Lo mejor de la gastronomía de Ginebra, entregado en su puerta. Calidad de restaurante al precio justo — disfrute sin gastar de más.",
      btnRestaurants: "Descubrir los Restaurantes",
      btnMenu: "Descubrir la Carta",
      btnTraiteur: "Servicio de Catering"
    },
    menu: {
      title: "La Carta",
      subtitle: "Una selección rigurosa para un viaje culinario excepcional.",
      all: "Todos",
      categories: {
        "Nos Spécialités": "Nuestras Especialidades",
        "Entrées": "Entrantes",
        "Plats Principaux": "Platos Principales",
        "Accompagnements": "Acompañamientos",
        "Desserts": "Postres",
        "Boissons": "Bebidas",
        "Formules": "Menús",
        "À Partager": "Para Compartir"
      }
    },
    testimonials: {
      title: "Lo que dicen nuestros clientes",
      subtitle: "Opiniones",
      rating: "Calificado {note}/5 en más de 150 reseñas de Google.",
      items: [
        { name: "Sophie M.", role: "Evento Privado", text: "Servicio excepcional para nuestro evento. La calidad de los platos impresionó a todos los invitados." },
        { name: "Thomas D.", role: "Empresa", text: "Siempre puntual, bellamente presentado y delicioso. El mejor restaurante de la zona." },
        { name: "Élodie & Marc", role: "Cena Familiar", text: "Una comida memorable en un ambiente cálido. Una experiencia culinaria que recomendamos encarecidamente." }
      ]
    },
    cta: {
      title: "¿Listo para pedir?",
      desc: "Nuestro equipo está listo para preparar su pedido. Entrega rápida o para llevar.",
      call: "Llamar"
    },
    values: {
      subtitle: "Nuestros Compromisos",
      title: "¿Por qué Planet Food?",
      items: [
        { icon: "speed", title: "Entrega Express", desc: "Pedidos preparados y entregados en menos de 30 min en toda Ginebra." },
        { icon: "payment", title: "Pago Seguro", desc: "Stripe certificado PCI-DSS. Sus datos bancarios nunca pasan por nuestros servidores." },
        { icon: "mobile", title: "Web & Móvil", desc: "Pida desde cualquier dispositivo. Aplicación PWA disponible desde su navegador." },
        { icon: "shared", title: "Carrito Compartido", desc: "Hamburguesas, pizzas, tacos: mezcle varios restaurantes en un solo pedido." }
      ]
    },
    restaurants: {
      banner: "Nuestros Restaurantes"
    },
    catering: {
      title: "Servicio de Catering de Prestigio",
      subtitle: "Excelencia gastronómica para sus recepciones.",
      desc: "Bodas, cócteles o eventos de empresa: creamos buffets refinados para todos sus eventos.",
      btnHero: "Solicitar presupuesto gratuito",
      experienceTitle: "El Arte de Recibir",
      blocs: [
        {
          tag: "01. EXPERIENCIA & PASIÓN",
          title: "La Excelencia de Nuestros Chefs",
          desc: "Nuestros chefs, apasionados y experimentados, preparan cada plato con absoluto rigor para garantizar una experiencia gastronómica auténtica."
        },
        {
          tag: "02. CALIDAD IRREPROCHABLE",
          title: "Ingredientes Cuidadosamente Seleccionados",
          desc: "Seleccionamos nuestros ingredientes de los mejores productores para ofrecerle lo mejor, respetando estrictamente los sabores y la frescura."
        },
        {
          tag: "03. PRESENTACIÓN CUIDADA",
          title: "Elegancia en el Plato",
          desc: "Nuestros emplatados están diseñados para realzar su mesa, combinando estética moderna y refinamiento para deleitar tanto la vista como el paladar."
        }
      ],
      formSection: {
        title: "Su Presupuesto Personalizado",
        subtitle: "Cuéntenos su proyecto, le responderemos con una propuesta a medida en menos de 24 horas.",
        name: "Nombre completo",
        email: "Email",
        type: "Tipo de evento",
        types: ["Evento de Empresa", "Boda", "Recepción Privada", "Cóctel"],
        guests: "Número de invitados",
        vision: "Detalles de la recepción",
        visionPlaceholder: "Fecha, lugar, deseos particulares...",
        submit: "Solicitar mi Presupuesto",
        sending: "Enviando...",
        successTitle: "Solicitud Enviada",
        successDesc: "Gracias por contactarnos. Nuestro equipo estudiará su proyecto y le contactará muy pronto.",
        successBtn: "Nueva solicitud"
      }
    },
    contact: {
      title: "Contáctenos",
      subtitle: "¿Una pregunta? ¿Una reserva?",
      address: "Dirección",
      opening: "Horarios",
      follow: "Síguenos"
    },
    footer: {
      desc: "Excelencia gastronómica a su servicio. Una experiencia única, en el local o en su casa.",
      linksTitle: "Navegación",
      contactTitle: "Ubicación",
      rights: "© 2026 Planet Food. Todos los derechos reservados."
    }
  }
};
