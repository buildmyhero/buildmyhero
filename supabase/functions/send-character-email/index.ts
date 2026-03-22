import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generateEmailHTML(character: any, baseUrl: string): string {
  const stats = character.character_data;
  const portraitUrl = character.portrait_url || '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your D&D Character is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a2e; color: #e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #3a3a5a;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(90deg, #8b5cf6 0%, #d4af37 100%);">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ⚔️ BuildMyHero
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #d4af37; text-align: center;">
                Your Character is Ready!
              </h2>
              
              <!-- Character Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  ${portraitUrl ? `
                  <td width="150" style="padding: 20px;">
                    <img src="${portraitUrl}" alt="${character.character_name}" style="width: 120px; height: 120px; border-radius: 12px; object-fit: cover; border: 2px solid #d4af37;">
                  </td>
                  ` : ''}
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 22px; color: #ffffff;">
                      ${character.character_name}
                    </h3>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #a0a0a0;">
                      Level ${character.level} ${character.race} ${character.character_class}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #8b5cf6;">
                      ${stats.alignment || 'Neutral'} • ${stats.background?.name || 'Adventurer'} • D&D ${character.ruleset}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Stats -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="10">
                      <tr>
                        ${['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((abbr, i) => {
                          const fullNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                          const score = stats.abilityScores?.[fullNames[i]] || 10;
                          return `
                            <td style="text-align: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; min-width: 50px;">
                              <div style="font-size: 10px; color: #a0a0a0; margin-bottom: 4px;">${abbr}</div>
                              <div style="font-size: 18px; font-weight: bold; color: #ffffff;">${score}</div>
                            </td>
                          `;
                        }).join('')}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Combat Stats -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="20">
                      <tr>
                        <td style="text-align: center;">
                          <div style="font-size: 28px; font-weight: bold; color: #ef4444;">❤️ ${stats.hitPoints?.maximum || '—'}</div>
                          <div style="font-size: 11px; color: #a0a0a0;">Hit Points</div>
                        </td>
                        <td style="text-align: center;">
                          <div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">🛡️ ${stats.armorClass || '—'}</div>
                          <div style="font-size: 11px; color: #a0a0a0;">Armor Class</div>
                        </td>
                        <td style="text-align: center;">
                          <div style="font-size: 28px; font-weight: bold; color: #d4af37;">⚡ ${stats.speed || 30}</div>
                          <div style="font-size: 11px; color: #a0a0a0;">Speed</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/character/${character.id}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #d4af37 0%, #f0c850 100%); color: #1a1a2e; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 5px;">
                      View Full Character Sheet
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <a href="${baseUrl}/character/${character.id}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 5px;">
                      Download Character Sheet PDF
                    </a>
                  </td>
                </tr>
                ${character.play_guide_content ? `
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <a href="${baseUrl}/character/${character.id}" style="display: inline-block; padding: 14px 28px; background: rgba(255,255,255,0.1); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 5px; border: 1px solid rgba(255,255,255,0.2);">
                      Download Play Guide PDF
                    </a>
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <!-- Info Section -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 20px;">
                <h4 style="margin: 0 0 12px 0; color: #d4af37; font-size: 16px;">✨ What's Included</h4>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #e0e0e0; font-size: 14px; line-height: 1.8;">
                  <li>Complete character sheet with all stats and abilities</li>
                  <li>AI-generated character portrait</li>
                  <li>Comprehensive play guide with combat tactics and roleplay tips</li>
                  <li>Leveling roadmap through level 20</li>
                </ul>
              </div>
              
              <!-- What's Next -->
              <div style="background: rgba(212, 175, 55, 0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(212, 175, 55, 0.3);">
                <h4 style="margin: 0 0 12px 0; color: #d4af37; font-size: 16px;">🎲 What's Next?</h4>
                <ol style="margin: 0; padding: 0 0 0 20px; color: #e0e0e0; font-size: 14px; line-height: 1.8;">
                  <li>Review your character sheet and familiarize yourself with your abilities</li>
                  <li>Read the play guide for tips on how to play this character effectively</li>
                  <li>Print your character sheet or use our web viewer at the table</li>
                </ol>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #a0a0a0;">
                Created with ❤️ by BuildMyHero
              </p>
              <p style="margin: 0; font-size: 11px; color: #666;">
                <a href="${baseUrl}/library" style="color: #8b5cf6; text-decoration: none;">View Your Character Library</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { characterId, email } = await req.json();

    if (!characterId) {
      return new Response(
        JSON.stringify({ error: 'Character ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch character data
    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (fetchError || !character) {
      console.error('Failed to fetch character:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Character not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine base URL (use the published URL in production)
    const baseUrl = 'https://buildmyhero.lovable.app';

    // Generate email HTML
    const emailHTML = generateEmailHTML(character, baseUrl);

    // Send email via Resend
    const resend = new Resend(RESEND_API_KEY);
    
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'BuildMyHero <onboarding@resend.dev>',
      to: [email],
      subject: `Your D&D Character: ${character.character_name} is Ready!`,
      html: emailHTML,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email sent successfully:', emailResponse);

    // Mark email as sent in database
    await supabase
      .from('characters')
      .update({ email_sent: true })
      .eq('id', characterId);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
