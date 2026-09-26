import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodedCoordinates {
  lat: number;
  lng: number;
}

interface MapsCoResult {
  lat: string;
  lon: string;
}

const DEFAULT_GEOCODING_BASE_URL = 'https://geocode.maps.co/search';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GEOCODING_API_KEY') ?? '';
    this.baseUrl =
      config.get<string>('GEOCODING_BASE_URL') ?? DEFAULT_GEOCODING_BASE_URL;
  }

  async search(fulltextSearchTerm: string): Promise<GeocodedCoordinates | null> {
    this.logger.log(`Searching for ${fulltextSearchTerm} in geocoding API.`);
    if (!this.apiKey) {
      this.logger.warn('GEOCODING_API_KEY is not set — skipping geocoding.');
      return null;
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set('q', fulltextSearchTerm);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('limit', '1');

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        this.logger.warn(
          `Geocoding request failed with status ${response.status}`,
        );
        return null;
      }

      const results = (await response.json()) as MapsCoResult[];
      const first = results[0];
      if (!first) {
      	this.logger.log(`Haven\'t found anything for ${fulltextSearchTerm}`);
        return null;
      }

      const lat = Number(first.lat);
      const lng = Number(first.lon);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
      }

      return { lat, lng };
    } catch (error) {
      this.logger.warn(
        'Geocoding request failed',
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }
}
