import { ActionPlanDirective, ActionPlanResponse, SupportedLanguage, SimulatorInputs } from '../domain/types';

/**
 * Parameter interface for deterministic action plan synthesis.
 */
export interface FallbackActionPlanParams {
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
 * Formulates structured clinical mitigation plans and directives with 100% zero-downtime resilience
 * when upstream GenAI LLMs are unconfigured, rate-limited, or experiencing latency timeouts.
 *
 * @param params - Ambient telemetry, selected city, language, and user simulator parameters
 * @returns {ActionPlanResponse} Fully structured clinical action plan with four categorized directives
 *
 * @example
 * ```ts
 * const plan = generateFallbackActionPlan({
 *   cityId: 'delhi_ncr',
 *   cityName: 'Delhi NCR',
 *   language: 'en',
 *   aqiUs: 204,
 *   primaryPollutant: 'PM2.5',
 *   primaryPollutantConcentration: 96.6,
 *   inputs: DEFAULT_SIMULATOR_INPUTS,
 * });
 * ```
 */
export function generateFallbackActionPlan(params: FallbackActionPlanParams): ActionPlanResponse {
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
      executiveSummary: `${cityName} வானிலை ஆலோசனை: தற்போதைய காற்றுத் தரம் ${aqiUs} AQI (${primaryPollutant} செறிவு: ${primaryPollutantConcentration} µg/m³). சுகாதாரப் பாதுகாப்பு நெறிமுறைகளைப் பின்பற்றவும்.`,
      engineSource: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
      generatedAt: new Date().toISOString(),
      directives,
    };
  }

  if (language === 'hi') {
    const directives: ActionPlanDirective[] = [
      {
        category: 'indoor',
        title: 'सक्रिय HEPA वायु शोधन संचालित करें',
        urgency: isSevere ? 'CRITICAL' : 'HIGH',
        description: `परिवेश AQI (${aqiUs}) अत्यधिक उच्च स्तर पर है। खिड़कियां सील रखें एवं ट्रू HEPA प्यूरीफायर को रीसर्क्युलेशन मोड पर चालू रखें।`,
        impactMetricLabel: 'प्रभाव मीट्रिक:',
        impactMetricValue: '85% इनडोर PM2.5 अवसादन में कमी',
      },
      {
        category: 'commute',
        title: 'N95 श्वसन सुरक्षा एवं सार्वजनिक मेट्रो पारगमन',
        urgency: isSevere ? 'CRITICAL' : isModerate ? 'HIGH' : 'MODERATE',
        description: 'खुले दोपहिया वाहनों से बचें। N95/FFP2 रेस्पिरेटर मास्क के साथ वातानुकूलित मेट्रो अथवा इलेक्ट्रिक बस चुनें।',
        impactMetricLabel: 'प्रभाव मीट्रिक:',
        impactMetricValue: '95% कम पारगमन इनहेलेशन एक्सपोजर',
      },
      {
        category: 'health',
        title: 'बाहरी एरोबिक व्यायाम स्थगित करें',
        urgency: isSevere ? 'HIGH' : 'MODERATE',
        description: `वर्तमान कण सांद्रता ${primaryPollutantConcentration} µg/m³ है। पल्मोनरी तनाव से बचाव हेतु इनडोर व्यायामशाला चुनें।`,
        impactMetricLabel: 'प्रभाव मीट्रिक:',
        impactMetricValue: '60% कम श्वसन तनाव',
      },
      {
        category: 'community',
        title: 'खुले कचरे अथवा बायोमास दहन की सूचना दें',
        urgency: 'HIGH',
        description: 'स्थानीय धुआं एवं निर्माण धूल उल्लंघन को नगरपालिका पोर्टल पर पंजीकृत करें।',
        impactMetricLabel: 'प्रभाव मीट्रिक:',
        impactMetricValue: 'सामुदायिक वायु मंडल संरक्षण',
      },
    ];

    return {
      cityId: params.cityId,
      cityName,
      compositeAqi: aqiUs,
      primaryPollutant,
      executiveSummary: `${cityName} मौसम परामर्श: वर्तमान समग्र सूचकांक ${aqiUs} AQI है, जिसमें मुख्य प्रदूषक ${primaryPollutant} (${primaryPollutantConcentration} µg/m³) है। तत्काल एहतियाती उपाय अपनाने की सलाह दी जाती है।`,
      engineSource: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
      generatedAt: new Date().toISOString(),
      directives,
    };
  }

  // English (default)
  const directives: ActionPlanDirective[] = [
    {
      category: 'indoor',
      title: 'Enact True HEPA Indoor Recirculation',
      urgency: isSevere ? 'CRITICAL' : 'HIGH',
      description: `Ambient AQI (${aqiUs}) indicates severe atmospheric stagnation. Seal fenestration and maintain active True HEPA air purifiers in sealed recirculation mode to scrub particulate deposition.`,
      impactMetricLabel: 'Impact Metric:',
      impactMetricValue: '85% Indoor PM2.5 Deposition Reduction',
    },
    {
      category: 'commute',
      title: 'Mandate N95 Respiratory Protection for Transit',
      urgency: isSevere ? 'CRITICAL' : isModerate ? 'HIGH' : 'MODERATE',
      description: 'Avoid open-air two-wheeler and auto-rickshaw transit. Transition to sealed Metro Rail cars and ensure tight-seal N95/FFP2 facial respiratory barrier.',
      impactMetricLabel: 'Impact Metric:',
      impactMetricValue: '95% Commute Inhalation Exposure Abatement',
    },
    {
      category: 'health',
      title: 'Defer High-Ventilation Outdoor Aerobic Cardio',
      urgency: isSevere ? 'HIGH' : 'MODERATE',
      description: `Ambient fine particulate concentration stands at ${primaryPollutantConcentration} µg/m³. Elevated ventilation (>3.0 m³/hr) accelerates alveolar microvascular penetration. Substitute with indoor resistance training.`,
      impactMetricLabel: 'Impact Metric:',
      impactMetricValue: '60% Pulmonary Microvascular Stress Reduction',
    },
    {
      category: 'community',
      title: 'Report Localized Biomass & Stubble Open Incineration',
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
 * Synthesizes localized, evidence-based clinical and meteorological answers across English, Tamil, and Hindi.
 *
 * @param query - Inbound user query text
 * @param cityName - Active metropolitan area name
 * @param aqiUs - Active US EPA Air Quality Index value
 * @param pm25 - Active PM2.5 particulate concentration in µg/m³
 * @param language - Active interface locale ('en' | 'ta' | 'hi')
 * @returns {string} Grounded response text
 *
 * @example
 * ```ts
 * const reply = generateFallbackChatResponse('Is it safe to jog?', 'Delhi NCR', 204, 96.6, 'en');
 * ```
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
