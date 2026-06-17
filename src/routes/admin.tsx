import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Store, Utensils, List, Palette, ChevronRight, Settings, LogOut, Eye, LayoutDashboard, Share2, TrendingUp, Trash2, Link2, Check, KeyRound, RefreshCw, Pencil, Lock, Shield, ShieldCheck, ShieldAlert, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Restaurant } from "@/types";
import { RestaurantDialog } from "@/components/admin/restaurant-dialog";
import { MenuManager } from "@/components/admin/menu-manager";
import { VisualManager } from "@/components/admin/visual-manager";
import { motion, AnimatePresence } from "framer-motion";
import { sha256Hex } from "@/lib/hash";
import { toast } from "sonner";
import { adminBypassPin } from "@/lib/admin-panel.functions";

const SUPABASE_URL = "https://mrjkizqyrmljtlvusgta.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      restaurantId: (search.restaurantId as string) || undefined,
      view: (search.view as 'list' | 'menu' | 'visual' | 'preview') || undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Painel Admin Master - MenuMaster" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/admin' });
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [pwdErrorMsg, setPwdErrorMsg] = useState("");
  // Hash of the password entered at login. Kept only in memory (not in storage).
  // Required to call admin-only RPCs (list tokens, rotate, etc.).
  const [sessionHash, setSessionHash] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await sb.rpc("admin_password_exists");
      setIsFirstTime(!data);
      // Tenta restaurar sessão persistida no navegador
      try {
        const stored = localStorage.getItem("admin_session_hash");
        if (stored && data) {
          const { data: ok } = await sb.rpc("verify_admin_password", { _password_hash: stored });
          if (ok) {
            setSessionHash(stored);
            setUnlocked(true);
          } else {
            localStorage.removeItem("admin_session_hash");
          }
        }
      } catch {}
      setAuthChecking(false);
    })();
  }, []);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestDialogOpen, setIsRestDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(search.restaurantId || null);
  const [activeView, setActiveTab] = useState<'list' | 'menu' | 'visual' | 'preview'>(search.view || 'list');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEditId, setCopiedEditId] = useState<string | null>(null);
  const [copiedPinLinkId, setCopiedPinLinkId] = useState<string | null>(null);
  const [pinStatusMap, setPinStatusMap] = useState<Record<string, { has_pin: boolean; is_locked: boolean }>>({});
  const [pinDialog, setPinDialog] = useState<{ rest: Restaurant; mode: 'set' | 'reset' } | null>(null);
  const [openingPanelId, setOpeningPanelId] = useState<string | null>(null);

  async function copyShareLink(slug: string, id: string) {
    const url = `${window.location.origin}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function copyEditLink(token: string | undefined, id: string) {
    if (!token) {
      toast.error("Este restaurante ainda não tem token. Recarregue a página.");
      return;
    }
    const url = `${window.location.origin}/editar/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiedEditId(id);
    toast.success("Link de edição copiado! Envie ao dono do restaurante.");
    setTimeout(() => setCopiedEditId(null), 2000);
  }

  async function regenerateToken(rest: Restaurant) {
    if (!confirm(`Regenerar link de edição de "${rest.name}"? O link antigo deixará de funcionar imediatamente.`)) return;
    if (!sessionHash) { toast.error("Sessão expirada. Entre novamente."); return; }
    const newToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const { error } = await sb.rpc("admin_rotate_edit_token", {
      _password_hash: sessionHash,
      _restaurant_id: rest.id,
      _new_token: newToken,
    });
    if (error) {
      toast.error("Erro ao regenerar: " + error.message);
    } else {
      toast.success("Novo link gerado!");
      loadData();
    }
  }

  async function loadData() {
    setIsLoading(true);
    try {
      const { data, error } = await sb.from('restaurants').select('*');
      if (error) throw error;
      let rows = (data ?? []) as Restaurant[];
      // Fetch edit tokens via password-gated RPC and merge.
      if (sessionHash) {
        const { data: tokens } = await sb.rpc("admin_list_edit_tokens", {
          _password_hash: sessionHash,
        });
        const tokenMap = new Map<string, string>(
          ((tokens ?? []) as Array<{ restaurant_id: string; edit_token: string }>)
            .map((t) => [t.restaurant_id, t.edit_token])
        );
        // Ensure every restaurant has a token (new ones don't get one automatically).
        for (const r of rows) {
          if (!tokenMap.has(r.id)) {
            const { data: created } = await sb.rpc("admin_ensure_edit_token", {
              _password_hash: sessionHash,
              _restaurant_id: r.id,
            });
            if (created) tokenMap.set(r.id, created as string);
          }
        }
        rows = rows.map((r) => ({ ...r, edit_token: tokenMap.get(r.id) }));
        // Load PIN status for every restaurant
        const { data: pinRows } = await sb.rpc("admin_list_pin_status", {
          _password_hash: sessionHash,
        });
        const map: Record<string, { has_pin: boolean; is_locked: boolean }> = {};
        for (const p of (pinRows ?? []) as Array<{ restaurant_id: string; has_pin: boolean; is_locked: boolean }>) {
          map[p.restaurant_id] = { has_pin: p.has_pin, is_locked: p.is_locked };
        }
        setPinStatusMap(map);
      }
      setRestaurants(rows);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function copyPinLink(slug: string, id: string) {
    const url = `${window.location.origin}/${slug}/admin`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiedPinLinkId(id);
    toast.success("Link do painel copiado!");
    setTimeout(() => setCopiedPinLinkId(null), 2000);
  }

  async function openOwnerPanel(rest: Restaurant) {
    if (!sessionHash) { toast.error("Sessão expirada. Entre novamente."); return; }
    setOpeningPanelId(rest.id);
    try {
      const result = await adminBypassPin({ data: { passwordHash: sessionHash, restaurantId: rest.id } });
      localStorage.setItem(`pin_session:${rest.slug}`, result.token);
      window.open(`/${rest.slug}/admin`, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao abrir painel");
    } finally {
      setOpeningPanelId(null);
    }
  }

  useEffect(() => {
    if (unlocked && sessionHash) loadData();
  }, [unlocked, sessionHash]);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(false);
    setPwdErrorMsg("");
    if (isFirstTime) {
      if (pwd.length < 6) {
        setPwdError(true); setPwdErrorMsg("Mínimo de 6 caracteres."); return;
      }
      if (pwd !== pwdConfirm) {
        setPwdError(true); setPwdErrorMsg("As senhas não coincidem."); return;
      }
      const hash = await sha256Hex(pwd);
      const { error } = await sb.from("app_settings").insert({ id: 1, admin_password_hash: hash });
      if (error) {
        setPwdError(true); setPwdErrorMsg("Erro ao definir senha: " + error.message); return;
      }
      setIsFirstTime(false);
      setSessionHash(hash);
      try { localStorage.setItem("admin_session_hash", hash); } catch {}
      setUnlocked(true);
      return;
    }
    const hash = await sha256Hex(pwd);
    const { data: ok, error } = await sb.rpc("verify_admin_password", { _password_hash: hash });
    if (error) {
      setPwdError(true);
      setPwdErrorMsg("Erro ao verificar: " + error.message);
      return;
    }
    if (ok) {
      setSessionHash(hash);
      try { localStorage.setItem("admin_session_hash", hash); } catch {}
      setUnlocked(true);
    } else {
      setPwdError(true);
      setPwdErrorMsg("Senha incorreta.");
    }
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-sm font-medium text-zinc-400 animate-pulse">Carregando…</div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-['Outfit']">
        <form onSubmit={handleAuthSubmit} className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-3">
              {isFirstTime ? <KeyRound className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
              {isFirstTime ? "Defina a senha do admin" : "Painel Admin"}
            </h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              {isFirstTime ? "Primeiro acesso — escolha uma senha forte." : "Acesso restrito"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
              {isFirstTime ? "Nova senha" : "Senha"}
            </label>
            <input
              type="password"
              autoFocus
              value={pwd}
              onChange={(e) => { setPwd(e.target.value); setPwdError(false); setPwdErrorMsg(""); }}
              placeholder="••••••"
              className={`h-14 w-full rounded-xl border px-4 text-base font-medium focus:outline-none focus:ring-2 ${pwdError ? "border-red-400 ring-red-100" : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-100"}`}
            />
            {isFirstTime && (
              <input
                type="password"
                value={pwdConfirm}
                onChange={(e) => { setPwdConfirm(e.target.value); setPwdError(false); setPwdErrorMsg(""); }}
                placeholder="Confirme a senha"
                className={`mt-2 h-14 w-full rounded-xl border px-4 text-base font-medium focus:outline-none focus:ring-2 ${pwdError ? "border-red-400 ring-red-100" : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-100"}`}
              />
            )}
            {pwdError && <p className="text-xs font-bold text-red-500 mt-1.5">{pwdErrorMsg || "Senha incorreta"}</p>}
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">
            {isFirstTime ? "Criar senha & entrar" : "Entrar"}
          </Button>
        </form>
      </div>
    );
  }

  const selectedRestaurant = restaurants?.find(r => r.id === selectedRestaurantId);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row font-['Outfit'] selection:bg-primary/10 selection:text-primary">
      {/* Dynamic Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-zinc-200 flex flex-col p-8 sticky top-0 md:h-screen z-40">
        <div className="flex items-center gap-4 mb-12 group cursor-pointer" onClick={() => navigate({ to: '/' })}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-2xl shadow-zinc-900/20 group-hover:scale-110 transition-transform">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 leading-none">MenuMaster</h2>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Pro Edition</span>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <SidebarItem 
            active={activeView === 'list'} 
            onClick={() => { setActiveTab('list'); setSelectedRestaurantId(null); }}
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
          />
          <div className="pt-6 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4">Gerenciamento</span>
          </div>
          <SidebarItem 
            active={activeView === 'menu'} 
            disabled={!selectedRestaurantId}
            onClick={() => setActiveTab('menu')}
            icon={<Utensils className="w-5 h-5" />} 
            label="Cardápio Digital" 
          />
          <SidebarItem 
            active={activeView === 'visual'} 
            disabled={!selectedRestaurantId}
            onClick={() => setActiveTab('visual')}
            icon={<Palette className="w-5 h-5" />} 
            label="Design Master" 
          />
          <SidebarItem 
            active={activeView === 'preview'} 
            disabled={!selectedRestaurantId}
            onClick={() => setActiveTab('preview')}
            icon={<Eye className="w-5 h-5" />} 
            label="Visualização Real" 
          />
          
          <div className="pt-8 border-t border-zinc-100 mt-6 space-y-2">
            <SidebarItem icon={<Settings className="w-5 h-5" />} label="Configurações" />
            <SidebarItem icon={<LogOut className="w-5 h-5 text-rose-500" />} label="Desconectar" onClick={() => {
              try { localStorage.removeItem("admin_session_hash"); } catch {}
              try { sessionStorage.removeItem("admin_session_hash"); } catch {}
              setSessionHash(null);
              setUnlocked(false);
              navigate({ to: '/' });
            }} />
          </div>
        </nav>

        {selectedRestaurant && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-auto p-5 rounded-[2rem] bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black uppercase">
                {selectedRestaurant.name.charAt(0)}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ativo Agora</span>
            </div>
            <p className="font-bold text-sm truncate">{selectedRestaurant.name}</p>
          </motion.div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeView === 'list' && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto"
            >
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
                <div>
                  <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">Bem-vindo, Designer</h1>
                  <p className="text-zinc-500 text-lg">Aqui estão seus projetos de cardápios ativos.</p>
                </div>
                <Button 
                  onClick={() => { setEditingRestaurant(null); setIsRestDialogOpen(true); }}
                  className="bg-zinc-900 text-white hover:bg-primary transition-all rounded-full h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-zinc-900/10"
                >
                  <Plus className="w-5 h-5 mr-2" /> Novo Projeto
                </Button>
              </header>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <StatCard label="Total de Projetos" value={restaurants.length.toString()} icon={<TrendingUp className="text-emerald-500" />} />
                <StatCard label="Pedidos Hoje" value="24" icon={<Utensils className="text-primary" />} />
                <StatCard label="Taxa de Conversão" value="12%" icon={<Share2 className="text-violet-500" />} />
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-zinc-200 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {restaurants.map(rest => (
                    <Card key={rest.id} className="group bg-white border-zinc-200 hover:border-primary/30 transition-all rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl">
                      <div className="h-32 bg-zinc-100 relative overflow-hidden">
                        {rest.banner_url && <img src={rest.banner_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                        <div className="absolute top-6 left-6 flex gap-2">
                           <span className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${rest.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                             {rest.status === 'active' ? 'Online' : 'Offline'}
                           </span>
                        </div>
                      </div>
                      <CardHeader className="px-8 pb-4 pt-0 -mt-10 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white overflow-hidden mb-4 group-hover:rotate-6 transition-transform">
                          {rest.logo_url ? <img src={rest.logo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xl font-black">{rest.name.charAt(0)}</div>}
                        </div>
                        <CardTitle className="text-2xl font-black text-zinc-900 mb-1 group-hover:text-primary transition-colors">{rest.name}</CardTitle>
                        <p className="text-xs text-zinc-500 font-medium tracking-tight truncate">{rest.address || 'Sem endereço configurado'}</p>
                      </CardHeader>
                      <CardContent className="px-8 pb-8">
                        <div className="mb-2 flex items-center gap-2 p-2 pl-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <Link2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="text-[11px] font-medium text-zinc-500 truncate flex-1 min-w-0">/{rest.slug}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-7 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 ${copiedId === rest.id ? 'bg-emerald-500 text-white hover:bg-emerald-500' : 'bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white border border-zinc-200'}`}
                            onClick={() => copyShareLink(rest.slug, rest.id)}
                          >
                            {copiedId === rest.id ? <><Check className="w-3 h-3 mr-1" />Copiado</> : <>Link público</>}
                          </Button>
                        </div>
                        <div className="mb-3 flex items-center gap-2 p-2 pl-3 rounded-2xl bg-amber-50 border border-amber-100">
                          <Pencil className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-[11px] font-medium text-amber-700 truncate flex-1 min-w-0">Link do dono (secreto)</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-7 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 ${copiedEditId === rest.id ? 'bg-emerald-500 text-white hover:bg-emerald-500' : 'bg-white text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200'}`}
                            onClick={() => copyEditLink(rest.edit_token, rest.id)}
                          >
                            {copiedEditId === rest.id ? <><Check className="w-3 h-3 mr-1" />Copiado</> : <>Copiar</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Gerar novo link (invalida o anterior)"
                            className="h-7 w-7 p-0 rounded-xl shrink-0 text-amber-600 hover:bg-amber-100"
                            onClick={() => regenerateToken(rest)}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        {/* Painel do dono com PIN (novo, recomendado) */}
                        <div className={`mb-2 flex items-center gap-2 p-2 pl-3 rounded-2xl border ${pinStatusMap[rest.id]?.has_pin ? 'bg-emerald-50 border-emerald-100' : 'bg-zinc-50 border-zinc-200'}`}>
                          {pinStatusMap[rest.id]?.is_locked ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : pinStatusMap[rest.id]?.has_pin ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          )}
                          <span className={`text-[11px] font-medium truncate flex-1 min-w-0 ${pinStatusMap[rest.id]?.has_pin ? 'text-emerald-700' : 'text-zinc-500'}`}>
                            {pinStatusMap[rest.id]?.is_locked
                              ? 'Painel BLOQUEADO (15 min)'
                              : pinStatusMap[rest.id]?.has_pin
                                ? `/${rest.slug}/admin · PIN ativo`
                                : `/${rest.slug}/admin · sem PIN`}
                          </span>
                          {pinStatusMap[rest.id]?.has_pin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-7 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 ${copiedPinLinkId === rest.id ? 'bg-emerald-500 text-white hover:bg-emerald-500' : 'bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'}`}
                              onClick={() => copyPinLink(rest.slug, rest.id)}
                            >
                              {copiedPinLinkId === rest.id ? <><Check className="w-3 h-3 mr-1" />Copiado</> : 'Copiar link'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Abrir painel do dono em nova aba"
                            className="h-7 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600"
                            onClick={() => openOwnerPanel(rest)}
                            disabled={openingPanelId === rest.id}
                          >
                            {openingPanelId === rest.id ? 'Abrindo…' : 'Abrir'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title={pinStatusMap[rest.id]?.has_pin ? 'Redefinir PIN' : 'Definir PIN'}
                            className="h-7 w-7 p-0 rounded-xl shrink-0 text-zinc-700 hover:bg-zinc-200"
                            onClick={() => setPinDialog({ rest, mode: pinStatusMap[rest.id]?.has_pin ? 'reset' : 'set' })}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1 rounded-2xl bg-zinc-100 text-zinc-900 font-bold border-zinc-100 hover:bg-zinc-200 transition-colors"
                            onClick={() => { setSelectedRestaurantId(rest.id); setActiveTab('menu'); }}
                          >
                            Editar Menu
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-12 h-10 rounded-2xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                            onClick={() => { setEditingRestaurant(rest); setIsRestDialogOpen(true); }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                             variant="ghost"
                             size="icon"
                             className="w-12 h-10 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                             onClick={async () => {
                               if (confirm(`Tem certeza que deseja excluir o cardápio "${rest.name}"? Esta ação é irreversível.`)) {
                                 const { error } = await sb.from('restaurants').delete().eq('id', rest.id);
                                 if (error) {
                                   alert('Erro ao excluir restaurante: ' + error.message);
                                 } else {
                                   loadData();
                                 }
                               }
                             }}
                          >
                             <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button 
                             onClick={() => { setSelectedRestaurantId(rest.id); setActiveTab('preview'); }}
                             className="w-12 h-10 rounded-2xl bg-zinc-900 text-white hover:bg-primary transition-all shadow-lg shadow-zinc-900/10"
                          >
                             <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Arquitetura de Menu</h1>
                  <p className="text-zinc-500 font-medium mt-1">Projetando a experiência gastronômica de <span className="text-primary">{selectedRestaurant?.name}</span></p>
                </div>
                <Button variant="ghost" onClick={() => setActiveTab('list')} className="rounded-full text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-zinc-900 transition-colors">
                  &larr; Voltar
                </Button>
              </div>
              <MenuManager restaurantId={selectedRestaurantId!} />
            </motion.div>
          )}

          {activeView === 'visual' && (
            <motion.div 
              key="visual"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-7xl mx-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Estúdio de Design</h1>
                  <p className="text-zinc-500 font-medium mt-1">Personalizando o DNA visual de <span className="text-primary">{selectedRestaurant?.name}</span></p>
                </div>
                <Button variant="ghost" onClick={() => setActiveTab('list')} className="rounded-full text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-zinc-900 transition-colors">
                  &larr; Voltar
                </Button>
              </div>
              <VisualManager restaurant={selectedRestaurant!} />
            </motion.div>
          )}

          {activeView === 'preview' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full max-w-7xl mx-auto flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Visualização Master</h1>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setActiveTab('list')} className="rounded-full text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-zinc-900 transition-colors">
                    Sair do Preview
                  </Button>
                  <Button onClick={() => window.open(`/${selectedRestaurant?.slug}`, '_blank')} className="rounded-full px-8 bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-zinc-900/10 hover:bg-primary transition-all">
                     Abrir Link Público
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex justify-center items-start sm:items-center p-2 sm:p-4 overflow-x-hidden">
                <div className="relative w-full max-w-[375px] aspect-[375/760] mx-auto rounded-[2.5rem] sm:rounded-[3.5rem] border-[10px] sm:border-[12px] border-zinc-900 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.1),0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
                   {/* Dynamic Island / Notch */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-zinc-900 rounded-b-3xl z-50 flex items-center justify-center">
                     <div className="w-10 h-1 bg-zinc-800 rounded-full" />
                   </div>
                   
                   <iframe 
                      src={`/${selectedRestaurant?.slug}`} 
                      className="w-full h-full border-none"
                      title="Menu Live Preview"
                   />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <RestaurantDialog 
        open={isRestDialogOpen} 
        onOpenChange={(open) => {
          setIsRestDialogOpen(open);
          if (!open) loadData();
        }} 
        restaurant={editingRestaurant} 
      />
      <PinDialog
        state={pinDialog}
        sessionHash={sessionHash}
        onClose={(refresh) => {
          setPinDialog(null);
          if (refresh) loadData();
        }}
      />
    </div>
  );
}

function PinDialog({
  state,
  sessionHash,
  onClose,
}: {
  state: { rest: Restaurant; mode: 'set' | 'reset' } | null;
  sessionHash: string | null;
  onClose: (refresh?: boolean) => void;
}) {
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (state) { setPin(""); setPin2(""); setErr(null); }
  }, [state]);

  if (!state) return null;

  async function save() {
    if (!sessionHash) { toast.error("Sessão expirada"); return; }
    if (!/^[0-9]{4,8}$/.test(pin)) { setErr("PIN deve ter 4 a 8 dígitos"); return; }
    if (pin !== pin2) { setErr("Os PINs não coincidem"); return; }
    setWorking(true); setErr(null);
    const { error } = await sb.rpc("admin_set_restaurant_pin", {
      _password_hash: sessionHash,
      _restaurant_id: state!.rest.id,
      _pin: pin,
    });
    setWorking(false);
    if (error) { setErr(error.message); return; }
    toast.success(`PIN definido. Compartilhe: /${state!.rest.slug}/admin`);
    onClose(true);
  }

  async function clearPin() {
    if (!sessionHash) return;
    if (!confirm("Remover o PIN deixa o painel sem acesso até você definir um novo. Continuar?")) return;
    setWorking(true);
    const { error } = await sb.rpc("admin_clear_restaurant_pin", {
      _password_hash: sessionHash,
      _restaurant_id: state!.rest.id,
    });
    setWorking(false);
    if (error) { toast.error(error.message); return; }
    toast.success("PIN removido");
    onClose(true);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-900/60 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900">
              {state.mode === 'reset' ? 'Redefinir PIN' : 'Definir PIN'}
            </h3>
            <p className="text-xs text-zinc-500 truncate max-w-[220px]">{state.rest.name}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-4">
          O PIN é o que o dono vai digitar em <strong>/{state.rest.slug}/admin</strong> para entrar.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Novo PIN (4–8 dígitos)"
            className="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-zinc-900 outline-none text-center text-lg font-black tracking-[0.4em]"
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={pin2}
            onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
            placeholder="Confirme o PIN"
            className="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-zinc-900 outline-none text-center text-lg font-black tracking-[0.4em]"
          />
          {err && <p className="text-xs text-rose-600 font-bold">{err}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => onClose()}
            disabled={working}
            className="flex-1 h-11 rounded-xl bg-zinc-100 text-zinc-700 font-bold text-sm hover:bg-zinc-200"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={working}
            className="flex-1 h-11 rounded-xl bg-zinc-900 text-white font-black text-sm hover:bg-zinc-800 disabled:opacity-50"
          >
            {working ? '...' : 'Salvar PIN'}
          </button>
        </div>

        {state.mode === 'reset' && (
          <button
            onClick={clearPin}
            disabled={working}
            className="w-full mt-3 h-10 rounded-xl text-rose-600 font-bold text-xs hover:bg-rose-50"
          >
            Remover PIN deste restaurante
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick, disabled }: { active?: boolean, icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
        disabled ? 'opacity-20 cursor-not-allowed grayscale' : 
        active 
          ? 'bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20 translate-x-1' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 hover:translate-x-1'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-primary' : ''}`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        <div className="p-2 bg-zinc-50 rounded-xl">{icon}</div>
      </div>
      <p className="text-4xl font-black text-zinc-900 tracking-tighter">{value}</p>
    </div>
  );
}
