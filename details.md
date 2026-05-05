# PG Accommodation Platform — Project Details  ['STAYFELLO'or'STAYNIVAS'or'ROOMSY']

## About the Project
- A web platform for discovering, browsing, and booking Paying Guest (PG) accommodations
- Users can search PGs by area or by current location (near me)
- Supports 2-sharing and 3-sharing room types
- Bookings can be made on a daily, weekly, or monthly basis
- Users can contact the PG owner directly and get directions to the PG
- The website and mobile app share the same backend database
- Three user roles: Customer, PG Admin, and Platform Admin

---

## Required Details

### PG Admin Onboarding                                                                                                     
- On the home page or signup page, there is a "Become a Host" option for anyone who wants to list their PG           
- Clicking "Become a Host" takes the user to a dedicated PG Admin signup page                                               
- After signup, the PG Admin is logged in and taken to their dashboard                                                    
- From the dashboard, the PG Admin fills and submits their PG details — name, address, area, location, photos, amenities, and rooms                                                                                                              
- After submission, the PG listing is in pending approval state and not visible to customers yet                          
- Platform Admin reviews the submission and approves or rejects it                                                          
- Once approved, the PG goes live and appears in customer listings                                                          
- PG Admin is notified when their PG is approved or rejected

### Authentication                                                                                                          
- Users can sign up and log in using email + password or phone number + password                                     
- No OTP verification required                                                                                              
- Role is assigned at signup: customer, pg_admin, or platform_admin                                                       
- After login, users are redirected based on their role  

### Users
- Customers can sign up, log in, browse PGs, book rooms, and leave reviews
- PG Admins manage their own PG — rooms, photos, amenities, and bookings
- Platform Admins oversee all PGs, users, and bookings across the platform

### Search & Filters
- Users can search PGs by area name or use "near me" to find PGs based on current location
- Filters available on the listings page:
  - Area / Location — search by area name or GPS-based radius
  - PG Type — Boys / Girls / Co-living
  - Price Range — set min and max price per day, week, or month
  - Room Type — filter by 2-sharing or 3-sharing
  - Food Preference — Veg / Non-veg / Both
  - Furnishing — Fully furnished / Semi-furnished / Unfurnished
  - Amenities — select one or more (WiFi, AC, Food, Laundry, Parking, etc.)
  - Rating — filter by minimum star rating (e.g. 3 stars and above)
  - Availability — only show PGs that have at least one available bed
- Multiple filters can be applied together at the same time
- Filters reset when the user clears or navigates away

### PG Listings
- Each PG has a name, description, area, full address, and geo-location
- Photos are stored via Cloudinary
- Amenities include WiFi, AC, Food, Laundry, Parking, etc.
- PGs must be approved by Platform Admin before appearing in listings
- Platform Admin can suspend a PG to temporarily hide it
- Each PG has a `pgType` field: `boys` / `girls` / `coliving`
- Each PG has a `foodType` field: `veg` / `nonveg` / `both` / `none`
- Each PG has a `furnishing` field: `fully-furnished` / `semi-furnished` / `unfurnished`
- Each PG has a `noticePeriod` field in days: 15 / 30 / 60
- Each PG has a `securityDeposit` field — amount collected upfront before move-in
- Each PG has a `minimumStay` field in months (e.g. 1, 3, 6)
- Each PG has a `guestPolicy` field: `allowed` / `not-allowed`
- Each PG has `curfewTimings` field — entry/exit time restrictions if any (e.g. 10:00pm)
- PG listing shows a type badge: Boys / Girls / Co-living

### Search & Filters (updated)
- Added PG type filter: Boys / Girls / Co-living
- Added food preference filter: Veg / Non-veg / Both
- Added furnishing filter: Fully furnished / Semi-furnished / Unfurnished

### Rooms
- Each PG can have multiple room types (2-sharing, 3-sharing)
- Each room has a total bed count and an available bed count
- Prices are set per person for daily, weekly, and monthly stays
- Room photos are stored separately via Cloudinary

### Bookings
- Daily booking: entry between 10:00am–11:00am, exit within 24 hours
- Weekly and monthly bookings use flat per-person pricing
- Monthly bookings require a `checkInDate` — the date of the month the tenant moves in
- Total price = price per person × number of persons
- Availability is checked before confirming — available beds must be >= persons booked
- On confirmation: available beds are decremented
- On cancellation: available beds are re-incremented
- Booking status flow: pending → confirmed / rejected → completed / cancelled
- `persons` field stores how many people are booking — total price is calculated as price × persons                       

### Notifications                                                                                                           
- Toast notifications shown in the app for instant feedback (using react-hot-toast on web, Expo notifications on app)     
- Email notifications sent for key booking events:                                                                          
- User receives email when booking is confirmed by PG Admin                                                               
- User receives email when booking is rejected by PG Admin                                                                
- User receives email when booking is cancelled                                                                           
- PG Admin receives email when a new booking request comes in                                                             
- Toast notifications shown for actions like: booking submitted, profile updated, review posted, errors 

### Payments                                                                                                                
- No online payment gateway is integrated — payments are handled offline between the user and PG owner               
- User can pay via UPI (owner's UPI ID shown on booking page)                                                               
- User can scan the PG owner's QR code to pay                                                                             
- User can call the PG owner before booking to confirm availability and arrange payment                                   
- PG owner's phone number is visible on the PG detail page and booking page for direct contact                              
- Booking status starts as pending — PG Admin confirms only after receiving payment                                       
- No refund flow needed since payment is handled directly between user and owner 

### Identity Proof Verification
- During the booking flow, the user must upload a valid government-issued ID proof before confirming the booking or after   reaching the Pg.
- Accepted documents: Aadhaar Card, Driving License, or PAN Card
- Only one document needs to be uploaded per booking
- The document is uploaded as an image (JPG/PNG) or PDF 
- The uploaded proof is stored against the booking record and visible to the PG Admin
- PG Admin can view the ID proof when reviewing a pending booking before accepting or rejecting
- Platform Admin can also access ID proofs for any booking if needed
- The document upload is mandatory — booking cannot be submitted without it
- Zod validates that the file is present and is an accepted format before form submission

### Reviews
- Only customers can leave reviews for a PG
- Each review has a star rating (1–5) and an optional comment
- PG average rating is auto-recomputed after every new review

### Platform Admin Dashboard
- KPI cards: Total PGs, Total Users, Bookings Today, Revenue This Month
- Charts: bookings per day (line), top 5 PGs by bookings (bar), booking type split (pie)
- Recent bookings feed (last 10)
- PG actions: approve, reject with reason, suspend
- Reports: select a PG + date range → day-by-day breakdown + CSV export

### Maps & Location
- Google Maps integration for PG location display and directions
- "Near me" search using device GPS and geo-radius queries

### Share & Report
- Each PG detail page has a Share button — copies the link or shares via WhatsApp
- Users can report a PG listing using a "Report" option on the detail page
- Report reasons: Fake listing / Wrong information / Inappropriate photos / Other
- Reports are visible to Platform Admin for review and action

### Platform Pages & UX
- Each PG detail page has SEO meta tags — title, description, og:image for Google and WhatsApp previews
- Custom 404 page with a friendly message and link back to listings
- Custom error page for unexpected failures
- Loading skeleton screens shown while PG data is being fetched on listing and detail pages

