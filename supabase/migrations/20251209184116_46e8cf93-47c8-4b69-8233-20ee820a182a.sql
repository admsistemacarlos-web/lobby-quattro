-- Add server-side validation constraints to the leads table
ALTER TABLE public.leads
ADD CONSTRAINT leads_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT leads_phone_length CHECK (char_length(phone) BETWEEN 8 AND 20),
ADD CONSTRAINT leads_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
ADD CONSTRAINT leads_email_length CHECK (char_length(email) <= 255);