import { describe, it, expect } from 'vitest';
import {
  generateFallbackActionPlan,
  generateFallbackChatResponse,
} from '@/services/fallback-service';
import { SimulatorInputs } from '@/domain/types';

describe('Deterministic Rules Fallback Engine', () => {
  const defaultInputs: SimulatorInputs = {
    commuteMode: 'ice_car',
    commuteDistanceKm: 15,
    maskGrade: 'none',
    indoorHepaActive: false,
    outdoorCardioHours: 1,
  };

  it('generates complete English action plan matching screenshot 4', () => {
    const plan = generateFallbackActionPlan({
      cityId: 'delhi_ncr',
      cityName: 'Delhi NCR',
      language: 'en',
      aqiUs: 204,
      primaryPollutant: 'PM2.5',
      primaryPollutantConcentration: 96.6,
      inputs: defaultInputs,
    });

    expect(plan.engineSource).toBe('AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)');
    expect(plan.compositeAqi).toBe(204);
    expect(plan.directives.length).toBe(4);

    const categories = plan.directives.map((d) => d.category);
    expect(categories).toContain('indoor');
    expect(categories).toContain('commute');
    expect(categories).toContain('health');
    expect(categories).toContain('community');

    const indoor = plan.directives.find((d) => d.category === 'indoor')!;
    expect(indoor.urgency).toBe('CRITICAL');
    expect(indoor.title).toContain('HEPA');
  });

  it('generates fully localized Tamil action plan', () => {
    const plan = generateFallbackActionPlan({
      cityId: 'chennai_industrial',
      cityName: 'Chennai Industrial',
      language: 'ta',
      aqiUs: 150,
      primaryPollutant: 'PM2.5',
      primaryPollutantConcentration: 45.0,
      inputs: defaultInputs,
    });

    expect(plan.directives.length).toBe(4);
    expect(plan.executiveSummary).toContain('வானிலை ஆலோசனை');
    const indoor = plan.directives.find((d) => d.category === 'indoor')!;
    expect(indoor.title).toContain('HEPA');
  });

  it('generates fully localized Hindi action plan', () => {
    const plan = generateFallbackActionPlan({
      cityId: 'delhi_ncr',
      cityName: 'Delhi NCR',
      language: 'hi',
      aqiUs: 250,
      primaryPollutant: 'PM2.5',
      primaryPollutantConcentration: 120.0,
      inputs: defaultInputs,
    });

    expect(plan.directives.length).toBe(4);
    expect(plan.executiveSummary).toContain('परामर्श');
    const commute = plan.directives.find((d) => d.category === 'commute')!;
    expect(commute.title).toContain('N95');
  });

  it('generates grounded English chat response for jogging query', () => {
    const reply = generateFallbackChatResponse(
      'Is it safe to jog outside right now?',
      'Delhi NCR',
      204,
      96.6,
      'en'
    );
    expect(reply).toContain('Delhi NCR');
    expect(reply).toContain('204');
    expect(reply).toContain('Outdoor cardio is strongly discouraged');
  });

  it('generates grounded English chat response for mask query', () => {
    const reply = generateFallbackChatResponse(
      'Which mask grade should I wear?',
      'Delhi NCR',
      204,
      96.6,
      'en'
    );
    expect(reply).toContain('N95 / FFP2');
    expect(reply).toContain('204');
  });

  it('generates grounded English chat response for children and elderly query', () => {
    const reply = generateFallbackChatResponse(
      'Protective tips for children and elderly?',
      'Delhi NCR',
      204,
      96.6,
      'en'
    );
    expect(reply).toContain('Children and the elderly');
    expect(reply).toContain('HEPA');
  });

  it('generates grounded Tamil chat responses', () => {
    const replyJog = generateFallbackChatResponse(
      'ஓட்டப்பயிற்சி',
      'Chennai Industrial',
      180,
      70,
      'ta'
    );
    expect(replyJog).toContain('Chennai Industrial');
    expect(replyJog).toContain('உடற்பயிற்சி');

    const replyMask = generateFallbackChatResponse(
      'முகக்கவசம்',
      'Chennai Industrial',
      180,
      70,
      'ta'
    );
    expect(replyMask).toContain('N95');

    const replyMaskModerate = generateFallbackChatResponse(
      'முகக்கவசம்',
      'Chennai Industrial',
      80,
      25,
      'ta'
    );
    expect(replyMaskModerate).toContain('நடுத்தர');
  });

  it('generates grounded Hindi chat responses', () => {
    const replyJog = generateFallbackChatResponse(
      'दौड़ना सुरक्षित है?',
      'Delhi NCR',
      210,
      100,
      'hi'
    );
    expect(replyJog).toContain('Delhi NCR');
    expect(replyJog).toContain('कार्डियो');

    const replyMask = generateFallbackChatResponse(
      'कौन सा मास्क पहनूं?',
      'Delhi NCR',
      210,
      100,
      'hi'
    );
    expect(replyMask).toContain('N95');

    const replyMaskModerateHi = generateFallbackChatResponse(
      'मास्क सुझाव',
      'Bengaluru Corridor',
      75,
      25,
      'hi'
    );
    expect(replyMaskModerateHi).toContain('मध्यम');
  });
});
