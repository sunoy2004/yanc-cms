// YANC CMS API Routes Structure with Google Drive Integration

// Public API Routes (for website consumption)
GET    /api/content/hero           -> Get active hero content
GET    /api/content/sections/:name -> Get section content by name
GET    /api/content/programs       -> Get all active programs
GET    /api/content/mentor-talks   -> Get all mentor talks
GET    /api/content/events         -> Get upcoming events
GET    /api/content/event-galleries-> Get event galleries with timeline
GET    /api/content/gallery-items  -> Get gallery media items
GET    /api/content/team           -> Get team members
GET    /api/content/founders       -> Get founders
GET    /api/content/testimonials   -> Get testimonials
GET    /api/content/about-us       -> Get about us content
GET    /api/content/contact        -> Get contact information

// Admin API Routes (protected)
// Section Content Management
GET    /api/admin/sections         -> Get all sections
POST   /api/admin/sections         -> Create section content
PUT    /api/admin/sections/:name   -> Update section content
DELETE /api/admin/sections/:name   -> Delete section content

// Hero Management
GET    /api/admin/hero             -> Get all hero content
POST   /api/admin/hero             -> Create new hero content
PUT    /api/admin/hero/:id         -> Update hero content
DELETE /api/admin/hero/:id         -> Delete hero content

// Programs Management
GET    /api/admin/programs         -> Get all programs
POST   /api/admin/programs         -> Create program
PUT    /api/admin/programs/:id     -> Update program
DELETE /api/admin/programs/:id     -> Delete program

// Mentor Talks Management
GET    /api/admin/mentor-talks     -> Get all mentor talks
POST   /api/admin/mentor-talks     -> Create mentor talk
PUT    /api/admin/mentor-talks/:id -> Update mentor talk
DELETE /api/admin/mentor-talks/:id -> Delete mentor talk

// Mentor Talk Gallery Management
GET    /api/admin/mentor-gallery   -> Get all gallery items
POST   /api/admin/mentor-gallery   -> Add gallery item
PUT    /api/admin/mentor-gallery/:id -> Update gallery item
DELETE /api/admin/mentor-gallery/:id -> Delete gallery item

// Events Management
GET    /api/admin/events           -> Get all events
POST   /api/admin/events           -> Create event
PUT    /api/admin/events/:id       -> Update event
DELETE /api/admin/events/:id       -> Delete event

// Event Galleries Management
GET    /api/admin/event-galleries  -> Get all event galleries
POST   /api/admin/event-galleries  -> Create event gallery
PUT    /api/admin/event-galleries/:id -> Update event gallery
DELETE /api/admin/event-galleries/:id -> Delete event gallery

// Event Images Management
GET    /api/admin/event-images     -> Get all event images
POST   /api/admin/event-images     -> Add event image
PUT    /api/admin/event-images/:id -> Update event image
DELETE /api/admin/event-images/:id -> Delete event image

// Gallery Items Management
GET    /api/admin/gallery-items    -> Get all gallery items
POST   /api/admin/gallery-items    -> Add gallery item
PUT    /api/admin/gallery-items/:id -> Update gallery item
DELETE /api/admin/gallery-items/:id -> Delete gallery item

// Google Drive Media Integration
POST   /api/media/google-drive     -> Upload to Google Drive and save link
GET    /api/media/google-drive/:id -> Get Google Drive file metadata
DELETE /api/media/google-drive/:id -> Remove Google Drive file link
GET    /api/media/list             -> List all media links

// Authentication
POST   /api/auth/login             -> Admin login
POST   /api/auth/logout            -> Admin logout
GET    /api/auth/me                -> Get current user
POST   /api/auth/refresh           -> Refresh token

// Settings
GET    /api/admin/settings         -> Get all settings
PUT    /api/admin/settings/:key    -> Update setting

// Health Check
GET    /api/health                 -> CMS health status

// Real-time Updates (WebSocket)
WS     /api/ws                     -> WebSocket connection for live updates