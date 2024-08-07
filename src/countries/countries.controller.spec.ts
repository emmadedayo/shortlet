import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CountriesService } from './countries.service';
import { StatsDto } from './dto/stats.dto';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CountriesController } from './countries.controller';
import { CountryFormatInterface } from './interfaces/country-format.interface';
import { RegionInterface } from './interfaces/region.interface';
import { LanguageInterface } from './interfaces/language.interface';
import { CountryResponseInterface } from './interfaces/country-response.interface';

describe('CountriesController', () => {
  let app: INestApplication;
  const countriesService = {
    getCountries: jest.fn(),
    getCountryByName: jest.fn(),
    getRegions: jest.fn(),
    getLanguages: jest.fn(),
    getStatistics: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([
          {
            ttl: 5 * 60,
            limit: 10,
          },
        ]),
      ],
      controllers: [CountriesController],
      providers: [{ provide: CountriesService, useValue: countriesService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it('/countries (GET)', () => {
    const mockResponse: CountryResponseInterface = {
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    };
    countriesService.getCountries.mockResolvedValue(mockResponse);

    return request(app.getHttpServer())
      .get('/countries')
      .query({ search: 'region=Europe&minPopulation=500000' })
      .expect(200)
      .expect(mockResponse);
  });

  it('/countries/:name (GET)', () => {
    const mockResponse: CountryFormatInterface = {
      commonName: 'France',
      population: 1000000,
      borders: ['Country2'],
      languages: { deu: 'German' },
      latlng: [-14.235004, -51.92528],
    };
    countriesService.getCountryByName.mockResolvedValue(mockResponse);

    return request(app.getHttpServer())
      .get('/countries/Country1')
      .expect(200)
      .expect(mockResponse);
  });

  it('/regions (GET)', () => {
    const mockResponse: Record<string, RegionInterface> = {
      Antarctic: {
        countries: [
          'South Georgia',
          'Antarctica',
          'Bouvet Island',
          'French Southern and Antarctic Lands',
          'Heard Island and McDonald Islands',
        ],
        totalPopulation: 1430,
      },
    };
    countriesService.getRegions.mockResolvedValue(mockResponse);

    return request(app.getHttpServer())
      .get('/regions')
      .expect(200)
      .expect(mockResponse);
  });

  it('/languages (GET)', () => {
    const mockResponse: Record<string, LanguageInterface> = {
      Language1: {
        countries: ['Country1'],
        totalSpeakers: 500000,
      },
      Language2: {
        countries: ['Country2'],
        totalSpeakers: 1500000,
      },
    };
    countriesService.getLanguages.mockResolvedValue(mockResponse);

    return request(app.getHttpServer())
      .get('/languages')
      .expect(200)
      .expect(mockResponse);
  });

  it('/statistics (GET)', () => {
    const mockResponse: StatsDto = {
      totalCountries: 250,
      largestCountryByArea: 'Russia',
      smallestCountryByPopulation: 'Heard Island and McDonald Islands',
      mostSpokenLanguage: 'English',
    };
    countriesService.getStatistics.mockResolvedValue(mockResponse);

    return request(app.getHttpServer())
      .get('/statistics')
      .expect(200)
      .expect(mockResponse);
  });

  afterAll(async () => {
    await app.close();
  });
});
