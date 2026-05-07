-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code varchar(50) UNIQUE NOT NULL,
  status varchar(50) DEFAULT 'draft' NOT NULL,
  type varchar(50) NOT NULL,
  operation varchar(50) NOT NULL,
  price bigint DEFAULT 0,
  rental_price bigint,
  currency varchar(10) DEFAULT 'USD',
  address text NOT NULL,
  neighborhood varchar(255),
  bedrooms integer,
  bathrooms integer,
  m2_built integer,
  m2_land integer,
  amenities jsonb DEFAULT '[]'::jsonb,
  media jsonb DEFAULT '[]'::jsonb,
  description_raw text,
  captured_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_captured_by ON public.properties(captured_by);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Users can only see their own properties
CREATE POLICY "Users can view their own properties"
  ON public.properties
  FOR SELECT
  USING (auth.uid() = captured_by);

-- Users can insert their own properties
CREATE POLICY "Users can insert their own properties"
  ON public.properties
  FOR INSERT
  WITH CHECK (auth.uid() = captured_by);

-- Users can update their own properties
CREATE POLICY "Users can update their own properties"
  ON public.properties
  FOR UPDATE
  USING (auth.uid() = captured_by)
  WITH CHECK (auth.uid() = captured_by);

-- Users can delete their own properties
CREATE POLICY "Users can delete their own properties"
  ON public.properties
  FOR DELETE
  USING (auth.uid() = captured_by);

-- Function to auto-generate property code
CREATE OR REPLACE FUNCTION public.generate_property_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := 'MR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('properties_code_seq')::text, 4, '0');
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for property codes
CREATE SEQUENCE IF NOT EXISTS properties_code_seq START 1;

-- Create trigger for auto-generating property code
DROP TRIGGER IF EXISTS trigger_generate_property_code ON public.properties;
CREATE TRIGGER trigger_generate_property_code
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_property_code();

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_properties_timestamp ON public.properties;
CREATE TRIGGER trigger_update_properties_timestamp
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.moddatetime(updated_at);
