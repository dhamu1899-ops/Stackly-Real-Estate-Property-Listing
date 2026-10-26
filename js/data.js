/* ============================================================
   Stackly — Data Layer
   Property listings, agents & testimonials (static dataset)
   ============================================================ */

const AGENTS = [
  {
    id: 'a1',
    name: 'Arjun Mehta',
    role: 'Senior Property Advisor',
    photo: 'assets/img/agent-1.webp',
    phone: '+91 98430 22114',
    email: 'arjun@stackly.com',
    deals: 148,
    rating: 4.9,
    tags: ['Luxury Villas', 'Investment']
  },
  {
    id: 'a2',
    name: 'Priya Raman',
    role: 'Luxury Homes Specialist',
    photo: 'assets/img/agent-2.webp',
    phone: '+91 98860 41127',
    email: 'priya@stackly.com',
    deals: 121,
    rating: 4.8,
    tags: ['Penthouses', 'Sea View']
  },
  {
    id: 'a3',
    name: 'David Fernandes',
    role: 'Commercial Leasing Head',
    photo: 'assets/img/agent-3.webp',
    phone: '+91 99620 73310',
    email: 'david@stackly.com',
    deals: 96,
    rating: 4.7,
    tags: ['Commercial', 'Co-working']
  },
  {
    id: 'a4',
    name: 'Ananya Iyer',
    role: 'Rentals & New Projects',
    photo: 'assets/img/agent-4.webp',
    phone: '+91 99440 58802',
    email: 'ananya@stackly.com',
    deals: 173,
    rating: 4.9,
    tags: ['Rentals', 'New Launches']
  }
];

const TESTIMONIALS = [
  {
    name: 'Rahul Verma',
    role: 'Homeowner, Bengaluru',
    photo: 'assets/img/t-1.webp',
    rating: 5,
    text: 'Stackly made buying our first villa genuinely enjoyable. The shortlist was curated perfectly for our budget and the legal team handled every document without a single follow-up from us.'
  },
  {
    name: 'Meera Krishnan',
    role: 'Investor, Chennai',
    photo: 'assets/img/t-2.webp',
    rating: 5,
    text: 'I have invested with three other firms, and none of them come close to this transparency. Rental yield projections were accurate, and my advisor called me with updates before I even asked.'
  },
  {
    name: 'Samuel Joseph',
    role: 'NRI Buyer, Dubai',
    photo: 'assets/img/t-3.webp',
    rating: 5,
    text: 'Buying property from overseas felt risky until the video tours and verified paperwork came in. Everything was documented, digitised and delivered on the promised date.'
  },
  {
    name: 'Divya Nair',
    role: 'Tenant, Coimbatore',
    photo: 'assets/img/t-4.webp',
    rating: 4.5,
    text: 'Found a fully furnished apartment in four days. The deposit, agreement and handover were handled professionally with zero hidden charges. Highly recommended for renters.'
  }
];

const PROPERTIES = [
  {
    id: 'azure-sky-penthouse',
    title: 'Azure Sky Penthouse',
    type: 'Penthouse',
    purpose: 'sale',
    status: 'Featured',
    price: 85000000,
    beds: 4,
    baths: 5,
    area: 3200,
    year: 2022,
    parking: 3,
    city: 'Chennai',
    district: 'Adyar, East Coast Road',
    rating: 4.9,
    featured: true,
    images: ['assets/img/p01.webp', 'assets/img/p04.webp', 'assets/img/p17.webp'],
    features: ['Private Terrace Pool', 'Sea Facing', 'Home Elevator', 'Smart Home', 'Italian Marble', '24×7 Concierge'],
    description:
      'Crowning one of Adyar’s most admired towers, this duplex penthouse opens onto a 1,400 sq.ft private terrace with an infinity plunge pool facing the Bay of Bengal. Floor-to-ceiling glazing, a double-height living room and a chef’s kitchen finished in Calacatta marble make it a rare find in the city’s luxury corridor.',
    agentId: 'a2'
  },
  {
    id: 'meridian-garden-villa',
    title: 'Meridian Garden Villa',
    type: 'Villa',
    purpose: 'sale',
    status: 'New Build',
    price: 32500000,
    beds: 5,
    baths: 6,
    area: 4800,
    year: 2024,
    parking: 3,
    city: 'Coimbatore',
    district: 'Race Course Road',
    rating: 4.8,
    featured: true,
    images: ['assets/img/p02.webp', 'assets/img/p06.webp', 'assets/img/p20.webp'],
    features: ['Private Garden', 'Home Theatre', 'Solar Roof', 'Servant Quarter', 'Covered Patio', 'Rainwater Harvesting'],
    description:
      'A contemporary five-bedroom villa set on a landscaped 6,200 sq.ft plot along Race Course Road. Broad overhangs, teak louvres and a courtyard pool create a calm tropical modernism, while the street-facing elevation keeps the home completely private.',
    agentId: 'a1'
  },
  {
    id: 'harbour-view-residence',
    title: 'Harbour View Residence',
    type: 'Apartment',
    purpose: 'sale',
    status: 'For Sale',
    price: 24500000,
    beds: 3,
    baths: 3,
    area: 1850,
    year: 2021,
    parking: 2,
    city: 'Chennai',
    district: 'Mylapore, Luz Church Road',
    rating: 4.7,
    featured: true,
    images: ['assets/img/p03.webp', 'assets/img/p15.webp', 'assets/img/p09.webp'],
    features: ['Harbour View', 'Clubhouse', 'Gymnasium', 'Power Backup', 'Reserved Parking', 'CCTV Security'],
    description:
      'A calm, light-filled three-bedroom residence overlooking the harbour, minutes from Luz Church Road. The layout separates formal and family living, and the building offers a full-size gym, indoor games and a rooftop lounge for residents.',
    agentId: 'a2'
  },
  {
    id: 'willow-park-townhouse',
    title: 'Willow Park Townhouse',
    type: 'Townhouse',
    purpose: 'sale',
    status: 'For Sale',
    price: 14800000,
    beds: 4,
    baths: 3,
    area: 2400,
    year: 2020,
    parking: 2,
    city: 'Bengaluru',
    district: 'Whitefield, Budigere Cross',
    rating: 4.6,
    featured: true,
    images: ['assets/img/p05.webp', 'assets/img/p12.webp', 'assets/img/p18.webp'],
    features: ['Corner Unit', 'Private Terrace', 'Kids Play Area', 'Jogging Track', 'Visitor Parking', 'Gated Community'],
    description:
      'A corner townhouse in a low-density enclave of 42 homes, with a double-height foyer, a west-facing terrace for evening gatherings and direct access to the community’s walking loop. Whitefield’s tech corridor is a twelve-minute drive.',
    agentId: 'a1'
  },
  {
    id: 'obsidian-business-suite',
    title: 'Obsidian Business Suite',
    type: 'Commercial',
    purpose: 'rent',
    status: 'For Rent',
    price: 350000,
    priceSuffix: '/month',
    beds: 6,
    baths: 4,
    area: 4200,
    year: 2023,
    parking: 6,
    city: 'Bengaluru',
    district: 'Outer Ring Road, Marathahalli',
    rating: 4.8,
    featured: true,
    images: ['assets/img/p07.webp', 'assets/img/p21.webp', 'assets/img/p16.webp'],
    features: ['Plug & Play', '60 Workstations', 'Meeting Rooms', 'Fibre Lease Line', 'Reception Desk', '100% Power Backup'],
    description:
      'A ready-to-move-in managed office on the fourth floor of a Grade-A tower on Outer Ring Road. Six cabins, two conference rooms and 60 workstations are already fitted, with a dedicated 1 Gbps lease line and 100% DG backup.',
    agentId: 'a3'
  },
  {
    id: 'palm-grove-penthouse',
    title: 'Palm Grove Penthouse',
    type: 'Penthouse',
    purpose: 'rent',
    status: 'Hot Offer',
    price: 275000,
    priceSuffix: '/month',
    beds: 4,
    baths: 4,
    area: 3050,
    year: 2023,
    parking: 3,
    city: 'Goa',
    district: 'Assagao, North Goa',
    rating: 4.9,
    featured: true,
    images: ['assets/img/p08.webp', 'assets/img/p22.webp', 'assets/img/p10.webp'],
    features: ['Private Pool', 'Sea Breeze Deck', 'Fully Furnished', 'Housekeeping', 'Backup Generator', 'Pet Friendly'],
    description:
      'A fully furnished four-bedroom penthouse two streets from the beach at Assagao. The wrap-around deck, plunge pool and outdoor lounge are designed for long stays, and weekly housekeeping plus maintenance are included in the rent.',
    agentId: 'a4'
  },
  {
    id: 'riverside-compact-home',
    title: 'Riverside Compact Home',
    type: 'House',
    purpose: 'sale',
    status: 'For Sale',
    price: 6800000,
    beds: 2,
    baths: 2,
    area: 1150,
    year: 2019,
    parking: 1,
    city: 'Salem',
    district: 'Fairlands, Sarada College Road',
    rating: 4.5,
    featured: false,
    images: ['assets/img/p09.webp', 'assets/img/p03.webp', 'assets/img/p11.webp'],
    features: ['East Facing', 'Modular Kitchen', 'Covered Parking', 'Borewell Water', 'Gated Street', 'Near Schools'],
    description:
      'A neatly maintained two-bedroom home on a quiet tree-lined street in Fairlands. Recent upgrades include a modular kitchen, burglar-proof windows and a covered car port, with schools and hospitals within a kilometre.',
    agentId: 'a1'
  },
  {
    id: 'skyline-office-loft',
    title: 'Skyline Office Loft',
    type: 'Commercial',
    purpose: 'sale',
    status: 'For Sale',
    price: 19500000,
    beds: 4,
    baths: 3,
    area: 3600,
    year: 2022,
    parking: 4,
    city: 'Hyderabad',
    district: 'Hitec City, Cyber Gateway',
    rating: 4.7,
    featured: false,
    images: ['assets/img/p10.webp', 'assets/img/p07.webp', 'assets/img/p19.webp'],
    features: ['Full Floor', 'Lift Access', 'Cafeteria', 'Conference Hall', 'Designated Parking', 'Green Building Cert.'],
    description:
      'A full-floor loft-style office with exposed ductwork, 3.6 m ceilings and 360-degree glazing in Cyber Gateway. Delivered with a fitted reception, four meeting rooms and dedicated parking for four cars.',
    agentId: 'a3'
  },
  {
    id: 'lotus-court-apartment',
    title: 'Lotus Court Apartment',
    type: 'Apartment',
    purpose: 'rent',
    status: 'For Rent',
    price: 42000,
    priceSuffix: '/month',
    beds: 2,
    baths: 2,
    area: 1100,
    year: 2020,
    parking: 1,
    city: 'Pune',
    district: 'Baner, Balewadi High Street',
    rating: 4.6,
    featured: false,
    images: ['assets/img/p11.webp', 'assets/img/p05.webp', 'assets/img/p14.webp'],
    features: ['Semi Furnished', 'Balcony', 'Gym Access', 'Swimming Pool', 'Clubhouse', '24×7 Security'],
    description:
      'A bright two-bedroom apartment three minutes from Balewadi High Street, offered semi-furnished with wardrobes, a washing machine and a split AC in every room. Clubhouse, pool and gym access are included in the maintenance.',
    agentId: 'a4'
  },
  {
    id: 'terra-farm-estate',
    title: 'Terra Farm Estate',
    type: 'Villa',
    purpose: 'sale',
    status: 'New Build',
    price: 56000000,
    beds: 6,
    baths: 7,
    area: 6400,
    year: 2025,
    parking: 4,
    city: 'Coorg',
    district: 'Madikeri, Kudagi Road',
    rating: 4.9,
    featured: true,
    images: ['assets/img/p12.webp', 'assets/img/p02.webp', 'assets/img/p23.webp'],
    features: ['Coffee Estate', 'Infinity Pool', 'Fireplace Lounge', 'Guest Bungalow', 'Organic Farm', 'EV Charging'],
    description:
      'A six-bedroom estate villa set inside a 4.2-acre working coffee plantation near Madikeri. Stone, timber and glass volumes open to an infinity pool above the valley, with a separate guest bungalow and staff quarters.',
    agentId: 'a1'
  },
  {
    id: 'metro-studio-one',
    title: 'Metro Studio One',
    type: 'Apartment',
    purpose: 'rent',
    status: 'For Rent',
    price: 18500,
    priceSuffix: '/month',
    beds: 1,
    baths: 1,
    area: 520,
    year: 2021,
    parking: 1,
    city: 'Chennai',
    district: 'Anna Nagar, 2nd Avenue',
    rating: 4.4,
    featured: false,
    images: ['assets/img/p13.webp', 'assets/img/p11.webp', 'assets/img/p16.webp'],
    features: ['Studio Layout', 'Fully Furnished', 'Metro 400 m', 'Co-working Lounge', 'Café in Lobby', 'Power Backup'],
    description:
      'A smart, fully furnished studio four hundred metres from Anna Nagar 2nd Avenue metro. Ideal for young professionals — the building has a ground-floor co-working lounge, café and secure bicycle storage.',
    agentId: 'a4'
  },
  {
    id: 'crest-crest-plot',
    title: 'Crest Hill Development Plot',
    type: 'Plot',
    purpose: 'sale',
    status: 'For Sale',
    price: 9200000,
    beds: 0,
    baths: 0,
    area: 2400,
    year: 2024,
    parking: 0,
    city: 'Salem',
    district: 'Shevapet, Jawahar Nagar',
    rating: 4.3,
    featured: false,
    images: ['assets/img/p14.webp', 'assets/img/p24.webp', 'assets/img/p12.webp'],
    features: ['DTCP Approved', 'Clear Title', 'Road Facing', 'Underground Elec.', 'Water Connection', 'Resale Ready'],
    description:
      'A road-facing DTCP-approved plot of 2,400 sq.ft on a 30 ft street, with underground electricity and a metre-ready water connection. Clear title with no litigation — ready for immediate construction or resale.',
    agentId: 'a1'
  },
  {
    id: 'anchor-retail-piazza',
    title: 'Anchor Retail Piazza',
    type: 'Commercial',
    purpose: 'rent',
    status: 'For Rent',
    price: 145000,
    priceSuffix: '/month',
    beds: 0,
    baths: 2,
    area: 1600,
    year: 2023,
    parking: 5,
    city: 'Coimbatore',
    district: 'RS Puram, Cross Cut Road',
    rating: 4.6,
    featured: false,
    images: ['assets/img/p15.webp', 'assets/img/p10.webp', 'assets/img/p21.webp'],
    features: ['Corner Showroom', 'High Footfall', 'Frontage 18 m', 'Signage Rights', 'Washrooms Fitted', 'Back Entrance'],
    description:
      'A corner showroom with 18 metres of frontage on Cross Cut Road, one of RS Puram’s highest-footfall stretches. Includes signage rights, two fitted washrooms and a separate service entrance for deliveries.',
    agentId: 'a3'
  },
  {
    id: 'oak-hollow-family-home',
    title: 'Oak Hollow Family Home',
    type: 'House',
    purpose: 'sale',
    status: 'Featured',
    price: 17600000,
    beds: 4,
    baths: 4,
    area: 2750,
    year: 2018,
    parking: 2,
    city: 'Bengaluru',
    district: 'Jayanagar, 8th Block',
    rating: 4.7,
    featured: false,
    images: ['assets/img/p16.webp', 'assets/img/p05.webp', 'assets/img/p08.webp'],
    features: ['Independent House', 'Roof Terrace', 'Utility Area', 'Mature Garden', 'Borewell + City Water', 'Vastu Compliant'],
    description:
      'A four-bedroom independent house in a leafy Jayanagar lane, with a mature garden, a roof terrace for festivals and a separate utility yard. Recently rewired with a 5 kVA inverter and city plus borewell water.',
    agentId: 'a2'
  },
  {
    id: 'serenity-rental-flat',
    title: 'Serenity Rental Flat',
    type: 'Apartment',
    purpose: 'rent',
    status: 'For Rent',
    price: 68000,
    priceSuffix: '/month',
    beds: 3,
    baths: 3,
    area: 1750,
    year: 2022,
    parking: 2,
    city: 'Hyderabad',
    district: 'Gachibowli, Financial District',
    rating: 4.8,
    featured: false,
    images: ['assets/img/p17.webp', 'assets/img/p03.webp', 'assets/img/p14.webp'],
    features: ['Lake View', 'Fully Furnished', 'Serviced Stay', 'Housekeeping', 'Gym & Pool', 'Covered Parking'],
    description:
      'A serviced three-bedroom flat facing the Gachibowli lake, delivered fully furnished with weekly housekeeping, piano-tuned appliances and a resident app for bookings. Minutes from the Financial District ring road.',
    agentId: 'a4'
  },
  {
    id: 'beacon-hill-villa',
    title: 'Beacon Hill Villa',
    type: 'Villa',
    purpose: 'sale',
    status: 'New Build',
    price: 41000000,
    beds: 5,
    baths: 5,
    area: 4100,
    year: 2025,
    parking: 3,
    city: 'Chennai',
    district: 'ECR, Injambakkam',
    rating: 4.8,
    featured: true,
    images: ['assets/img/p18.webp', 'assets/img/p12.webp', 'assets/img/p02.webp'],
    features: ['Beach 900 m', 'Private Pool', 'Double Height Living', 'Wine Cellar', 'Staff Room', 'Solar Water'],
    description:
      'A newly completed five-bedroom villa nine hundred metres from the shoreline at Injambakkam. Double-height living volumes, a 14-metre lap pool and a climate-controlled wine cellar anchor the ground floor.',
    agentId: 'a2'
  },
  {
    id: 'quarter-quarter-loft',
    title: 'Fort Quarter Loft',
    type: 'Apartment',
    purpose: 'sale',
    status: 'For Sale',
    price: 11200000,
    beds: 2,
    baths: 2,
    area: 1340,
    year: 2020,
    parking: 1,
    city: 'Mumbai',
    district: 'Colaba, Shamaldas Road',
    rating: 4.5,
    featured: false,
    images: ['assets/img/p19.webp', 'assets/img/p16.webp', 'assets/img/p15.webp'],
    features: ['Heritage Building', 'High Ceilings', 'Restored Facade', 'Airy Layout', 'Lift Access', 'Pet Allowed'],
    description:
      'A two-bedroom loft in a restored 1930s building near Colaba Causeway, with 3.9 m ceilings, teak floors and tall shuttered windows. The facade was restored under heritage supervision in 2020.',
    agentId: 'a2'
  },
  {
    id: 'northgate-family-rental',
    title: 'Northgate Family Rental',
    type: 'Townhouse',
    purpose: 'rent',
    status: 'For Rent',
    price: 95000,
    priceSuffix: '/month',
    beds: 3,
    baths: 3,
    area: 2050,
    year: 2021,
    parking: 2,
    city: 'Pune',
    district: 'Kharadi, EON Nextencity',
    rating: 4.6,
    featured: false,
    images: ['assets/img/p20.webp', 'assets/img/p11.webp', 'assets/img/p05.webp'],
    features: ['Duplex Layout', 'Private Garden', 'School Campus Adjacent', 'Pet Friendly', 'Cabin Parking', 'Community Pool'],
    description:
      'A three-bedroom duplex townhouse with a private rear garden, ideal for families relocating to Kharadi. An international school campus sits at the gate, and the community pool and café are a two-minute walk.',
    agentId: 'a4'
  }
];

/* ---------- helpers ---------- */
function formatPrice(value, suffix) {
  const n = Number(value) || 0;
  let out;
  if (n >= 1e7) out = '₹' + (n / 1e7).toFixed(2).replace(/\.00$/, '') + ' Cr';
  else if (n >= 1e5) out = '₹' + (n / 1e5).toFixed(n % 1e5 === 0 ? 0 : 2).replace(/\.00$/, '') + ' L';
  else out = '₹' + n.toLocaleString('en-IN');
  return out + (suffix || '');
}

function getAgent(id) {
  return AGENTS.find(a => a.id === id) || AGENTS[0];
}

function getProperty(id) {
  return PROPERTIES.find(p => p.id === id) || null;
}

const CITIES = [...new Set(PROPERTIES.map(p => p.city))].sort();
const TYPES = [...new Set(PROPERTIES.map(p => p.type))].sort();
