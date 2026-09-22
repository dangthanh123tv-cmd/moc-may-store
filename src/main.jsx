import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShoppingCart, Package, MessageSquare, Settings, Plus, Pencil, Trash2,
  LogOut, Menu, X, Search, Minus, Image as ImageIcon, Send, MapPin,
  Phone, Mail, Clock
} from "lucide-react";
import "./styles.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Matcha Latte Mây Xanh",
    price: 30000,
    category: "Tea",
    rating: 4.9,
    desc: "Matcha thanh dịu, sữa tươi béo nhẹ và lớp mây kem mịn.",
    imageUrl:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 2,
    name: "Trà Đào Cam Sả Mây",
    price: 30000,
    category: "Tea",
    rating: 4.9,
    desc: "Trà đào cam sả tươi sáng vị, cân bằng và dễ uống.",
    imageUrl:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 3,
    name: "Cacao Muối Biển Chill",
    price: 30000,
    category: "Cacao",
    rating: 4.7,
    desc: "Cacao đậm vị cân bằng với lớp kem muối biển dịu mềm.",
    imageUrl:
      "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 4,
    name: "Dâu Kem Sữa Mộng Mơ",
    price: 30000,
    category: "Milk",
    rating: 4.8,
    desc: "Dâu tươi chua ngọt cùng sữa và lớp kem mịn.",
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 5,
    name: "Trà Vải Hoa Nhài",
    price: 33000,
    category: "Tea",
    rating: 4.8,
    desc: "Vải ngọt thanh kết hợp hương hoa nhài nhẹ nhàng.",
    imageUrl:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 6,
    name: "Cà Phê Mây",
    price: 32000,
    category: "Coffee",
    rating: 4.7,
    desc: "Cà phê đậm vừa, hậu vị êm và lớp kem mây mềm.",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
  },
];

const REVIEWS = [
  { id: 1, name: "Thảo Vy", rating: 5, text: "Dâu Kem Sữa vừa béo vừa tươi. Mình đã quay lại mua lần thứ ba rồi." },
  { id: 2, name: "Gia Hân", rating: 4, text: "Trà đào cam sả rất sáng vị, uống buổi chiều thấy nhẹ nhàng." },
  { id: 3, name: "Minh Khang", rating: 5, text: "Không gian và màu sắc rất dịu mắt, đồ uống được chuẩn bị chỉn chu." },
  { id: 4, name: "Ngọc Anh", rating: 5, text: "Matcha thanh, không quá ngọt. Mình rất thích." },
];

const DEFAULT_SETTINGS = {
  brand: "Mộc Mây",
  email: "hello@mocmay.vn",
  phone: "0900 123 456",
  address: "12 Đường Lá Nhỏ, Quận 3, TP. Hồ Chí Minh",
  hours: "Thứ Hai – Chủ Nhật · 08:00 – 21:30",
  bg: "#f7f3e9",
  green: "#315d3a",
};

const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

function App() {
  const [products, setProducts] = useState(() => read("mocProductsV2", PRODUCTS));
  const [reviews, setReviews] = useState(() => read("mocReviewsV2", REVIEWS));
  const [orders, setOrders] = useState(() => read("mocOrdersV2", []));
  const [settings, setSettings] = useState(() => read("mocSettingsV2", DEFAULT_SETTINGS));
  const [cart, setCart] = useState(() => read("mocCartV2", []));
  const [page, setPage] = useState("home");
  const [admin, setAdmin] = useState(false);
  const [edit, setEdit] = useState(null);
  const [detail, setDetail] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [menu, setMenu] = useState(false);

  const saveProducts = (v) => { setProducts(v); write("mocProductsV2", v); };
  const saveReviews = (v) => { setReviews(v); write("mocReviewsV2", v); };
  const saveOrders = (v) => { setOrders(v); write("mocOrdersV2", v); };
  const saveSettings = (v) => { setSettings(v); write("mocSettingsV2", v); };
  const saveCart = (v) => { setCart(v); write("mocCartV2", v); };

  const enterAdmin = () => {
    const password = window.prompt("Mật khẩu Admin");
    if (password === "admin123") {
      setAdmin(true);
      setPage("dashboard");
    } else if (password !== null) {
      window.alert("Sai mật khẩu");
    }
  };

  const addToCart = (product) => {
    const next = cart.some((x) => x.id === product.id)
      ? cart.map((x) => x.id === product.id ? { ...x, quantity: x.quantity + 1 } : x)
      : [...cart, { ...product, quantity: 1 }];
    saveCart(next);
    setCartOpen(true);
  };

  const changeQty = (id, quantity) => {
    saveCart(
      quantity <= 0
        ? cart.filter((x) => x.id !== id)
        : cart.map((x) => x.id === id ? { ...x, quantity } : x)
    );
  };

  const subtotal = cart.reduce((sum, x) => sum + x.price * x.quantity, 0);

  const placeOrder = (info) => {
    if (!cart.length) return;
    const order = {
      id: Date.now(),
      createdAt: new Date().toLocaleString("vi-VN"),
      customer: info.name,
      phone: info.phone,
      address: info.address,
      note: info.note,
      items: cart.map((x) => ({ id: x.id, name: x.name, price: x.price, quantity: x.quantity })),
      total: subtotal,
      status: "Mới",
    };
    saveOrders([order, ...orders]);
    saveCart([]);
    setCheckout(false);
    setCartOpen(false);
    window.alert("Đặt hàng thành công!");
  };

  const saveProduct = (product) => {
    const next = product.id
      ? products.map((x) => x.id === product.id ? product : x)
      : [...products, { ...product, id: Date.now() }];
    saveProducts(next);
    setEdit(null);
  };

  const deleteProduct = (id) => {
    if (window.confirm("Xóa sản phẩm này?")) {
      saveProducts(products.filter((x) => x.id !== id));
    }
  };

  if (admin) {
    return (
      <Admin
        page={page}
        setPage={setPage}
        setAdmin={setAdmin}
        products={products}
        reviews={reviews}
        orders={orders}
        settings={settings}
        setEdit={setEdit}
        deleteProduct={deleteProduct}
        saveProduct={saveProduct}
        saveReviews={saveReviews}
        saveOrders={saveOrders}
        saveSettings={saveSettings}
        edit={edit}
      />
    );
  }

  return (
    <div className="site" style={{ "--site-bg": settings.bg || DEFAULT_SETTINGS.bg, "--green": settings.green || DEFAULT_SETTINGS.green }}>
      <header className="siteHeader">
        <div className="nav">
          <button className="brand" onClick={() => setPage("home")}>
            <b>M</b><span>{settings.brand}</span>
          </button>

          <div className="navRight">
            <button className="cartBtn" onClick={() => setCartOpen(true)} aria-label="Giỏ hàng">
              <ShoppingCart size={20} />
              <span>{cart.reduce((s, x) => s + x.quantity, 0)}</span>
            </button>
            <button className="mobileMenu" onClick={() => setMenu(!menu)}>
              {menu ? <X /> : <Menu />}
            </button>
          </div>

          <nav className={menu ? "open" : ""}>
            <button onClick={() => { setPage("home"); setMenu(false); }}>Trang chủ</button>
            <button onClick={() => { setPage("products"); setMenu(false); }}>Sản phẩm</button>
            <button onClick={() => { setPage("reviews"); setMenu(false); }}>Đánh giá</button>
            <button onClick={() => { setPage("contact"); setMenu(false); }}>Liên hệ</button>
            <button onClick={enterAdmin}>Admin</button>
          </nav>
        </div>
      </header>

      {page === "home" && <Home products={products} reviews={reviews} setPage={setPage} add={addToCart} open={setDetail} />}
      {page === "products" && <ProductPage products={products} add={addToCart} open={setDetail} />}
      {page === "reviews" && <ReviewsPage reviews={reviews} saveReviews={saveReviews} />}
      {page === "contact" && <ContactPage settings={settings} />}
      <Footer settings={settings} />

      {detail && <ProductModal p={detail} close={() => setDetail(null)} add={() => { addToCart(detail); setDetail(null); }} />}
      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} close={() => setCartOpen(false)} changeQty={changeQty} checkout={() => setCheckout(true)} />}
      {checkout && <CheckoutModal total={subtotal} close={() => setCheckout(false)} place={placeOrder} />}
    </div>
  );
}

function Home({ products, reviews, setPage, add, open }) {
  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow">TƯƠI LÀNH · NHẸ TÊN</div>
          <h1>Một ngụm dịu dàng,<br /><span>cả ngày rạng rỡ.</span></h1>
          <p>Những thức uống tươi mới được pha bằng nguyên liệu thân quen, cân bằng vị ngon và cảm giác chăm sóc chính mình.</p>
          <div className="heroActions">
            <button className="primary" onClick={() => setPage("products")}>Khám phá menu →</button>
            <button className="outlineBtn" onClick={() => setPage("reviews")}>Đọc đánh giá</button>
          </div>
        </div>

        <div className="heroVisual">
          <div className="visualLarge">
            <img src={products[0]?.imageUrl} alt={products[0]?.name || "Mộc Mây"} />
          </div>
          <div className="visualSmall">
            <img src={products[1]?.imageUrl} alt={products[1]?.name || "Mộc Mây"} />
          </div>
        </div>
      </section>

      <section className="creamBand">
        <div className="statsRow">
          <div><b>6</b><span>Hương vị riêng</span></div>
          <div><b>4.8+</b><span>Điểm yêu thích</span></div>
          <div><b>100%</b><span>Pha mới mỗi ngày</span></div>
        </div>
      </section>

      <section className="section">
        <div className="sectionTag">ĐƯỢC YÊU THÍCH</div>
        <h2>Món dành cho hôm nay</h2>
        <div className="grid">{products.slice(0, 4).map((p) => <Card key={p.id} p={p} add={() => add(p)} open={() => open(p)} />)}</div>
      </section>

      <section className="quoteSection">
        <div>
          <div className="sectionTag light">MỘC MÂY</div>
          <h2>Không chỉ là một ly nước.<br />Đó là khoảng nghỉ của bạn.</h2>
          <p>Mộc Mây chọn cách pha vừa vặn: ít ngọt hơn, nhiều tầng vị hơn và luôn đẹp như khoảnh khắc bạn muốn giữ lại.</p>
        </div>
      </section>

      <section className="section">
        <div className="sectionTag">KHÁCH HÀNG NÓI GÌ</div>
        <h2>Những lời dịu dàng</h2>
        <div className="grid reviewGrid">{reviews.slice(0, 3).map((r) => <Review key={r.id} r={r} />)}</div>
        <button className="outlineBtn sectionButton" onClick={() => setPage("reviews")}>Xem tất cả đánh giá</button>
      </section>
    </>
  );
}

function ProductPage({ products, add, open }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const categories = ["Tất cả", ...new Set(products.map((p) => p.category))];

  const list = useMemo(() => {
    return products.filter((p) =>
      (category === "Tất cả" || p.category === category) &&
      `${p.name} ${p.desc}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query, category]);

  return (
    <section className="section pageSection">
      <div className="pageHead">
        <div><div className="sectionTag">MENU</div><h2>Tất cả sản phẩm</h2></div>
        <div className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm món..." /></div>
      </div>
      <div className="filters">{categories.map((c) => <button key={c} className={category === c ? "filter active" : "filter"} onClick={() => setCategory(c)}>{c}</button>)}</div>
      <div className="grid">{list.map((p) => <Card key={p.id} p={p} add={() => add(p)} open={() => open(p)} />)}</div>
      {!list.length && <div className="empty">Không tìm thấy sản phẩm.</div>}
    </section>
  );
}

function Card({ p, add, open }) {
  return (
    <article className="productCard" onClick={open}>
      <ProductImage p={p} />
      <div className="cardBody">
        <div className="meta"><span>{p.category}</span><span>★ {p.rating}</span></div>
        <h3>{p.name}</h3>
        <p>{p.desc}</p>
        <div className="cardBottom">
          <b>{money(p.price)}</b>
          <div>
            <button className="outlineMini" onClick={(e) => { e.stopPropagation(); open(); }}>Xem chi tiết</button>
            <button className="cartMini" onClick={(e) => { e.stopPropagation(); add(); }}><ShoppingCart size={18} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductImage({ p }) {
  return p.imageUrl
    ? <img className="pic imagePic" src={p.imageUrl} alt={p.name} />
    : <div className="pic"><ImageIcon size={30} /></div>;
}

function Review({ r }) {
  return (
    <article className="reviewCard">
      <div className="quoteMark">”</div>
      <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
      <p>“{r.text}”</p>
      <b>{r.name}</b>
      <small>Khách hàng Mộc Mây</small>
    </article>
  );
}

function ReviewsPage({ reviews, saveReviews }) {
  const [form, setForm] = useState({ name: "", rating: 5, text: "" });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    saveReviews([{ id: Date.now(), ...form, rating: Number(form.rating) }, ...reviews]);
    setForm({ name: "", rating: 5, text: "" });
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <section className="section pageSection">
      <div className="sectionTag">CỘNG ĐỒNG MỘC MÂY</div>
      <h2>Đánh giá của khách hàng</h2>
      <p className="lead">Bạn đã thử món của Mộc Mây? Hãy để lại cảm nhận của mình.</p>

      <div className="reviewLayout">
        <div className="reviewList">{reviews.map((r) => <Review key={r.id} r={r} />)}</div>
        <form className="reviewForm" onSubmit={submit}>
          <h3>Viết đánh giá</h3>
          <label>Tên của bạn<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn An" /></label>
          <label>Chấm điểm<select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5-n)} · {n} sao</option>)}
          </select></label>
          <label>Cảm nhận<textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Chia sẻ với Mộc Mây nhé..." /></label>
          <button className="primary full" type="submit"><Send size={17} /> Gửi đánh giá</button>
          {sent && <div className="success">Đã gửi đánh giá của bạn.</div>}
        </form>
      </div>
    </section>
  );
}

function ContactPage({ settings }) {
  return (
    <section className="contactPage">
      <div className="contactIntro">
        <div className="sectionTag">KẾT NỐI CÙNG MỘC MÂY</div>
        <h2>Có điều gì muốn nhắn?</h2>
        <p>Tụi mình luôn sẵn lòng lắng nghe góp ý, câu hỏi hoặc một lời chào thật dễ thương từ bạn.</p>
        <div className="contactInfo">
          <Info icon={Mail} title="Email" text={settings.email} />
          <Info icon={Phone} title="Điện thoại" text={settings.phone} />
          <Info icon={MapPin} title="Ghé Mộc Mây" text={settings.address} />
          <Info icon={Clock} title="Giờ mở cửa" text={settings.hours} />
        </div>
      </div>

      <form className="contactForm" onSubmit={(e) => { e.preventDefault(); alert("Đã gửi lời nhắn!"); e.currentTarget.reset(); }}>
        <label>Tên của bạn<input required placeholder="Nguyễn An" /></label>
        <label>Email<input required type="email" placeholder="ban@email.com" /></label>
        <label>Chủ đề<input required placeholder="Mình muốn hỏi về..." /></label>
        <label>Lời nhắn<textarea required placeholder="Chia sẻ với Mộc Mây nhé..." /></label>
        <button className="primary" type="submit"><Send size={17} /> Gửi lời nhắn</button>
      </form>
    </section>
  );
}

function Info({ icon: Icon, title, text }) {
  return <div className="infoItem"><Icon size={25} /><div><b>{title}</b><span>{text}</span></div></div>;
}

function Footer({ settings }) {
  return (
    <footer>
      <div><h3>{settings.brand}</h3><p>Một chút dịu dàng trong từng ly, được pha từ nguyên liệu gần gũi và cảm hứng chăm sóc bản thân.</p></div>
      <div className="footerLinks"><span>Sản phẩm</span><span>Đánh giá</span><span>Liên hệ</span></div>
      <div className="copyright">© 2026 {settings.brand}. Dịu lành mỗi ngày.</div>
    </footer>
  );
}

function ProductModal({ p, close, add }) {
  return (
    <div className="overlay">
      <div className="modal detailModal">
        <button className="close" onClick={close}><X /></button>
        <ProductImage p={p} />
        <div className="meta"><span>{p.category}</span><span>★ {p.rating}</span></div>
        <h2>{p.name}</h2><p>{p.desc}</p><b className="price">{money(p.price)}</b>
        <button className="primary full" onClick={add}><ShoppingCart size={17} /> Thêm vào giỏ</button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, subtotal, close, changeQty, checkout }) {
  return (
    <div className="drawerOverlay" onClick={close}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawerHead"><h2>Giỏ hàng</h2><button onClick={close}><X /></button></div>
        {!cart.length ? <div className="empty">Giỏ hàng đang trống.</div> : <>
          {cart.map((x) => <div className="cartItem" key={x.id}>
            <ProductImage p={x} />
            <div className="cartInfo"><b>{x.name}</b><small>{money(x.price)}</small>
              <div className="qty">
                <button onClick={() => changeQty(x.id, x.quantity - 1)}><Minus size={15} /></button>
                <span>{x.quantity}</span>
                <button onClick={() => changeQty(x.id, x.quantity + 1)}><Plus size={15} /></button>
              </div>
            </div>
          </div>)}
          <div className="cartTotal"><span>Tạm tính</span><b>{money(subtotal)}</b></div>
          <button className="primary full" onClick={checkout}>Đặt hàng</button>
        </>}
      </aside>
    </div>
  );
}

function CheckoutModal({ total, close, place }) {
  const [info, setInfo] = useState({ name: "", phone: "", address: "", note: "" });
  const update = (e) => setInfo({ ...info, [e.target.name]: e.target.value });

  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" onClick={close}><X /></button>
        <h2>Thông tin đặt hàng</h2>
        <input name="name" placeholder="Họ và tên" value={info.name} onChange={update} />
        <input name="phone" placeholder="Số điện thoại" value={info.phone} onChange={update} />
        <input name="address" placeholder="Địa chỉ giao hàng" value={info.address} onChange={update} />
        <textarea name="note" placeholder="Ghi chú" value={info.note} onChange={update} />
        <p>Tổng thanh toán: <b>{money(total)}</b></p>
        <button className="primary full" onClick={() => {
          if (!info.name || !info.phone || !info.address) {
            alert("Vui lòng nhập đủ thông tin");
            return;
          }
          place(info);
        }}>Xác nhận đặt hàng</button>
      </div>
    </div>
  );
}

function Admin(props) {
  const { page, setPage, setAdmin, products, reviews, orders, settings, setEdit, deleteProduct, saveProduct, saveReviews, saveOrders, saveSettings, edit } = props;

  return (
    <div className="admin">
      <aside>
        <h2>Mộc Mây Admin</h2>
        {[
          ["dashboard", "Tổng quan", Settings],
          ["products", "Sản phẩm", Package],
          ["orders", "Đơn hàng", Package],
          ["reviews", "Đánh giá", MessageSquare],
          ["settings", "Cài đặt", Settings],
        ].map(([id, label, Icon]) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}><Icon size={17} />{label}</button>
        ))}
        <button onClick={() => setAdmin(false)}><LogOut size={17} />Về cửa hàng</button>
      </aside>

      <main>
        {page === "dashboard" && <>
          <h1>📊 Tổng quan</h1>
          <div className="stats adminStats">
            <div>Sản phẩm<b>{products.length}</b></div>
            <div>Đơn hàng<b>{orders.length}</b></div>
            <div>Đánh giá<b>{reviews.length}</b></div>
          </div>
        </>}

        {page === "products" && <>
          <div className="title"><h1>🛍️ Sản phẩm</h1><button className="primary" onClick={() => setEdit("new")}><Plus /> Thêm</button></div>
          <table><thead><tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Danh mục</th><th></th></tr></thead>
            <tbody>{products.map((p) => <tr key={p.id}>
              <td>{p.imageUrl ? <img className="thumb" src={p.imageUrl} alt="" /> : <ImageIcon size={18} />}</td>
              <td>{p.name}</td><td>{money(p.price)}</td><td>{p.category}</td>
              <td><button onClick={() => setEdit(p)}><Pencil size={15} /></button><button onClick={() => deleteProduct(p.id)}><Trash2 size={15} /></button></td>
            </tr>)}</tbody>
          </table>
        </>}

        {page === "orders" && <Orders orders={orders} setOrders={saveOrders} />}
        {page === "reviews" && <ReviewsAdmin reviews={reviews} setReviews={saveReviews} />}
        {page === "settings" && <SettingsPage settings={settings} setSettings={saveSettings} />}
      </main>

      {edit && <ProductEditor value={edit === "new" ? null : edit} close={() => setEdit(null)} save={saveProduct} />}
    </div>
  );
}

function Orders({ orders, setOrders }) {
  const total = orders.reduce((s, o) => s + o.total, 0);
  return <>
    <div className="title"><h1>📦 Đơn hàng</h1><b>Tổng: {money(total)}</b></div>
    {!orders.length ? <div className="empty">Chưa có đơn hàng.</div> : <div>
      {orders.map((o) => <div className="orderCard" key={o.id}>
        <div><b>#{o.id}</b> · {o.customer} · {o.phone}<small>{o.createdAt} · {o.address}</small>
          {o.items?.map((i) => <div key={i.id}>{i.name} × {i.quantity}</div>)}
        </div>
        <div><b>{money(o.total)}</b>
          <select value={o.status} onChange={(e) => setOrders(orders.map(x => x.id === o.id ? { ...x, status: e.target.value } : x))}>
            <option>Mới</option><option>Đang chuẩn bị</option><option>Đang giao</option><option>Hoàn thành</option><option>Đã hủy</option>
          </select>
        </div>
      </div>)}
    </div>}
  </>;
}

function ReviewsAdmin({ reviews, setReviews }) {
  return <>
    <h1>⭐ Đánh giá</h1>
    {reviews.map((r) => <div className="card reviewAdmin" key={r.id}>
      <div><b>{r.name}</b> · {r.rating}★<p>{r.text}</p></div>
      <button onClick={() => setReviews(reviews.filter(x => x.id !== r.id))}><Trash2 size={16} /></button>
    </div>)}
  </>;
}

function SettingsPage({ settings, setSettings }) {
  const [s, setS] = useState(settings);
  const update = (key) => (e) => setS({ ...s, [key]: e.target.value });

  return <>
    <h1>⚙️ Cài đặt cửa hàng</h1>
    <div className="card settingsCard">
      <label>Tên thương hiệu<input value={s.brand} onChange={update("brand")} /></label>
      <label>Gmail / Email<input type="email" value={s.email} onChange={update("email")} /></label>
      <label>Số điện thoại<input value={s.phone} onChange={update("phone")} /></label>
      <label>Địa chỉ<input value={s.address} onChange={update("address")} /></label>
      <label>Giờ mở cửa<input value={s.hours} onChange={update("hours")} /></label>
      <label>Màu nền<input type="color" value={s.bg} onChange={update("bg")} /></label>
      <label>Màu xanh chủ đạo<input type="color" value={s.green} onChange={update("green")} /></label>
      <button className="primary" onClick={() => { setSettings(s); alert("Đã lưu cài đặt"); }}>Lưu cài đặt</button>
      <p>Mật khẩu Admin hiện tại: <b>admin123</b></p>
    </div>
  </>;
}

function ProductEditor({ value, close, save }) {
  const [p, setP] = useState(value || {
    name: "", price: 30000, category: "Tea", rating: 5, desc: "", imageUrl: ""
  });

  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" onClick={close}><X /></button>
        <h2>{value ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
        <input placeholder="Tên sản phẩm" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} />
        <input type="number" placeholder="Giá" value={p.price} onChange={e => setP({ ...p, price: Number(e.target.value) })} />
        <input placeholder="Danh mục" value={p.category} onChange={e => setP({ ...p, category: e.target.value })} />
        <input type="number" min="0" max="5" step="0.1" placeholder="Rating" value={p.rating} onChange={e => setP({ ...p, rating: Number(e.target.value) })} />
        <input placeholder="URL hình ảnh sản phẩm" value={p.imageUrl || ""} onChange={e => setP({ ...p, imageUrl: e.target.value })} />
        {p.imageUrl && <img className="previewImg" src={p.imageUrl} alt="Xem trước" />}
        <textarea placeholder="Mô tả" value={p.desc} onChange={e => setP({ ...p, desc: e.target.value })} />
        <button className="primary" onClick={() => {
          if (!p.name.trim()) return alert("Nhập tên sản phẩm");
          save(p);
        }}>Lưu</button>
        <button onClick={close}>Hủy</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
