import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { CountryInterface } from './interfaces/country.interface';
import { CountryQueryDataDto } from './dto/country-query-data.dto';
import { CountryResponseInterface } from './interfaces/country-response.interface';
import { CountryFormatInterface } from './interfaces/country-format.interface';
import { RegionInterface } from './interfaces/region.interface';
import { LanguageInterface } from './interfaces/language.interface';
import { StatsDto } from './dto/stats.dto';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);
  private readonly restCountriesBaseUrl: string;
  private readonly callTimeout: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.restCountriesBaseUrl = this.configService.get<string>('COUNTRY_BASE_URL');
    this.callTimeout = this.configService.get<number>('TIME_OUT');
  }

  async fetchCountries(): Promise<CountryInterface[]> {
    const cacheKey = 'countries';
    const cachedData =
      await this.cacheManager.get<CountryInterface[]>(cacheKey);

    if (cachedData) {
      this.logger.debug('Returning cached data');
      return cachedData;
    }

    try {
      this.logger.debug(
        `Fetching countries from API: ${this.restCountriesBaseUrl}`,
      );
      const response: AxiosResponse<CountryInterface[]> = await axios.get(
        `${this.restCountriesBaseUrl}/all`,
        {
          timeout: this.callTimeout,
        },
      );
      const countries = response.data;

      if (
        !Array.isArray(countries) ||
        !countries.every(this.isValidCountryInterface)
      ) {
        throw new Error('Invalid data format from API');
      }

      this.logger.debug('Storing data in cache');
      await this.cacheManager.set(cacheKey, countries);

      return countries;
    } catch (error) {
      this.logger.error('Error fetching and storing countries:', error.stack);
      throw new InternalServerErrorException('Error fetching countries data');
    }
  }

  async getCountries(
    searchQuery: CountryQueryDataDto,
  ): Promise<CountryResponseInterface> {
    this.logger.debug('Fetching countries for search query', searchQuery);
    let filteredCountries = await this.fetchCountries();

    if (searchQuery?.region) {
      filteredCountries = filteredCountries.filter(
        (country) =>
          country.region.toLowerCase() === searchQuery?.region.toLowerCase(),
      );
    }

    if (searchQuery?.minPopulation) {
      filteredCountries = filteredCountries.filter(
        (country) => country.population >= searchQuery?.minPopulation,
      );
    }

    filteredCountries.sort((a, b) =>
      a.name.common.localeCompare(b.name.common),
    );

    const start = (searchQuery?.page - 1) * searchQuery?.limit;
    const end = start + searchQuery?.limit;
    const paginatedCountries = filteredCountries.slice(start, end);

    const formattedCountries = this.formatCountryData(
      paginatedCountries,
    ) as CountryFormatInterface[];

    this.logger.debug('Returning paginated and formatted country data');
    return {
      total: filteredCountries.length,
      page: searchQuery?.page,
      limit: searchQuery?.limit,
      data: formattedCountries,
    };
  }

  async getCountryByName(name: string): Promise<CountryFormatInterface> {
    this.logger.debug(`Fetching country by name: ${name}`);
    const countries: CountryInterface[] = await this.fetchCountries();
    const country: CountryInterface = countries.find(
      (country) => country.name.common.toLowerCase() === name.toLowerCase(),
    );

    if (!country) {
      this.logger.warn(`Country not found: ${name}`);
      throw new NotFoundException('The specified country could not be found');
    }

    return this.formatCountryData(country) as CountryFormatInterface;
  }

  async getRegions(): Promise<Record<string, RegionInterface>> {
    this.logger.debug('Fetching regions');
    const countries: CountryInterface[] = await this.fetchCountries();
    const regions: Record<string, RegionInterface> = {};

    countries.forEach((country) => {
      if (!regions[country.region]) {
        regions[country.region] = {
          countries: [],
          totalPopulation: 0,
        };
      }
      regions[country.region].countries.push(country.name.common);
      regions[country.region].totalPopulation += country.population;
    });

    this.logger.debug('Returning region data');
    return regions;
  }

  async getLanguages(): Promise<Record<string, LanguageInterface>> {
    this.logger.debug('Fetching languages');
    const countries: CountryInterface[] = await this.fetchCountries();
    const languageDetails: Record<string, LanguageInterface> = {};

    countries.forEach((country) => {
      Object.entries(country.languages || {})
        .filter(([, name]) => name)
        .forEach(([, name]) => {
          if (!languageDetails[name]) {
            languageDetails[name] = {
              countries: [],
              totalSpeakers: 0,
            };
          }

          languageDetails[name].countries.push(country.name.common);
          languageDetails[name].totalSpeakers += country.population;
        });
    });

    this.logger.debug('Returning language data');
    return languageDetails;
  }

  async getStatistics(): Promise<StatsDto> {
    this.logger.debug('Fetching statistics');
    const countries: CountryInterface[] = await this.fetchCountries();
    const totalCountries = countries.length;
    const largestCountry = countries.reduce((prev, current) =>
      prev.area > current.area ? prev : current,
    );
    const smallestCountry = countries.reduce((prev, current) =>
      prev.population < current.population ? prev : current,
    );
    const mostSpokenLanguage = await this.getMostSpokenLanguage(countries);

    this.logger.debug('Returning statistics data');
    return {
      totalCountries,
      largestCountryByArea: largestCountry.name.common,
      smallestCountryByPopulation: smallestCountry.name.common,
      mostSpokenLanguage,
    };
  }

  private async getMostSpokenLanguage(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _countries: CountryInterface[],
  ): Promise<string> {
    const languages: Record<string, LanguageInterface> =
      await this.getLanguages();
    return Object.keys(languages).reduce((a, b) =>
      languages[a].totalSpeakers > languages[b].totalSpeakers ? a : b,
    );
  }

  private formatCountryData(
    country: CountryInterface | CountryInterface[],
  ): CountryFormatInterface | CountryFormatInterface[] {
    if (Array.isArray(country)) {
      return country.map((c) => ({
        commonName: c.name.common,
        population: c.population,
        languages: c.languages,
        borders: c.borders,
        latlng: c.latlng,
      }));
    } else {
      return {
        commonName: country.name.common,
        population: country.population,
        languages: country.languages,
        borders: country.borders,
        latlng: country.latlng,
      };
    }
  }

  private isValidCountryInterface(country: any): country is CountryInterface {
    return (
      country &&
      typeof country.name?.common === 'string' &&
      typeof country.region === 'string' &&
      typeof country.population === 'number'
    );
  }
}
