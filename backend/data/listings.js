/**
 * In-memory listings store.
 * ─────────────────────────
 * Persists while the server process runs.
 * Will be replaced by MongoDB in Week 5.
 *
 * Each listing mirrors the data shape expected by the React frontend.
 */

export let listings = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Cozy Mountain Cottage',
    description:
      'A peaceful retreat nestled in the Himalayas with stunning views and crisp air.',
    location: 'Mussoorie, Uttarakhand',
    pricePerNight: 2500,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Mountain View', 'Fireplace'],
    images: ['https://picsum.photos/seed/cottage1/600/400'],
    host: { name: 'Ramesh Sharma', rating: 4.8 },
    rating: 4.7,
    reviewCount: 23,
    featured: true,
    createdAt: '2025-01-15T08:30:00.000Z',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    title: 'Riverside Homestay',
    description:
      'Wake up to the sound of the Ganges. Traditional Garhwali home with modern comforts.',
    location: 'Rishikesh, Uttarakhand',
    pricePerNight: 1800,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Kitchen', 'River View', 'Yoga Deck', 'Hot Water'],
    images: ['https://picsum.photos/seed/river1/600/400'],
    host: { name: 'Sunita Rawat', rating: 4.9 },
    rating: 4.9,
    reviewCount: 47,
    featured: true,
    createdAt: '2025-02-10T10:00:00.000Z',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    title: 'Heritage Haveli Stay',
    description:
      'Experience royal Rajasthani living in this beautifully restored 18th-century haveli.',
    location: 'Jaipur, Rajasthan',
    pricePerNight: 4500,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'AC', 'Breakfast Included', 'Cultural Tours', 'Rooftop'],
    images: ['https://picsum.photos/seed/haveli1/600/400'],
    host: { name: 'Priya Rathore', rating: 4.6 },
    rating: 4.6,
    reviewCount: 15,
    featured: false,
    createdAt: '2025-03-05T14:20:00.000Z',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    title: 'Kerala Backwater Houseboat',
    description:
      'Float through the serene backwaters on this traditional rice boat converted into a luxury stay.',
    location: 'Alleppey, Kerala',
    pricePerNight: 8000,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'AC', 'All Meals', 'Fishing', 'Kayak', 'Sunset Deck'],
    images: ['https://picsum.photos/seed/boat1/600/400'],
    host: { name: 'Thomas Kurian', rating: 4.9 },
    rating: 4.8,
    reviewCount: 62,
    featured: true,
    createdAt: '2025-04-12T09:45:00.000Z',
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    title: 'Bamboo Forest Cabin',
    description:
      'Eco-friendly cabin surrounded by a lush bamboo grove in the Western Ghats.',
    location: 'Coorg, Karnataka',
    pricePerNight: 3200,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Organic Meals', 'Nature Walks', 'Bird Watching', 'Hammock'],
    images: ['https://picsum.photos/seed/bamboo1/600/400'],
    host: { name: 'Kavya Nair', rating: 4.7 },
    rating: 4.5,
    reviewCount: 31,
    featured: false,
    createdAt: '2025-05-20T11:15:00.000Z',
  },
];