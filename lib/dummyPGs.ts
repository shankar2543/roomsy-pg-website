import { PG } from "@/types/pg";

export const ACTIVE_CITY = "Hyderabad";

export const DUMMY_PGS: PG[] = [
  {
    objectId: "pg_002",
    name: "Madhapur Comfort Stay",
    description: "Spacious rooms with homely meals. Walking distance to Mindspace and Cyber Towers.",
    city: "Hyderabad", area: "Madhapur",
    address: "Road No. 2, Jubilee Hills Extension, Madhapur, Hyderabad",
    pgType: "girls", occupancy: ["double", "triple"], food: "breakfast", parking: "none",
    location: { latitude: 17.4484, longitude: 78.3908 },
    photos: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"],
    amenities: ["WiFi", "Meals", "Laundry", "CCTV", "24/7 Security"],
    owner: { objectId: "seed_4", name: "Meena Hostess", phone: "9000000002" },
    isApproved: true, isSuspended: false, rating: 4.5, availableBeds: 1, monthlyPrice: 7500,
    sharingPrices: { double: 7500, triple: 5500 },
    dailyPrices:   { double: 420,  triple: 310 },
  },
  {
    objectId: "pg_003",
    name: "Gachibowli Elite PG",
    description: "Premium co-living space ideal for IT professionals. Rooftop common area, fully air-conditioned.",
    city: "Hyderabad", area: "Gachibowli",
    address: "Survey No. 45, Gachibowli Village, Hyderabad",
    pgType: "coliving", occupancy: ["single", "double", "triple"], food: "all", parking: "both",
    location: { latitude: 17.4400, longitude: 78.3489 },
    photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
    amenities: ["WiFi", "AC", "Gym", "Lounge", "Meals", "Housekeeping"],
    owner: { objectId: "seed_3", name: "Ravi Landlord", phone: "9000000001" },
    isApproved: true, isSuspended: false, rating: 4.9, availableBeds: 6, monthlyPrice: 13000,
    sharingPrices: { single: 13000, double: 9500, triple: 7000 },
    dailyPrices:   { single: 750,  double: 550,  triple: 400 },
  },
  {
    objectId: "pg_004",
    name: "Kondapur Boys Hostel",
    description: "Budget-friendly PG near JNTU and Kondapur bus stop. Clean rooms with regular housekeeping.",
    city: "Hyderabad", area: "Kondapur",
    address: "Lane 7, Sri Nagar Colony, Kondapur, Hyderabad",
    pgType: "boys", occupancy: ["triple"], food: "none", parking: "bike",
    location: { latitude: 17.4600, longitude: 78.3600 },
    photos: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"],
    amenities: ["WiFi", "Meals", "Laundry", "Parking"],
    owner: { objectId: "seed_4", name: "Meena Hostess", phone: "9000000002" },
    isApproved: true, isSuspended: false, rating: 4.1, availableBeds: 1, monthlyPrice: 5500,
    sharingPrices: { triple: 5500 },
    dailyPrices:   { triple: 300 },
  },
  {
    objectId: "pg_005",
    name: "Banjara Hills Ladies PG",
    description: "Safe and secure PG exclusively for women in prime Banjara Hills location. 24/7 security.",
    city: "Hyderabad", area: "Banjara Hills",
    address: "Road No. 10, Banjara Hills, Hyderabad",
    pgType: "girls", occupancy: ["single", "double"], food: "all", parking: "car",
    location: { latitude: 17.4156, longitude: 78.4347 },
    photos: ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80"],
    amenities: ["WiFi", "AC", "Meals", "CCTV", "24/7 Security", "Laundry"],
    owner: { objectId: "seed_3", name: "Ravi Landlord", phone: "9000000001" },
    isApproved: true, isSuspended: false, rating: 4.8, availableBeds: 3, monthlyPrice: 11000,
    sharingPrices: { single: 11000, double: 8500 },
    dailyPrices:   { single: 650,  double: 480 },
  },
  {
    objectId: "pg_006",
    name: "Kukatpally Nest",
    description: "Affordable PG near KPHB and Kukatpally bus depot. Ideal for students and freshers.",
    city: "Hyderabad", area: "Kukatpally",
    address: "KPHB Phase 3, Kukatpally, Hyderabad",
    pgType: "boys", occupancy: ["triple"], food: "breakfast", parking: "bike",
    location: { latitude: 17.4948, longitude: 78.3996 },
    photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
    amenities: ["WiFi", "Meals", "Laundry", "TV Room"],
    owner: { objectId: "seed_4", name: "Meena Hostess", phone: "9000000002" },
    isApproved: true, isSuspended: false, rating: 3.9, availableBeds: 5, monthlyPrice: 4800,
    sharingPrices: { triple: 4800 },
    dailyPrices:   { triple: 270 },
  },
  {
    objectId: "pg_007",
    name: "Ameerpet Co-Living Hub",
    description: "Vibrant co-living community near coaching institutes and Ameerpet metro. High-speed internet.",
    city: "Hyderabad", area: "Ameerpet",
    address: "Street 5, SR Nagar, Ameerpet, Hyderabad",
    pgType: "coliving", occupancy: ["single", "double"], food: "dinner", parking: "both",
    location: { latitude: 17.4375, longitude: 78.4483 },
    photos: ["https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80"],
    amenities: ["WiFi", "AC", "Rooftop", "Meals", "Gym", "Study Room"],
    owner: { objectId: "seed_3", name: "Ravi Landlord", phone: "9000000001" },
    isApproved: true, isSuspended: false, rating: 4.6, availableBeds: 1, monthlyPrice: 10500,
    sharingPrices: { single: 10500, double: 8000 },
    dailyPrices:   { single: 620,  double: 460 },
  },
  {
    objectId: "pg_008",
    name: "Nallagandla Girls Residence",
    description: "Peaceful PG for working women near financial district. Homemade meals, no restrictions.",
    city: "Hyderabad", area: "Nallagandla",
    address: "Nallagandla Village Road, Near Financial District, Hyderabad",
    pgType: "girls", occupancy: ["double", "triple"], food: "lunch", parking: "none",
    location: { latitude: 17.4235, longitude: 78.3200 },
    photos: ["https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=800&q=80"],
    amenities: ["WiFi", "Meals", "Laundry", "Parking", "RO Water"],
    owner: { objectId: "seed_4", name: "Meena Hostess", phone: "9000000002" },
    isApproved: true, isSuspended: false, rating: 4.3, availableBeds: 4, monthlyPrice: 8000,
    sharingPrices: { double: 8000, triple: 6000 },
    dailyPrices:   { double: 450,  triple: 340 },
  },
  {
    objectId: "pg_009",
    name: "Begumpet Premium Stay",
    description: "Well-connected PG near Begumpet airport road. Close to Secunderabad railway station.",
    city: "Hyderabad", area: "Begumpet",
    address: "SP Road, Begumpet, Hyderabad",
    pgType: "boys", occupancy: ["single", "double"], food: "all", parking: "car",
    location: { latitude: 17.4432, longitude: 78.4636 },
    photos: ["https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80"],
    amenities: ["WiFi", "AC", "Meals", "Gym", "Laundry"],
    owner: { objectId: "seed_3", name: "Ravi Landlord", phone: "9000000001" },
    isApproved: true, isSuspended: false, rating: 4.4, availableBeds: 0, monthlyPrice: 12000,
    sharingPrices: { single: 12000, double: 9000 },
    dailyPrices:   { single: 700,  double: 520 },
  },
  {
    objectId: "pg_010",
    name: "Miyapur Shared Living",
    description: "Budget co-living near Miyapur metro end-station. Perfect for students attending Hyderabad colleges.",
    city: "Hyderabad", area: "Miyapur",
    address: "Miyapur X Roads, Near JNTU Gate, Hyderabad",
    pgType: "coliving", occupancy: ["double", "triple"], food: "breakfast", parking: "bike",
    location: { latitude: 17.4964, longitude: 78.3522 },
    photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"],
    amenities: ["WiFi", "Meals", "Study Room", "CCTV", "Laundry"],
    owner: { objectId: "seed_4", name: "Meena Hostess", phone: "9000000002" },
    isApproved: true, isSuspended: false, rating: 4.0, availableBeds: 7, monthlyPrice: 6000,
    sharingPrices: { double: 6000, triple: 4500 },
    dailyPrices:   { double: 350,  triple: 260 },
  },
  {
    objectId: "pg_011",
    name: "Jubilee Hills Premium PG",
    description: "Newly opened PG in the heart of Jubilee Hills. Premium amenities, 24/7 security, fully furnished.",
    city: "Hyderabad", area: "Jubilee Hills",
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    pgType: "coliving", occupancy: ["single", "double"], food: "all", parking: "both",
    location: { latitude: 17.4319, longitude: 78.4075 },
    photos: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"],
    amenities: ["WiFi", "AC", "Gym", "Meals", "Laundry", "Rooftop"],
    owner: { objectId: "seed_3", name: "Ravi Landlord", phone: "9000000001" },
    isApproved: false, isSuspended: false, rating: 0, availableBeds: 8, monthlyPrice: 14000,
    sharingPrices: { single: 14000, double: 10000 },
    dailyPrices:   { single: 800,   double: 580 },
  },
  {
    objectId: "pg_012",
    name: "Dilsukhnagar Budget Stay",
    description: "Affordable PG near Dilsukhnagar bus depot. Close to coaching centres, clean and well-maintained.",
    city: "Hyderabad", area: "Dilsukhnagar",
    address: "Main Road, Dilsukhnagar, Hyderabad",
    pgType: "boys", occupancy: ["triple"], food: "breakfast", parking: "bike",
    location: { latitude: 17.3688, longitude: 78.5247 },
    photos: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"],
    amenities: ["WiFi", "Meals", "Laundry", "CCTV"],
    owner: { objectId: "seed_4", name: "Meena Hostess", phone: "9000000002" },
    isApproved: false, isSuspended: false, rating: 0, availableBeds: 5, monthlyPrice: 4500,
    sharingPrices: { triple: 4500 },
    dailyPrices:   { triple: 250 },
  },
];

type FilterQuery = {
  area?: string;
  pgType?: string;
  price?: string;
  nameSearch?: string;
  occupancy?: string[];
  food?: string[];
  parking?: string[];
};

export function filterPGs(query: FilterQuery, source: PG[] = DUMMY_PGS): PG[] {
  let results = source.filter((pg) => pg.isApproved && !pg.isSuspended);

  if (query.nameSearch) {
    const term = query.nameSearch.toLowerCase();
    results = results.filter((pg) => pg.name.toLowerCase().includes(term));
  }

  if (query.area) {
    const term = query.area.toLowerCase();
    results = results.filter(
      (pg) =>
        pg.area.toLowerCase().includes(term) ||
        pg.name.toLowerCase().includes(term) ||
        pg.address.toLowerCase().includes(term)
    );
  }

  if (query.pgType && query.pgType !== "any") {
    results = results.filter((pg) => pg.pgType === query.pgType);
  }

  if (query.price && query.price !== "any") {
    results = results.filter((pg) => {
      const p = pg.monthlyPrice;
      if (query.price === "under5k") return p < 5000;
      if (query.price === "5k-10k") return p >= 5000 && p <= 10000;
      if (query.price === "10k+") return p > 10000;
      return true;
    });
  }

  if (query.occupancy && query.occupancy.length > 0) {
    results = results.filter((pg) =>
      query.occupancy!.some((o) => pg.occupancy.includes(o as any))
    );
  }

  if (query.food && query.food.length > 0) {
    results = results.filter((pg) => {
      if (query.food!.includes("all") && pg.food === "all") return true;
      if (query.food!.includes("breakfast") && (pg.food === "breakfast" || pg.food === "all")) return true;
      if (query.food!.includes("lunch") && (pg.food === "lunch" || pg.food === "all")) return true;
      if (query.food!.includes("dinner") && (pg.food === "dinner" || pg.food === "all")) return true;
      if (query.food!.includes("none") && pg.food === "none") return true;
      return false;
    });
  }

  if (query.parking && query.parking.length > 0) {
    results = results.filter((pg) => {
      if (query.parking!.includes("bike") && (pg.parking === "bike" || pg.parking === "both")) return true;
      if (query.parking!.includes("car") && (pg.parking === "car" || pg.parking === "both")) return true;
      if (query.parking!.includes("both") && pg.parking === "both") return true;
      return false;
    });
  }

  return results;
}
