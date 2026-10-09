-- Reservation cleanup is a backend maintenance operation, not a public RPC.
revoke execute on function public.release_expired_commerce_reservations() from public, anon, authenticated;
grant execute on function public.release_expired_commerce_reservations() to service_role;
