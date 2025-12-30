-- Create user_tickets table for tracking ticket balances
CREATE TABLE public.user_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  ticket_balance integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tickets"
ON public.user_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets record"
ON public.user_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create ticket_transactions table for purchase/usage history
CREATE TABLE public.ticket_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type text NOT NULL, -- 'purchase' or 'usage'
  ticket_amount integer NOT NULL, -- positive for purchase, negative for usage
  price_per_ticket integer, -- in yen, only for purchases
  total_price integer, -- in yen, only for purchases
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions"
ON public.ticket_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.ticket_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to get user's ticket balance
CREATE OR REPLACE FUNCTION public.get_ticket_balance(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ticket_balance, 0)
  FROM public.user_tickets
  WHERE user_id = _user_id
$$;

-- Create function to use a ticket (deduct from balance)
CREATE OR REPLACE FUNCTION public.use_ticket(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT ticket_balance INTO current_balance
  FROM public.user_tickets
  WHERE user_id = _user_id
  FOR UPDATE;
  
  IF current_balance IS NULL OR current_balance < 1 THEN
    RETURN false;
  END IF;
  
  UPDATE public.user_tickets
  SET ticket_balance = ticket_balance - 1,
      updated_at = now()
  WHERE user_id = _user_id;
  
  INSERT INTO public.ticket_transactions (user_id, transaction_type, ticket_amount, description)
  VALUES (_user_id, 'usage', -1, '占い利用');
  
  RETURN true;
END;
$$;

-- Create function to add tickets (for purchases)
CREATE OR REPLACE FUNCTION public.add_tickets(_user_id uuid, _amount integer, _price_per_ticket integer, _total_price integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert or update user_tickets
  INSERT INTO public.user_tickets (user_id, ticket_balance)
  VALUES (_user_id, _amount)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    ticket_balance = user_tickets.ticket_balance + _amount,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.ticket_transactions (user_id, transaction_type, ticket_amount, price_per_ticket, total_price, description)
  VALUES (_user_id, 'purchase', _amount, _price_per_ticket, _total_price, _amount || '枚チケット購入');
  
  RETURN true;
END;
$$;

-- Update trigger for updated_at
CREATE TRIGGER update_user_tickets_updated_at
BEFORE UPDATE ON public.user_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();