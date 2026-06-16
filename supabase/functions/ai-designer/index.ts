import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, extractedDesign, adminPasswordHash, sessionToken, restaurantId } = await req.json()

    // === AUTORIZAÇÃO obrigatória ===
    // Aceita: (1) hash da senha master do painel /admin
    //         (2) token de sessão PIN do dono do restaurante
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const sb = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    let authorized = false
    if (adminPasswordHash) {
      const { data } = await sb.rpc('verify_admin_password', { _password_hash: adminPasswordHash })
      if (data === true) authorized = true
    }
    if (!authorized && sessionToken && restaurantId) {
      const { data } = await sb.rpc('is_restaurant_session_valid', {
        _token: sessionToken,
        _restaurant_id: restaurantId,
      })
      if (data === true) authorized = true
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY')

    let designSuggestion: any = {
      visual_style: 'modern',
      primary_color: extractedDesign?.primary || '#7c3aed',
      secondary_color: extractedDesign?.secondary || '#10b981',
      button_color: extractedDesign?.accent || extractedDesign?.primary || '#7c3aed',
      background_color: extractedDesign?.background || '#ffffff',
      text_color: extractedDesign?.text || '#1f2937',
      font_family: 'Outfit',
      header_style: 'standard',
      border_radius: '1.5rem',
      card_style: 'elevated'
    }

    if (apiKey && image) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-pro',
            messages: [
              {
                role: 'system',
                content: `You are an expert brand designer. Analyze the uploaded image (logo, photo, or menu reference) with extreme attention to detail. Identify:
- The DOMINANT brand color (primary_color) — the most recognizable color
- A complementary SECONDARY color present in the image
- An ACCENT color for buttons/CTAs (highest contrast against background)
- The exact BACKGROUND color visible in the image (or white/dark surface that fits the brand)
- The exact TEXT color that appears on text in the image (or the best readable color over background)
- Font family vibe: pick from "Outfit", "Inter", "Playfair Display", "Bebas Neue", "Space Grotesk", "DM Serif Display"
- visual_style: one of "modern", "premium", "artesanal", "minimalista", "vibrant"
- header_style: "standard", "hero", "minimal"
- border_radius: "0.5rem", "1rem", "1.5rem", "2rem"
- card_style: "elevated", "flat", "outlined"

Pixel data already extracted: ${JSON.stringify(extractedDesign)}.
Use the pixel data as ground truth for colors when uncertain, but refine with semantic understanding (e.g. logo color vs background noise).
Return ONLY valid JSON with keys: primary_color, secondary_color, button_color, background_color, text_color, font_family, visual_style, header_style, border_radius, card_style. All colors MUST be valid hex (#RRGGBB).`
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Analyze this brand image and return the full design system JSON.' },
                  { type: 'image_url', image_url: { url: image } }
                ]
              }
            ],
            response_format: { type: 'json_object' }
          })
        })

        if (response.ok) {
          const aiData = await response.json()
          const content = aiData.choices?.[0]?.message?.content
          if (content) {
            const aiDesign = JSON.parse(content)
            designSuggestion = { ...designSuggestion, ...aiDesign }
          }
        } else {
          console.error("AI Gateway status:", response.status, await response.text())
        }
      } catch (aiError) {
        console.error("AI Gateway Error:", aiError)
      }
    }

    return new Response(
      JSON.stringify({ success: true, design: designSuggestion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
