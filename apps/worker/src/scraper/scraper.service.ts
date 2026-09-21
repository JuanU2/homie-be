import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  url: string;
  title: string;
  text: string;
  links: string[];
}

@Injectable()
export class ScraperService {
  async scrape(url: string, selector?: string): Promise<ScrapeResult> {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HomieBot/1.0)' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').first().text().trim();
    const text = selector
      ? $(selector).text().trim()
      : $('body').text().replace(/\s+/g, ' ').trim();

    const links = $('a[href]')
      .map((_, el) => $(el).attr('href') ?? '')
      .get()
      .filter((href) => href.startsWith('http') || href.startsWith('/'))
      .slice(0, 100);

    return { url, title, text, links };
  }
}
