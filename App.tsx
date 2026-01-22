
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Search, Mail, LogIn, Store, Package, Upload, Trash2, Plus, Minus, 
  Tag, Zap, CheckCircle2, ShieldCheck, RefreshCcw, Camera, X, Check, MapPin, 
  Building2, Image as ImageIcon, CreditCard, Rocket, Star, User, UserPlus, 
  Calculator, ReceiptText, ChevronRight, LayoutGrid, Flame, UtensilsCrossed, 
  SprayCan, Bath, Croissant, MessageSquareText, Heart, Send, Apple, PackagePlus,
  Pencil, Bell, MessageCircle, Share2, Layers, ChevronDown, ChevronUp, ChevronLeft, ChevronRight as ChevronRightIcon,
  Wine, Home, MapPinned, ListChecks
} from 'lucide-react';
import { Product, Supermarket, PriceRecord, ViewState, ShoppingListItem, User as UserType, Feedback } from './types';
import { INITIAL_PRODUCTS, INITIAL_SUPERMARKETS, INITIAL_PRICES } from './constants';
import { getSmartShoppingSuggestions } from './geminiService';

// --- Helpers ---

const sendWhatsAppNotification = (phone: string, message: string) => {
  const encodedMsg = encodeURIComponent(message);
  window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
};

// --- Shared Components ---

const CameraModal: React.FC<{ 
  onClose: () => void; 
  onCapture: (base64: string) => void;
  productName: string;
}> = ({ onClose, onCapture, productName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        alert("Não foi possível acessar a câmera. Verifique as permissões.");
        onClose();
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-emerald-500" />
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest truncate max-w-[200px]">{productName || "Novo Produto"}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="relative aspect-square bg-black overflow-hidden">
          {!capturedImage ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-dashed border-white/50 rounded-3xl" />
              </div>
            </>
          ) : (
            <img src={capturedImage} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="p-8 flex justify-center gap-6 bg-gray-50">
          {!capturedImage ? (
            <button 
              onClick={takePhoto}
              className="w-20 h-20 bg-emerald-500 rounded-full border-[6px] border-white flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white/30" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => setCapturedImage(null)}
                className="px-6 py-4 bg-gray-200 rounded-2xl font-black text-gray-600 hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <RefreshCcw size={20} /> Refazer
              </button>
              <button 
                onClick={() => onCapture(capturedImage)}
                className="px-8 py-4 bg-emerald-500 rounded-2xl font-black text-white shadow-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Check size={20} /> Salvar Foto
              </button>
            </>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

// --- Modal: Cadastro/Edição de Produto ---

const ProductFormModal: React.FC<{
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id'>, initialPrice?: number) => void;
  initialProduct?: Product;
}> = ({ onClose, onSave, initialProduct }) => {
  const [formData, setFormData] = useState({
    productName: initialProduct?.productName || '',
    barcode: initialProduct?.barcode || '',
    brand: initialProduct?.brand || '',
    category: initialProduct?.category || 'Mercearia',
    imageUrl: initialProduct?.imageUrl || '',
    initialPrice: ''
  });
  const [showCamera, setShowCamera] = useState(false);

  const categories = ['Hortifruti', 'Mercearia', 'Limpeza', 'Higiene', 'Laticínios', 'Padaria', 'Bebidas Alcoólicas'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.barcode) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (initialProduct) {
      onSave({
        ...initialProduct,
        productName: formData.productName,
        barcode: formData.barcode,
        brand: formData.brand,
        category: formData.category,
        imageUrl: formData.imageUrl
      });
    } else {
      onSave({
        productName: formData.productName,
        barcode: formData.barcode,
        brand: formData.brand,
        category: formData.category,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300&h=300'
      }, parseFloat(formData.initialPrice || '0'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {showCamera && (
        <CameraModal 
          productName={formData.productName} 
          onClose={() => setShowCamera(false)} 
          onCapture={(base64) => {
            setFormData({...formData, imageUrl: base64});
            setShowCamera(false);
          }} 
        />
      )}
      
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 border-b flex justify-between items-center">
          <div className="flex items-center gap-3 text-emerald-600">
            {initialProduct ? <Pencil size={28} /> : <PackagePlus size={28} />}
            <h3 className="font-black text-2xl text-gray-900 tracking-tight">{initialProduct ? 'Editar Cadastro' : 'Novo Cadastro'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div 
              onClick={() => setShowCamera(true)}
              className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all overflow-hidden relative group"
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={32} className="text-gray-300 group-hover:text-emerald-500" />
                  <span className="text-[10px] font-black text-gray-400 mt-2 uppercase">Tirar Foto</span>
                </>
              )}
              {formData.imageUrl && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <RefreshCcw size={24} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome do Produto *</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium"
                placeholder="Ex: Arroz Integral 1kg"
                value={formData.productName}
                onChange={e => setFormData({...formData, productName: e.target.value})}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">EAN (Código de Barras) *</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-mono"
                placeholder="789..."
                value={formData.barcode}
                onChange={e => setFormData({...formData, barcode: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Marca</label>
              <input 
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium"
                placeholder="Ex: Tio João"
                value={formData.brand}
                onChange={e => setFormData({...formData, brand: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoria</label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {!initialProduct && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Preço Inicial (R$) *</label>
                <input 
                  required
                  type="number" step="0.01"
                  className="w-full px-5 py-4 bg-emerald-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-black text-emerald-700"
                  placeholder="0,00"
                  value={formData.initialPrice}
                  onChange={e => setFormData({...formData, initialPrice: e.target.value})}
                />
              </div>
            )}
          </div>
        </form>

        <div className="p-8 border-t bg-gray-50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
          <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
            {initialProduct ? 'Atualizar Dados' : 'Salvar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Modal: Cadastro/Edição de Filial ---

const BranchFormModal: React.FC<{
  onClose: () => void;
  onSave: (branch: Supermarket | Omit<Supermarket, 'id'>) => void;
  initialBranch?: Supermarket;
  supermarketId: string;
}> = ({ onClose, onSave, initialBranch, supermarketId }) => {
  const [formData, setFormData] = useState({
    name: initialBranch?.name || '',
    cep: initialBranch?.cep || '',
    street: initialBranch?.street || '',
    number: initialBranch?.number || '',
    neighborhood: initialBranch?.neighborhood || '',
    city: initialBranch?.city || '',
    state: initialBranch?.state || 'SP'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      alert("Por favor, preencha o nome da unidade e a cidade.");
      return;
    }

    onSave({
      ...initialBranch,
      ...formData,
      parentId: supermarketId,
      logoUrl: initialBranch?.logoUrl || '' // Usa o mesmo logo da matriz ou herdado
    } as Supermarket);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 border-b flex justify-between items-center">
          <div className="flex items-center gap-3 text-emerald-600">
            <Building2 size={28} />
            <h3 className="font-black text-2xl text-gray-900 tracking-tight">{initialBranch ? 'Editar Filial' : 'Nova Filial'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome da Unidade *</label>
            <input 
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium"
              placeholder="Ex: Unidade Centro"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CEP</label>
              <input 
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium"
                placeholder="00000-000"
                value={formData.cep}
                onChange={e => setFormData({...formData, cep: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cidade *</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium"
                placeholder="Ex: São Paulo"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Endereço Completo</label>
            <input 
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-medium"
              placeholder="Rua, Número, Bairro"
              value={formData.street}
              onChange={e => setFormData({...formData, street: e.target.value})}
            />
          </div>
        </form>

        <div className="p-8 border-t bg-gray-50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
          <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">
            Salvar Filial
          </button>
        </div>
      </div>
    </div>
  );
};

// --- View: Calculator Modal ---

const CalculatorModal: React.FC<{
  onClose: () => void;
  items: ShoppingListItem[];
  supermarkets: Supermarket[];
  prices: PriceRecord[];
}> = ({ onClose, items, supermarkets, prices }) => {
  const [selectedMarketId, setSelectedMarketId] = useState(supermarkets[0]?.id || '');
  const market = supermarkets.find(m => m.id === selectedMarketId);
  
  const receiptItems = items.map(item => {
    const priceRec = prices.find(p => p.productId === item.product.id && p.supermarketId === selectedMarketId);
    return {
      name: item.product.productName,
      qty: item.quantity,
      unitPrice: priceRec?.price || 0,
      subtotal: (priceRec?.price || 0) * item.quantity
    };
  });

  const total = receiptItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3 text-emerald-600">
            <Calculator size={24} />
            <h3 className="font-black text-xl text-gray-900 tracking-tight">Recibo Estimado</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
        </div>

        <div className="p-6 flex gap-2 overflow-x-auto no-scrollbar">
          {supermarkets.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarketId(m.id)}
              className={`px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                selectedMarketId === m.id 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4">
          <div className="bg-gray-50/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 font-mono text-sm">
            <div className="text-center mb-6">
              <p className="font-black uppercase tracking-widest text-gray-800">{market?.name}</p>
              <p className="text-[10px] text-gray-400">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            <div className="space-y-3 border-y border-dashed border-gray-200 py-4">
              {receiptItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="uppercase leading-tight text-gray-700">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.qty}x R$ {item.unitPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-bold">R$ {item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between items-end">
              <p className="font-black text-gray-400 uppercase text-xs">Total Sacola</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">R$ {total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <button onClick={onClose} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95">Fechar Resumo</button>
        </div>
      </div>
    </div>
  );
};

// --- View: Feedback ---

const FeedbackView: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    { id: 'f1', userName: 'Maria Silva', rating: 5, comment: 'Finalmente consigo comparar o preço do leite sem ter que ir em dois mercados diferentes! Economizei R$ 40,00 na última compra.', date: 'Há 2 horas', likes: 12, userPhoto: 'https://i.pravatar.cc/150?u=maria' },
    { id: 'f2', userName: 'João Pedro', rating: 4, comment: 'Muito bom, mas seria legal ter mais padarias cadastradas. O scanner do Gmail funcionou perfeitamente.', date: 'Há 1 dia', likes: 5, userPhoto: 'https://i.pravatar.cc/150?u=joao' },
    { id: 'f3', userName: 'Ana Costa', rating: 5, comment: 'O Preço Justo virou meu app favorito. O design é lindo e muito fácil de usar.', date: 'Há 3 dias', likes: 28, userPhoto: 'https://i.pravatar.cc/150?u=ana' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setFeedbacks([{
        id: `f-${Date.now()}`, userName: 'Você', rating: newRating, comment: newComment, date: 'Agora mesmo', likes: 0, userPhoto: 'https://i.pravatar.cc/150?u=me'
      }, ...feedbacks]);
      setNewComment('');
      setNewRating(5);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-3">
        <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full w-fit mx-auto shadow-lg"><MessageSquareText size={32} /></div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Comunidade</h2>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setNewRating(star)} className={`transition-all ${newRating >= star ? 'text-amber-400 scale-110' : 'text-gray-200'}`}>
              <Star size={28} fill={newRating >= star ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <textarea className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl outline-none font-medium min-h-[120px]" placeholder="Sua experiência..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
          {isSubmitting ? <RefreshCcw className="animate-spin" /> : <Send size={20} />} Enviar Feedback
        </button>
      </div>
      <div className="space-y-6">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="bg-white p-6 rounded-[2rem] shadow-md border border-gray-50 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={fb.userPhoto} className="w-12 h-12 rounded-full border-2 border-emerald-50" />
                <div>
                  <h4 className="font-bold text-gray-900">{fb.userName}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{fb.date}</p>
                </div>
              </div>
              <div className="flex text-amber-400">{Array.from({ length: fb.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
            </div>
            <p className="text-gray-600 font-medium">{fb.comment}</p>
            <div className="pt-2 flex items-center gap-4 text-gray-400"><Heart size={18} /><span className="text-xs font-bold">{fb.likes}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- View: Consumer Home ---

const CategoryPill: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  isExpandable?: boolean;
  isExpanded?: boolean;
}> = ({ label, icon, active, onClick, isExpandable, isExpanded }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap shadow-sm group ${
      active ? 'bg-[#059669] text-white shadow-[#059669]/20' : 'bg-white text-gray-500 hover:bg-emerald-50 border border-gray-100'
    }`}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    {isExpandable && (
      <div className={`ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
        <ChevronDown size={14} className={active ? 'text-white/70' : 'text-gray-300'} />
      </div>
    )}
  </button>
);

const ConsumerHome: React.FC<{ products: Product[]; supermarkets: Supermarket[]; prices: PriceRecord[]; onAddToCart: (product: Product) => void; }> = ({ products, supermarkets, prices, onAddToCart }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tudo');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(true);

  const categories = [
    { label: 'Tudo', icon: <LayoutGrid size={18} /> },
    { label: 'Hortifruti', icon: <Apple size={18} /> },
    { label: 'Mercearia', icon: <UtensilsCrossed size={18} /> },
    { label: 'Limpeza', icon: <SprayCan size={18} /> },
    { label: 'Higiene', icon: <Bath size={18} /> },
    { label: 'Laticínios', icon: <Tag size={18} /> },
    { label: 'Padaria', icon: <Croissant size={18} /> },
    { label: 'Bebidas Alcoólicas', icon: <Wine size={18} /> },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (debouncedSearch) list = list.filter(p => p.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.brand.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (selectedCategory !== 'Tudo') list = list.filter(p => p.category === selectedCategory);
    return list;
  }, [debouncedSearch, selectedCategory, products]);

  const groupedByCategories = useMemo(() => {
    return filteredProducts.reduce((acc, p) => {
      const cat = p.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts]);

  useEffect(() => {
    if (selectedCategory === 'Tudo') {
      const initial: Record<string, boolean> = {};
      (Object.keys(groupedByCategories) as string[]).forEach(cat => initial[cat] = true);
      setExpandedCategories(initial);
    }
  }, [groupedByCategories, selectedCategory]);

  const topDeals = useMemo(() => {
    return products.map(p => {
      const pPrices = prices.filter(pr => pr.productId === p.id);
      const bestPriceRec = pPrices.sort((a, b) => a.price - b.price)[0];
      if (bestPriceRec?.originalPrice && bestPriceRec.originalPrice > bestPriceRec.price) {
        return { product: p, priceRec: bestPriceRec, discount: Math.round(((bestPriceRec.originalPrice - bestPriceRec.price) / bestPriceRec.originalPrice) * 100) };
      }
      return null;
    }).filter(d => d !== null);
  }, [products, prices]);

  const handleWhatsAppAlert = (productName: string) => {
    sendWhatsAppNotification('5500000000000', `Olá! Gostaria de receber alertas de preço baixo para o produto: ${productName}. Por favor, me avise quando o valor cair! 🔔`);
  };

  const handleCategoryClick = (label: string) => {
    if (label === 'Tudo') {
      setIsCategoriesCollapsed(!isCategoriesCollapsed);
      setSelectedCategory('Tudo');
    } else {
      setSelectedCategory(label);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-700">
      <div className="relative group mt-4 transition-all">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-1 border border-gray-100 flex items-center">
          <div className="pl-6 text-emerald-500 shrink-0">
            <Search size={28} />
          </div>
          <input 
            type="text" 
            placeholder="O que você procura?" 
            className="w-full px-4 py-6 outline-none font-bold text-lg text-emerald-600 placeholder:text-emerald-300 bg-white" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar items-center">
        {/* Botão Tudo fixo que controla o toggle */}
        <CategoryPill 
          label="Tudo" 
          icon={<LayoutGrid size={18} />} 
          active={selectedCategory === 'Tudo'} 
          onClick={() => handleCategoryClick('Tudo')}
          isExpandable={true}
          isExpanded={!isCategoriesCollapsed}
        />

        {/* Demais categorias que aparecem/desaparecem */}
        {!isCategoriesCollapsed && categories.filter(c => c.label !== 'Tudo').map((cat) => (
          <div key={cat.label} className="animate-in slide-in-from-left-2 fade-in duration-300">
            <CategoryPill 
              label={cat.label} 
              icon={cat.icon} 
              active={selectedCategory === cat.label} 
              onClick={() => handleCategoryClick(cat.label)} 
            />
          </div>
        ))}
        
        {isCategoriesCollapsed && selectedCategory !== 'Tudo' && (
          <div className="animate-in zoom-in duration-300">
            <CategoryPill 
              label={selectedCategory} 
              icon={categories.find(c => c.label === selectedCategory)?.icon} 
              active={true} 
              onClick={() => {}} 
            />
          </div>
        )}
      </div>

      {!debouncedSearch && selectedCategory === 'Tudo' && topDeals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-orange-500">
            <Flame size={20} fill="currentColor" />
            <h2 className="text-lg font-black uppercase italic tracking-widest">OFERTAS</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {topDeals.map((deal) => (
              <div key={deal!.product.id} className="bg-white rounded-[1.5rem] p-2.5 shadow-lg border border-orange-50 relative group">
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md z-10 animate-pulse">-{deal!.discount}%</div>
                <button 
                  onClick={() => handleWhatsAppAlert(deal!.product.productName)}
                  className="absolute top-2 right-2 p-1.5 bg-emerald-500 text-white rounded-full shadow-md z-10 active:scale-90 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Bell size={10} />
                </button>
                <img src={deal!.product.imageUrl} onClick={() => onAddToCart(deal!.product)} className="w-full aspect-square object-cover rounded-xl mb-2 shadow-inner cursor-pointer hover:scale-105 transition-transform" />
                <h3 className="font-bold text-gray-900 text-[10px] line-clamp-2 h-7 leading-tight mb-1">{deal!.product.productName}</h3>
                <div className="mt-1">
                  <span className="text-[8px] text-gray-400 line-through">R$ {deal!.priceRec.originalPrice?.toFixed(2)}</span>
                  <div className="text-sm font-black text-emerald-600 tracking-tighter">R$ {deal!.priceRec.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {(Object.entries(groupedByCategories) as [string, Product[]][]).map(([category, catProducts]) => (
          <div key={category} className="space-y-4">
            {selectedCategory === 'Tudo' && (
              <button 
                onClick={() => setExpandedCategories(p => ({...p, [category]: !p[category]}))}
                className="w-full flex items-center justify-between px-2 group"
              >
                <div className="flex items-center gap-2 text-gray-400 group-hover:text-emerald-500 transition-colors">
                  <Layers size={18} />
                  <h2 className="text-sm font-black uppercase tracking-widest">{category}</h2>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{catProducts.length}</span>
                </div>
                {expandedCategories[category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            
            {(selectedCategory !== 'Tudo' || expandedCategories[category]) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {catProducts.map(product => {
                  const mPrices = supermarkets.map(m => ({ market: m, record: prices.find(p => p.productId === product.id && p.supermarketId === m.id) }));
                  const minPrice = Math.min(...mPrices.filter(mp => mp.record).map(mp => mp.record!.price));
                  return (
                    <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-lg border border-gray-50 flex gap-5 hover:border-emerald-100 transition-colors">
                      <div className="relative shrink-0">
                        <img src={product.imageUrl} className="w-32 h-32 object-cover rounded-[1.8rem] border" />
                        <button 
                          onClick={() => handleWhatsAppAlert(product.productName)}
                          className="absolute -top-2 -right-2 p-2.5 bg-white text-emerald-500 rounded-full shadow-md border border-emerald-50 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                        >
                          <Bell size={16} strokeWidth={3} />
                        </button>
                      </div>
                      <div className="flex-1 space-y-3 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <div className="overflow-hidden">
                            <h3 className="font-black text-gray-900 leading-tight truncate">{product.productName}</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</p>
                          </div>
                          <button onClick={() => onAddToCart(product)} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl active:scale-90 transition-all shrink-0 hover:bg-emerald-600 hover:text-white"><Plus size={20} strokeWidth={3} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {mPrices.map(({ market, record }) => (
                            <div key={market.id} className={`p-2 rounded-xl border flex flex-col justify-center ${record?.price === minPrice ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                              <span className="text-[8px] font-black text-gray-400 uppercase block truncate">{market.name}</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black">{record ? `R$ ${record.price.toFixed(2)}` : 'Indisponível'}</span>
                                {record?.price === minPrice && <span className="text-[7px] text-emerald-600 font-black uppercase">Melhor</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- View: Shopping List ---

const ShoppingListView: React.FC<{ items: ShoppingListItem[]; onUpdateQty: (id: string, delta: number) => void; onRemove: (id: string) => void; supermarkets: Supermarket[]; prices: PriceRecord[]; }> = ({ items, onUpdateQty, onRemove, supermarkets, prices }) => {
  const [showCalc, setShowCalc] = useState(false);
  const totals = supermarkets.map(m => {
    let sum = 0;
    items.forEach(it => {
      const pr = prices.find(p => p.productId === it.product.id && p.supermarketId === m.id);
      if (pr) sum += pr.price * it.quantity;
    });
    return { market: m, total: sum };
  });
  const best = [...totals].sort((a, b) => a.total - b.total)[0];

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-gray-100 p-8 rounded-[3rem] mb-6 text-gray-300"><ShoppingCart size={64} /></div>
      <h2 className="text-2xl font-black text-gray-900">Sua lista está vazia</h2>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 pb-64">
      {showCalc && <CalculatorModal onClose={() => setShowCalc(false)} items={items} supermarkets={supermarkets} prices={prices} />}
      <div className="flex justify-between items-end">
        <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">Minha Lista</h2><p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{items.length} itens</p></div>
        <button onClick={() => setShowCalc(true)} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-black text-xs uppercase"><Calculator size={16} /> Ver Recibo</button>
      </div>
      <div className="space-y-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-md border border-gray-100 flex items-center gap-5">
            <img src={product.imageUrl} className="w-20 h-20 rounded-[1.5rem] object-cover" />
            <div className="flex-1">
              <h4 className="font-black text-gray-900 leading-tight">{product.productName}</h4>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center bg-gray-50 rounded-2xl p-1 border">
                  <button onClick={() => onUpdateQty(product.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-xl"><Minus size={14} /></button>
                  <span className="font-black w-8 text-center">{quantity}</span>
                  <button onClick={() => onUpdateQty(product.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-xl"><Plus size={14} /></button>
                </div>
              </div>
            </div>
            <button onClick={() => onRemove(product.id)} className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={24} /></button>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t p-6 pb-10 z-40">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {totals.map(t => (
              <div key={t.market.id} className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-black">{t.market.name}</span>
                <span className="text-2xl font-black tracking-tighter">R$ {t.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowCalc(true)} className="w-full bg-emerald-600 rounded-[2rem] p-5 flex items-center justify-between text-white shadow-2xl">
            <div className="text-left"><p className="text-[10px] font-black uppercase opacity-80">Melhor Opção</p><h4 className="font-bold text-lg leading-tight">{best.market.name}</h4></div>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- View: Admin Panel ---

const AdminPanel: React.FC<{
  supermarket: Supermarket;
  allSupermarkets: Supermarket[];
  products: Product[];
  allPrices: PriceRecord[];
  onUpdatePrice: (prodId: string, marketId: string, newPrice: number) => void;
  onUpdateStock: (prodId: string, marketId: string, delta: number) => void;
  onUpdateImage: (prodId: string, imageUrl: string) => void;
  onAddNewProduct: (product: Omit<Product, 'id'>, marketId: string, initialPrice: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (prodId: string) => void;
  onAddBranch: (branch: Omit<Supermarket, 'id'>) => void;
  onEditBranch: (branch: Supermarket) => void;
}> = ({ supermarket, allSupermarkets, products, allPrices, onUpdatePrice, onUpdateStock, onUpdateImage, onAddNewProduct, onEditProduct, onDeleteProduct, onAddBranch, onEditBranch }) => {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'BRANCHES'>('PRODUCTS');
  const [selectedBranchId, setSelectedBranchId] = useState(supermarket.id);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const myBranches = useMemo(() => {
    return [supermarket, ...allSupermarkets.filter(m => m.parentId === supermarket.id)];
  }, [allSupermarkets, supermarket]);

  const currentManagingBranch = useMemo(() => {
    return myBranches.find(b => b.id === selectedBranchId) || supermarket;
  }, [myBranches, selectedBranchId, supermarket]);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const cat = product.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    (Object.keys(groupedProducts) as string[]).forEach(cat => initialExpanded[cat] = true);
    setExpandedCategories(initialExpanded);
  }, [groupedProducts]);

  const handleNotifyWhatsApp = (productName: string, price: number) => {
    const message = `🔥 OFERTA IMPERDÍVEL! O ${productName} está por apenas R$ ${price.toFixed(2)} no ${currentManagingBranch.name}! Unidade ${currentManagingBranch.city}. 🚀`;
    sendWhatsAppNotification('5500000000000', message);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <img src={supermarket.logoUrl} className="w-16 h-16 rounded-2xl shadow-lg border object-contain" />
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">{supermarket.name}</h2>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <Building2 size={14} /> {myBranches.length} Unidades Cadastradas
            </div>
          </div>
        </div>
        
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border">
          <button 
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'PRODUCTS' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-400'}`}
          >
            <div className="flex items-center gap-2"><Package size={16} /> Produtos</div>
          </button>
          <button 
            onClick={() => setActiveTab('BRANCHES')}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'BRANCHES' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-400'}`}
          >
            <div className="flex items-center gap-2"><MapPinned size={16} /> Filiais</div>
          </button>
        </div>
      </div>

      {activeTab === 'BRANCHES' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xl font-black text-gray-800">Minhas Unidades</h3>
            <button 
              onClick={() => { setEditingItem(null); setShowBranchModal(true); }}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-xs shadow-lg hover:bg-emerald-700 transition-all"
            >
              <Plus size={18} /> Adicionar Filial
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBranches.map(branch => (
              <div key={branch.id} className={`bg-white p-6 rounded-[2.5rem] shadow-md border-2 transition-all ${selectedBranchId === branch.id ? 'border-emerald-500' : 'border-transparent'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><Building2 /></div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(branch); setShowBranchModal(true); }} className="p-2 text-gray-400 hover:text-emerald-500"><Pencil size={18} /></button>
                  </div>
                </div>
                <h4 className="font-black text-lg text-gray-900 mb-1">{branch.name}</h4>
                <p className="text-xs font-medium text-gray-500 mb-4">{branch.street || 'Endereço não cadastrado'}, {branch.city}</p>
                <button 
                  onClick={() => { setSelectedBranchId(branch.id); setActiveTab('PRODUCTS'); }}
                  className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedBranchId === branch.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                >
                  {selectedBranchId === branch.id ? 'Unidade Selecionada' : 'Gerenciar Preços'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-white p-2 rounded-xl"><Home size={18} /></div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase">Gerenciando Agora:</p>
                <h3 className="font-black text-gray-800">{currentManagingBranch.name} ({currentManagingBranch.city})</h3>
              </div>
            </div>
            <button 
              onClick={() => { setEditingItem(null); setShowProductModal(true); }}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black uppercase text-xs shadow-xl shadow-emerald-100"
            >
              <Plus size={20} /> Novo Produto
            </button>
          </div>

          <div className="space-y-6">
            {(Object.entries(groupedProducts) as [string, Product[]][]).map(([category, catProducts]) => (
              <div key={category} className="bg-white rounded-[2.5rem] shadow-xl border overflow-hidden">
                <div className="px-8 py-6 bg-gray-50/50 flex items-center justify-between border-b">
                  <div className="flex items-center gap-3">
                    <Layers size={18} className="text-emerald-500" />
                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">{category}</h3>
                  </div>
                  <span className="bg-white text-gray-400 text-[10px] font-black px-3 py-1 rounded-full border">{catProducts.length} itens</span>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase">Produto</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase">Preço (R$)</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase">Estoque</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {catProducts.map(product => {
                        const curPrice = allPrices.find(p => p.productId === product.id && p.supermarketId === selectedBranchId);
                        const stock = curPrice?.stock ?? 0;
                        return (
                          <tr key={product.id} className="hover:bg-emerald-50/10 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <img src={product.imageUrl} className="w-12 h-12 rounded-2xl object-cover border" />
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{product.productName}</p>
                                  <p className="text-[10px] font-black text-gray-400 uppercase">{product.brand}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="relative w-28">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">R$</span>
                                <input 
                                  type="number" step="0.01" 
                                  className="w-full pl-8 pr-3 py-2 bg-gray-50 focus:bg-white border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none font-black text-sm"
                                  value={curPrice?.price || ''}
                                  onChange={(e) => onUpdatePrice(product.id, selectedBranchId, parseFloat(e.target.value))}
                                  placeholder="0,00"
                                />
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2">
                                <button onClick={() => onUpdateStock(product.id, selectedBranchId, -1)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-red-50 hover:text-red-500"><Minus size={14} /></button>
                                <span className="min-w-[30px] text-center font-black text-sm">{stock}</span>
                                <button onClick={() => onUpdateStock(product.id, selectedBranchId, 1)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-emerald-50 hover:text-emerald-500"><Plus size={14} /></button>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleNotifyWhatsApp(product.productName, curPrice?.price || 0)} className="p-2.5 bg-[#25D366] text-white rounded-xl shadow-sm"><MessageCircle size={16} /></button>
                                <button onClick={() => { setEditingItem(product); setShowProductModal(true); }} className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:text-emerald-600"><Pencil size={16} /></button>
                                <button onClick={() => onDeleteProduct(product.id)} className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:text-red-500"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showProductModal && (
        <ProductFormModal 
          initialProduct={editingItem}
          onClose={() => setShowProductModal(false)}
          onSave={(prod, price) => {
            if ('id' in prod) onEditProduct(prod as Product);
            else onAddNewProduct(prod, selectedBranchId, price || 0);
            setShowProductModal(false);
          }}
        />
      )}

      {showBranchModal && (
        <BranchFormModal 
          supermarketId={supermarket.id}
          initialBranch={editingItem}
          onClose={() => setShowBranchModal(false)}
          onSave={(branch) => {
            if ('id' in branch) onEditBranch(branch as Supermarket);
            else onAddBranch(branch);
            setShowBranchModal(false);
          }}
        />
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('CONSUMER');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>(INITIAL_SUPERMARKETS);
  const [prices, setPrices] = useState<PriceRecord[]>(INITIAL_PRICES);
  const [currentUserMarket, setCurrentUserMarket] = useState<Supermarket | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const addToCart = (product: Product) => {
    setShoppingList(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdatePrice = (prodId: string, marketId: string, newPrice: number) => {
    setPrices(prev => {
      const idx = prev.findIndex(p => p.productId === prodId && p.supermarketId === marketId);
      if (idx > -1) {
        const up = [...prev];
        up[idx] = { ...up[idx], price: newPrice, lastUpdated: Date.now() };
        return up;
      }
      return [...prev, { id: `pr-${Date.now()}`, productId: prodId, supermarketId: marketId, price: newPrice, stock: 0, lastUpdated: Date.now() }];
    });
  };

  const handleUpdateStock = (prodId: string, marketId: string, delta: number) => {
    setPrices(prev => {
      const idx = prev.findIndex(p => p.productId === prodId && p.supermarketId === marketId);
      if (idx > -1) {
        const up = [...prev];
        const currentStock = up[idx].stock || 0;
        up[idx] = { ...up[idx], stock: Math.max(0, currentStock + delta), lastUpdated: Date.now() };
        return up;
      }
      return prev;
    });
  };

  const handleAddNewProduct = (prodData: Omit<Product, 'id'>, marketId: string, initialPrice: number) => {
    const newId = `p-${Date.now()}`;
    const newProduct: Product = { ...prodData, id: newId };
    setProducts(prev => [...prev, newProduct]);
    setPrices(prev => [...prev, { 
      id: `pr-${Date.now()}`, 
      productId: newId, 
      supermarketId: marketId, 
      price: initialPrice, 
      stock: 0,
      lastUpdated: Date.now() 
    }]);
  };

  const handleAddBranch = (branchData: Omit<Supermarket, 'id'>) => {
    const newBranch: Supermarket = { ...branchData, id: `s-${Date.now()}` };
    setSupermarkets(prev => [...prev, newBranch]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('CONSUMER')}>
          <div className="bg-[#059669] text-white p-1.5 rounded-xl shadow-lg"><Tag size={24} /></div>
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Preço Justo</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setView('CONSUMER')} className={`p-2.5 rounded-xl ${view === 'CONSUMER' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400'}`}><Search size={22} /></button>
          <button onClick={() => setView('FEEDBACK')} className={`p-2.5 rounded-xl ${view === 'FEEDBACK' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400'}`}><MessageSquareText size={22} /></button>
          <button onClick={() => setView('LIST')} className={`p-2.5 rounded-xl relative ${view === 'LIST' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}>
            <ShoppingCart size={22} />
            {shoppingList.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">{shoppingList.length}</span>}
          </button>
          <button onClick={() => setView('LOGIN')} className={`p-2.5 rounded-xl ${view === 'LOGIN' || view === 'ADMIN' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}>
            {currentUserMarket ? <Store size={22} /> : (loggedInUser ? <User size={22} /> : <LogIn size={22} />)}
          </button>
        </div>
      </nav>

      <main className="pb-10">
        {view === 'CONSUMER' && <ConsumerHome products={products} supermarkets={supermarkets} prices={prices} onAddToCart={addToCart} />}
        {view === 'FEEDBACK' && <FeedbackView />}
        {view === 'LIST' && <ShoppingListView items={shoppingList} onUpdateQty={(id, d) => setShoppingList(p => p.map(it => it.product.id === id ? { ...it, quantity: Math.max(1, it.quantity + d) } : it))} onRemove={(id) => setShoppingList(p => p.filter(it => it.product.id !== id))} supermarkets={supermarkets} prices={prices} />}
        {view === 'ADMIN' && currentUserMarket && (
          <AdminPanel 
            supermarket={currentUserMarket} 
            allSupermarkets={supermarkets}
            products={products} 
            allPrices={prices} 
            onUpdatePrice={handleUpdatePrice} 
            onUpdateStock={handleUpdateStock}
            onUpdateImage={(id, url) => setProducts(p => p.map(item => item.id === id ? {...item, imageUrl: url} : item))} 
            onAddNewProduct={handleAddNewProduct}
            onEditProduct={(upd) => setProducts(p => p.map(item => item.id === upd.id ? upd : item))}
            onDeleteProduct={(id) => setProducts(p => p.filter(item => item.id !== id))}
            onAddBranch={handleAddBranch}
            onEditBranch={(upd) => setSupermarkets(s => s.map(item => item.id === upd.id ? upd : item))}
          />
        )}
        {view === 'LOGIN' && (
          <div className="max-w-md mx-auto p-8 flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-emerald-500 text-white p-6 rounded-[2.5rem] mb-8 shadow-2xl"><LogIn size={48} /></div>
            <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">Acesso ao Sistema</h2>
            <div className="w-full space-y-4">
              <button onClick={() => { setCurrentUserMarket(supermarkets[0]); setView('ADMIN'); }} className="w-full bg-[#059669] text-white font-black py-5 rounded-2xl shadow-xl flex flex-col items-center">
                <span>Entrar como Supermercado</span>
                <span className="text-[10px] opacity-70">Gerencie produtos e filiais</span>
              </button>
              <button onClick={() => { setLoggedInUser({ id: 'u1', name: 'Tiago', email: 'tiago@email.com', city: 'SP' }); setView('CONSUMER'); }} className="w-full bg-white border-2 border-gray-100 text-gray-600 font-bold py-5 rounded-2xl flex items-center justify-center gap-3">Entrar como Consumidor</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
