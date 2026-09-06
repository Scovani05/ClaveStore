import { useEffect, useMemo, useState } from "react";
import AdminPanel from "./components/AdminPanel.jsx";
import AuthModal from "./components/AuthModal.jsx";
import BackofficeLayout from "./components/BackofficeLayout.jsx";
import BusinessPanel from "./components/BusinessPanel.jsx";
import CartPanel from "./components/CartPanel.jsx";
import OrdersPanel from "./components/OrdersPanel.jsx";
import ProductDetailsModal from "./components/ProductDetailsModal.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import StoreHeader from "./components/StoreHeader.jsx";
import { musicApi } from "./api/musicApi.js";
import { mockDashboard } from "./data/mockMusicStore.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number(value || 0) % 1 === 0 ? 0 : 2
  }).format(Number(value || 0));

const formatNumber = (value) => new Intl.NumberFormat("pt-PT").format(Math.round(Number(value || 0)));

const categoryIcons = {
  Guitarras: "bi-music-note-beamed",
  Baixos: "bi-music-note-list",
  Teclados: "bi-keyboard",
  Bateria: "bi-vinyl",
  "Áudio e estúdio": "bi-mic",
  "DJ e palco": "bi-speaker",
  Iluminação: "bi-lightbulb",
  Sopro: "bi-music-note",
  "Cordas clássicas": "bi-music-note-beamed",
  "Merch e vinil": "bi-vinyl",
  Acessórios: "bi-plug"
};

const statusLabels = {
  pending: "Pendente",
  paid: "Pago",
  processing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado"
};

const calcIncludedTax = (subtotal, rate = 23) => Number((subtotal - subtotal / (1 + Number(rate || 0) / 100)).toFixed(2));
const AUTH_STORAGE_KEY = "clavestore-auth-session";
const GUEST_CART_STORAGE_KEY = "clavestore-cart-guest";
const adminViews = ["admin", "orders", "business"];

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const readJsonStorage = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const writeJsonStorage = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Local storage can be blocked in private browsing.
  }
};

const removeStorageItem = (key) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Nothing to do when storage is unavailable.
  }
};

const readStoredAuth = () => readJsonStorage(AUTH_STORAGE_KEY, null);
const cartStorageKey = (user) => (user?.role === "client" && user.email ? `clavestore-cart-${user.email}` : GUEST_CART_STORAGE_KEY);
const readStoredCart = (user) => readJsonStorage(cartStorageKey(user), []);
const saveStoredCart = (user, cart) => writeJsonStorage(cartStorageKey(user), cart);

const mergeCartEntries = (...carts) => {
  const grouped = new Map();

  carts.flat().forEach((item) => {
    const productId = Number(item?.productId);
    const quantity = Math.max(1, Number(item?.quantity || 1));

    if (!Number.isFinite(productId)) {
      return;
    }

    grouped.set(productId, Math.min(99, (grouped.get(productId) || 0) + quantity));
  });

  return Array.from(grouped, ([productId, quantity]) => ({ productId, quantity }));
};

const sumOrderRevenue = (orders) =>
  orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

const recomputeStoreStats = (products, orders, currentStats = {}) => {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const revenue = sumOrderRevenue(orders);
  const unitsSold = activeOrders.reduce(
    (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
    0
  );
  const visitorSessions = Number(currentStats.visitorSessions || 4200);

  return {
    ...currentStats,
    products: products.length,
    activeProducts: products.filter((product) => Number(product.stock || 0) > 0).length,
    stockValue: products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0),
    lowStock: products.filter((product) => Number(product.stock || 0) <= Number(product.reorderPoint || 0)).length,
    orders: orders.length,
    revenue,
    avgTicket: activeOrders.length ? Number((revenue / activeOrders.length).toFixed(2)) : 0,
    pendingOrders: orders.filter((order) => ["pending", "paid", "processing"].includes(order.status)).length,
    unitsSold,
    visitorSessions,
    conversionRate: visitorSessions ? Number(((activeOrders.length / visitorSessions) * 100).toFixed(2)) : 0
  };
};

const sortProducts = (products, sortKey) => {
  const sorted = [...products];

  if (sortKey === "price-asc") {
    return sorted.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sortKey === "price-desc") {
    return sorted.sort((a, b) => Number(b.price) - Number(a.price));
  }

  if (sortKey === "stock") {
    return sorted.sort((a, b) => Number(a.stock) - Number(b.stock));
  }

  return sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || Number(b.rating) - Number(a.rating));
};

export default function App() {
  const [activeView, setActiveView] = useState("shop");
  const [authUser, setAuthUser] = useState(() => readStoredAuth());
  const [authDialog, setAuthDialog] = useState({ isOpen: false, mode: "login", role: "client", redirectView: null });
  const [dashboard, setDashboard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortKey, setSortKey] = useState("featured");
  const [cart, setCart] = useState(() => readStoredCart(readStoredAuth()));
  const [apiStatus, setApiStatus] = useState("a ligar");
  const [isLoading, setIsLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [notice, setNotice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const data = await musicApi.getDashboard();

        if (!ignore) {
          setDashboard(data);
          setApiStatus(data.meta?.source === "database" ? "PostgreSQL ativo" : "dados locais");
        }
      } catch (error) {
        if (!ignore) {
          setDashboard(mockDashboard);
          setApiStatus("dados locais");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    musicApi
      .getInsight()
      .then((data) => {
        if (!ignore) {
          setInsight(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setInsight({
            title: "Packs e usados com boa margem",
            tip: "Começa pelos bundles para iniciantes e pelos usados certificados.",
            externalSignal: "Dados locais carregados",
            ideas: mockDashboard.playbooks
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (authUser) {
      writeJsonStorage(AUTH_STORAGE_KEY, authUser);
      return;
    }

    removeStorageItem(AUTH_STORAGE_KEY);
  }, [authUser]);

  useEffect(() => {
    saveStoredCart(authUser, cart);

    if (authUser?.role === "client") {
      musicApi.saveCart(authUser.id, cart).catch(() => undefined);
    }
  }, [authUser, cart]);

  const products = dashboard?.products || [];
  const orders = dashboard?.orders || [];
  const workspace = dashboard?.workspace || mockDashboard.workspace;
  const isBackoffice = adminViews.includes(activeView);

  const filteredProducts = useMemo(() => {
    const query = normalizeText(searchTerm.trim());
    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const haystack = normalizeText(`${product.name} ${product.brand} ${product.category} ${product.shortDescription} ${(product.specs || []).join(" ")} ${(product.comments || []).map((comment) => `${comment.title} ${comment.body}`).join(" ")}`);
      return matchesCategory && (!query || haystack.includes(query));
    });

    return sortProducts(filtered, sortKey);
  }, [products, searchTerm, selectedCategory, sortKey]);

  const cartItems = useMemo(
    () =>
      cart
        .map((entry) => {
          const product = products.find((item) => item.id === entry.productId);
          return product ? { ...product, quantity: entry.quantity } : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const shipping = subtotal === 0 || subtotal >= Number(workspace.freeShippingThreshold || 250) ? 0 : 6;
    const total = Number((subtotal + shipping).toFixed(2));

    return {
      subtotal,
      shipping,
      total,
      tax: calcIncludedTax(subtotal, workspace.taxRate),
      count: cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    };
  }, [cartItems, workspace.freeShippingThreshold, workspace.taxRate]);

  const updateDashboard = (recipe) => {
    setDashboard((current) => {
      const next = recipe(current);
      return {
        ...next,
        stats: recomputeStoreStats(next.products, next.orders, next.stats)
      };
    });
  };


  const openAuthDialog = (role = "client", mode = "login", redirectView = null) => {
    setAuthDialog({ isOpen: true, role, mode, redirectView });
  };

  const closeAuthDialog = () => {
    setAuthDialog((current) => ({ ...current, isOpen: false, redirectView: null }));
  };

  const requireClientAuth = () => {
    openAuthDialog("client", "login");
    setNotice("Inicia sessão como cliente para finalizar a compra.");
  };

  const handleViewChange = (view) => {
    if (adminViews.includes(view) && authUser?.role !== "admin") {
      openAuthDialog("admin", "login", view);
      setNotice("Inicia sessão como admin para abrir o backoffice.");
      return;
    }

    setActiveView(view);
  };

  const handleAuthSubmit = async (payload) => {
    try {
      const data = payload.mode === "register" ? await musicApi.register(payload) : await musicApi.login(payload);
      const user = data.user;

      if (!user) {
        throw new Error("Não foi possível validar a conta.");
      }

      if (user.role === "client") {
        const remoteCart = Array.isArray(data.cart?.items) ? data.cart.items : [];
        const localCart = readStoredCart(user);
        const mergedCart = mergeCartEntries(cart, localCart, remoteCart);
        setCart(mergedCart);
        saveStoredCart(user, mergedCart);
        musicApi.saveCart(user.id, mergedCart).catch(() => undefined);
        setNotice(mergedCart.length ? "Sessão iniciada e carrinho recuperado." : "Sessão iniciada.");
      } else {
        setNotice("Sessão admin iniciada.");
      }

      setAuthUser(user);
      closeAuthDialog();

      if (user.role === "admin") {
        setActiveView(authDialog.redirectView || "admin");
      } else {
        setActiveView("shop");
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Não foi possível validar a conta.");
    }
  };

  const handleLogout = () => {
    if (authUser?.role === "client") {
      saveStoredCart(authUser, cart);
      musicApi.saveCart(authUser.id, cart).catch(() => undefined);
    }

    setAuthUser(null);
    setCart(readStoredCart(null));
    setActiveView("shop");
    setNotice("Sessão terminada.");
  };
  const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product.id);

    if (existing && existing.quantity >= Number(product.stock || 0)) {
      setNotice("Não há mais stock disponível para esse produto.");
      return;
    }

    if (!existing && Number(product.stock || 0) <= 0) {
      setNotice("Produto sem stock neste momento.");
      return;
    }

    setCart((current) => {
      if (current.some((item) => item.productId === product.id)) {
        return current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...current, { productId: product.id, quantity: 1 }];
    });
    setNotice(`${product.name} adicionado ao carrinho.`);
  };

  const changeCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId));
      return;
    }

    const product = products.find((item) => item.id === productId);
    const safeQuantity = Math.min(quantity, Number(product?.stock || 1));
    setCart((current) => current.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item)));
  };

  const submitOrder = async (customer) => {
    if (!authUser || authUser.role !== "client") {
      requireClientAuth();
      return;
    }

    if (!cartItems.length) {
      setNotice("Adiciona pelo menos um produto antes de finalizar.");
      return;
    }

    const payload = {
      userId: authUser.id,
      customerName: authUser.name || customer.customerName,
      email: authUser.email || customer.email,
      city: customer.city,
      paymentMethod: customer.paymentMethod,
      items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity }))
    };

    const optimisticOrder = {
      id: Date.now(),
      workspaceId: workspace.id,
      customerName: payload.customerName,
      email: payload.email,
      city: payload.city,
      status: "paid",
      paymentMethod: payload.paymentMethod,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      shipping: cartTotals.shipping,
      total: cartTotals.total,
      createdAt: new Date().toISOString(),
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: Number((item.price * item.quantity).toFixed(2))
      }))
    };

    updateDashboard((current) => ({
      ...current,
      products: current.products.map((product) => {
        const sold = cartItems.find((item) => item.id === product.id);
        return sold ? { ...product, stock: Math.max(0, Number(product.stock || 0) - sold.quantity) } : product;
      }),
      orders: [optimisticOrder, ...current.orders]
    }));
    setCart([]);
    setActiveView("shop");
    setNotice("Encomenda criada com sucesso.");

    try {
      const createdOrder = await musicApi.createOrder(payload);
      updateDashboard((current) => ({
        ...current,
        orders: current.orders.map((order) => (order.id === optimisticOrder.id ? createdOrder : order))
      }));
      setApiStatus("PostgreSQL ativo");
    } catch (error) {
      setApiStatus("dados locais");
    }
  };

  const createProduct = async (draft) => {
    const optimisticProduct = {
      ...draft,
      id: Date.now(),
      workspaceId: workspace.id,
      rating: 4.5,
      reviews: 0,
      badge: "Novo",
      isFeatured: false,
      compareAtPrice: Number(draft.price || 0) + 20,
      reorderPoint: Number(draft.reorderPoint || 2),
      price: Number(draft.price || 0),
      stock: Number(draft.stock || 0),
      specs: String(draft.specs || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      gallery: [draft.imageUrl].filter(Boolean),
      comments: [
        {
          author: "Cliente ClaveStore",
          city: workspace.city,
          rating: 4.5,
          title: "Primeira avaliação",
          body: "Produto adicionado ao catálogo com detalhes editáveis."
        }
      ]
    };

    updateDashboard((current) => ({ ...current, products: [optimisticProduct, ...current.products] }));
    setNotice("Produto adicionado ao catálogo.");

    try {
      const product = await musicApi.createProduct(optimisticProduct);
      updateDashboard((current) => ({
        ...current,
        products: current.products.map((item) => (item.id === optimisticProduct.id ? product : item))
      }));
      setApiStatus("PostgreSQL ativo");
    } catch (error) {
      setApiStatus("dados locais");
    }
  };

  const updateProduct = async (productId, payload) => {
    updateDashboard((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === productId ? { ...product, ...payload } : product))
    }));

    try {
      await musicApi.updateProduct(productId, payload);
      setApiStatus("PostgreSQL ativo");
    } catch (error) {
      setApiStatus("dados locais");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    updateDashboard((current) => ({
      ...current,
      orders: current.orders.map((order) => (order.id === orderId ? { ...order, status } : order))
    }));

    try {
      await musicApi.updateOrder(orderId, { status });
      setApiStatus("PostgreSQL ativo");
    } catch (error) {
      setApiStatus("dados locais");
    }
  };

  if (isLoading || !dashboard) {
    return (
      <main className="loading-screen">
        <div className="spinner-border text-warning" role="status" />
        <span>A preparar ClaveStore PT...</span>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <StoreHeader
        activeArea={isBackoffice ? "backoffice" : "client"}
        activeView={activeView}
        apiStatus={apiStatus}
        authUser={authUser}
        cartCount={cartTotals.count}
        onChangeView={handleViewChange}
        onLogout={handleLogout}
        onOpenAuth={openAuthDialog}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        workspace={workspace}
      />

      <AuthModal
        defaultMode={authDialog.mode}
        defaultRole={authDialog.role}
        isOpen={authDialog.isOpen}
        onClose={closeAuthDialog}
        onSubmit={handleAuthSubmit}
      />

      <main className="store-main">
        {notice && (
          <div className="notice" role="status">
            <i className="bi bi-check2-circle" aria-hidden="true" />
            {notice}
          </div>
        )}

        {activeView === "shop" && (
          <>
            <section className="shop-stage" aria-label="Montra ClaveStore">
              <aside className="department-panel" aria-label="Categorias">
                <div className="department-title">
                  <i className="bi bi-list" aria-hidden="true" />
                  <strong>Categorias</strong>
                </div>
                {(dashboard.categories || []).map((category) => (
                  <button
                    className={selectedCategory === category ? "department-link active" : "department-link"}
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    type="button"
                  >
                    <i className={`bi ${categoryIcons[category] || "bi-music-note"}`} aria-hidden="true" />
                    <span>{category}</span>
                  </button>
                ))}
              </aside>

              <div className="promo-panel">
                <div className="promo-copy">
                  <span className="section-kicker">Semana do músico</span>
                  <h2>Instrumentos, estúdio e palco com compra rápida.</h2>
                  <p>
                    Packs para começar, usados certificados e material de home studio com stock visível antes do checkout.
                  </p>
                  <div className="promo-actions">
                    <button className="btn btn-cart" onClick={() => setSelectedCategory("Guitarras")} type="button">
                      <i className="bi bi-lightning-charge" aria-hidden="true" />
                      Ver destaques
                    </button>
                    <button
                      className="btn btn-outline-store"
                      onClick={() => {
                        setSelectedCategory("Áudio e estúdio");
                        setActiveView("shop");
                      }}
                      type="button"
                    >
                      Home studio
                    </button>
                  </div>
                </div>
                <div className="promo-metrics" aria-label="Indicadores principais">
                  <div>
                    <strong>{formatNumber(dashboard.stats.products)}</strong>
                    <span>produtos</span>
                  </div>
                  <div>
                    <strong>{formatCurrency(dashboard.stats.revenue)}</strong>
                    <span>vendas registadas</span>
                  </div>
                  <div>
                    <strong>{dashboard.stats.lowStock}</strong>
                    <span>alertas stock</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="commerce-layout products-only">
              <ProductGrid
                formatCurrency={formatCurrency}
                onAddToCart={addToCart}
                products={filteredProducts}
                onOpenProduct={setSelectedProduct}
                selectedCategory={selectedCategory}
                setSortKey={setSortKey}
                sortKey={sortKey}
              />
            </section>
          </>
        )}

        {activeView === "cart" && (
          <section className="cart-page" aria-label="Carrinho de compras">
            <div className="cart-page-heading">
              <div>
                <span className="section-kicker">Carrinho</span>
                <h2>Resumo da compra</h2>
                <p>Confirma os artigos escolhidos, ajusta quantidades e finaliza a encomenda com a tua conta de cliente.</p>
              </div>
              <button className="btn btn-outline-dark" onClick={() => setActiveView("shop")} type="button">
                <i className="bi bi-arrow-left" aria-hidden="true" />
                Continuar a comprar
              </button>
            </div>

            <CartPanel
              authUser={authUser}
              cartItems={cartItems}
              cartTotals={cartTotals}
              formatCurrency={formatCurrency}
              onCheckout={submitOrder}
              onQuantityChange={changeCartQuantity}
              onRequireAuth={requireClientAuth}
              showHeading={false}
              workspace={workspace}
            />
          </section>
        )}

        {isBackoffice && (
          <BackofficeLayout
            activeView={activeView}
            apiStatus={apiStatus}
            formatCurrency={formatCurrency}
            stats={dashboard.stats}
          >
            {activeView === "orders" && (
              <OrdersPanel
                formatCurrency={formatCurrency}
                onUpdateStatus={updateOrderStatus}
                orders={orders}
                statusLabels={statusLabels}
              />
            )}

            {activeView === "admin" && (
              <AdminPanel
                categories={dashboard.categories}
                formatCurrency={formatCurrency}
                onCreateProduct={createProduct}
                onUpdateProduct={updateProduct}
                products={products}
                stats={dashboard.stats}
              />
            )}

            {activeView === "business" && (
              <BusinessPanel
                formatCurrency={formatCurrency}
                insight={insight}
                pricing={dashboard.pricing}
                stats={dashboard.stats}
                workspace={workspace}
              />
            )}
          </BackofficeLayout>
        )}
      </main>
      <ProductDetailsModal
        formatCurrency={formatCurrency}
        onAddToCart={addToCart}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </div>
  );
}
