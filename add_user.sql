INSERT INTO users (id, email, name, role, "isActive", "createdAt", "updatedAt") 
VALUES (gen_random_uuid(), 'sebastian@dwe-beratung.de', 'Sebastian Möhrer', 'ADMIN', true, NOW(), NOW());
