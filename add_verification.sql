ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false, ADD COLUMN IF NOT EXISTS verification_date timestamp with time zone; CREATE POLICY \
Admins
can
verify
companies\ ON public.companies FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role::text = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role::text = 'admin'));
