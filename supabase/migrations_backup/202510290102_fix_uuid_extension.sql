-- Fix UUID extension setup for Growth Hub
-- This ensures the uuid-ossp extension is properly enabled and the uuid_generate_v4 function is available

drop extension if exists "uuid-ossp" cascade;
create extension "uuid-ossp" with schema extensions;

grant usage on schema extensions to public;
grant execute on all functions in schema extensions to public;
