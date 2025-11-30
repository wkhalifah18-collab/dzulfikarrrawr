import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: true, // PAKAI bawaan Vercel dulu
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { nama, telepon, alamat, metode, cart, total } = req.body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          nama,
          telepon,
          alamat,
          metode,
          total,
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.log(orderError);
      return res.status(500).json({ error: 'Gagal membuat order' });
    }

    const orderId = orderData.id;

    for (const item of cart) {
      await supabase.from('order_items').insert([
        {
          order_id: orderId,
          name: item.name,
          size: item.size,
          price: item.price,
          qty: item.qty ?? 1,
        }
      ]);
    }

    return res.status(200).json({ success: true, orderId });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
