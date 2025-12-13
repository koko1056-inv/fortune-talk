-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create agent_configs table for cloud storage
CREATE TABLE public.agent_configs (
    id text PRIMARY KEY,
    agent_id text NOT NULL DEFAULT '',
    name text NOT NULL,
    description text NOT NULL,
    emoji text NOT NULL,
    image_url text,
    gradient text NOT NULL,
    accent_color text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on agent_configs
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

-- Anyone can read agent configs (public data)
CREATE POLICY "Anyone can view agent configs"
ON public.agent_configs
FOR SELECT
USING (true);

-- Only admins can insert agent configs
CREATE POLICY "Admins can insert agent configs"
ON public.agent_configs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update agent configs
CREATE POLICY "Admins can update agent configs"
ON public.agent_configs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete agent configs
CREATE POLICY "Admins can delete agent configs"
ON public.agent_configs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on agent_configs
CREATE TRIGGER update_agent_configs_updated_at
BEFORE UPDATE ON public.agent_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default agent configs
INSERT INTO public.agent_configs (id, agent_id, name, description, emoji, gradient, accent_color, sort_order) VALUES
('tarot', 'agent_3101kc38wn6qftar7macxcm8rg7g', 'タロット占い', '78枚のカードが導く運命の物語', '🃏', 'from-violet-600 via-purple-600 to-indigo-700', '280 70% 50%', 0),
('astro', '', '西洋占星術', '星座と惑星が語る宇宙の知恵', '⭐', 'from-amber-500 via-yellow-500 to-orange-500', '45 80% 55%', 1),
('eastern', '', '四柱推命', '生年月日から読み解く東洋の叡智', '🌙', 'from-rose-600 via-red-600 to-pink-600', '350 70% 50%', 2),
('numerology', '', '数秘術', '数字に隠された人生のメッセージ', '🔢', 'from-cyan-500 via-teal-500 to-emerald-500', '175 70% 45%', 3);