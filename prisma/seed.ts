// prisma/seed.ts
import { PrismaClient, Role, TicketType, TicketStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Початок seed...');

  // Очищення існуючих даних (опціонально)
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  // Створення користувачів
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Адміністратор',
      password: 'hashed_password_123', // В реальному проекті використовуйте bcrypt
      role: Role.Admin,
      status: 'active',
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      email: 'organizer1@example.com',
      name: 'Петро Організатор',
      password: 'hashed_password_123',
      role: Role.Organizer,
      status: 'active',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: 'organizer2@example.com',
      name: 'Марія Організатор',
      password: 'hashed_password_123',
      role: Role.Organizer,
      status: 'active',
    },
  });

  const clients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'client1@example.com',
        name: 'Іван Клієнт',
        password: 'hashed_password_123',
        role: Role.Client,
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        email: 'client2@example.com',
        name: 'Олена Клієнт',
        password: 'hashed_password_123',
        role: Role.Client,
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        email: 'client3@example.com',
        name: 'Андрій Клієнт',
        password: 'hashed_password_123',
        role: Role.Client,
        status: 'active',
      },
    }),
  ]);

  console.log('✅ Створено користувачів');

  // Створення venue
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Палац спорту',
      address: '1, проспект Перемоги',
      city: 'Київ',
      zip: '02000',
      region: 'Київська область',
      country: 'Україна',
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Національний академічний драматичний театр',
      address: '5, вулиця Франка',
      city: 'Львів',
      zip: '79000',
      region: 'Львівська область',
      country: 'Україна',
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: 'Конференц-центр',
      address: '10, проспект Шевченка',
      city: 'Київ',
      zip: '01000',
      region: 'Київська область',
      country: 'Україна',
    },
  });

  const venue4 = await prisma.venue.create({
    data: {
      name: 'Парк культури та відпочинку',
      address: 'Центральна алея',
      city: 'Одеса',
      zip: '65000',
      region: 'Одеська область',
      country: 'Україна',
    },
  });

  console.log('✅ Створено venue');

  // Створення подій
  const event1 = await prisma.event.create({
    data: {
      title: 'Концерт рок-групи',
      description: 'Неймовірний вечір живої музики з найкращими хітами',
      startDate: new Date('2026-03-15T19:00:00'),
      endDate: new Date('2026-03-15T23:00:00'),
      duration: new Decimal(4),
      price: new Decimal(500),
      capacity: 5000,
      organizerId: organizer1.id,
      venueId: venue1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Театральна вистава "Гамлет"',
      description: 'Класична постановка шекспірівського шедевру',
      startDate: new Date('2026-04-20T18:00:00'),
      endDate: new Date('2026-04-20T21:00:00'),
      duration: new Decimal(3),
      price: new Decimal(300),
      capacity: 800,
      organizerId: organizer1.id,
      venueId: venue2.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Технологічна конференція TechFest 2026',
      description: 'Найбільша конференція про інновації та технології',
      startDate: new Date('2026-05-10T09:00:00'),
      endDate: new Date('2026-05-12T18:00:00'),
      duration: new Decimal(72),
      price: new Decimal(1500),
      capacity: 2000,
      organizerId: organizer2.id,
      venueId: venue3.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Фестиваль вуличної їжі',
      description: 'Скуштуйте найкращі страви від локальних шеф-кухарів',
      startDate: new Date('2026-06-01T12:00:00'),
      endDate: new Date('2026-06-02T22:00:00'),
      duration: new Decimal(34),
      price: new Decimal(0), // Безкоштовний вхід
      capacity: 10000,
      organizerId: organizer2.id,
      venueId: venue4.id,
    },
  });

  console.log('✅ Створено події');

  // Створення квитків
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tickets = await Promise.all([
    // Квитки на event1 (Концерт)
    prisma.ticket.create({
      data: {
        eventId: event1.id,
        userId: clients[0].id,
        type: TicketType.VIP,
        price: new Decimal(800),
        seatNumber: 'A-15',
        status: TicketStatus.Paid,
        purchaseDate: new Date('2026-02-10T14:30:00'),
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: event1.id,
        userId: clients[1].id,
        type: TicketType.Standard,
        price: new Decimal(500),
        seatNumber: 'B-42',
        status: TicketStatus.Paid,
        purchaseDate: new Date('2026-02-12T10:15:00'),
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: event1.id,
        userId: clients[2].id,
        type: TicketType.Standard,
        price: new Decimal(500),
        seatNumber: 'C-28',
        status: TicketStatus.Reserved,
        purchaseDate: new Date('2026-02-25T16:45:00'),
      },
    }),

    // Квитки на event2 (Театр)
    prisma.ticket.create({
      data: {
        eventId: event2.id,
        userId: clients[0].id,
        type: TicketType.VIP,
        price: new Decimal(450),
        seatNumber: 'Ложа-5',
        status: TicketStatus.Paid,
        purchaseDate: new Date('2026-03-01T11:00:00'),
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: event2.id,
        userId: clients[1].id,
        type: TicketType.Standard,
        price: new Decimal(300),
        seatNumber: 'Партер-23',
        status: TicketStatus.Used,
        purchaseDate: new Date('2026-03-05T15:20:00'),
      },
    }),

    // Квитки на event3 (Конференція)
    prisma.ticket.create({
      data: {
        eventId: event3.id,
        userId: clients[2].id,
        type: TicketType.VIP,
        price: new Decimal(2000),
        seatNumber: 'VIP-10',
        status: TicketStatus.Reserved,
        purchaseDate: new Date('2026-04-15T09:30:00'),
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: event3.id,
        userId: clients[0].id,
        type: TicketType.Standard,
        price: new Decimal(1500),
        seatNumber: 'G-105',
        status: TicketStatus.Paid,
        purchaseDate: new Date('2026-04-18T13:45:00'),
      },
    }),

    // Квитки на event4 (Фестиваль)
    prisma.ticket.create({
      data: {
        eventId: event4.id,
        userId: clients[1].id,
        type: TicketType.Standard,
        price: new Decimal(0),
        seatNumber: 'GA-001',
        status: TicketStatus.Paid,
        purchaseDate: new Date('2026-05-20T12:00:00'),
      },
    }),
    prisma.ticket.create({
      data: {
        eventId: event4.id,
        userId: clients[2].id,
        type: TicketType.Standard,
        price: new Decimal(0),
        seatNumber: 'GA-002',
        status: TicketStatus.Cancelled,
        purchaseDate: new Date('2026-05-22T14:30:00'),
      },
    }),
  ]);

  console.log('✅ Створено квитки');

  console.log('🎉 Seed завершено успішно!');
  console.log(`
  📊 Створено:
  - Користувачів: ${await prisma.user.count()}
  - Venue: ${await prisma.venue.count()}
  - Подій: ${await prisma.event.count()}
  - Квитків: ${await prisma.ticket.count()}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Помилка seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
