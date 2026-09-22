import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShoppingCart, Package, MessageSquare, Settings, Plus, Pencil, Trash2,
  LogOut, Menu, X, Search, Minus, Image as ImageIcon, Send,
  MapPin, Phone, Mail, Clock, LockKeyhole, KeyRound
} from "lucide-react";
import "./styles.css";
import { supabase } from "./supabase";

const ADMIN_EMAILS = ["dangthanh123tv@gmail.com"];

const PRODUCTS = [
  {id:1,name:"Matcha Latte Mây Xanh",price:30000,category:"Tea",rating:4.9,desc:"Matcha thanh dịu, sữa tươi béo nhẹ và lớp mây kem mịn.",imageUrl:"https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=1200&q=85"},
  {id:2,name:"Trà Đào Cam Sả Mây",price:30000,category:"Tea",rating:4.9,desc:"Trà đào cam sả tươi sáng vị, cân bằng và dễ uống.",imageUrl:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85"},
  {id:3,name:"Cacao Muối Biển Chill",price:30000,category:"Cacao",rating:4.7,desc:"Cacao đậm vị cân bằng với lớp kem muối biển dịu mềm.",imageUrl:"https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=1200&q=85"},
  {id:4,name:"Dâu Kem Sữa Mộng Mơ",price:30000,category:"Milk",rating:4.8,desc:"Dâu tươi chua ngọt cùng sữa và lớp kem mịn.",imageUrl:"https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=85"},
  {id:5,name:"Trà Vải Hoa Nhài",price:33000,category:"Tea",rating:4.8,desc:"Vải ngọt thanh kết hợp hương hoa nhài nhẹ nhàng.",imageUrl:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85"},
  {id:6,name:"Cà Phê Mây",price:32000,category:"Coffee",rating:4.7,desc:"Cà phê đậm vừa, hậu vị êm và lớp kem mây mềm.",imageUrl:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85"}
];

const REVIEWS = [
  {id:1,name:"Thảo Vy",rating:5,text:"Dâu Kem Sữa vừa béo vừa tươi. Mình đã quay lại mua lần thứ ba rồi."},
  {id:2,name:"Gia Hân",rating:4,text:"Trà đào cam sả rất sáng vị, uống buổi chiều thấy nhẹ nhàng."},
  {id:3,name:"Minh Khang",rating:5,text:"Không gian và màu sắc rất dịu mắt, đồ uống được chuẩn bị chỉn chu."},
  {id:4,name:"Ngọc Anh",rating:5,text:"Matcha thanh, không quá ngọt. Mình rất thích."}
];

const DEFAULT_SETTINGS = {
  brand:"Mộc Mây", email:"hello@mocmay.vn", phone:"0900 123 456",
  address:"12 Đường Lá Nhỏ, Quận 3, TP. Hồ Chí Minh",
  hours:"Thứ Hai – Chủ Nhật · 08:00 – 21:30", bg:"#f7f3e9", green:"#315d3a"
};

const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const money=n=>Number(n||0).toLocaleString("vi-VN")+"đ";

function App(){
  const [products,setProducts]=useState(()=>read("mocProductsV2",PRODUCTS));
  const [reviews,setReviews]=useState(()=>read("mocReviewsV2",REVIEWS));
  const [orders,setOrders]=useState(()=>read("mocOrdersV2",[]));
  const [settings,setSettings]=useState(()=>read("mocSettingsV2",DEFAULT_SETTINGS));
  const [cart,setCart]=useState(()=>read("mocCartV2",[]));
  const [page,setPage]=useState("home");
  const [admin,setAdmin]=useState(false);
  const [edit,setEdit]=useState(null);
  const [detail,setDetail]=useState(null);
  const [cartOpen,setCartOpen]=useState(false);
  const [checkout,setCheckout]=useState(false);
  const [menu,setMenu]=useState(false);
  const [loginOpen,setLoginOpen]=useState(false);
  const [forgotOpen,setForgotOpen]=useState(false);
  const [resetOpen,setResetOpen]=useState(false);

  const saveProducts=v=>{setProducts(v);write("mocProductsV2",v)};
  const saveReviews=v=>{setReviews(v);write("mocReviewsV2",v)};
  const saveSettings=v=>{setSettings(v);write("mocSettingsV2",v)};
  const saveCart=v=>{setCart(v);write("mocCartV2",v)};
  const mapOrder=row=>({id:row.id,createdAt:new Date(row.created_at).toLocaleString("vi-VN"),customer:row.customer_name,phone:row.phone,address:row.address,note:row.note||"",items:row.items||[],total:row.total,status:row.status});

  useEffect(()=>{
    const {data}=supabase.auth.onAuthStateChange(event=>{
      if(event==="PASSWORD_RECOVERY"){setLoginOpen(false);setForgotOpen(false);setResetOpen(true)}
    });
    return()=>data.subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      const email=data?.session?.user?.email?.toLowerCase();
      if(data?.session&&ADMIN_EMAILS.includes(email)){setAdmin(true);setPage("orders")}
    });
  },[]);

  useEffect(()=>{
    if(!admin)return;
    let channel;
    let cancelled=false;
    const load=async()=>{
      const {data,error}=await supabase.from("orders").select("*").order("created_at",{ascending:false});
      if(cancelled)return;
      if(error){alert("Không tải được đơn hàng: "+error.message);return}
      const list=(data||[]).map(mapOrder);setOrders(list);write("mocOrdersV2",list);
    };
    load();
    channel=supabase.channel("moc-may-orders")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"orders"},payload=>{
        const item=mapOrder(payload.new);
        setOrders(cur=>{const n=[item,...cur.filter(x=>x.id!==item.id)];write("mocOrdersV2",n);return n});
        if(document.visibilityState!=="visible"&&"Notification"in window&&Notification.permission==="granted")try{new Notification("Mộc Mây – Có đơn mới",{body:`${item.customer} · ${money(item.total)}`})}catch{}
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders"},payload=>{
        const item=mapOrder(payload.new);
        setOrders(cur=>{const n=cur.map(x=>x.id===item.id?item:x);write("mocOrdersV2",n);return n});
      }).subscribe();
    return()=>{cancelled=true;if(channel)supabase.removeChannel(channel)};
  },[admin]);

  const enterAdmin=async()=>{
    const {data}=await supabase.auth.getSession();
    const email=data?.session?.user?.email?.toLowerCase();
    if(data?.session&&ADMIN_EMAILS.includes(email)){setAdmin(true);setPage("orders")}else setLoginOpen(true);
  };

  const loginAdmin=async(email,password)=>{
    const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(error)throw new Error(error.message==="Invalid login credentials"?"Email hoặc mật khẩu không đúng.":error.message);
    const logged=data?.user?.email?.toLowerCase();
    if(!logged||!ADMIN_EMAILS.includes(logged)){await supabase.auth.signOut();throw new Error("Tài khoản này không có quyền Admin.")}
    setLoginOpen(false);setAdmin(true);setPage("orders");
  };

  const sendPasswordReset=async email=>{
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+window.location.pathname});
    if(error)throw new Error(error.message);
  };

  const updateAdminPassword=async password=>{
    if(password.length<6)throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
    const {error}=await supabase.auth.updateUser({password});
    if(error)throw new Error(error.message);
    setResetOpen(false);setAdmin(true);setPage("orders");
    window.history.replaceState({},document.title,window.location.pathname);
    alert("Đổi mật khẩu thành công!");
  };

  const logout=async()=>{await supabase.auth.signOut();setAdmin(false);setPage("home")};

  const updateOrderStatus=async(id,status)=>{
    const {error}=await supabase.from("orders").update({status}).eq("id",id);
    if(error){alert("Không cập nhật được đơn: "+error.message);return}
    setOrders(cur=>{const n=cur.map(x=>x.id===id?{...x,status}:x);write("mocOrdersV2",n);return n});
  };

  const add=p=>{
    const next=cart.some(x=>x.id===p.id)?cart.map(x=>x.id===p.id?{...x,quantity:x.quantity+1}:x):[...cart,{...p,quantity:1}];
    saveCart(next);setCartOpen(true);
  };
  const changeQty=(id,q)=>saveCart(q<=0?cart.filter(x=>x.id!==id):cart.map(x=>x.id===id?{...x,quantity:q}:x));
  const subtotal=cart.reduce((s,x)=>s+x.price*x.quantity,0);

  const placeOrder=async info=>{
    if(!cart.length)return;
    const {error}=await supabase.from("orders").insert({
      customer_name:info.name.trim(),phone:info.phone.trim(),address:info.address.trim(),
      note:info.note?.trim()||"",items:cart.map(x=>({id:x.id,name:x.name,price:x.price,quantity:x.quantity})),
      total:subtotal,status:"Mới"
    });
    if(error){alert("Chưa gửi được đơn hàng: "+error.message);return}
    saveCart([]);setCheckout(false);setCartOpen(false);alert("Đặt hàng thành công! Mộc Mây đã nhận đơn của bạn.");
  };

  const saveProduct=p=>{
    const v={...p,price:Number(p.price),rating:Number(p.rating)};
    saveProducts(v.id?products.map(x=>x.id===v.id?v:x):[...products,{...v,id:Date.now()}]);setEdit(null);
  };
  const deleteProduct=id=>{if(confirm("Xóa sản phẩm này?"))saveProducts(products.filter(x=>x.id!==id))};
  const deleteReview=id=>{if(confirm("Xóa đánh giá này?"))saveReviews(reviews.filter(x=>x.id!==id))};

  if(admin)return <Admin page={page} setPage={setPage} logout={logout} products={products} reviews={reviews} orders={orders} settings={settings} setEdit={setEdit} deleteProduct={deleteProduct} saveProduct={saveProduct} deleteReview={deleteReview} updateOrderStatus={updateOrderStatus} saveReviews={saveReviews} saveSettings={saveSettings} edit={edit}/>;

  return <div className="site" style={{"--site-bg":settings.bg,"--green":settings.green}}>
    <header className="siteHeader"><div className="nav">
      <button className="brand" onClick={()=>setPage("home")}><b>M</b><span>{settings.brand}</span></button>
      <div className="navRight"><button className="cartBtn" onClick={()=>setCartOpen(true)}><ShoppingCart size={20}/><span>{cart.reduce((s,x)=>s+x.quantity,0)}</span></button><button className="mobileMenu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
      <nav className={menu?"open":""}>
        {["home","products","reviews","contact"].map((p,i)=><button key={p} onClick={()=>{setPage(p);setMenu(false)}}>{["Trang chủ","Sản phẩm","Đánh giá","Liên hệ"][i]}</button>)}
        <button onClick={()=>{setMenu(false);enterAdmin()}}>Admin</button>
      </nav>
    </div></header>

    {page==="home"&&<Home products={products} reviews={reviews} setPage={setPage} add={add} open={setDetail}/>}
    {page==="products"&&<ProductPage products={products} add={add} open={setDetail}/>}
    {page==="reviews"&&<ReviewsPage reviews={reviews} saveReviews={saveReviews}/>}
    {page==="contact"&&<ContactPage settings={settings}/>}
    <Footer settings={settings}/>

    {detail&&<ProductModal p={detail} close={()=>setDetail(null)} add={()=>{add(detail);setDetail(null)}}/>}
    {cartOpen&&<CartDrawer cart={cart} subtotal={subtotal} close={()=>setCartOpen(false)} changeQty={changeQty} checkout={()=>setCheckout(true)}/>}
    {checkout&&<CheckoutModal total={subtotal} close={()=>setCheckout(false)} place={placeOrder}/>}
    {loginOpen&&<AdminLoginModal close={()=>setLoginOpen(false)} login={loginAdmin} forgotPassword={()=>{setLoginOpen(false);setForgotOpen(true)}}/>}
    {forgotOpen&&<ForgotPasswordModal close={()=>setForgotOpen(false)} send={sendPasswordReset}/>}
    {resetOpen&&<ResetPasswordModal updatePassword={updateAdminPassword}/>}
  </div>;
}

function Home({products,reviews,setPage,add,open}){return <>
  <section className="hero"><div className="heroCopy"><div className="eyebrow">TƯƠI LÀNH · NHẸ TÊN</div><h1>Một ngụm dịu dàng,<br/><span>cả ngày rạng rỡ.</span></h1><p>Những thức uống tươi mới được pha bằng nguyên liệu thân quen, cân bằng vị ngon và cảm giác chăm sóc chính mình.</p><div className="heroActions"><button className="primary" onClick={()=>setPage("products")}>Khám phá menu →</button><button className="outlineBtn" onClick={()=>setPage("reviews")}>Đọc đánh giá</button></div></div><div className="heroVisual"><div className="visualLarge"><img src={products[0]?.imageUrl} alt=""/></div><div className="visualSmall"><img src={products[1]?.imageUrl} alt=""/></div></div></section>
  <section className="creamBand"><div className="statsRow"><div><b>{products.length}</b><span>Hương vị riêng</span></div><div><b>4.8+</b><span>Điểm yêu thích</span></div><div><b>100%</b><span>Pha mới mỗi ngày</span></div></div></section>
  <section className="section"><div className="sectionTag">ĐƯỢC YÊU THÍCH</div><h2>Món dành cho hôm nay</h2><div className="grid">{products.slice(0,4).map(p=><Card key={p.id} p={p} add={()=>add(p)} open={()=>open(p)}/>)}</div></section>
  <section className="quoteSection"><div><div className="sectionTag light">MỘC MÂY</div><h2>Không chỉ là một ly nước.<br/>Đó là khoảng nghỉ của bạn.</h2><p>Mộc Mây chọn cách pha vừa vặn: ít ngọt hơn, nhiều tầng vị hơn và luôn đẹp như khoảnh khắc bạn muốn giữ lại.</p></div></section>
  <section className="section"><div className="sectionTag">KHÁCH HÀNG NÓI GÌ</div><h2>Những lời dịu dàng</h2><div className="grid reviewGrid">{reviews.slice(0,3).map(r=><Review key={r.id} r={r}/>)}</div><button className="outlineBtn sectionButton" onClick={()=>setPage("reviews")}>Xem tất cả đánh giá</button></section>
</>}

function ProductPage({products,add,open}){
  const [query,setQuery]=useState("");const [category,setCategory]=useState("Tất cả");
  const cats=["Tất cả",...new Set(products.map(p=>p.category))];
  const list=useMemo(()=>products.filter(p=>(category==="Tất cả"||p.category===category)&&`${p.name} ${p.desc}`.toLowerCase().includes(query.toLowerCase())),[products,query,category]);
  return <section className="section pageSection"><div className="pageHead"><div><div className="sectionTag">MENU</div><h2>Tất cả sản phẩm</h2></div><div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm món..."/></div></div><div className="filters">{cats.map(c=><button key={c} className={category===c?"filter active":"filter"} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="grid">{list.map(p=><Card key={p.id} p={p} add={()=>add(p)} open={()=>open(p)}/>)}</div>{!list.length&&<div className="empty">Không tìm thấy sản phẩm.</div>}</section>
}

function Card({p,add,open}){return <article className="productCard" onClick={open}><ProductImage p={p}/><div className="cardBody"><div className="meta"><span>{p.category}</span><span>★ {p.rating}</span></div><h3>{p.name}</h3><p>{p.desc}</p><div className="cardBottom"><b>{money(p.price)}</b><div><button className="outlineMini" onClick={e=>{e.stopPropagation();open()}}>Xem chi tiết</button><button className="cartMini" onClick={e=>{e.stopPropagation();add()}}><ShoppingCart size={18}/></button></div></div></div></article>}

function ProductImage({p}){return p.imageUrl?<img className="pic imagePic" src={p.imageUrl} alt={p.name}/>:<div className="pic"><ImageIcon size={30}/></div>}

function Review({r}){return <article className="reviewCard"><div className="quoteMark">”</div><div className="stars">{"★".repeat(Number(r.rating))}{"☆".repeat(5-Number(r.rating))}</div><p>“{r.text}”</p><b>{r.name}</b><small>Khách hàng Mộc Mây</small></article>}

function ReviewsPage({reviews,saveReviews}){
  const [form,setForm]=useState({name:"",rating:5,text:""});const [sent,setSent]=useState(false);
  const submit=e=>{e.preventDefault();if(!form.name.trim()||!form.text.trim())return;saveReviews([{id:Date.now(),name:form.name.trim(),rating:Number(form.rating),text:form.text.trim()},...reviews]);setForm({name:"",rating:5,text:""});setSent(true);setTimeout(()=>setSent(false),2500)};
  return <section className="section pageSection"><div className="sectionTag">CỘNG ĐỒNG MỘC MÂY</div><h2>Đánh giá của khách hàng</h2><p className="lead">Bạn đã thử món của Mộc Mây? Hãy để lại cảm nhận của mình.</p><div className="reviewLayout"><div className="reviewList">{reviews.map(r=><Review key={r.id} r={r}/>)}</div><form className="reviewForm" onSubmit={submit}><h3>Viết đánh giá</h3><label>Tên của bạn<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Chấm điểm<select value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5-n)} · {n} sao</option>)}</select></label><label>Cảm nhận<textarea value={form.text} onChange={e=>setForm({...form,text:e.target.value})} required/></label><button className="primary full" type="submit"><Send size={17}/> Gửi đánh giá</button>{sent&&<div className="success">Đã gửi đánh giá của bạn.</div>}</form></div></section>
}

function ContactPage({settings}){return <section className="contactPage"><div className="contactIntro"><div className="sectionTag">KẾT NỐI CÙNG MỘC MÂY</div><h2>Có điều gì muốn nhắn?</h2><p>Tụi mình luôn sẵn lòng lắng nghe góp ý, câu hỏi hoặc một lời chào thật dễ thương từ bạn.</p><div className="contactInfo"><Info icon={Mail} title="Email" text={settings.email}/><Info icon={Phone} title="Điện thoại" text={settings.phone}/><Info icon={MapPin} title="Ghé Mộc Mây" text={settings.address}/><Info icon={Clock} title="Giờ mở cửa" text={settings.hours}/></div></div><form className="contactForm" onSubmit={e=>{e.preventDefault();alert("Đã gửi lời nhắn!");e.currentTarget.reset()}}><label>Tên của bạn<input required/></label><label>Email<input required type="email"/></label><label>Chủ đề<input required/></label><label>Lời nhắn<textarea required/></label><button className="primary" type="submit"><Send size={17}/> Gửi lời nhắn</button></form></section>}
function Info({icon:Icon,title,text}){return <div className="infoItem"><Icon size={25}/><div><b>{title}</b><span>{text}</span></div></div>}
function Footer({settings}){return <footer><div><h3>{settings.brand}</h3><p>Một chút dịu dàng trong từng ly, được pha từ nguyên liệu gần gũi và cảm hứng chăm sóc bản thân.</p></div><div className="footerLinks"><span>Sản phẩm</span><span>Đánh giá</span><span>Liên hệ</span></div><div className="copyright">© 2026 {settings.brand}. Dịu lành mỗi ngày.</div></footer>}

function ProductModal({p,close,add}){return <div className="overlay"><div className="modal detailModal"><button className="close" onClick={close}><X/></button><ProductImage p={p}/><div className="meta"><span>{p.category}</span><span>★ {p.rating}</span></div><h2>{p.name}</h2><p>{p.desc}</p><h3>{money(p.price)}</h3><button className="primary full" onClick={add}><ShoppingCart size={18}/> Thêm vào giỏ</button></div></div>}

function CartDrawer({cart,subtotal,close,changeQty,checkout}){return <div className="overlay"><div className="modal cartModal"><button className="close" onClick={close}><X/></button><h2>Giỏ hàng của bạn</h2>{!cart.length?<div className="empty"><ShoppingCart size={40}/><p>Giỏ hàng đang trống.</p></div>:<><div className="cartList">{cart.map(i=><div className="cartItem" key={i.id}><ProductImage p={i}/><div className="cartItemInfo"><b>{i.name}</b><span>{money(i.price)}</span><div className="qty"><button onClick={()=>changeQty(i.id,i.quantity-1)}><Minus size={15}/></button><span>{i.quantity}</span><button onClick={()=>changeQty(i.id,i.quantity+1)}><Plus size={15}/></button><button className="removeBtn" onClick={()=>changeQty(i.id,0)}><Trash2 size={15}/></button></div></div></div>)}</div><div className="cartTotal"><span>Tạm tính</span><b>{money(subtotal)}</b></div><button className="primary full" onClick={checkout}>Thanh toán · Đặt hàng</button></>}</div></div>}

function CheckoutModal({total,close,place}){const [f,setF]=useState({name:"",phone:"",address:"",note:""});const u=(k,v)=>setF(x=>({...x,[k]:v}));return <div className="overlay"><div className="modal checkoutModal"><button className="close" onClick={close}><X/></button><h2>Đặt hàng</h2><p>Điền thông tin để Mộc Mây liên hệ xác nhận đơn.</p><form onSubmit={e=>{e.preventDefault();place(f)}}><label>Họ và tên<input required value={f.name} onChange={e=>u("name",e.target.value)}/></label><label>Số điện thoại<input required type="tel" value={f.phone} onChange={e=>u("phone",e.target.value)}/></label><label>Địa chỉ nhận hàng<textarea required value={f.address} onChange={e=>u("address",e.target.value)}/></label><label>Ghi chú<textarea value={f.note} onChange={e=>u("note",e.target.value)}/></label><div className="cartTotal"><span>Tổng tiền</span><b>{money(total)}</b></div><button className="primary full">Xác nhận đặt hàng</button></form></div></div>}

function AdminLoginModal({close,login,forgotPassword}){const [email,setEmail]=useState("dangthanh123tv@gmail.com"),[password,setPassword]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(false);const submit=async e=>{e.preventDefault();setError("");setLoading(true);try{await login(email,password)}catch(err){setError(err.message)}finally{setLoading(false)}};return <div className="overlay"><div className="modal authModal"><button className="close" onClick={close}><X/></button><div className="authIcon"><LockKeyhole/></div><h2>Đăng nhập Admin</h2><p>Quản lý sản phẩm, đơn hàng, đánh giá và cài đặt.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Mật khẩu<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="errorBox">{error}</div>}<button className="primary full" disabled={loading}>{loading?"Đang đăng nhập...":"Đăng nhập"}</button></form><button className="textButton" onClick={forgotPassword}>Quên mật khẩu?</button></div></div>}

function ForgotPasswordModal({close,send}){const [email,setEmail]=useState("dangthanh123tv@gmail.com"),[loading,setLoading]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState("");const submit=async e=>{e.preventDefault();setLoading(true);setError("");try{await send(email);setSent(true)}catch(err){setError(err.message)}finally{setLoading(false)}};return <div className="overlay"><div className="modal authModal"><button className="close" onClick={close}><X/></button><div className="authIcon"><Mail/></div><h2>Quên mật khẩu</h2>{!sent?<form onSubmit={submit}><p>Nhập email Admin để nhận link đặt mật khẩu mới.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>{error&&<div className="errorBox">{error}</div>}<button className="primary full" disabled={loading}>{loading?"Đang gửi...":"Gửi link đặt lại mật khẩu"}</button></form>:<div className="success"><b>Email đã được gửi.</b><p>Mở Gmail và bấm link Reset Password để quay lại website.</p><button className="primary full" onClick={close}>Đóng</button></div>}</div></div>}

function ResetPasswordModal({updatePassword}){const [p,setP]=useState(""),[c,setC]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(false);const submit=async e=>{e.preventDefault();if(p.length<6){setError("Mật khẩu phải có ít nhất 6 ký tự.");return}if(p!==c){setError("Hai mật khẩu không giống nhau.");return}setLoading(true);try{await updatePassword(p)}catch(err){setError(err.message)}finally{setLoading(false)}};return <div className="overlay"><div className="modal authModal"><div className="authIcon"><KeyRound/></div><h2>Đặt mật khẩu mới</h2><form onSubmit={submit}><label>Mật khẩu mới<input type="password" value={p} onChange={e=>setP(e.target.value)} required/></label><label>Nhập lại mật khẩu<input type="password" value={c} onChange={e=>setC(e.target.value)} required/></label>{error&&<div className="errorBox">{error}</div>}<button className="primary full" disabled={loading}>{loading?"Đang cập nhật...":"Đặt mật khẩu mới"}</button></form></div></div>}

function Admin({page,setPage,logout,products,reviews,orders,settings,setEdit,deleteProduct,saveProduct,deleteReview,updateOrderStatus,saveReviews,saveSettings,edit}){
  const tab=page==="dashboard"?"orders":page;
  const newCount=orders.filter(x=>x.status==="Mới").length;
  return <div className="adminShell"><aside className="adminSide"><div className="adminBrand"><span>M</span><div><b>{settings.brand}</b><small>Admin</small></div></div><button className={tab==="orders"?"active":""} onClick={()=>setPage("orders")}><Package/>Đơn hàng{newCount>0&&<em>{newCount}</em>}</button><button className={tab==="products"?"active":""} onClick={()=>setPage("products")}><ShoppingCart/>Sản phẩm</button><button className={tab==="reviews"?"active":""} onClick={()=>setPage("reviews")}><MessageSquare/>Đánh giá</button><button className={tab==="settings"?"active":""} onClick={()=>setPage("settings")}><Settings/>Cài đặt</button><button className="adminLogout" onClick={logout}><LogOut/>Đăng xuất</button></aside><main className="adminMain"><div className="adminTop"><div><span className="sectionTag">MỘC MÂY ADMIN</span><h1>{tab==="orders"?"Quản lý đơn hàng":tab==="products"?"Quản lý sản phẩm":tab==="reviews"?"Quản lý đánh giá":"Cài đặt cửa hàng"}</h1></div></div>{tab==="orders"&&<OrdersAdmin orders={orders} updateOrderStatus={updateOrderStatus}/>} {tab==="products"&&<ProductsAdmin products={products} setEdit={setEdit} deleteProduct={deleteProduct} saveProduct={saveProduct} edit={edit}/>} {tab==="reviews"&&<ReviewsAdmin reviews={reviews} deleteReview={deleteReview}/>} {tab==="settings"&&<SettingsAdmin settings={settings} saveSettings={saveSettings}/>}</main></div>
}

function OrdersAdmin({orders,updateOrderStatus}){const statuses=["Mới","Đã nhận","Đang pha","Đang giao","Hoàn thành"];if(!orders.length)return <div className="adminEmpty"><Package size={44}/><h3>Chưa có đơn hàng</h3><p>Khi khách đặt hàng, đơn mới sẽ xuất hiện ở đây.</p></div>;return <div className="adminOrders">{orders.map(o=><article className="orderCard" key={o.id}><div className="orderHead"><div><b>Đơn #{o.id}</b><small>{o.createdAt}</small></div><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div><div className="orderCustomer"><b>{o.customer}</b><span>{o.phone}</span><span>{o.address}</span>{o.note&&<span>Ghi chú: {o.note}</span>}</div><div className="orderItems">{o.items.map((i,n)=><div key={n}><span>{i.name} × {i.quantity}</span><b>{money(i.price*i.quantity)}</b></div>)}</div><div className="orderTotal"><span>Tổng</span><b>{money(o.total)}</b></div></article>)}</div>}

function ProductsAdmin({products,setEdit,deleteProduct,saveProduct,edit}){return <div><button className="primary" onClick={()=>setEdit({name:"",price:30000,category:"Tea",rating:5,desc:"",imageUrl:""})}><Plus/> Thêm sản phẩm</button><div className="adminProductGrid">{products.map(p=><article className="adminProductCard" key={p.id}><ProductImage p={p}/><div><div className="meta"><span>{p.category}</span><span>★ {p.rating}</span></div><h3>{p.name}</h3><p>{p.desc}</p><b>{money(p.price)}</b><div className="adminCardActions"><button onClick={()=>setEdit(p)}><Pencil/> Sửa</button><button className="danger" onClick={()=>deleteProduct(p.id)}><Trash2/> Xóa</button></div></div></article>)}</div>{edit&&<ProductEditor product={edit} close={()=>setEdit(null)} save={saveProduct}/>}</div>}

function ProductEditor({product,close,save}){const [f,setF]=useState(product);const u=(k,v)=>setF(x=>({...x,[k]:v}));return <div className="overlay"><div className="modal adminEditor"><button className="close" onClick={close}><X/></button><h2>{f.id?"Sửa sản phẩm":"Thêm sản phẩm"}</h2><form onSubmit={e=>{e.preventDefault();save(f)}}><label>Tên sản phẩm<input value={f.name} onChange={e=>u("name",e.target.value)} required/></label><div className="twoCols"><label>Giá<input type="number" value={f.price} onChange={e=>u("price",e.target.value)} required/></label><label>Danh mục<input value={f.category} onChange={e=>u("category",e.target.value)} required/></label></div><div className="twoCols"><label>Rating<input type="number" min="0" max="5" step=".1" value={f.rating} onChange={e=>u("rating",e.target.value)}/></label><label>Link hình ảnh<input value={f.imageUrl} onChange={e=>u("imageUrl",e.target.value)}/></label></div><label>Mô tả<textarea value={f.desc} onChange={e=>u("desc",e.target.value)} required/></label><div className="adminFormActions"><button type="button" className="outlineBtn" onClick={close}>Hủy</button><button className="primary">Lưu sản phẩm</button></div></form></div></div>}

function ReviewsAdmin({reviews,deleteReview}){return <div className="adminReviewList">{reviews.map(r=><article className="adminReviewCard" key={r.id}><div><b>{r.name}</b><div className="stars">{"★".repeat(Number(r.rating))}{"☆".repeat(5-Number(r.rating))}</div></div><p>{r.text}</p><button className="dangerBtn" onClick={()=>deleteReview(r.id)}><Trash2/> Xóa</button></article>)}</div>}

function SettingsAdmin({settings,saveSettings}){const [f,setF]=useState(settings),[saved,setSaved]=useState(false);const u=(k,v)=>setF(x=>({...x,[k]:v}));return <form className="settingsForm" onSubmit={e=>{e.preventDefault();saveSettings(f);setSaved(true);setTimeout(()=>setSaved(false),2000)}}><div className="settingsCard"><h3>Thông tin cửa hàng</h3>{[["brand","Tên thương hiệu"],["email","Email"],["phone","Số điện thoại"],["address","Địa chỉ"],["hours","Giờ mở cửa"]].map(([k,l])=><label key={k}>{l}<input value={f[k]} onChange={e=>u(k,e.target.value)}/></label>)}</div><div className="settingsCard"><h3>Giao diện</h3><label>Màu nền<input value={f.bg} onChange={e=>u("bg",e.target.value)}/></label><label>Màu xanh chủ đạo<input value={f.green} onChange={e=>u("green",e.target.value)}/></label></div><button className="primary">Lưu cài đặt</button>{saved&&<div className="success">Đã lưu cài đặt.</div>}</form>}

createRoot(document.getElementById("root")).render(<App/>);
