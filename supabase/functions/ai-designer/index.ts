import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, extractedColors, currentStyle } = await req.json()
    const apiKey = Deno.env.get('LOVABLE_API_KEY')

    let designSuggestion = {
      visual_style: 'modern',
      primary_color: extractedColors?.[0] || '#7c3aed',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'Outfit',
      header_style: 'standard',
      border_radius: '1.5rem'
    }

    // If we have a real API key, we call the Lovable AI Gateway for a high-quality decision
    if (apiKey) {
      try {
        const response = await fetch('https://api.lovable.app/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: {
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert UI/UX designer specializing in restaurant digital menus. Based on the provided image and extracted colors, suggest a professional design system. Return ONLY JSON.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: `Extracted colors: ${extractedColors?.join(', ') || 'none'}. Current style: ${currentStyle || 'modern'}. Suggest visual_style (modern, minimalista, premium, artesanal), background_color, text_color, font_family (Outfit, Inter, Space Grotesk, Montserrat), header_style (standard, floating), and border_radius (0.75rem, 1.5rem, 2.5rem).` },
                  { type: 'image_url', image_url: { url: image } }
                ]
              }
            ],
            response_format: { type: 'json_object' }
          }
        })
        
        const aiData = await response.json()
        if (aiData.choices?.[0]?.message?.content) {
          const aiDesign = JSON.parse(aiData.choices[0].message.content)
          designSuggestion = { ...designSuggestion, ...aiDesign }
        }
      } catch (aiError) {
        console.error("AI Gateway Error:", aiError)
        // Fallback to deterministic logic if AI fails
      }
    }

    // Deterministic logic if AI is not available or failed
    if (extractedColors && extractedColors.length > 0) {
      designSuggestion.primary_color = extractedColors[0]
      // Try to find a good background color based on the primary color (light version)
      designSuggestion.background_color = '#ffffff'
      designSuggestion.text_color = '#1f2937'
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        design: designSuggestion
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
