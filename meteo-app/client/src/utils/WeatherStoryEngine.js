class WeatherStoryEngine {

  //pour générer une histoire météo
  static generateStory(weatherData) {
    if (!weatherData) return null;

    const { city, temperature, description, humidity, windSpeed, uvIndex, sunrise, sunset } = weatherData;
    //heure actuelle
    const hour = new Date().getHours();
    //période de la journée
    const period = this.getPeriodOfDay(hour);
    //type de météo
    const weatherType = this.getWeatherType(description);
    //génération de l'histoire
    let story = this.getGreeting(period);
    story += ` ${this.getWeatherIntro(city, temperature, weatherType)}`;
    story += ` ${this.getWeatherDescription(weatherType, temperature)}`;
    //avertissement UV
    if (uvIndex !== null && uvIndex !== undefined && uvIndex > 5) {
      story += ` ${this.getUVWarning(uvIndex)}`;
    }
    //info coucher de soleil
    if (hour >= 15 && hour < 20 && sunset) {
      story += ` ${this.getSunsetInfo(sunset)}`;
    }
    //message de fermeture
    story += ` ${this.getClosing(weatherType)}`;

    return story;
  }

  // Selon l'heure
  static getGreeting(period) {
    const greetings = {
      morning: ["Bonjour!", "Bonne matinée!", "Salut"],
      afternoon: ["Bon après-midi!", "Salut!", "Bonjour!"],
      evening: ["Bonsoir!", "Bonne soirée!", "Salut"],
      night: ["Bonne nuit!", "Salut!", "Bonsoir!"]
    };

    const options = greetings[period];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Introduction météo
  static getWeatherIntro(city, temperature, weatherType) {
    const intros = [
      `Il fait actuellement ${Math.round(temperature)} degrés à ${city}.`,
      `À ${city}, la température est de ${Math.round(temperature)} degrés.`,
      `Nous sommes à ${Math.round(temperature)} degrés à ${city} en ce moment.`,
    ];

    return intros[Math.floor(Math.random() * intros.length)];
  }

  // Description météo
  static getWeatherDescription(weatherType, temperature) {
    const descriptions = {
      sunny: [
        "Le soleil brille dans un ciel parfaitement dégagé.",
        "Le ciel est magnifiquement bleu aujourd'hui.",
        "C'est une journée ensoleillée!",
        "Le soleil illumine tout de ses rayons dorés."
      ],
      cloudy: [
        "Le ciel est couvert de nuages.",
        "Des nuages parcourent le ciel.",
        "C'est une journée plutôt nuageuse.",
        "Les nuages dominent le ciel aujourd'hui."
      ],
      rainy: [
        "Il pleut en ce moment, alors n'oubliez pas votre parapluie!",
        "La pluie tombe doucement sur la ville.",
        "C'est un temps pluvieux, restez au sec!",
        "Les gouttes de pluie dansent sur les trottoirs."
      ],
      stormy: [
        "Un orage gronde! Restez à l'intérieur si possible.",
        "Le temps est orageux, soyez prudents!",
        "Des éclairs illuminent le ciel, c'est impressionnant!",
        "La tempête fait rage, mettez-vous à l'abri."
      ],
      snowy: [
        "Il neige! La ville se couvre d'un manteau blanc.",
        "Des flocons de neige tombent doucement.",
        "C'est une belle journée enneigée!",
        "La neige transforme le paysage en carte postale."
      ],
      foggy: [
        "Un épais brouillard enveloppe la ville.",
        "La visibilité est réduite à cause du brouillard.",
        "Le brouillard crée une atmosphère mystérieuse.",
        "La brume donne un aspect féerique au paysage."
      ]
    };

    const options = descriptions[weatherType] || descriptions.cloudy;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Avertissement UV
  static getUVWarning(uvIndex) {
    if (uvIndex > 10) {
      return "Attention! L'indice UV est extrême. La protection solaire est indispensable!";
    } else if (uvIndex > 7) {
      return "L'indice UV est très élevé. Protégez votre peau avec de la crème solaire!";
    } else {
      return "L'indice UV est élevé. N'oubliez pas votre crème solaire!";
    }
  }

  // Info coucher de soleil
  static getSunsetInfo(sunset) {
    const time = new Date(sunset * 1000).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const messages = [
      `Le coucher de soleil aura lieu à ${time}, ce sera magnifique!`,
      `Ne manquez pas le coucher de soleil à ${time}!`,
      `Le soleil se couchera à ${time}, un moment magique en perspective!`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Message de fermeture
  static getClosing(weatherType) {
    const closings = {
      sunny: ["Profitez bien de cette belle journée!", "Bonne journée ensoleillée!", "Que le soleil vous accompagne!"],
      rainy: ["Restez au sec!", "Prenez soin de vous!", "Courage sous la pluie!"],
      stormy: ["Restez en sécurité!", "Prenez soin de vous!", "La tempête passera!"],
      snowy: ["Restez au chaud!", "Profitez de la neige!", "Bonne journée hivernale!"],
      cloudy: ["Bonne journée!", "Profitez bien!", "À bientôt!"],
      foggy: ["Soyez prudents!", "Bonne journée!", "Prenez soin de vous!"]
    };

    const options = closings[weatherType] || closings.cloudy;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Déterminer la période de la journée
  static getPeriodOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  // Déterminer le type de météo depuis la description
  static getWeatherType(description) {
    const desc = description.toLowerCase();

    if (desc.includes('clear') || desc.includes('sunny') || desc.includes('dégagé')) {
      return 'sunny';
    }
    if (desc.includes('rain') || desc.includes('pluie') || desc.includes('drizzle')) {
      return 'rainy';
    }
    if (desc.includes('storm') || desc.includes('thunder') || desc.includes('orage')) {
      return 'stormy';
    }
    if (desc.includes('snow') || desc.includes('neige')) {
      return 'snowy';
    }
    if (desc.includes('fog') || desc.includes('mist') || desc.includes('brouillard')) {
      return 'foggy';
    }
    if (desc.includes('cloud') || desc.includes('nuage') || desc.includes('overcast')) {
      return 'cloudy';
    }

    return 'cloudy';
  }

  // Obtenir le fichier audio d'ambiance
  static getAmbientSound(weatherType) {
    return weatherType;
  }
}

export default WeatherStoryEngine;