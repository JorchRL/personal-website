# Blog, CMS & Database - TODO

## Database Setup (Supabase)
- [ ] Create Supabase project and get credentials
- [ ] Run `lib/db/schema.sql` to create all tables
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure Supabase Auth providers (GitHub, Google)

## Contact API
- [ ] Implement `app/api/contact/route.ts` to save form submissions
- [ ] Add email notification on new submissions (optional: Resend/SendGrid)
- [ ] Add rate limiting to prevent spam

## Blog System
- [ ] Create `app/blog/page.tsx` - Blog listing with filters by category
- [ ] Create `app/blog/[slug]/page.tsx` - Individual post page
- [ ] Implement interactive scene headers (Particle, Geometric, Audio, Custom)
- [ ] Add Tailwind Typography for markdown rendering
- [ ] Create related posts component
- [ ] Add reading time estimation
- [ ] Implement table of contents for long posts

## Discussion/Comments System
- [ ] Create `app/components/blog/Comments.tsx`
- [ ] Implement nested/threaded replies
- [ ] Add Supabase Auth login modal (GitHub/Google)
- [ ] Real-time comment updates with Supabase subscriptions
- [ ] Moderation controls (delete, hide)

## Admin Dashboard
- [ ] Create protected `/admin` route with auth check
- [ ] `app/admin/page.tsx` - Dashboard overview
- [ ] `app/admin/posts/page.tsx` - Post management (list, create, edit, delete)
- [ ] `app/admin/posts/[id]/edit/page.tsx` - Markdown editor with live preview
- [ ] `app/admin/submissions/page.tsx` - View contact form submissions
- [ ] `app/admin/analytics/page.tsx` - Page views, popular posts, traffic sources

## Analytics
- [ ] Create analytics provider/hook to track page views
- [ ] Implement `lib/analytics/analytics.ts` tracking functions
- [ ] Add to `app/layout.tsx` or create `AnalyticsProvider`

## API Routes
- [ ] `app/api/posts/route.ts` - CRUD for posts
- [ ] `app/api/posts/[slug]/route.ts` - Get single post
- [ ] `app/api/comments/route.ts` - CRUD for comments
- [ ] `app/api/analytics/route.ts` - Track page views
- [ ] `app/api/admin/stats/route.ts` - Dashboard statistics

## Files Already Created (Ready to Use)
- `lib/types/posts.ts` - Post types
- `lib/types/projects.ts` - Project types  
- `lib/types/contact.ts` - Contact submission types
- `lib/types/analytics.ts` - Analytics types
- `lib/db/schema.sql` - Full database schema
- `lib/db/queries.ts` - Database query functions
- `lib/db/comments.ts` - Comment query functions
- `lib/db/contact.ts` - Contact query functions
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/supabase/admin.ts` - Admin client
- `lib/constants/categories.ts` - Blog categories
- `lib/constants/templates.ts` - Interactive scene templates

## Interactive Scene Templates (Components Ready)
- [x] `ParticleScene.tsx` - Network/flow/explosion particle effects
- [x] `GeometricScene.tsx` - 3D rotating shapes (cube, pyramid, octahedron, sphere)
- [x] `AudioVisualizer.tsx` - Real-time audio visualization
- [x] `CustomScene.tsx` - Code sandbox for Three.js/p5.js
