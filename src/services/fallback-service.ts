import { ActionPlanDirective, ActionPlanResponse, SupportedLanguage, SimulatorInputs } from '../domain/types';

interface FallbackParams {
  cityId: string;
  cityName: string;
  language: SupportedLanguage;
  aqiUs: number;
  primaryPollutant: string;
  primaryPollutantConcentration: number;
  inputs: SimulatorInputs;
}

/**
 * Deterministic Rules-Based Fallback Engine.
 * Formulates structured clinical mitigation plans and chat responses
 * with 100% zero-downtime resilience when upstream LLMs are unavailable.
 */
export function generateFallbackActionPlan(params: FallbackParams): ActionPlanResponse {
  const { cityName, language, aqiUs, primaryPollutant, primaryPollutantConcentration } = params;

  const isSevere = aqiUs > 200;
  const isModerate = aqiUs > 100 && aqiUs <= 200;

  if (language === 'ta') {
    const directives: ActionPlanDirective[] = [
      {
        category: 'indoor',
        title: 'ட்ரூ HEPA உட்புற மறுசுழற்சியைச் செயல்படுத்தவும்',
        urgency: isSevere ? 'CRITICAL' : 'HIGH',
        description: `சுற்றுப்புற AQI (${aqiUs}) மிக அதிகமாக உள்ளது. ஜன்னல்களை மூடி, HEPA காற்று சுத்திகரிப்பான்களை தொடர்ச்சியான மறுசுழற்சி முறையில் இயக்கவும்.`,
        impactMetricLabel: 'தாக்கக் குறியீடு',
        impactMetricValue: '85% உட்புற PM2.5 படிவு குறைப்பு',
      },
      {
        category: 'commute',
        title: 'கட்டாய N95 முகக்கவசம் மற்றும் பாதுகாப்பான பயணம்',
        urgency: isSevere ? 'CRITICAL' : isModerate ? 'HIGH' : 'MODERATE',
        description: 'இருசக்கர வாகனம் மற்றும் திறந்த ஆட்டோ பயணத்தைத் தவிர்க்கவும். N95/FFP2 முகக்கவசத்துடன் மெட்ரோ ரயிலைப் பயன்படுத்தவும்.',
        impactMetricLabel: 'தாக்கக் குறியீடு',
        impactMetricValue: '95% பயண சுவாச உறிஞ்சுதல் குறைப்பு',
      },
      {
        category: 'health',
        title: 'வெளியரங்க தீவிர உடற்பயிற்சியை ஒத்திவைக்கவும்',
        urgency: isSevere ? 'HIGH' : 'MODERATE',
        description: `மாசுபடுத்தி செறிவு ${primaryPollutantConcentration} µg/m³ ஆக உள்ளது. நுரையீரல் பாதுகாப்பிற்கு உட்புற உடற்பயிற்சிக்கு மாறவும்.`,
        impactMetricLabel: 'தாக்கக் குறியீடு',
        impactMetricValue: '60% நுரையீரல் அழுத்தக் குறைப்பு',
      },
      {
        category: 'community',
        title: 'திறந்தவெளி குப்பை எரிப்பதை புகாரளிக்கவும்',
        urgency: 'HIGH',
        description: 'குப்பை, இலை அல்லது கட்டுமான தூசி விதிமீறல்களை நகராட்சி உதவி எண்களில் பதிவு செய்யவும்.',
        impactMetricLabel: 'தாக்கக் குறியீடு',
        impactMetricValue: 'அருகாமை காற்று மண்டல பாதுகாப்பு',
      },
    ];

    return {
      cityId: params.cityId,
      cityName,
      compositeAqi: aqiUs,
      primaryPollutant,
      executiveSummary: `${cityName}-க்கான வானிலை ஆலோசனை: தற்போதைய கூட்டு AQI ${aqiUs} (${primaryPollutant}: ${primaryPollutantConcentration} µg/m³). முன் எச்சரிக்கை நடவடிக்கைகள் பரிந்துரைக்கப்படுகின்றன.`,
      engineSource: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
      generatedAt: new Date().toISOString(),
      directives,
    };
  }

  if (language === 'hi') {
    const directives: ActionPlanDirective[] = [
      {
        category: 'indoor',
        title: 'ट्रू HEPA इनडोर वायु पुनर्चक्रण सक्रिय करें',
        urgency: isSevere ? 'CRITICAL' : 'HIGH',
        description: `परिवेश AQI (${aqiUs}) गंभीर है। खिड़कियां बंद रखें और HEPA एयर प्यूरीफायर को अधिकतम पुनर्चक्रण मोड पर चलाएं।`,
        impactMetricLabel: 'प्रभाव सूचकांक',
        impactMetricValue: '85% इनडोर PM2.5 जमाव में कमी',
      },
      {
        category: 'commute',
        title: 'अनिवार्य N95 मास्क एवं सुरक्षित सार्वजनिक पारगमन',
        urgency: isSevere ? 'CRITICAL' : isModerate ? 'HIGH' : 'MODERATE',
        description: 'दोपहिया और खुली यात्रा से बचें। कसकर लगे N95/FFP2 मास्क के साथ वातानुकूलित मेट्रो रेल का उपयोग करें।',
        impactMetricLabel: 'प्रभाव सूचकांक',
        impactMetricValue: '95% यात्रा अंतःश्वसन जोखिम में कमी',
      },
      {
        category: 'health',
        title: 'बाहरी उच्च-तीव्रता कार्डियो स्थगित करें',
        urgency: isSevere ? 'HIGH' : 'MODERATE',
        description: `प्राथमिक प्रदूषक सांद्रता ${primaryPollutantConcentration} µg/m³ है। फेफड़ों की सुरक्षा हेतु इनडोर व्यायाम करें।`,
        impactMetricLabel: 'प्रभाव सूचकांक',
        impactMetricValue: '60% फुफ्फुसीय तनाव में कमी',
      },
      {
        category: 'community',
        title: 'खुले में कचरा जलाने की सूचना दें',
        urgency: 'HIGH',
        description: 'किसी भी बायोमास या निर्माण धूल उल्लंघन की रिपोर्ट नगर निगम हेल्पलाइन पर दर्ज करें।',
        impactMetricLabel: 'प्रभाव सूचकांक',
        impactMetricValue: 'स्थानीय वायु सुरक्षा',
      },
    ];

    return {
      cityId: params.cityId,
      cityName,
      compositeAqi: aqiUs,
      primaryPollutant,
      executiveSummary: `${cityName} के लिए मौसम संबंधी परामर्श: वर्तमान समग्र सूचकांक ${aqiUs} AQI है (${primaryPollutant}: ${primaryPollutantConcentration} µg/m³)। एहतियाती सुरक्षा उपायों की सिफारिश की जाती है।`,
      engineSource: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
      generatedAt: new Date().toISOString(),
      directives,
    };
  }

  // Default: English
  const directives: ActionPlanDirective[] = [
    {
      category: 'indoor',
      title: 'Enact True HEPA Indoor Recirculation',
      urgency: isSevere ? 'CRITICAL' : 'HIGH',
      description: `Ambient AQI (${aqiUs}) is hazardous. Seal building envelope windows and set HEPA air purifiers to maximum continuous recirculation mode.`,
      impactMetricLabel: 'Impact Metric:',
      impactMetricValue: '85% Indoor PM2.5 Deposition Reduction',
    },
    {
      category: 'commute',
      title: 'Mandatory N95 Respirator & Sealed Transit',
      urgency: isSevere ? 'CRITICAL' : isModerate ? 'HIGH' : 'MODERATE',
      description: 'Bypass two-wheeler and open rickshaw transit. Utilize sealed metro rail with tightly fitted N95/FFP2 respirators.',
      impactMetricLabel: 'Impact Metric:',
      impactMetricValue: '95% Commute Inhaled Dose Abatement',
    },
    {
      category: 'health',
      title: 'Postpone High-Ventilation Outdoor Cardio',
      urgency: isSevere ? 'HIGH' : 'MODERATE',
      description: `Primary pollutant concentration is ${primaryPollutantConcentration} µg/m³. Shift cardio to filtered indoor environments to prevent deep alveolar deposition.`,
      impactMetricLabel: 'Impact Metric:',
      impactMetricValue: '60% Pulmonary Stress Reduction',
    },
    {
      category: 'community',
      title: 'Report Open Waste Combustion',
      urgency: 'HIGH',
      description: 'Log any localized biomass, leaf, or construction dust violations on municipal portal hotlines.',
      impactMetricLabel: 'Impact Metric:',
      impactMetricValue: 'Neighborhood Air Basin Protection',
    },
  ];

  return {
    cityId: params.cityId,
    cityName,
    compositeAqi: aqiUs,
    primaryPollutant,
    executiveSummary: `Meteorological advisory for ${cityName}: Current composite index is ${aqiUs} AQI governed by ${primaryPollutant} (${primaryPollutantConcentration} µg/m³). Precautionary protections recommended.`,
    engineSource: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
    generatedAt: new Date().toISOString(),
    directives,
  };
}

/**
 * Deterministic fallback responses for grounded atmospheric chat queries.
 */
export function generateFallbackChatResponse(
  query: string,
  cityName: string,
  aqiUs: number,
  pm25: number,
  language: SupportedLanguage
): string {
  const q = query.toLowerCase();

  if (language === 'ta') {
    if (q.includes('jog') || q.includes('cardio') || q.includes('உடற்பயிற்சி') || q.includes('ஓட்ட')) {
      return `${cityName}-ல் தற்போதைய AQI ${aqiUs} மற்றும் PM2.5 ${pm25} µg/m³ ஆக உள்ளது. தீவிர உடற்பயிற்சியின் போது அதிக காற்று உள்ளிழுக்கப்படுவதால் நச்சுத்துகள்கள் நுரையீரலில் ஆழமாக படியும். எனவே வெளியரங்க ஓட்டப்பயிற்சியை தவிர்த்து உட்புறத்தில் பயிற்சி செய்யவும்.`;
    }
    if (q.includes('mask') || q.includes('முகக்கவசம்')) {
      return aqiUs > 150
        ? `தற்போதைய AQI (${aqiUs}) மிக ஆபத்தானது. துணி முகக்கவசங்களை தவிர்த்து, காற்று கசிவு இல்லாத N95 அல்லது FFP2 ரெஸ்பிரேட்டர் முகக்கவசத்தை அணியவும்.`
        : `சுற்றுப்புற காற்று நடுத்தர நிலையில் உள்ளது. வெளியில் செல்லும்போது சர்ஜிகல் அல்லது N95 முகக்கவசம் பரிந்துரைக்கப்படுகிறது.`;
    }
    return `${cityName}-ல் தற்போதைய கூட்டு AQI ${aqiUs} ஆகவும், PM2.5 செறிவு ${pm25} µg/m³ ஆகவும் உள்ளது. முன்னெச்சரிக்கை நடவடிக்கையாக தேவையற்ற வெளியரங்க நடமாட்டத்தை குறைத்துக்கொள்ளவும்.`;
  }

  if (language === 'hi') {
    if (q.includes('jog') || q.includes('cardio') || q.includes('दौड़') || q.includes('व्यायाम')) {
      return `${cityName} में वर्तमान समग्र AQI ${aqiUs} और PM2.5 ${pm25} µg/m³ है। बाहरी कार्डियो की सख्त मनाही है क्योंकि उच्च वेंटिलेशन (>3.0 m³/hr) सूक्ष्म कणों को फेफड़ों में गहराई तक पहुंचाता है। कृपया इनडोर व्यायाम करें।`;
    }
    if (q.includes('mask') || q.includes('मास्क')) {
      return aqiUs > 150
        ? `वर्तमान AQI (${aqiUs}) गंभीर है। कपड़े के मास्क के स्थान पर कसकर फिट किया गया N95 अथवा FFP2 रेस्पिरेटर ही उपयोग करें।`
        : `वायु गुणवत्ता मध्यम है। संवेदनशील व्यक्तियों के लिए N95 मास्क पहनने की सलाह दी जाती है।`;
    }
    return `${cityName} में वर्तमान संयुक्त AQI ${aqiUs} है और PM2.5 सांद्रता ${pm25} µg/m³ है। स्वास्थ्य सुरक्षा हेतु उचित एहतियाती उपाय अपनाएं।`;
  }

  // English
  if (q.includes('jog') || q.includes('cardio') || q.includes('run') || q.includes('safe to jog')) {
    return `In ${cityName}, the composite AQI is currently ${aqiUs} with PM2.5 at ${pm25} µg/m³. Outdoor cardio is strongly discouraged because elevated minute ventilation (>3.0 m³/hr) drives fine particulates deep into alveolar tissue. Shift workouts indoors.`;
  }

  if (q.includes('mask') || q.includes('grade')) {
    return aqiUs > 150
      ? `Given the high ambient AQI of ${aqiUs} in ${cityName}, cloth or standard surgical masks are insufficient (<40% filtration). A certified, well-fitted N95 / FFP2 respirator providing >=95% particulate filtration is strictly mandatory for any outdoor exposure.`
      : `With current AQI at ${aqiUs}, standard surgical masks provide basic barrier protection, though N95 respirators remain optimal for high-risk individuals and active commuters.`;
  }

  if (q.includes('child') || q.includes('elder') || q.includes('protect')) {
    return `Children and the elderly have higher minute ventilation rates per kg and more permeable lung tissue. Ensure indoor living areas maintain continuous HEPA filtration, avoid early morning and late evening outdoor transit, and keep rescue inhalers accessible.`;
  }

  // Default atmospheric breakdown
  return `In ${cityName}, the composite AQI is currently ${aqiUs} with PM2.5 at ${pm25} µg/m³. Outdoor exposure should be strictly minimized and physical exertion shifted to filtered indoor zones.`;
}
