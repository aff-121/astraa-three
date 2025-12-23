INSERT INTO events (slug, title, description, full_description, image_url, date, time, duration, venue, location, parking, type, badge, has_tickets)
VALUES 
  ('filmfare-awards', 'Astra Filmfare Awards 2025', 'A Night of Glory. A Celebration of Art.', 'Join us for the most prestigious awards ceremony celebrating excellence in Tulu cinema. The Astra Filmfare Awards 2025 brings together the brightest stars, talented filmmakers, and passionate fans for an unforgettable evening of glamour, entertainment, and recognition. Experience live performances, red carpet moments, and witness history as we honor the best in regional cinema.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop', 'December 13, 2025', '6:00 PM', '4 Hours', 'Dr. TMA Pai Convention Centre', 'Mangalore, Karnataka', 'Free parking available', 'award', 'Upcoming', true),
  ('bulldog-premiere', 'Bulldog - Grand Premiere', 'Be the first to witness the most anticipated film of 2025.', 'Exclusive premiere with cast and crew. Join us for an unforgettable evening as we unveil Bulldog, the most anticipated action drama of 2025.', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop', 'January 14, 2025', '7:00 PM', '3 Hours', 'PVR Cinemas', 'Mangalore, Karnataka', 'Parking available', 'premiere', 'Premiere', true),
  ('music-launch', 'Netterekere Music Launch', 'Experience the soulful music of Netterekere live.', 'Experience the soulful music of Netterekere live with the composer and playback singers. A musical evening you will never forget.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop', 'September 20, 2025', '5:00 PM', '2 Hours', 'Town Hall', 'Mangalore, Karnataka', 'Limited parking', 'music', 'Music Event', true),
  ('fan-meet', 'Meet the Stars', 'An exclusive fan meet with the cast of our upcoming movies.', 'An exclusive fan meet with the cast of our upcoming movies. Photo ops, Q&A, and more!', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=500&fit=crop', 'November 5, 2025', '3:00 PM', '3 Hours', 'Forum Fiza Mall', 'Mangalore, Karnataka', 'Mall parking available', 'meet', 'Fan Event', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'VVIP Access', 5000, 50, 50, 'Front row seating, Meet & Greet, Dinner, and exclusive backstage access', 1
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'VIP Access', 2500, 100, 100, 'Premium seating, Refreshments, and photo opportunities', 2
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'General Access', 500, 500, 500, 'Standard seating with full view of the stage', 3
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'VVIP Access', 3000, 30, 30, 'Premium seating with meet and greet', 1
FROM events e WHERE e.slug = 'bulldog-premiere'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'VIP Access', 1500, 70, 70, 'Premium seating', 2
FROM events e WHERE e.slug = 'bulldog-premiere'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'General Access', 300, 200, 200, 'Standard seating', 3
FROM events e WHERE e.slug = 'bulldog-premiere'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'VIP Access', 1000, 50, 50, 'Front row with refreshments', 1
FROM events e WHERE e.slug = 'music-launch'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'General Access', 250, 300, 300, 'Standard entry', 2
FROM events e WHERE e.slug = 'music-launch'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'VIP Pass', 500, 100, 100, 'Priority access and photo opportunity', 1
FROM events e WHERE e.slug = 'fan-meet'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_categories (event_id, name, price, total_seats, available_seats, description, sort_order)
SELECT e.id, 'General Pass', 100, 500, 500, 'Standard entry', 2
FROM events e WHERE e.slug = 'fan-meet'
ON CONFLICT DO NOTHING;

INSERT INTO event_gallery (event_id, image_url, sort_order)
SELECT e.id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop', 1
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO event_gallery (event_id, image_url, sort_order)
SELECT e.id, 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop', 2
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO event_gallery (event_id, image_url, sort_order)
SELECT e.id, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop', 3
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO event_gallery (event_id, image_url, sort_order)
SELECT e.id, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop', 4
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO event_gallery (event_id, image_url, sort_order)
SELECT e.id, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop', 5
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO event_gallery (event_id, image_url, sort_order)
SELECT e.id, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop', 6
FROM events e WHERE e.slug = 'filmfare-awards'
ON CONFLICT DO NOTHING;

INSERT INTO movies (slug, title, description, synopsis, image_url, status, release_date, director, cast_members, genre, duration, youtube_url, bookmyshow_url)
VALUES 
  ('bulldog', 'Bulldog', 'A gripping tale of power, politics, and redemption set in the heart of coastal Karnataka.', 'In the heart of coastal Karnataka, a man rises from the ashes of betrayal to challenge the corrupt powers that destroyed his family. Bulldog is an action-packed drama that explores themes of justice, redemption, and the unbreakable spirit of a man who refuses to bow down.', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=800&fit=crop', 'coming-soon', 'January 2025', 'Raj Kumar', ARRAY['Rishab Shetty', 'Samantha Ruth Prabhu', 'Prakash Raj'], 'Action Drama', '2h 45m', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://in.bookmyshow.com'),
  ('kattimani', 'Kattimani', 'An epic saga of a legendary warrior fighting for justice in medieval Tulunadu.', 'Set in medieval Tulunadu, Kattimani tells the story of a legendary warrior who rises against tyranny to protect his people. This epic saga combines breathtaking action with deep emotional storytelling.', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=800&fit=crop', 'released', 'Released', 'Arun Shetty', ARRAY['Yash', 'Srinidhi Shetty', 'Anant Nag'], 'Historical Drama', '3h 10m', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://in.bookmyshow.com'),
  ('netterekere', 'Netterekere', 'A modern love story intertwined with family traditions and cultural identity.', 'Netterekere is a heartwarming tale of two souls from different worlds who find love amidst the rich cultural tapestry of coastal Karnataka. The film beautifully captures the essence of Tulu traditions while telling a modern love story.', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=800&fit=crop', 'released', 'Released', 'Priya Nair', ARRAY['Rakshit Shetty', 'Rashmika Mandanna'], 'Romantic Drama', '2h 30m', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://in.bookmyshow.com'),
  ('meera', 'Meera', 'A young woman''s journey of self-discovery through the bustling streets of Mangalore.', 'Meera follows the journey of a young woman navigating life, love, and dreams in the vibrant city of Mangalore. A coming-of-age story that resonates with the youth of today.', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&h=800&fit=crop', 'coming-soon', 'March 2025', 'Vikram Rao', ARRAY['Sanjana Anand', 'Dhananjay'], 'Coming-of-Age', '2h 15m', NULL, NULL),
  ('leelarahasyam', 'Leela Rahasyam', 'A mysterious thriller that unravels dark secrets of a wealthy coastal family.', 'When a young journalist begins investigating a wealthy coastal family, she uncovers secrets that have been buried for decades. Leela Rahasyam is a gripping thriller that keeps you on the edge of your seat.', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=800&fit=crop', 'released', 'Released', 'Sanjay Kulkarni', ARRAY['Nayanthara', 'Vijay Sethupathi'], 'Mystery Thriller', '2h 40m', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://in.bookmyshow.com'),
  ('kadalundi', 'Kadalundi', 'A heartwarming story of fishermen and their bond with the Arabian Sea.', 'Kadalundi is a poetic exploration of the lives of fishermen in coastal Karnataka. The film captures their struggles, joys, and the deep spiritual connection they share with the Arabian Sea.', 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600&h=800&fit=crop', 'coming-soon', 'February 2025', 'Maya Thomas', ARRAY['Shine Tom Chacko', 'Parvathy Thiruvothu'], 'Drama', '2h 20m', NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO news (slug, title, description, content, image_url, youtube_url, published_at)
VALUES 
  ('bulldog-announcement', 'Bulldog - Official Announcement', 'We are thrilled to announce our upcoming action drama ''Bulldog'' starring Rishab Shetty. Production begins this month.', 'We are thrilled to announce our upcoming action drama Bulldog starring Rishab Shetty. Production begins this month. This marks a new chapter in Tulu cinema as we bring together an exceptional cast and crew for this ambitious project.', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '2025-12-01'),
  ('netterekere-success', 'Netterekere Crosses 50 Crore Mark', 'Our romantic drama Netterekere has achieved the remarkable milestone of crossing 50 crores at the box office.', 'Our romantic drama Netterekere has achieved the remarkable milestone of crossing 50 crores at the box office. We thank all our fans and audiences for their overwhelming support.', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop', NULL, '2025-11-20'),
  ('awards-nominations', 'Filmfare Awards 2025 Nominations Announced', 'The nominations for Astra Filmfare Awards 2025 have been announced. Check out the complete list of nominees.', 'The nominations for Astra Filmfare Awards 2025 have been announced. This year features an exceptional lineup of talent across all categories.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop', NULL, '2025-11-15'),
  ('new-partnership', 'Strategic Partnership with Leading Studios', 'Astra Production announces a strategic partnership to expand our reach across South India.', 'Astra Production announces a strategic partnership with leading studios to expand our reach across South India. This collaboration will bring more quality content to audiences.', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop', NULL, '2025-11-10'),
  ('trailer-launch', 'Kattimani Trailer Launch Event', 'The grand trailer launch of Kattimani was held at Forum Fiza Mall with the entire cast and crew.', 'The grand trailer launch of Kattimani was held at Forum Fiza Mall with the entire cast and crew. Fans gathered in huge numbers to witness this spectacular event.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '2025-11-05'),
  ('talent-hunt', 'Astra Talent Hunt 2025', 'We''re looking for fresh faces! Auditions for our upcoming projects will be held across Karnataka.', 'We are looking for fresh faces! Auditions for our upcoming projects will be held across Karnataka. If you have the talent and passion for cinema, this is your chance to shine.', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=500&fit=crop', NULL, '2025-10-28')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO awards (year, title, description, hero_image_url)
VALUES (2025, 'Astra Filmfare Awards 2025', 'Celebrating Excellence in Tulu Cinema', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop')
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Best Film', 'trophy', 1 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Best Actor', 'star', 2 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Best Actress', 'star', 3 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Best Director', 'award', 4 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Best Music', 'award', 5 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Best Debut', 'star', 6 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Best Screenplay', 'award', 7 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_categories (award_id, name, icon, sort_order)
SELECT a.id, 'Lifetime Achievement', 'trophy', 8 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_hosts (award_id, name, image_url, role, sort_order)
SELECT a.id, 'Puneeth Rajkumar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', 'Host', 1 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_hosts (award_id, name, image_url, role, sort_order)
SELECT a.id, 'Rashmika Mandanna', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop', 'Co-Host', 2 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_hosts (award_id, name, image_url, role, sort_order)
SELECT a.id, 'Yash', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop', 'Special Guest', 3 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop', 'photo', NULL, 1 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop', 'photo', NULL, 2 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop', 'photo', NULL, 3 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop', 'photo', NULL, 4 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop', 'photo', NULL, 5 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop', 'photo', NULL, 6 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, youtube_url, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=340&fit=crop', 'video', 'Awards 2024 - Highlights', 'https://youtube.com', 7 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, youtube_url, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=340&fit=crop', 'video', 'Best Moments', 'https://youtube.com', 8 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;

INSERT INTO award_gallery (award_id, image_url, type, title, youtube_url, sort_order)
SELECT a.id, 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=340&fit=crop', 'video', 'Red Carpet Recap', 'https://youtube.com', 9 FROM awards a WHERE a.year = 2025
ON CONFLICT DO NOTHING;
