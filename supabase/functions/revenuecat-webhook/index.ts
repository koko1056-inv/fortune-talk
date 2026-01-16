import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RevenueCat Event Types for consumables
const PURCHASE_EVENTS = [
  'INITIAL_PURCHASE',
  'NON_RENEWING_PURCHASE',
];

// Product ID to ticket amount mapping
const PRODUCT_TICKET_MAP: Record<string, number> = {
  'ticket_01': 1,
  'ticket_10': 10,
  'ticket_50': 50,
  'ticket_100': 100,
};

// Product ID to price mapping (for records)
const PRODUCT_PRICE_MAP: Record<string, { pricePerTicket: number; totalPrice: number }> = {
  'ticket_01': { pricePerTicket: 1000, totalPrice: 1000 },
  'ticket_10': { pricePerTicket: 900, totalPrice: 9000 },
  'ticket_50': { pricePerTicket: 800, totalPrice: 40000 },
  'ticket_100': { pricePerTicket: 700, totalPrice: 70000 },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization header (RevenueCat webhook secret)
    const authHeader = req.headers.get('Authorization');
    const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error('Unauthorized webhook request');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    console.log('RevenueCat webhook received:', JSON.stringify(body, null, 2));

    const event = body.event;
    if (!event) {
      return new Response(JSON.stringify({ error: 'No event in body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const eventType = event.type;
    const appUserId = event.app_user_id;
    const productId = event.product_id;

    console.log(`Event type: ${eventType}, User: ${appUserId}, Product: ${productId}`);

    // Only process purchase events
    if (!PURCHASE_EVENTS.includes(eventType)) {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(JSON.stringify({ success: true, message: 'Event ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get ticket amount from product ID
    const ticketAmount = PRODUCT_TICKET_MAP[productId];
    if (!ticketAmount) {
      console.error(`Unknown product ID: ${productId}`);
      return new Response(JSON.stringify({ error: 'Unknown product' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const priceInfo = PRODUCT_PRICE_MAP[productId] || { pricePerTicket: 0, totalPrice: 0 };

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // The app_user_id should be the Supabase user ID (set during RevenueCat login)
    const userId = appUserId;

    // Add tickets using the database function
    const { data, error } = await supabase.rpc('add_tickets', {
      _user_id: userId,
      _amount: ticketAmount,
      _price_per_ticket: priceInfo.pricePerTicket,
      _total_price: priceInfo.totalPrice,
    });

    if (error) {
      console.error('Failed to add tickets:', error);
      return new Response(JSON.stringify({ error: 'Failed to add tickets', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully added ${ticketAmount} tickets for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      ticketsAdded: ticketAmount,
      userId 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
