-- Seed data for companies and reviews (idempotent)
INSERT INTO public.companies (id, name, industry, location)
VALUES
  (1, 'Acme Corp', 'Technology', 'New York'),
  (2, 'Globex Inc', 'Finance', 'San Francisco')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, company_id, rating, pros, cons, position, employment_status, is_current_employee, recommend, created_at)
VALUES
  (1, 1, 4, 'Great culture', 'Long hours', 'Engineer', 'Full-time', true, true, now()),
  (2, 2, 2, 'Decent', 'Low pay', 'Analyst', 'Full-time', false, false, now())
ON CONFLICT (id) DO NOTHING;
