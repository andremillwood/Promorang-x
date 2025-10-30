-- Use pgcrypto for UUID generation instead of uuid-ossp
drop extension if exists "uuid-ossp" cascade;
create extension if not exists "pgcrypto" with schema extensions;

grant usage on schema extensions to public;
grant execute on all functions in schema extensions to public;
