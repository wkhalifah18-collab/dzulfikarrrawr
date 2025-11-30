import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,   // penting agar FormData bisa dibaca
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ambil form-data dari request
    const formData = await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    const boundary = req.headers['content-type'].split('boundary=')[1];
    const form = parseMultipartFormData(formData, boundary);

    const nama = form.fields.nama;
    const telepon = form.fields.telepon;
    const alamat = form.fields.alamat;
    const metode = form.fields.metode;
    const cart = JSON.parse(form.fields.cart); // cart dari localStorage
    const total = parseInt(form.fields.total);

    // Inisialisasi Supabase dengan KEY server-side
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let bukti_url = null;

    // Upload bukti transfer jika ada file
    if (form.files.bukti) {
      const file = form.files.bukti;

      const filename = `bukti_${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('bukti-transfer')
        .upload(filename, file.content, {
          contentType: file.contentType,
          upsert: false
        });

      if (error) {
        console.log(error);
      } else {
        const { data: publicURL } = supabase.storage
          .from('bukti-transfer')
          .getPublicUrl(filename);

        bukti_url = publicURL.publicUrl;
      }
    }

    // Insert ke tabel orders
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          nama,
          telepon,
          alamat,
          metode,
          total,
          bukti_url
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.log(orderError);
      return res.status(500).json({ error: 'Gagal membuat order' });
    }

    const orderId = orderData.id;

    // Insert item ke tabel order_items
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
    return res.status(500).json({ error: 'Server error' });
  }
}

/** --- PARSER MULTIPART FORM DATA --- */
function parseMultipartFormData(body, boundary) {
  const result = { fields: {}, files: {} };

  const parts = body
    .toString('binary')
    .split(`--${boundary}`)
    .filter((part) => part.includes('Content-Disposition'));

  parts.forEach((part) => {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) return;
    const name = nameMatch[1];

    const filenameMatch = part.match(/filename="([^"]+)"/);

    if (filenameMatch) {
      // file
      const contentTypeMatch = part.match(/Content-Type: ([^\n\r]+)/);
      const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

      const fileContent = part.split('\r\n\r\n')[1];
      const cleaned = fileContent.substring(0, fileContent.length - 2); // remove \r\n

      result.files[name] = {
        filename: filenameMatch[1],
        contentType,
        content: Buffer.from(cleaned, 'binary'),
      };
    } else {
      // field text
      const value = part.split('\r\n\r\n')[1].replace(/\r\n$/, '');
      result.fields[name] = value;
    }
  });

  return result;
}
