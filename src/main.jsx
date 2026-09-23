import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShoppingCart, Package, MessageSquare, Settings, Plus, Pencil, Trash2,
  LogOut, Menu, X, Search, Minus, Image as ImageIcon, Send,
  MapPin, Phone, Mail, Clock, LockKeyhole, KeyRound
} from "lucide-react";
import "./styles.css";
import { initSentry } from "./monitoring/sentry";

initSentry();
import { supabase } from "./supabase";

const PRODUCTS = [
  { id: 1, name: "Matcha Latte Mây Xanh", price: 30000, category: "Tea", rating: 4.9, desc: "Matcha thanh dịu, sữa tươi béo nhẹ và lớp mây kem mịn.", imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=1200&q=85" },
  { id: 2, name: "Trà Đào Cam Sả Mây", price: 30000, category: "Tea", rating: 4.9, desc: "Trà đào cam sả tươi sáng vị, cân bằng và dễ uống.", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85" },
  { id: 3, name: "Cacao Muối Biển Chill", price: 30000, category: "Cacao", rating: 4.7, desc: "Cacao đậm vị cân bằng với lớp kem muối biển dịu mềm.", imageUrl: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=1200&q=85" },
  { id: 4, name: "Dâu Kem Sữa Mộng Mơ", price: 30000, category: "Milk", rating: 4.8, desc: "Dâu tươi chua ngọt cùng sữa và lớp kem mịn.", imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=85" },
  { id: 5, name: "Trà Vải Hoa Nhài", price: 33000, category: "Tea", rating: 4.8, desc: "Vải ngọt thanh kết hợp hương hoa nhài nhẹ nhàng.", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85" },
  { id: 6, name: "Cà Phê Mây", price: 32000, category: "Coffee", rating: 4.7, desc: "Cà phê đậm vừa, hậu vị êm và lớp kem mây mềm.", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85" }
];

const REVIEWS = [
  { id: 1, name: "Thảo Vy", rating: 5, text: "Dâu Kem Sữa vừa béo vừa tươi. Mình đã quay lại mua lần thứ ba rồi." },
  { id: 2, name: "Gia Hân", rating: 4, text: "Trà đào cam sả rất sáng vị, uống buổi chiều thấy nhẹ nhàng." },
  { id: 3, name: "Minh Khang", rating: 5, text: "Không gian và màu sắc rất dịu mắt, đồ uống được chuẩn bị chỉn chu." },
  { id: 4, name: "Ngọc Anh", rating: 5, text: "Matcha thanh, không quá ngọt. Mình rất thích." }
];

const DEFAULT_SETTINGS = {
  brand: "Mộc Mây",
  email: "hello@mocmay.vn",
  phone: "0900 123 456",
  address: "12 Đường Lá Nhỏ, Quận 3, TP. Hồ Chí Minh",
  hours: "Thứ Hai – Chủ Nhật · 08:00 – 21:30",
  bg: "#f7f3e9",
  green: "#315d3a"
};

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const PRODUCT_IMAGE_BUCKET = "product-images";

const normalizeProductPrice = (value) => {
  const price = Number(value || 0);
  if (price >= 1000000 && price <= 100000000) return Math.round(price / 1000);
  return Math.round(price);
};

const placeholderImage = (name = "Mộc Mây") => {
  const safe = String(name).slice(0, 28).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700"><rect width="900" height="700" fill="#ebe8dc"/><circle cx="450" cy="300" r="82" fill="#315d3a"/><text x="450" y="325" text-anchor="middle" font-size="92" font-family="Georgia,serif" fill="#fff">M</text><text x="450" y="470" text-anchor="middle" font-size="38" font-family="Arial,sans-serif" fill="#315d3a">${safe}</text><text x="450" y="520" text-anchor="middle" font-size="24" font-family="Arial,sans-serif" fill="#6d756b">Ảnh sản phẩm Mộc Mây</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

const compressProductImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Trình duyệt không hỗ trợ xử lý ảnh."));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Không thể nén ảnh.")),
          "image/jpeg",
          0.82
        );
      };
      image.onerror = () => reject(new Error("Không đọc được ảnh."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Không đọc được tệp ảnh."));
    reader.readAsDataURL(file);
  });

function App() {
  const [products, setProducts] = useState(() => read("mocProductsV2", PRODUCTS));
  const [reviews, setReviews] = useState(() => read("mocReviewsV3", read("mocReviewsV2", REVIEWS)));
  const [orders, setOrders] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [settings, setSettings] = useState(() => read("mocSettingsV2", DEFAULT_SETTINGS));
  const [cart, setCart] = useState(() => read("mocCartV2", []));
  const [page, setPage] = useState("home");
  const [admin, setAdmin] = useState(false);
  const [edit, setEdit] = useState(null);
  const [detail, setDetail] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [menu, setMenu] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const saveProducts = async (v) => { setProducts(v); write("mocProductsV2", v); };
  const saveReviews = (v) => { setReviews(v); write("mocReviewsV3", v); write("mocReviewsV2", v); };
  const saveSettings = async (v) => {
    const next = { ...DEFAULT_SETTINGS, ...v };
    const { error } = await supabase.from("store_settings").upsert({
      id: 1, brand: next.brand, email: next.email, phone: next.phone,
      address: next.address, hours: next.hours, bg: next.bg, green: next.green, layout: next.layout || "soft"
    });
    if (error) { alert("Không lưu được cài đặt: " + error.message); return false; }
    setSettings(next);
    write("mocSettingsV2", next);
    return true;
  };
  const saveCart = (v) => { setCart(v); write("mocCartV2", v); };

  const mapOrder = (row) => ({
    id: row.id,
    createdAtISO: row.created_at,
    createdAt: new Date(row.created_at).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh"
    }),
    customer: row.customer_name,
    phone: row.phone,
    address: row.address,
    note: row.note || "",
    items: row.items || [],
    total: row.total,
    status: row.status
  });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setLoginOpen(false);
        setForgotOpen(false);
        setResetOpen(true);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active || error) return;
      const role = data?.user?.app_metadata?.role;
      if (role === "admin") {
        setAdmin(true);
        setPage("orders");
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadCatalog = async () => {
      const { data, error } = await supabase
        .from("product_catalog")
        .select("id,name,price,category,rating,description,image_url")
        .eq("active", true)
        .order("id", { ascending: true });
      if (cancelled || error || !data?.length) return;
      const list = data.map((p) => ({
        id: p.id, name: p.name, price: normalizeProductPrice(p.price), category: p.category,
        rating: Number(p.rating), desc: p.description, imageUrl: p.image_url || ""
      }));
      setProducts(list);
      write("mocProductsV2", list);
    };
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("brand,email,phone,address,hours,bg,green,layout")
        .eq("id", 1)
        .maybeSingle();
      if (cancelled || error || !data) return;
      const next = { ...DEFAULT_SETTINGS, ...data };
      setSettings(next);
      write("mocSettingsV2", next);
    };
    loadCatalog();
    loadSettings();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let channel;
    const loadReviews = async () => {
      const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (data) {
        const list = data.map(r => ({ id:r.id, name:r.name, rating:r.rating, text:r.text, createdAt:r.created_at }));
        setReviews(list);
        write("mocReviewsV3", list);
      }
    };
    loadReviews();
    channel = supabase.channel("moc-may-reviews")
      .on("postgres_changes", {event:"INSERT", schema:"public", table:"reviews"}, payload => {
        const r = payload.new;
        setReviews(current => {
          const next = [{id:r.id,name:r.name,rating:r.rating,text:r.text,createdAt:r.created_at}, ...current.filter(x => x.id !== r.id)];
          write("mocReviewsV3", next);
          return next;
        });
      })
      .on("postgres_changes", {event:"DELETE", schema:"public", table:"reviews"}, payload => {
        setReviews(current => {
          const next = current.filter(x => x.id !== payload.old.id);
          write("mocReviewsV3", next);
          return next;
        });
      })
      .subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!admin) return;

    let channel;
    let cancelled = false;

    const loadOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        alert("Không tải được đơn hàng: " + error.message);
        return;
      }

      const list = (data || []).map(mapOrder);
      setOrders(list);
    };

    loadOrders();
    const loadContactMessages = async () => {
      const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (!cancelled && data) setContactMessages(data);
    };
    loadContactMessages();

    channel = supabase
      .channel("moc-may-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const incoming = mapOrder(payload.new);
          setOrders((current) => {
            const next = [incoming, ...current.filter((x) => x.id !== incoming.id)];
            return next;
          });

          if (
            document.visibilityState !== "visible" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification("Mộc Mây – Có đơn mới", {
                body: `${incoming.customer} · ${money(incoming.total)}`
              });
            } catch {}
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const incoming = mapOrder(payload.new);
          setOrders((current) => {
            const next = current.map((x) => x.id === incoming.id ? incoming : x);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((current) => {
            const next = current.filter((x) => x.id !== payload.old.id);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [admin]);

  const sendContactMessage = async (info) => {
    const name = String(info.name || "").trim();
    const email = String(info.email || "").trim();
    const subject = String(info.subject || "").trim();
    const message = String(info.message || "").trim();
    if (name.length < 2 || name.length > 100) throw new Error("Tên không hợp lệ.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) throw new Error("Email không hợp lệ.");
    if (subject.length < 2 || subject.length > 160) throw new Error("Chủ đề không hợp lệ.");
    if (message.length < 5 || message.length > 2000) throw new Error("Lời nhắn phải từ 5–2000 ký tự.");
    const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });
    if (error) throw new Error("Chưa gửi được lời nhắn. Vui lòng thử lại sau.");
  };

  const enterAdmin = async () => {
    const { data, error } = await supabase.auth.getUser();
    const role = data?.user?.app_metadata?.role;

    if (!error && role === "admin") {
      setAdmin(true);
      setPage("orders");
      if ("Notification" in window && Notification.permission === "default") {
        try { await Notification.requestPermission(); } catch {}
      }
    } else {
      setLoginOpen(true);
    }
  };

  const loginAdmin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      throw new Error(
        error.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng."
          : error.message
      );
    }

    const role = data?.user?.app_metadata?.role;

    if (role !== "admin") {
      await supabase.auth.signOut();
      throw new Error("Tài khoản này không có quyền Admin.");
    }

    setLoginOpen(false);
    setAdmin(true);
    setPage("orders");
    if ("Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
  };

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: window.location.origin + window.location.pathname
      }
    );

    if (error) throw new Error(error.message);
  };

  const updateAdminPassword = async (password) => {
    if (password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw new Error(error.message);

    setResetOpen(false);
    setAdmin(true);
    setPage("orders");
    window.history.replaceState({}, document.title, window.location.pathname);
    alert("Đổi mật khẩu thành công!");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdmin(false);
    setPage("home");
  };

  const updateOrderStatus = async (id, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Không cập nhật được đơn: " + error.message);
      return;
    }

    setOrders((current) => {
      const next = current.map((x) => x.id === id ? { ...x, status } : x);
      return next;
    });
  };

  const deleteOrder = async (id) => {
    const order = orders.find((x) => x.id === id);
    const label = order ? `Đơn #${order.id}` : "đơn hàng này";

    if (!window.confirm(`Bạn có chắc muốn xóa ${label}?\n\nThao tác này sẽ xóa đơn khỏi hệ thống và doanh thu theo ngày sẽ được tính lại.`)) {
      return;
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Không xóa được đơn: " + error.message);
      return;
    }

    setOrders((current) => {
      const next = current.filter((x) => x.id !== id);
      return next;
    });
  };

  const addToCart = (product) => {
    const next = cart.some((x) => x.id === product.id)
      ? cart.map((x) =>
          x.id === product.id
            ? { ...x, quantity: x.quantity + 1 }
            : x
        )
      : [...cart, { ...product, quantity: 1 }];

    saveCart(next);
    setCartOpen(true);
  };

  const changeQty = (id, quantity) => {
    saveCart(
      quantity <= 0
        ? cart.filter((x) => x.id !== id)
        : cart.map((x) =>
            x.id === id ? { ...x, quantity } : x
          )
    );
  };

  const subtotal = cart.reduce(
    (sum, x) => sum + Number(x.price) * Number(x.quantity),
    0
  );

  const placeOrder = async (info) => {
    if (!cart.length) return;

    const name = String(info.name || "").trim();
    const phone = String(info.phone || "").trim();
    const address = String(info.address || "").trim();
    const note = String(info.note || "").trim();
    const phoneOk = /^(?:0|\+84)[0-9 .-]{8,16}$/.test(phone);

    if (name.length < 2 || name.length > 100) {
      alert("Vui lòng nhập họ tên từ 2–100 ký tự.");
      return;
    }
    if (!phoneOk) {
      alert("Vui lòng kiểm tra số điện thoại.");
      return;
    }
    if (address.length < 5 || address.length > 300) {
      alert("Vui lòng nhập địa chỉ từ 5–300 ký tự.");
      return;
    }
    if (note.length > 500) {
      alert("Ghi chú không được vượt quá 500 ký tự.");
      return;
    }

    const items = cart.slice(0, 30).map((x) => ({
      id: x.id,
      name: String(x.name).slice(0, 200),
      price: Math.max(0, Math.round(Number(x.price) || 0)),
      quantity: Math.min(99, Math.max(1, Math.round(Number(x.quantity) || 1)))
    }));

    const safeTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const payload = {
      customer_name: name,
      phone,
      address,
      note,
      items,
      total: safeTotal,
      status: "Mới"
    };

    const { error } = await supabase.from("orders").insert(payload);

    if (error) {
      console.error("Order insert failed", error);
      alert("Chưa gửi được đơn hàng. Vui lòng thử lại sau.");
      return;
    }

    saveCart([]);
    setCheckout(false);
    setCartOpen(false);
    alert("Đặt hàng thành công! Mộc Mây đã nhận đơn của bạn.");
  };

  const saveProduct = async (product) => {
    const value = {
      ...product,
      name: String(product.name || "").trim(),
      desc: String(product.desc || "").trim(),
      category: String(product.category || "Tea").trim().slice(0, 50),
      imageUrl: String(product.imageUrl || "").trim(),
      price: Math.round(Number(product.price) || 0),
      rating: Number(product.rating)
    };

    if (value.name.length < 2 || value.name.length > 120) { alert("Tên sản phẩm không hợp lệ."); return; }
    if (value.price < 0 || value.price > 100000000) { alert("Giá sản phẩm không hợp lệ."); return; }
    if (value.rating < 0 || value.rating > 5) { alert("Rating phải từ 0 đến 5."); return; }

    const row = {
      ...(value.id ? { id: value.id } : {}),
      name: value.name, price: value.price, category: value.category,
      rating: value.rating, description: value.desc, image_url: value.imageUrl, active: true
    };
    const result = value.id
      ? await supabase.from("product_catalog").upsert(row).select().single()
      : await supabase.from("product_catalog").insert(row).select().single();
    if (result.error || !result.data) {
      alert("Không lưu được sản phẩm: " + (result.error?.message || "Lỗi hệ thống"));
      return;
    }
    const saved = { id: result.data.id, name: result.data.name, price: Number(result.data.price), category: result.data.category, rating: Number(result.data.rating), desc: result.data.description, imageUrl: result.data.image_url || "" };
    const next = value.id ? products.map((x) => x.id === saved.id ? saved : x) : [...products, saved];
    await saveProducts(next);
    setEdit(null);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Ẩn sản phẩm này khỏi cửa hàng? Các đơn cũ vẫn được giữ nguyên.")) return;
    const { error } = await supabase.from("product_catalog").update({ active: false }).eq("id", id);
    if (error) { alert("Không thể xóa sản phẩm: " + error.message); return; }
    await saveProducts(products.filter((x) => x.id !== id));
  };

  const deleteReview = async (id) => {
    if (!confirm("Xóa đánh giá này?")) return;
    const previous = reviews;
    saveReviews(reviews.filter(x => x.id !== id));
    if (typeof id === "number") {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) {
        saveReviews(previous);
        alert("Không xóa được đánh giá. Vui lòng thử lại.");
      }
    }
  };

  if (admin) {
    return (
      <Admin
        page={page}
        setPage={setPage}
        logout={logout}
        products={products}
        reviews={reviews}
        orders={orders}
        settings={settings}
        setEdit={setEdit}
        deleteProduct={deleteProduct}
        saveProduct={saveProduct}
        deleteReview={deleteReview}
        updateOrderStatus={updateOrderStatus}
        deleteOrder={deleteOrder}
        saveSettings={saveSettings}
        contactMessages={contactMessages}
        edit={edit}
      />
    );
  }

  return (
    <div
      className={`site layout-${settings.layout || "soft"}`}
      style={{
        "--site-bg": settings.bg || DEFAULT_SETTINGS.bg,
        "--green": settings.green || DEFAULT_SETTINGS.green
      }}
    >
      <header className="siteHeader">
        <div className="nav">
          <button className="brand" onClick={() => setPage("home")}>
            <b>M</b>
            <span>{settings.brand}</span>
          </button>

          <div className="navRight">
            <button
              className="cartBtn"
              onClick={() => setCartOpen(true)}
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={20} />
              <span>
                {cart.reduce((s, x) => s + Number(x.quantity), 0)}
              </span>
            </button>

            <button
              className="mobileMenu"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>

          <nav className={menu ? "open" : ""}>
            <button onClick={() => { setPage("home"); setMenu(false); }}>
              Trang chủ
            </button>
            <button onClick={() => { setPage("products"); setMenu(false); }}>
              Sản phẩm
            </button>
            <button onClick={() => { setPage("reviews"); setMenu(false); }}>
              Đánh giá
            </button>
            <button onClick={() => { setPage("contact"); setMenu(false); }}>
              Liên hệ
            </button>
            <button onClick={() => { setMenu(false); enterAdmin(); }}>
              Admin
            </button>
          </nav>
        </div>
      </header>

      {page === "home" && (
        <Home
          products={products}
          reviews={reviews}
          setPage={setPage}
          add={addToCart}
          open={setDetail}
        />
      )}

      {page === "products" && (
        <ProductPage
          products={products}
          add={addToCart}
          open={setDetail}
        />
      )}

      {page === "reviews" && (
        <ReviewsPage
          reviews={reviews}
          saveReviews={saveReviews}
        />
      )}

      {page === "contact" && <ContactPage settings={settings} sendMessage={sendContactMessage} />}

      <Footer settings={settings} />

      {detail && (
        <ProductModal
          p={detail}
          close={() => setDetail(null)}
          add={() => {
            addToCart(detail);
            setDetail(null);
          }}
        />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          subtotal={subtotal}
          close={() => setCartOpen(false)}
          changeQty={changeQty}
          checkout={() => {
            if (cart.length) setCheckout(true);
          }}
        />
      )}

      {checkout && (
        <CheckoutModal
          total={subtotal}
          close={() => setCheckout(false)}
          place={placeOrder}
        />
      )}

      {loginOpen && (
        <AdminLoginModal
          close={() => setLoginOpen(false)}
          login={loginAdmin}
          forgotPassword={() => {
            setLoginOpen(false);
            setForgotOpen(true);
          }}
        />
      )}

      {forgotOpen && (
        <ForgotPasswordModal
          close={() => setForgotOpen(false)}
          send={sendPasswordReset}
        />
      )}

      {resetOpen && (
        <ResetPasswordModal updatePassword={updateAdminPassword} />
      )}
    </div>
  );
}

function Home({ products, reviews, setPage, add, open }) {
  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow">TƯƠI LÀNH · NHẸ TÊN</div>
          <h1>
            Một ngụm dịu dàng,
            <br />
            <span>cả ngày rạng rỡ.</span>
          </h1>
          <p>
            Những thức uống tươi mới được pha bằng nguyên liệu thân quen,
            cân bằng vị ngon và cảm giác chăm sóc chính mình.
          </p>

          <div className="heroActions">
            <button className="primary" onClick={() => setPage("products")}>
              Khám phá menu →
            </button>
            <button className="outlineBtn" onClick={() => setPage("reviews")}>
              Đọc đánh giá
            </button>
          </div>
        </div>

        <div className="heroVisual">
          <div className="visualLarge">
            <img src={products[0]?.imageUrl} alt={products[0]?.name || ""} />
          </div>
          <div className="visualSmall">
            <img src={products[1]?.imageUrl} alt={products[1]?.name || ""} />
          </div>
        </div>
      </section>

      <section className="creamBand">
        <div className="statsRow">
          <div>
            <b>{products.length}</b>
            <span>Hương vị riêng</span>
          </div>
          <div>
            <b>4.8+</b>
            <span>Điểm yêu thích</span>
          </div>
          <div>
            <b>100%</b>
            <span>Pha mới mỗi ngày</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionTag">ĐƯỢC YÊU THÍCH</div>
        <h2>Món dành cho hôm nay</h2>

        <div className="grid">
          {products.slice(0, 4).map((p) => (
            <Card
              key={p.id}
              p={p}
              add={() => add(p)}
              open={() => open(p)}
            />
          ))}
        </div>
      </section>

      <section className="section trustSection" aria-labelledby="trust-title">
        <div className="sectionTag">MINH BẠCH & TIN CẬY</div>
        <h2 id="trust-title">Điều Mộc Mây luôn rõ ràng với bạn</h2>
        <div className="grid trustGrid">
          <article className="trustCard">
            <div className="trustIcon">01</div>
            <h3>Thông tin sản phẩm</h3>
            <p>Mỗi món có tên, danh mục, giá, mô tả và hình ảnh để bạn dễ xem trước khi đặt.</p>
          </article>
          <article className="trustCard">
            <div className="trustIcon">02</div>
            <h3>Đánh giá cộng đồng</h3>
            <p>Bạn có thể gửi đánh giá trực tiếp trên website. Đánh giá được lưu và hiển thị từ hệ thống của Mộc Mây.</p>
          </article>
          <article className="trustCard">
            <div className="trustIcon">03</div>
            <h3>Đặt hàng minh bạch</h3>
            <p>Giỏ hàng hiển thị số lượng và tạm tính trước khi bạn gửi thông tin đặt hàng.</p>
          </article>
          <article className="trustCard">
            <div className="trustIcon">04</div>
            <h3>Liên hệ trực tiếp</h3>
            <p>Thông tin email, điện thoại, địa chỉ và giờ mở cửa được công khai để bạn dễ kết nối.</p>
          </article>
        </div>
      </section>

      <section className="section aboutSection" aria-labelledby="about-title">
        <div className="sectionTag">VỀ MỘC MÂY</div>
        <h2 id="about-title">Một thương hiệu nhỏ, đặt sự dịu dàng vào từng ly</h2>
        <p className="lead">Mộc Mây tập trung vào những thức uống dễ uống, hình ảnh nhẹ nhàng và trải nghiệm đặt hàng rõ ràng. Nội dung trên website được xây dựng để bạn có thể xem thông tin món, tham khảo đánh giá và liên hệ với Mộc Mây trước khi mua.</p>
      </section>

      <section className="quoteSection">
        <div>
          <div className="sectionTag light">MỘC MÂY</div>
          <h2>
            Không chỉ là một ly nước.
            <br />
            Đó là khoảng nghỉ của bạn.
          </h2>
          <p>
            Mộc Mây chọn cách pha vừa vặn: ít ngọt hơn, nhiều tầng vị hơn
            và luôn đẹp như khoảnh khắc bạn muốn giữ lại.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="sectionTag">KHÁCH HÀNG NÓI GÌ</div>
        <h2>Những lời dịu dàng</h2>

        <div className="grid reviewGrid">
          {reviews.slice(0, 3).map((r) => (
            <Review key={r.id} r={r} />
          ))}
        </div>

        <button
          className="outlineBtn sectionButton"
          onClick={() => setPage("reviews")}
        >
          Xem tất cả đánh giá
        </button>
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
        <div>
          <div className="sectionTag">MENU</div>
          <h2>Tất cả sản phẩm</h2>
        </div>

        <div className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm món..."
          />
        </div>
      </div>

      <div className="filters">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "filter active" : "filter"}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid">
        {list.map((p) => (
          <Card
            key={p.id}
            p={p}
            add={() => add(p)}
            open={() => open(p)}
          />
        ))}
      </div>

      {!list.length && <div className="empty">Không tìm thấy sản phẩm.</div>}
    </section>
  );
}

function Card({ p, add, open }) {
  return (
    <article className="productCard" onClick={open}>
      <ProductImage p={p} />

      <div className="cardBody">
        <div className="meta">
          <span>{p.category}</span>
          <span>★ {p.rating}</span>
        </div>

        <h3>{p.name}</h3>
        <p>{p.desc}</p>

        <div className="cardBottom">
          <b>{money(p.price)}</b>

          <div>
            <button
              className="outlineMini"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              Xem chi tiết
            </button>

            <button
              className="cartMini"
              onClick={(e) => {
                e.stopPropagation();
                add();
              }}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductImage({ p }) {
  const fallback = placeholderImage(p.name);
  const [src, setSrc] = useState(p.imageUrl || fallback);

  useEffect(() => {
    setSrc(p.imageUrl || fallback);
  }, [p.imageUrl, p.name]);

  return (
    <img
      className="pic imagePic"
      src={src}
      alt={p.name}
      loading="lazy"
      decoding="async"
      onError={() => setSrc(fallback)}
    />
  );
}

function Review({ r }) {
  const rating = Number(r.rating);

  return (
    <article className="reviewCard">
      <div className="quoteMark">”</div>
      <div className="stars">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>
      <p>“{r.text}”</p>
      <b>{r.name}</b>
      <small>Khách hàng Mộc Mây</small>
    </article>
  );
}

function ReviewsPage({ reviews, saveReviews }) {
  const [form, setForm] = useState({
    name: "",
    rating: 5,
    text: ""
  });

  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const text = form.text.trim();
    const rating = Number(form.rating);
    if (name.length < 2 || name.length > 80 || text.length < 5 || text.length > 1000) {
      return;
    }

    const optimistic = {
      id: `local-${Date.now()}`,
      name,
      rating,
      text,
      createdAt: new Date().toISOString()
    };

    const previous = reviews;
    saveReviews([optimistic, ...reviews]);
    setForm({ name: "", rating: 5, text: "" });
    setSent(true);

    const { data, error } = await supabase.from("reviews").insert({
      name: optimistic.name,
      rating: optimistic.rating,
      text: optimistic.text
    }).select().single();

    if (error) {
      saveReviews(previous);
      setSent(false);
      alert("Chưa gửi được đánh giá. Vui lòng thử lại sau.");
      return;
    }

    if (data) {
      const next = [
        {id:data.id,name:data.name,rating:data.rating,text:data.text,createdAt:data.created_at},
        ...previous.filter(x => x.id !== data.id)
      ];
      saveReviews(next);
    }
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <section className="section pageSection">
      <div className="sectionTag">CỘNG ĐỒNG MỘC MÂY</div>
      <h2>Đánh giá của khách hàng</h2>
      <p className="lead">
        Bạn đã thử món của Mộc Mây? Hãy để lại cảm nhận của mình.
      </p>

      <div className="reviewLayout">
        <div className="reviewList">
          {reviews.map((r) => (
            <Review key={r.id} r={r} />
          ))}
        </div>

        <form className="reviewForm" onSubmit={submit}>
          <h3>Viết đánh giá</h3>

          <label>
            Tên của bạn
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Chấm điểm
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}
                  {"☆".repeat(5 - n)} · {n} sao
                </option>
              ))}
            </select>
          </label>

          <label>
            Cảm nhận
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              required
            />
          </label>

          <button className="primary full" type="submit">
            <Send size={17} />
            Gửi đánh giá
          </button>

          {sent && <div className="success">Đã gửi đánh giá của bạn.</div>}
        </form>
      </div>
    </section>
  );
}

function ContactPage({ settings, sendMessage }) {
  return (
    <section className="contactPage">
      <div className="contactIntro">
        <div className="sectionTag">KẾT NỐI CÙNG MỘC MÂY</div>
        <h2>Có điều gì muốn nhắn?</h2>
        <p>
          Tụi mình luôn sẵn lòng lắng nghe góp ý, câu hỏi hoặc một lời chào
          thật dễ thương từ bạn.
        </p>

        <div className="contactInfo">
          <Info icon={Mail} title="Email" text={settings.email} />
          <Info icon={Phone} title="Điện thoại" text={settings.phone} />
          <Info icon={MapPin} title="Ghé Mộc Mây" text={settings.address} />
          <Info icon={Clock} title="Giờ mở cửa" text={settings.hours} />
        </div>
      </div>

      <form
        className="contactForm"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          try {
            await sendMessage({
              name: form.get("name"), email: form.get("email"),
              subject: form.get("subject"), message: form.get("message")
            });
            alert("Đã gửi lời nhắn! Mộc Mây sẽ phản hồi khi có thể.");
            e.currentTarget.reset();
          } catch (error) {
            alert(error.message);
          }
        }}
      >
        <label>Tên của bạn<input name="name" required maxLength="100" /></label>
        <label>Email<input name="email" required type="email" maxLength="160" /></label>
        <label>Chủ đề<input name="subject" required maxLength="160" /></label>
        <label>Lời nhắn<textarea name="message" required maxLength="2000" /></label>

        <button className="primary" type="submit">
          <Send size={17} />
          Gửi lời nhắn
        </button>
      </form>
    </section>
  );
}

function Info({ icon: Icon, title, text }) {
  return (
    <div className="infoItem">
      <Icon size={25} />
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
    </div>
  );
}

function Footer({ settings }) {
  return (
    <footer>
      <div>
        <h3>{settings.brand}</h3>
        <p>
          Một chút dịu dàng trong từng ly, được pha từ nguyên liệu gần gũi
          và cảm hứng chăm sóc bản thân.
        </p>
      </div>

      <div className="footerLinks">
        <span>Sản phẩm</span>
        <span>Đánh giá</span>
        <span>Liên hệ</span>
        <span>Đặt hàng: kiểm tra thông tin trước khi xác nhận</span>
      </div>

      <div className="copyright">
        © 2026 {settings.brand}. Dịu lành mỗi ngày.
      </div>
    </footer>
  );
}

function ProductModal({ p, close, add }) {
  return (
    <div className="overlay">
      <div className="modal detailModal">
        <button className="close" onClick={close}><X /></button>
        <ProductImage p={p} />
        <div className="meta">
          <span>{p.category}</span>
          <span>★ {p.rating}</span>
        </div>
        <h2>{p.name}</h2>
        <p>{p.desc}</p>
        <h3>{money(p.price)}</h3>
        <button className="primary full" onClick={add}>
          <ShoppingCart size={18} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, subtotal, close, changeQty, checkout }) {
  return (
    <div className="overlay">
      <div className="modal cartModal">
        <button className="close" onClick={close}><X /></button>

        <h2>Giỏ hàng của bạn</h2>

        {!cart.length ? (
          <div className="empty">
            <ShoppingCart size={40} />
            <p>Giỏ hàng đang trống.</p>
          </div>
        ) : (
          <>
            <div className="cartList">
              {cart.map((item) => (
                <div className="cartItem" key={item.id}>
                  <ProductImage p={item} />

                  <div className="cartItemInfo">
                    <b>{item.name}</b>
                    <span>{money(item.price)}</span>

                    <div className="qty">
                      <button onClick={() => changeQty(item.id, item.quantity - 1)}>
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => changeQty(item.id, item.quantity + 1)}>
                        <Plus size={15} />
                      </button>

                      <button
                        className="removeBtn"
                        onClick={() => changeQty(item.id, 0)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cartTotal">
              <span>Tạm tính</span>
              <b>{money(subtotal)}</b>
            </div>

            <button className="primary full" onClick={checkout}>
              Thanh toán · Đặt hàng
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({ total, close, place }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: ""
  });

  const update = (key, value) =>
    setForm((old) => ({ ...old, [key]: value }));

  return (
    <div className="overlay">
      <div className="modal checkoutModal">
        <button className="close" onClick={close}><X /></button>

        <h2>Đặt hàng</h2>
        <p>Điền thông tin để Mộc Mây liên hệ xác nhận đơn.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            place(form);
          }}
        >
          <label>
            Họ và tên
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>

          <label>
            Số điện thoại
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>

          <label>
            Địa chỉ nhận hàng
            <textarea
              required
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </label>

          <label>
            Ghi chú
            <textarea
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
            />
          </label>

          <div className="cartTotal">
            <span>Tổng tiền</span>
            <b>{money(total)}</b>
          </div>

          <button className="primary full">
            Xác nhận đặt hàng
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminLoginModal({ close, login, forgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="modal authModal">
        <button className="close" onClick={close}><X /></button>

        <div className="authIcon"><LockKeyhole /></div>
        <h2>Đăng nhập Admin</h2>
        <p>Quản lý sản phẩm, đơn hàng, đánh giá và cài đặt.</p>

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="errorBox">{error}</div>}

          <button className="primary full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <button className="textButton" onClick={forgotPassword}>
          Quên mật khẩu?
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordModal({ close, send }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await send(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="modal authModal">
        <button className="close" onClick={close}><X /></button>

        <div className="authIcon"><Mail /></div>
        <h2>Quên mật khẩu</h2>

        {!sent ? (
          <form onSubmit={submit}>
            <p>Nhập email Admin của bạn để nhận link đặt mật khẩu mới.</p>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {error && <div className="errorBox">{error}</div>}

            <button className="primary full" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </button>
          </form>
        ) : (
          <div className="success">
            <b>Email đã được gửi.</b>
            <p>Mở Gmail và bấm link Reset Password để quay lại website.</p>
            <button className="primary full" onClick={close}>
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResetPasswordModal({ updatePassword }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirm) {
      setError("Hai mật khẩu không giống nhau.");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="modal authModal">
        <div className="authIcon"><KeyRound /></div>
        <h2>Đặt mật khẩu mới</h2>

        <form onSubmit={submit}>
          <label>
            Mật khẩu mới
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Nhập lại mật khẩu
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>

          {error && <div className="errorBox">{error}</div>}

          <button className="primary full" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Đặt mật khẩu mới"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Admin({
  page,
  setPage,
  logout,
  products,
  reviews,
  orders,
  settings,
  setEdit,
  deleteProduct,
  saveProduct,
  deleteReview,
  updateOrderStatus,
  deleteOrder,
  saveSettings,
  contactMessages,
  edit
}) {
  const tab = page === "dashboard" ? "orders" : page;
  const newCount = orders.filter((x) => x.status === "Mới").length;

  return (
    <div className="adminShell">
      <aside className="adminSide">
        <div className="adminBrand">
          <span>M</span>
          <div>
            <b>{settings.brand}</b>
            <small>Admin</small>
          </div>
        </div>

        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => setPage("orders")}
        >
          <Package />
          Đơn hàng
          {newCount > 0 && <em>{newCount}</em>}
        </button>

        <button
          className={tab === "products" ? "active" : ""}
          onClick={() => setPage("products")}
        >
          <ShoppingCart />
          Sản phẩm
        </button>

        <button
          className={tab === "reviews" ? "active" : ""}
          onClick={() => setPage("reviews")}
        >
          <MessageSquare />
          Đánh giá
        </button>

        <button
          className={tab === "contacts" ? "active" : ""}
          onClick={() => setPage("contacts")}
        >
          <Mail />
          Liên hệ
          {contactMessages.length > 0 && <em>{contactMessages.length}</em>}
        </button>

        <button
          className={tab === "settings" ? "active" : ""}
          onClick={() => setPage("settings")}
        >
          <Settings />
          Cài đặt
        </button>

        <button className="adminLogout" onClick={logout}>
          <LogOut />
          Đăng xuất
        </button>
      </aside>

      <main className="adminMain">
        <div className="adminTop">
          <div>
            <span className="sectionTag">MỘC MÂY ADMIN</span>
            <h1>
              {tab === "orders"
                ? "Quản lý đơn hàng"
                : tab === "products"
                ? "Quản lý sản phẩm"
                : tab === "reviews"
                ? "Quản lý đánh giá"
                : tab === "contacts"
                ? "Tin nhắn liên hệ"
                : "Cài đặt cửa hàng"}
            </h1>
          </div>
        </div>

        {tab === "orders" && (
          <OrdersAdmin
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            deleteOrder={deleteOrder}
          />
        )}

        {tab === "products" && (
          <ProductsAdmin
            products={products}
            setEdit={setEdit}
            deleteProduct={deleteProduct}
            saveProduct={saveProduct}
            edit={edit}
          />
        )}

        {tab === "reviews" && (
          <ReviewsAdmin
            reviews={reviews}
            deleteReview={deleteReview}
          />
        )}

        {tab === "contacts" && (
          <ContactsAdmin messages={contactMessages} setMessages={setContactMessages} />
        )}

        {tab === "settings" && (
          <SettingsAdmin
            settings={settings}
            saveSettings={saveSettings}
          />
        )}
      </main>
    </div>
  );
}

/* =========================
   ĐƠN HÀNG ADMIN
========================= */

function OrdersAdmin({ orders, updateOrderStatus, deleteOrder }) {
  const statuses = ["Mới", "Đã nhận", "Đang pha", "Đang giao", "Hoàn thành"];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [dayFilter, setDayFilter] = useState("Tất cả");

  const getDay = (order) => {
    const source = order.createdAtISO || order.createdAt;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return "Không xác định";
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(date);
  };

  const formatDay = (day) => {
    if (day === "Không xác định") return day;
    const [y, m, d] = day.split("-");
    return `${d}/${m}/${y}`;
  };

  const dayTotals = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      const day = getDay(order);
      if (!map.has(day)) map.set(day, { day, orders: 0, products: 0, completed: 0, revenue: 0 });
      const row = map.get(day);
      row.orders += 1;
      row.completed += order.status === "Hoàn thành" ? 1 : 0;
      row.revenue += Number(order.total || 0);
      row.products += (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    });
    return [...map.values()].sort((a, b) => b.day.localeCompare(a.day));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "Tất cả" || order.status === statusFilter;
      const matchesDay = dayFilter === "Tất cả" || getDay(order) === dayFilter;
      const haystack = [
        order.id, order.customer, order.phone, order.address, order.note,
        ...(order.items || []).map((item) => item.name)
      ].join(" ").toLowerCase();
      return matchesStatus && matchesDay && (!keyword || haystack.includes(keyword));
    });
  }, [orders, search, statusFilter, dayFilter]);

  const visibleTotal = filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const todaySummary = dayTotals.find((x) => x.day === today) || { orders: 0, products: 0, completed: 0, revenue: 0 };

  if (!orders.length) {
    return <div className="adminEmpty"><Package size={44} /><h3>Chưa có đơn hàng</h3><p>Khi khách đặt hàng, đơn mới sẽ xuất hiện ở đây.</p></div>;
  }

  return (
    <div className="ordersManager">
      <section className="orderSummary">
        <div className="summaryTitle">
          <div><span className="sectionTag">TỔNG KẾT HÔM NAY</span><h2>Doanh thu trong ngày</h2></div>
          <span className="summaryDate">{formatDay(today)}</span>
        </div>
        <div className="summaryGrid">
          <div className="summaryCard"><span>Đơn hàng</span><strong>{todaySummary.orders}</strong></div>
          <div className="summaryCard"><span>Sản phẩm</span><strong>{todaySummary.products}</strong></div>
          <div className="summaryCard"><span>Hoàn thành</span><strong>{todaySummary.completed}</strong></div>
          <div className="summaryCard highlight"><span>Doanh thu</span><strong>{money(todaySummary.revenue)}</strong></div>
        </div>
      </section>

      <section className="dailySummary">
        <div className="dailyHeader">
          <div><span className="sectionTag">THỐNG KÊ</span><h2>Tổng kết theo ngày</h2></div>
          <button className={dayFilter === "Tất cả" ? "filter active" : "filter"} onClick={() => setDayFilter("Tất cả")}>Tất cả ngày</button>
        </div>
        <div className="dailyTableWrap">
          <table className="dailyTable">
            <thead><tr><th>Ngày</th><th>Đơn</th><th>Sản phẩm</th><th>Hoàn thành</th><th>Doanh thu</th></tr></thead>
            <tbody>
              {dayTotals.map((row) => (
                <tr key={row.day} className={dayFilter === row.day ? "selected" : ""} onClick={() => setDayFilter(row.day)}>
                  <td><b>{formatDay(row.day)}</b></td><td>{row.orders}</td><td>{row.products}</td><td>{row.completed}</td><td><strong>{money(row.revenue)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="orderListSection">
        <div className="orderTools">
          <div><span className="sectionTag">ĐƠN HÀNG</span><h2>{dayFilter === "Tất cả" ? "Tất cả đơn hàng" : `Đơn ngày ${formatDay(dayFilter)}`}</h2></div>
          <div className="orderToolFilters">
            <div className="adminSearch"><Search size={18} /><input placeholder="Tìm đơn, tên, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Tất cả</option>{statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>

        <div className="orderResultBar">
          <span>{filteredOrders.length} đơn · Tổng {money(visibleTotal)}</span>
          {(search || statusFilter !== "Tất cả" || dayFilter !== "Tất cả") && (
            <button className="clearFilters" onClick={() => { setSearch(""); setStatusFilter("Tất cả"); setDayFilter("Tất cả"); }}>Xóa bộ lọc</button>
          )}
        </div>

        {!filteredOrders.length ? (
          <div className="adminEmpty small"><Search size={36} /><h3>Không tìm thấy đơn</h3><p>Thử thay đổi từ khóa hoặc bộ lọc.</p></div>
        ) : (
          <div className="adminOrders">
            {filteredOrders.map((order) => (
              <article className="orderCard" key={order.id}>
                <div className="orderHead">
                  <div><b>Đơn #{order.id}</b><small>{order.createdAt}</small></div>
                  <div className="orderActions">
                    <div className="orderStatusBox">
                      <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <button className="deleteOrderBtn" onClick={() => deleteOrder(order.id)} title="Xóa đơn hàng"><Trash2 size={17} /> Xóa đơn</button>
                  </div>
                </div>

                <div className="orderCustomer">
                  <div><span>👤</span><span><b>Tên:</b> {order.customer || "Không có"}</span></div>
                  <div><span>☎</span><span><b>SĐT:</b> {order.phone || "Không có"}</span></div>
                  <div><span>📍</span><span><b>Địa chỉ:</b> {order.address || "Không có"}</span></div>
                  {order.note && <div><span>📝</span><span><b>Ghi chú:</b> {order.note}</span></div>}
                </div>

                <h3 className="orderProductTitle">Chi tiết sản phẩm</h3>
                <div className="orderTableWrap">
                  <table className="orderTable">
                    <thead><tr><th>#</th><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
                    <tbody>
                      {(order.items || []).map((item, index) => {
                        const quantity = Number(item.quantity || 1);
                        const price = Number(item.price || 0);
                        return <tr key={index}><td>{index + 1}</td><td className="orderProductName">{item.name}</td><td className="orderQuantity">{quantity}</td><td>{money(price)}</td><td className="orderItemTotal">{money(quantity * price)}</td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="orderTotal"><span>Tổng cộng:</span><strong>{money(order.total)}</strong></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
function ProductsAdmin({
  products,
  setEdit,
  deleteProduct,
  saveProduct,
  edit
}) {
  return (
    <div>
      <button
        className="primary"
        onClick={() =>
          setEdit({
            name: "",
            price: 30000,
            category: "Tea",
            rating: 5,
            desc: "",
            imageUrl: ""
          })
        }
      >
        <Plus />
        Thêm sản phẩm
      </button>

      <div className="adminProductGrid">
        {products.map((p) => (
          <article className="adminProductCard" key={p.id}>
            <ProductImage p={p} />

            <div>
              <div className="meta">
                <span>{p.category}</span>
                <span>★ {p.rating}</span>
              </div>

              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <b>{money(p.price)}</b>

              <div className="adminCardActions">
                <button onClick={() => setEdit(p)}>
                  <Pencil />
                  Sửa
                </button>

                <button
                  className="danger"
                  onClick={() => deleteProduct(p.id)}
                >
                  <Trash2 />
                  Xóa
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {edit && (
        <ProductEditor
          product={edit}
          close={() => setEdit(null)}
          save={saveProduct}
        />
      )}
    </div>
  );
}

function ProductEditor({ product, close, save }) {
  const [form, setForm] = useState({
    ...product,
    price: normalizeProductPrice(product.price)
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(product.imageUrl || "");
  const inputRef = useRef(null);
  const previewObjectUrl = useRef("");

  const update = (key, value) =>
    setForm((old) => ({ ...old, [key]: value }));

  const chooseImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp ảnh.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      alert("Ảnh gốc tối đa 12 MB.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = localUrl;
    setPreview(localUrl);
    setUploading(true);

    try {
      const compressed = await compressProductImage(file);
      const safeName = String(form.name || "san-pham")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()
        .slice(0, 50) || "san-pham";
      const path = `products/${Date.now()}-${safeName}.jpg`;

      const { data, error } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(path, compressed, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: false
        });

      if (error) {
        console.error("Product image upload failed", error);
        throw new Error(
          error.message?.toLowerCase().includes("bucket")
            ? "Chưa có bucket product-images. Hãy tạo bucket và policy trong Supabase."
            : error.message
        );
      }

      const { data: publicData } = supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .getPublicUrl(data.path);

      if (!publicData?.publicUrl) {
        throw new Error("Không lấy được URL ảnh sau khi tải lên.");
      }

      update("imageUrl", publicData.publicUrl);
      setPreview(publicData.publicUrl);
    } catch (error) {
      console.error(error);
      alert("Không tải được ảnh: " + (error?.message || "Lỗi không xác định"));
      setPreview(form.imageUrl || "");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    update("imageUrl", "");
    setPreview("");
  };

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    };
  }, []);

  return (
    <div className="overlay">
      <div className="modal adminEditor">
        <button className="close" onClick={close}><X /></button>
        <h2>{form.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (uploading) return;
            save({ ...form, price: normalizeProductPrice(form.price) });
          }}
        >
          <label>
            Tên sản phẩm
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </label>

          <div className="twoCols">
            <label>
              Giá (VNĐ)
              <input
                type="number"
                min="0"
                step="1000"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
              <small style={{display:"block",marginTop:6,opacity:.7}}>Ví dụ: 35000 → 35.000đ</small>
            </label>

            <label>
              Danh mục
              <input value={form.category} onChange={(e) => update("category", e.target.value)} required />
            </label>
          </div>

          <div className="twoCols">
            <label>
              Rating
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => update("rating", e.target.value)}
              />
            </label>

            <label>
              Hình ảnh sản phẩm
              <div style={{marginTop:8,border:"1px dashed rgba(49,93,58,.45)",borderRadius:16,padding:12}}>
                <div style={{background:"#ebe8dc",borderRadius:12,overflow:"hidden",aspectRatio:"4/3",display:"grid",placeItems:"center"}}>
                  <img
                    src={preview || placeholderImage(form.name)}
                    alt="Xem trước sản phẩm"
                    style={{width:"100%",height:"100%",objectFit:"cover"}}
                    onError={(e) => { e.currentTarget.src = placeholderImage(form.name); }}
                  />
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                  <button
                    type="button"
                    className="outlineBtn"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                  >
                    <ImageIcon size={17} />
                    {uploading ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
                  </button>
                  {preview && !uploading && (
                    <button type="button" className="outlineBtn" onClick={removeImage}>
                      Xóa ảnh
                    </button>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={chooseImage}
                  style={{display:"none"}}
                />
                <small style={{display:"block",marginTop:8,opacity:.7}}>
                  Điện thoại: chọn từ Thư viện/Ảnh. Máy tính: chọn tệp. Ảnh sẽ tự nén và tải lên Supabase.
                </small>
              </div>
            </label>
          </div>

          <label>
            Mô tả
            <textarea value={form.desc} onChange={(e) => update("desc", e.target.value)} required />
          </label>

          <div className="adminFormActions">
            <button type="button" className="outlineBtn" onClick={close}>Hủy</button>
            <button className="primary" disabled={uploading}>
              {uploading ? "Đang tải ảnh..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ReviewsAdmin({ reviews, deleteReview }) {
  return (
    <div className="adminReviewList">
      {reviews.map((review) => (
        <article className="adminReviewCard" key={review.id}>
          <div>
            <b>{review.name}</b>
            <div className="stars">
              {"★".repeat(Number(review.rating))}
              {"☆".repeat(5 - Number(review.rating))}
            </div>
          </div>

          <p>{review.text}</p>

          <button
            className="dangerBtn"
            onClick={() => deleteReview(review.id)}
          >
            <Trash2 />
            Xóa
          </button>
        </article>
      ))}
    </div>
  );
}

function ContactsAdmin({ messages, setMessages }) {
  const remove = async (id) => {
    if (!confirm("Xóa tin nhắn này?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) { alert("Không xóa được tin nhắn: " + error.message); return; }
    setMessages((current) => current.filter((x) => x.id !== id));
  };

  if (!messages.length) return <div className="adminEmpty"><Mail size={42} /><h3>Chưa có tin nhắn</h3><p>Tin nhắn từ trang Liên hệ sẽ xuất hiện ở đây.</p></div>;

  return (
    <div className="adminReviewList">
      {messages.map((m) => (
        <article className="adminReviewCard" key={m.id}>
          <div>
            <b>{m.name}</b>
            <small>{new Date(m.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</small>
            <p><strong>{m.subject}</strong></p>
            <p>{m.message}</p>
            <p><a href={`mailto:${m.email}`}>{m.email}</a></p>
          </div>
          <button className="dangerBtn" onClick={() => remove(m.id)}><Trash2 /> Xóa</button>
        </article>
      ))}
    </div>
  );
}

function SettingsAdmin({ settings, saveSettings }) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const update = (key, value) =>
    setForm((old) => ({ ...old, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const ok = await saveSettings(form);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <form className="settingsForm" onSubmit={submit}>
      <div className="settingsCard">
        <h3>Thông tin cửa hàng</h3>

        <label>
          Tên thương hiệu
          <input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
          />
        </label>

        <label>
          Email
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>

        <label>
          Số điện thoại
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>

        <label>
          Địa chỉ
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </label>

        <label>
          Giờ mở cửa
          <input
            value={form.hours}
            onChange={(e) => update("hours", e.target.value)}
          />
        </label>
      </div>

      <div className="settingsCard">
        <h3>Giao diện</h3>

        <label>
          Màu nền
          <input
            value={form.bg}
            onChange={(e) => update("bg", e.target.value)}
          />
        </label>

        <label>
          Màu xanh chủ đạo
          <input
            value={form.green}
            onChange={(e) => update("green", e.target.value)}
          />
        </label>
        <label>
          Bố cục background
          <select
            value={form.layout || "soft"}
            onChange={(e) => update("layout", e.target.value)}
          >
            <option value="soft">Dịu nhẹ</option>
            <option value="editorial">Editorial</option>
            <option value="minimal">Tối giản</option>
          </select>
        </label>
      </div>

      <button className="primary">
        Lưu cài đặt
      </button>

      {saved && (
        <div className="success">
          Đã lưu cài đặt.
        </div>
      )}
    </form>
  );
}

createRoot(document.getElementById("root")).render(<App />);
