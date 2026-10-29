# शुक्ला बीज भंडार — React Website

हिंदी-प्रथम कृषि दुकान वेबसाइट। Netlify और Vercel पर deploy करने के लिए तैयार।

## इसमें क्या है
- Responsive Hindi storefront
- Product cards with photography, details, units, categories and sample prices
- Search, category filters and cart quantity controls
- WhatsApp order message generator
- Contact/address placeholders
- SEO metadata and deployment configuration

## चलाने का तरीका
Node.js 20+ install करें। Project folder में terminal खोलें:

```bash
npm install
npm run dev
```

Terminal में दिखाया गया local URL खोलें, आमतौर पर http://localhost:5173

Production build:
```bash
npm run build
npm run preview
```

## अपनी दुकान की जानकारी बदलें
`src/config/shop.js` में:
- `phone`: दुकान का फोन नंबर
- `whatsappNumber`: country code सहित केवल अंक, जैसे `91XXXXXXXXXX`
- `address`: पूरा पता
- `hours`: दुकान का समय

`src/data/products.js` में उत्पाद, कीमत, विवरण, मात्रा/इकाई और फोटो URL बदलें।
अभी सभी कीमतें केवल sample values हैं; दुकान की असली कीमतों से बदलें। Product images Unsplash के hosted photo URLs से लोड होती हैं और इंटरनेट कनेक्शन चाहिए।

## Netlify
1. GitHub पर repository push करें।
2. Netlify → Add new site → Import an existing project.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy करें।

## Vercel
1. Repository को GitHub पर push करें।
2. Vercel → Add New → Project → repository import करें।
3. Framework preset Vite चुनें (या auto-detect होने दें)।
4. Build command `npm run build`, output directory `dist`.
5. Deploy करें।

## WhatsApp order
`src/config/shop.js` में सही `whatsappNumber` भरें। नंबर में `+`, spaces या hyphens न रखें, उदाहरण: `919876543210`.
WhatsApp संदेश ग्राहक के चुने हुए उत्पाद और कुल sample राशि के साथ खुलेगा। ग्राहक खुद संदेश भेजेगा; वेबसाइट अपने आप ऑर्डर या भुगतान दर्ज नहीं करती।

## Production से पहले
- सभी sample prices, product varieties, stock and product claims verify करें।
- Product photo URLs बदलकर अपने product/brand की वास्तविक photos लगाएँ।
- सही address, phone, WhatsApp, delivery area and business policies add करें।
- यह frontend-only version है: इसमें admin panel, database, customer accounts, inventory persistence या online payment शामिल नहीं हैं।
- यदि online payments या saved orders चाहिए, तो secure backend/API जोड़ें; secret keys कभी frontend में न रखें।
