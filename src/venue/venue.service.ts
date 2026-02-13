import { Injectable } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Venue } from '@prisma/client';
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}
  async createVenue(createVenueDto: CreateVenueDto): Promise<Venue> {
    const location = this.parseLocation(createVenueDto.location);
    return await this.prisma.venue.create({
      data: {
        ...location,
      },
    });
  }

  async findAllVenues() {
    return await this.prisma.venue.findMany();
  }

  async findVenueByLocation(location: string) {
    const parsedLocation = this.parseLocation(location);
    const venue = await this.prisma.venue.findFirst({
      where: {
        ...parsedLocation,
      },
    });

    if (venue === null) {
      const newVenue = await this.createVenue({ location });
      return newVenue;
    }

    return venue;
  }

  parseLocation(location: string) {
    const parts = location.split(',').map((part) => part.trim());

    // Останні два елементи завжди: поштовий індекс та країна
    const country = parts[parts.length - 1] || '';
    const zip = parts[parts.length - 2] || '';

    // Передостанній елемент перед zip - це зазвичай регіон/область
    const region = parts[parts.length - 3] || '';

    // Знаходимо місто - це зазвичай один з елементів перед регіоном
    // Шукаємо елемент, який не містить слова "район", "громада", "область", "region"
    let city = '';
    for (let i = parts.length - 4; i >= 0; i--) {
      const part = parts[i].toLowerCase();
      if (
        !part.includes('район') &&
        !part.includes('громада') &&
        !part.includes('область') &&
        !part.includes('region') &&
        !part.includes('vvg') &&
        !part.includes('stadt')
      ) {
        city = parts[i];
        break;
      }
    }

    // Якщо місто не знайдено, беремо перший елемент перед регіоном
    if (!city && parts.length > 3) {
      city = parts[parts.length - 4] || '';
    }

    // Адреса - це перші 1-2 елементи (номер будинку + назва вулиці)
    // Назва venue - це перший елемент або комбінація перших елементів
    let address = '';
    let name = '';

    if (parts.length >= 2) {
      // Якщо перший елемент виглядає як номер будинку (містить цифри)
      if (/^\d+/.test(parts[0]) || /^[A-ZА-Я]-\d+/.test(parts[0])) {
        address = parts[0];
        name = parts[0];
        // Якщо є другий елемент і він не є містом, додаємо до адреси
        if (parts.length > 1 && parts[1] !== city) {
          address += ', ' + parts[1];
          name = parts[1]; // Назва venue - це назва вулиці або району
        }
      } else {
        // Якщо перший елемент не номер, то це назва
        name = parts[0];
        address = parts[0];
        if (parts.length > 1) {
          address += ', ' + parts[1];
        }
      }
    } else {
      name = parts[0] || '';
      address = parts[0] || '';
    }

    return {
      name: name || city || 'Unknown',
      address: address || '',
      city: city || '',
      zip: zip || '',
      region: region || '',
      country: country || '',
    };
  }
}
