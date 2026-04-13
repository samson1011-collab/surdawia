import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL      = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Relief Org <noreply@yourdomain.com>'
const ADMIN_EMAIL     = Deno.env.get('ADMIN_EMAIL')       ?? 'admin@yourdomain.com'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { template, data } = body as { template: string; data: Record<string, string> }

    let subject = ''
    let html    = ''

    if (template === 'donation_received') {
      subject = `New donation from ${data.donor_name}`
      html = `
        <h2>New Donation Received</h2>
        <p><strong>Donor:</strong> ${data.donor_name}</p>
        <p><strong>Email:</strong> ${data.donor_email}</p>
        <p><strong>Amount:</strong> $${(parseInt(data.amount_cents) / 100).toFixed(2)}</p>
        <p><strong>Frequency:</strong> ${data.frequency}</p>
        ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
      `
    } else if (template === 'donation_confirmation') {
      subject = `Thank you for your donation, ${data.donor_name}`
      html = `
        <h2>Thank You, ${data.donor_name}!</h2>
        <p>Your donation of <strong>$${(parseInt(data.amount_cents) / 100).toFixed(2)}</strong> has been received.</p>
        <p>100% of your gift goes directly to families in need. Thank you for your generosity.</p>
      `
    } else if (template === 'order_received') {
      subject = `New store order from ${data.donor_name}`
      html = `
        <h2>New Store Order</h2>
        <p><strong>Customer:</strong> ${data.donor_name}</p>
        <p><strong>Email:</strong> ${data.donor_email}</p>
        <p><strong>Total:</strong> $${(parseInt(data.total_cents) / 100).toFixed(2)}</p>
      `
    } else {
      return new Response(JSON.stringify({ error: 'Unknown template' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Determine recipient
    const to = template === 'donation_confirmation' ? data.donor_email : ADMIN_EMAIL

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
