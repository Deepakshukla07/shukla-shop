import { useMemo, useState } from 'react';
import {
  Sprout, Search, ShoppingCart, Menu, X, ArrowRight, Leaf, Phone, MapPin,
  Clock, Plus, Minus, Trash2, Wheat, ShieldCheck, Truck, MessageCircle, ChevronDown
} from 'lucide-react';
import { categories, products } from './data/products.js';
import { shop } from './config/shop.js';

const formatPrice = (amount) => new Intl.NumberFormat('hi-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(amount);

function ProductCard({ product, onAdd, onDetails }) {
  return (
    <article className="product-card">
      <button className="product-image-button" onClick={() => onDetails(product)} aria-label={`${product.name} की जानकारी देखें`}>
        <img src={product.image} alt={product.imageAlt} loading="lazy" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80'; }} />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <span className="image-view">विवरण देखें <ArrowRight size={14}/></span>
      </button>
      <div className="product-info">
        <div className="product-meta"><span>{product.categoryLabel}</span><span className="season">{product.season}</span></div>
        <h3>{product.name}</h3>
        <p className="product-variety">{product.variety}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="price-block"><strong>{formatPrice(product.price)}</strong><small> / {product.unit}</small><span>डेमो कीमत</span></div>
          <button className="add-button" onClick={() => onAdd(product)} aria-label={`${product.name} कार्ट में जोड़ें`}><Plus size={19}/><span>जोड़ें</span></button>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const visibleProducts = useMemo(() => products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const q = search.trim().toLocaleLowerCase('hi');
    const matchesSearch = !q || `${p.name} ${p.variety} ${p.categoryLabel} ${p.description}`.toLocaleLowerCase('hi').includes(q);
    return matchesCategory && matchesSearch;
  }), [search, activeCategory]);

  const cartItems = products.filter((p) => (cart[p.id] || 0) > 0).map((p) => ({ ...p, quantity: cart[p.id] }));
  const cartCount = cartItems.reduce((sum, p) => sum + p.quantity, 0);
  const cartTotal = cartItems.reduce((sum, p) => sum + p.quantity * p.price, 0);

  const updateQuantity = (id, quantity) => setCart((current) => ({ ...current, [id]: Math.max(0, quantity) }));
  const addProduct = (product) => {
    updateQuantity(product.id, (cart[product.id] || 0) + 1);
  };

  const buildWhatsAppMessage = () => {
    const lines = cartItems.map((p) => `• ${p.name}: ${p.quantity} ${p.unit} × ${formatPrice(p.price)} = ${formatPrice(p.quantity * p.price)}`);
    return [
      `नमस्ते ${shop.name} जी,`,
      'मुझे नीचे दिए गए उत्पादों के बारे में ऑर्डर/उपलब्धता पूछनी है:',
      ...lines,
      `कुल अनुमानित राशि: ${formatPrice(cartTotal)}`,
      'कृपया स्टॉक, वास्तविक कीमत और डिलीवरी की पुष्टि करें।',
      'नाम:',
      'पता:'
    ].join('\n');
  };

  const sendWhatsApp = () => {
    if (!cartItems.length) {
      alert('पहले कार्ट में उत्पाद जोड़ें।');
      return;
    }
    if (!shop.whatsappNumber) {
      alert('WhatsApp ऑर्डर चालू करने के लिए src/config/shop.js में whatsappNumber भरें।');
      return;
    }
    window.open(`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage())}`, '_blank', 'noopener,noreferrer');
  };

  const askAboutProduct = (product) => {
    if (!shop.whatsappNumber) {
      alert('WhatsApp संपर्क चालू करने के लिए src/config/shop.js में whatsappNumber भरें।');
      return;
    }
    const message = `नमस्ते ${shop.name} जी, मुझे ${product.name} (${product.variety}) के बारे में जानकारी चाहिए। वेबसाइट पर दिखाई गई कीमत ${formatPrice(product.price)} / ${product.unit} केवल डेमो है। कृपया वास्तविक कीमत और उपलब्धता बताएं।`;
    window.open(`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="app-shell">
      <div className="announcement">
        <div className="container announcement-inner">
          <span><Sprout size={14}/> किसानों की सेवा, हमारा संकल्प</span>
          <span>बीज • अनाज • कृषि उत्पाद</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a href="#home" className="brand" aria-label="शुक्ला बीज भंडार मुखपृष्ठ">
            <span className="brand-icon"><Sprout size={30}/></span>
            <span className="brand-copy"><strong>{shop.name}</strong><small>किसानों का भरोसा</small></span>
          </a>
          <nav className={mobileNavOpen ? 'main-nav nav-open' : 'main-nav'}>
            <a href="#home" onClick={() => setMobileNavOpen(false)}>मुखपृष्ठ</a>
            <a href="#products" onClick={() => setMobileNavOpen(false)}>उत्पाद</a>
            <a href="#about" onClick={() => setMobileNavOpen(false)}>हमारे बारे में</a>
            <a href="#contact" onClick={() => setMobileNavOpen(false)}>संपर्क</a>
          </nav>
          <div className="header-controls">
            <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="कार्ट खोलें">
              <ShoppingCart size={18}/><span>कार्ट</span><b>{cartCount}</b>
            </button>
            <button className="mobile-menu" onClick={() => setMobileNavOpen((v) => !v)} aria-label="मेन्यू">{mobileNavOpen ? <X/> : <Menu/>}</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-bg-shape"></div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot"></span> खेती की हर ज़रूरत के लिए</div>
              <h1>अच्छे बीज चुनें,<br/><em>बेहतर फसल उगाएँ।</em></h1>
              <p>शुक्ला बीज भंडार में आपका स्वागत है। गेहूँ, धान, मक्का, सरसों और सब्ज़ियों के बीजों के विकल्प देखें। सही किस्म और उपलब्धता की पुष्टि दुकान से करें।</p>
              <div className="hero-buttons">
                <a className="button button-primary" href="#products">उत्पाद देखें <ArrowRight size={17}/></a>
                <a className="button button-light" href="#contact">दुकान से संपर्क करें</a>
              </div>
              <div className="hero-trust">
                <span><ShieldCheck size={17}/> खरीदने से पहले जानकारी</span>
                <span><MessageCircle size={17}/> WhatsApp पूछताछ</span>
              </div>
            </div>
            <div className="hero-visual">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=90" alt="हरी-भरी कृषि भूमि और फसल" fetchPriority="high" />
              <div className="hero-image-overlay"></div>
              <div className="hero-sticker"><span className="sticker-icon"><Wheat size={23}/></span><span><strong>खेती के लिए उपयोगी विकल्प</strong><small>बीज और कृषि उत्पाद</small></span></div>
              <div className="hero-side-note"><Leaf size={15}/> किसान पहले</div>
            </div>
          </div>
        </section>

        <section className="trust-bar container" aria-label="हमारी सेवाएँ">
          <div className="trust-item"><span><Sprout size={22}/></span><div><strong>फसल के अनुसार विकल्प</strong><small>अलग-अलग बीज श्रेणियाँ</small></div></div>
          <div className="trust-item"><span><ShoppingCart size={22}/></span><div><strong>आसान चयन</strong><small>कार्ट में उत्पाद जोड़ें</small></div></div>
          <div className="trust-item"><span><MessageCircle size={22}/></span><div><strong>सीधी पूछताछ</strong><small>WhatsApp से संपर्क</small></div></div>
        </section>

        <section className="products-section container" id="products">
          <div className="section-head">
            <div><span className="section-kicker">हमारे उत्पाद</span><h2>अपनी ज़रूरत का उत्पाद चुनें</h2><p>उत्पादों की जानकारी नीचे देखें और उपलब्धता के लिए पूछताछ करें।</p></div>
            <span className="result-count">{visibleProducts.length} उत्पाद</span>
          </div>

          <div className="catalog-tools">
            <label className="search-input"><Search size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="उत्पाद खोजें, जैसे गेहूँ..." aria-label="उत्पाद खोजें"/></label>
            <div className="category-filters" aria-label="उत्पाद श्रेणी">
              {categories.map((c) => <button key={c.id} className={activeCategory === c.id ? 'category-button active' : 'category-button'} onClick={() => setActiveCategory(c.id)}>{c.label}</button>)}
            </div>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={addProduct} onDetails={setSelectedProduct}/>)}
          </div>
          {visibleProducts.length === 0 && <div className="no-results"><Search size={28}/><strong>कोई उत्पाद नहीं मिला</strong><span>किसी दूसरे नाम से खोजें या दूसरी श्रेणी चुनें।</span><button onClick={() => {setSearch('');setActiveCategory('all');}}>सभी उत्पाद दिखाएँ</button></div>}
          <p className="price-disclaimer">महत्वपूर्ण: वेबसाइट पर दिखाई गई कीमतें नमूने के लिए हैं। इन्हें वास्तविक दुकान की कीमतें न मानें। किस्म, पैक, स्टॉक और अंतिम कीमत की पुष्टि दुकान से करें।</p>
        </section>

        <section className="about-section" id="about">
          <div className="container about-grid">
            <div className="about-photo"><img src="https://images.unsplash.com/photo-1499529112087-3cb3b73a0b6b?auto=format&fit=crop&w=1000&q=85" alt="कृषि क्षेत्र में हरे पौधे" loading="lazy" onError={(e) => {e.currentTarget.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85';}}/><div className="photo-caption"><Sprout size={18}/> खेती की ज़रूरतों के लिए</div></div>
            <div className="about-copy"><span className="section-kicker">हमारे बारे में</span><h2>खेती के सफ़र में<br/><em>आपका साथी।</em></h2><p>शुक्ला बीज भंडार की यह वेबसाइट ग्राहकों को बीज और कृषि उत्पादों की जानकारी आसानी से देने के लिए बनाई गई है। आप उत्पादों को देख सकते हैं, कार्ट बना सकते हैं और दुकान से उपलब्धता व कीमत पूछ सकते हैं।</p><p>दुकान का पता, वास्तविक ब्रांड, प्रमाणित किस्में और उपलब्ध स्टॉक मिलने के बाद इस जानकारी को अपडेट किया जा सकता है।</p><a href="#contact" className="text-link">संपर्क जानकारी देखें <ArrowRight size={17}/></a></div>
          </div>
        </section>

        <section className="contact-section container" id="contact">
          <div className="contact-intro"><span className="section-kicker">संपर्क करें</span><h2>आपकी खेती, हमारी प्राथमिकता।</h2><p>किसी उत्पाद की कीमत, उपलब्धता या पैक के बारे में जानना है? दुकान की जानकारी अपडेट होने पर यहाँ से संपर्क कर सकेंगे।</p><div className="contact-points"><span><MessageCircle size={18}/> WhatsApp पूछताछ</span><span><Phone size={18}/> फोन पर जानकारी</span></div></div>
          <div className="contact-card">
            <div className="contact-card-head"><span className="contact-icon"><MapPin size={22}/></span><div><h3>{shop.name}</h3><p>दुकान की जानकारी</p></div></div>
            <div className="contact-detail"><MapPin size={18}/><div><strong>पता</strong><span>{shop.address}</span></div></div>
            <div className="contact-detail"><Phone size={18}/><div><strong>फोन नंबर</strong><span>{shop.phone || 'नंबर जल्द जोड़ा जाएगा'}</span></div></div>
            <div className="contact-detail"><Clock size={18}/><div><strong>दुकान का समय</strong><span>{shop.hours}</span></div></div>
            <a className="button button-primary contact-button" href="#products">उत्पाद देखें <ArrowRight size={17}/></a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-top"><a href="#home" className="brand footer-brand"><span className="brand-icon"><Sprout size={27}/></span><span className="brand-copy"><strong>{shop.name}</strong><small>किसानों का भरोसा</small></span></a><div className="footer-links"><a href="#home">मुखपृष्ठ</a><a href="#products">उत्पाद</a><a href="#about">हमारे बारे में</a><a href="#contact">संपर्क</a></div></div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} {shop.name}। सर्वाधिकार सुरक्षित।</span><span>किसानों की सेवा, हमारा संकल्प।</span></div>
      </footer>

      {cartOpen && <div className="modal-backdrop" onMouseDown={(e) => {if (e.target === e.currentTarget) setCartOpen(false);}}>
        <aside className="cart-panel" aria-label="शॉपिंग कार्ट">
          <div className="panel-header"><div><h2>आपका कार्ट</h2><span>{cartCount} आइटम चुने गए</span></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="कार्ट बंद करें"><X/></button></div>
          {cartItems.length === 0 ? <div className="empty-cart"><span><ShoppingCart size={35}/></span><h3>आपका कार्ट खाली है</h3><p>उत्पादों में से अपनी ज़रूरत की चीज़ें चुनें।</p><button className="button button-primary" onClick={() => {setCartOpen(false);document.getElementById('products')?.scrollIntoView({behavior:'smooth'});}}>उत्पाद देखें</button></div> :
            <>
              <div className="cart-list">{cartItems.map((p) => <div className="cart-row" key={p.id}><img src={p.image} alt="" loading="lazy"/><div className="cart-row-main"><strong>{p.name}</strong><small>{formatPrice(p.price)} / {p.unit}</small><div className="quantity-control"><button onClick={() => updateQuantity(p.id,p.quantity-1)} aria-label="मात्रा घटाएँ"><Minus size={13}/></button><span>{p.quantity}</span><button onClick={() => updateQuantity(p.id,p.quantity+1)} aria-label="मात्रा बढ़ाएँ"><Plus size={13}/></button></div></div><div className="cart-row-end"><strong>{formatPrice(p.price*p.quantity)}</strong><button className="remove-item" onClick={() => updateQuantity(p.id,0)} aria-label="कार्ट से हटाएँ"><Trash2 size={15}/></button></div></div>)}</div>
              <div className="cart-summary"><span>कुल अनुमानित राशि</span><strong>{formatPrice(cartTotal)}</strong></div><p className="cart-warning">{shop.deliveryNote} ये कीमतें नमूने के लिए हैं।</p>
              <button className="button button-primary checkout-button" onClick={sendWhatsApp}><MessageCircle size={18}/> WhatsApp पर ऑर्डर पूछें</button>
              <p className="checkout-note">WhatsApp खुलने पर संदेश जाँचकर खुद भेजें। अभी वेबसाइट ऑर्डर या भुगतान सेव नहीं करती।</p>
            </>}
        </aside>
      </div>}

      {selectedProduct && <div className="modal-backdrop detail-backdrop" onMouseDown={(e) => {if(e.target===e.currentTarget)setSelectedProduct(null);}}><section className="product-detail-modal" role="dialog" aria-modal="true" aria-label={`${selectedProduct.name} का विवरण`}><button className="icon-button detail-close" onClick={() => setSelectedProduct(null)} aria-label="बंद करें"><X/></button><img src={selectedProduct.image} alt={selectedProduct.imageAlt}/><div className="detail-content"><span className="section-kicker">{selectedProduct.categoryLabel}</span><h2>{selectedProduct.name}</h2><p className="detail-variety">{selectedProduct.variety}</p><p>{selectedProduct.description}</p><div className="detail-spec"><div><small>फसल का मौसम</small><strong>{selectedProduct.season}</strong></div><div><small>इकाई</small><strong>{selectedProduct.unit}</strong></div><div><small>पैक विकल्प</small><strong>{selectedProduct.packOptions.join(', ')}</strong></div></div><div className="detail-price"><span>नमूना कीमत</span><strong>{formatPrice(selectedProduct.price)} / {selectedProduct.unit}</strong></div><p className="detail-disclaimer">वास्तविक किस्म, पैक, उपलब्धता और कीमत दुकान से सत्यापित करें।</p><div className="detail-actions"><button className="button button-primary" onClick={() => {addProduct(selectedProduct);setSelectedProduct(null);setCartOpen(true);}}><Plus size={17}/> कार्ट में जोड़ें</button><button className="button button-light" onClick={() => askAboutProduct(selectedProduct)}><MessageCircle size={17}/> जानकारी पूछें</button></div></div></section></div>}
    </div>
  );
}