import React, { useState, useEffect } from 'react';
import { ShoppingBag, LayoutDashboard, Database, Store, Package2, ShieldAlert } from 'lucide-react';
import { Produto, ItemCarrinho, Cliente, Pedido, Categoria, Cupom, ConfiguracaoLoja } from './types';
import CatalogView from './components/CatalogView';
import AdminView from './components/AdminView';
import SupabaseGuide from './components/SupabaseGuide';
import { motion, AnimatePresence } from 'motion/react';

const CUPONS_PADRAO: Cupom[] = [];

const CONFIG_PADRAO: ConfiguracaoLoja = {
  nomeLoja: 'Rayzer Gamers PC',
  descricaoLoja: 'Sua loja especializada em PCs de alto desempenho, hardware e periféricos gamer premium.',
  telefoneContato: '(11) 99999-9999',
  emailContato: 'contato@rayzergamerspc.com.br',
  enderecoLoja: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  moeda: 'R$',
  taxaEntregaPadrao: 25.00,
  freteGratisMinimo: 500.00,
  permitirEstoqueNegativo: false,
  modoManutencao: false,
  bannerUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1200'
};

// Lista de categorias padrão de fábrica
const CATEGORIAS_PADRAO: Categoria[] = [
  { id: '1', nome: 'PCs Completos', emoji: '🖥️', descricao: 'Computadores gamer montados e testados por especialistas.' },
  { id: '2', nome: 'Hardware & Peças', emoji: '⚙️', descricao: 'Placas de vídeo, processadores, fontes, gabinetes e coolers.' },
  { id: '3', nome: 'Periféricos', emoji: '⌨️', descricao: 'Teclados mecânicos, mouses de alta precisão e headsets gamer.' },
  { id: '4', nome: 'Cadeiras & Conforto', emoji: '🪑', descricao: 'Cadeiras gamer ergonômicas e mesas para o seu setup.' },
  { id: '5', nome: 'Monitores', emoji: '🖥️', descricao: 'Telas com alta taxa de atualização (Hz) e baixíssimo tempo de resposta.' }
];

// Lista de produtos padrão de fábrica
const PRODUTOS_PADRAO: Produto[] = [];

const CLIENTES_PADRAO: Cliente[] = [];

const PEDIDOS_PADRAO: Pedido[] = [];

export default function App() {
  // Estado de Navegação por Abas
  const [abaAtiva, setAbaAtiva] = useState<'catalogo' | 'admin' | 'supabase'>('catalogo');

  // Estado Central de Produtos (carrega do localStorage se houver)
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Estado Central de Clientes (carrega do localStorage se houver)
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Estado Central de Pedidos (carrega do localStorage se houver)
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Estado Central do Carrinho de Compras (carrega do localStorage)
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  // Estado Central de Categorias (carrega do localStorage e sincroniza com os produtos)
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estado Central de Cupons
  const [cupons, setCupons] = useState<Cupom[]>([]);

  // Estado Central de Configuração da Loja
  const [configuracao, setConfiguracao] = useState<ConfiguracaoLoja>(CONFIG_PADRAO);

  // Sincronizar categorias com os produtos cadastrados
  useEffect(() => {
    const categoriasLocais = localStorage.getItem('catalogo_categorias');
    let cats: Categoria[] = [];
    if (categoriasLocais) {
      try {
        cats = JSON.parse(categoriasLocais);
      } catch (e) {
        cats = [...CATEGORIAS_PADRAO];
      }
    } else {
      cats = [...CATEGORIAS_PADRAO];
    }

    if (produtos.length > 0) {
      let mudou = false;
      const nomesExistentes = new Set(cats.map(c => c.nome.toLowerCase()));
      
      const sugestoesEmoji: Record<string, string> = {
        'headsets': '🎧',
        'processadores': '🔥',
        'placas de vídeo': '🎮',
        'teclados': '⌨️',
        'mouses': '🖱️',
        'monitores': '🖥️',
        'eletrônicos': '💻',
        'acessórios': '🎒',
        'moda': '👕',
        'casa & decoração': '🏠',
        'esportes': '⚽',
        'games': '🎮',
        'hardware': '⚙️',
        'áudio': '🎧',
        'periféricos': '🖱️'
      };

      produtos.forEach(p => {
        if (p.categoria) {
          const catNome = p.categoria.trim();
          const catLower = catNome.toLowerCase();
          if (!nomesExistentes.has(catLower)) {
            const emojiSugerido = sugestoesEmoji[catLower] || '📦';
            const novaCat: Categoria = {
              id: (cats.length > 0 ? Math.max(...cats.map(c => parseInt(c.id, 10) || 0)) + 1 : 1).toString(),
              nome: catNome,
              emoji: emojiSugerido,
              descricao: `Categoria ${catNome} carregada dinamicamente dos produtos.`
            };
            cats.push(novaCat);
            nomesExistentes.add(catLower);
            mudou = true;
          }
        }
      });

      if (mudou) {
        localStorage.setItem('catalogo_categorias', JSON.stringify(cats));
      }
    }

    setCategorias(cats);
  }, [produtos]);

  const salvarCategorias = (novasCategorias: Categoria[]) => {
    setCategorias(novasCategorias);
    localStorage.setItem('catalogo_categorias', JSON.stringify(novasCategorias));
  };

  const adicionarCategoria = (nova: Omit<Categoria, 'id'>) => {
    const novoID = (categorias.length > 0 ? Math.max(...categorias.map(c => parseInt(c.id, 10) || 0)) + 1 : 1).toString();
    const completo: Categoria = {
      ...nova,
      id: novoID
    };
    salvarCategorias([...categorias, completo]);
  };

  const removerCategoria = (id: string) => {
    const filtradas = categorias.filter(c => c.id !== id);
    salvarCategorias(filtradas);
  };

  const atualizarCategoria = (id: string, categoriaAtualizada: Categoria) => {
    const atualizadas = categorias.map(c => c.id === id ? categoriaAtualizada : c);
    salvarCategorias(atualizadas);
  };


  // Inicializar dados de produtos, carrinho, clientes e pedidos com verificação de reset
  useEffect(() => {
    let resetAll = false;
    const configuracaoLocal = localStorage.getItem('catalogo_configuracao');
    if (configuracaoLocal) {
      try {
        const parsed = JSON.parse(configuracaoLocal);
        if (parsed.nomeLoja !== 'Rayzer Gamers PC') {
          resetAll = true;
        }
      } catch (e) {
        resetAll = true;
      }
    } else {
      resetAll = true;
    }

    if (resetAll) {
      setConfiguracao(CONFIG_PADRAO);
      localStorage.setItem('catalogo_configuracao', JSON.stringify(CONFIG_PADRAO));
      
      setProdutos(PRODUTOS_PADRAO);
      localStorage.setItem('catalogo_produtos', JSON.stringify(PRODUTOS_PADRAO));
      
      setClientes(CLIENTES_PADRAO);
      localStorage.setItem('catalogo_clientes', JSON.stringify(CLIENTES_PADRAO));
      
      setPedidos(PEDIDOS_PADRAO);
      localStorage.setItem('catalogo_pedidos', JSON.stringify(PEDIDOS_PADRAO));
      
      setCupons(CUPONS_PADRAO);
      localStorage.setItem('catalogo_cupons', JSON.stringify(CUPONS_PADRAO));

      setCategorias(CATEGORIAS_PADRAO);
      localStorage.setItem('catalogo_categorias', JSON.stringify(CATEGORIAS_PADRAO));
      
      setCarrinho([]);
      localStorage.setItem('catalogo_carrinho', JSON.stringify([]));
    } else {
      // Carregar normalmente
      const produtosLocais = localStorage.getItem('catalogo_produtos');
      if (produtosLocais) {
        try {
          setProdutos(JSON.parse(produtosLocais));
        } catch (e) {
          setProdutos(PRODUTOS_PADRAO);
        }
      } else {
        setProdutos(PRODUTOS_PADRAO);
      }

      const clientesLocais = localStorage.getItem('catalogo_clientes');
      if (clientesLocais) {
        try {
          setClientes(JSON.parse(clientesLocais));
        } catch (e) {
          setClientes(CLIENTES_PADRAO);
        }
      } else {
        setClientes(CLIENTES_PADRAO);
      }

      const pedidosLocais = localStorage.getItem('catalogo_pedidos');
      if (pedidosLocais) {
        try {
          setPedidos(JSON.parse(pedidosLocais));
        } catch (e) {
          setPedidos(PEDIDOS_PADRAO);
        }
      } else {
        setPedidos(PEDIDOS_PADRAO);
      }

      const carrinhoLocal = localStorage.getItem('catalogo_carrinho');
      if (carrinhoLocal) {
        try {
          setCarrinho(JSON.parse(carrinhoLocal));
        } catch (e) {
          setCarrinho([]);
        }
      }

      const cuponsLocais = localStorage.getItem('catalogo_cupons');
      if (cuponsLocais) {
        try {
          setCupons(JSON.parse(cuponsLocais));
        } catch (e) {
          setCupons(CUPONS_PADRAO);
        }
      } else {
        setCupons(CUPONS_PADRAO);
      }

      try {
        setConfiguracao(JSON.parse(configuracaoLocal!));
      } catch (e) {
        setConfiguracao(CONFIG_PADRAO);
      }
    }
  }, []);

  // Salvar alterações de produtos no localStorage
  const salvarProdutos = (novosProdutos: Produto[]) => {
    setProdutos(novosProdutos);
    localStorage.setItem('catalogo_produtos', JSON.stringify(novosProdutos));
  };

  // Salvar alterações de carrinho no localStorage
  const salvarCarrinho = (novoCarrinho: ItemCarrinho[]) => {
    setCarrinho(novoCarrinho);
    localStorage.setItem('catalogo_carrinho', JSON.stringify(novoCarrinho));
  };

  // Funções de Gerenciamento do Carrinho
  const adicionarAoCarrinho = (produto: Produto) => {
    const itemExistente = carrinho.find(item => item.produto.id === produto.id);
    
    if (itemExistente) {
      if (itemExistente.quantidade < produto.estoque) {
        const novoCarrinho = carrinho.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
        salvarCarrinho(novoCarrinho);
      } else {
        alert('Desculpe, limite máximo de estoque para este produto atingido.');
      }
    } else {
      salvarCarrinho([...carrinho, { produto, quantidade: 1 }]);
    }
  };

  const atualizarQuantidadeCarrinho = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }
    
    const novoCarrinho = carrinho.map(item => {
      if (item.produto.id === produtoId) {
        // Garantir que não ultrapassa estoque
        const qteSegura = Math.min(quantidade, item.produto.estoque);
        return { ...item, quantidade: qteSegura };
      }
      return item;
    });
    
    salvarCarrinho(novoCarrinho);
  };

  const removerDoCarrinho = (produtoId: string) => {
    const novoCarrinho = carrinho.filter(item => item.produto.id !== produtoId);
    salvarCarrinho(novoCarrinho);
  };

  const limparCarrinho = () => {
    salvarCarrinho([]);
  };

  // Funções Administrativas
  const adicionarProduto = (novo: Omit<Produto, 'id' | 'avaliacao'>) => {
    const novoID = (produtos.length > 0 ? Math.max(...produtos.map(p => parseInt(p.id, 10))) + 1 : 1).toString();
    const completo: Produto = {
      ...novo,
      id: novoID,
      avaliacao: 5.0 // Novos produtos iniciam com nota máxima padrão
    };
    salvarProdutos([...produtos, completo]);
  };

  const removerProduto = (id: string) => {
    const filtrados = produtos.filter(p => p.id !== id);
    salvarProdutos(filtrados);
    
    // Remover também do carrinho caso esteja lá
    removerDoCarrinho(id);
  };

  const atualizarProduto = (id: string, produtoAtualizado: Produto) => {
    const atualizados = produtos.map(p => p.id === id ? produtoAtualizado : p);
    salvarProdutos(atualizados);

    // Atualizar produto no carrinho se já estiver inserido
    const carrinhoAtualizado = carrinho.map(item => 
      item.produto.id === id ? { ...item, produto: produtoAtualizado } : item
    );
    salvarCarrinho(carrinhoAtualizado);
  };

  const salvarClientes = (novosClientes: Cliente[]) => {
    setClientes(novosClientes);
    localStorage.setItem('catalogo_clientes', JSON.stringify(novosClientes));
  };

  const salvarPedidos = (novosPedidos: Pedido[]) => {
    setPedidos(novosPedidos);
    localStorage.setItem('catalogo_pedidos', JSON.stringify(novosPedidos));
  };

  // Métodos para Cupons
  const salvarCupons = (novosCupons: Cupom[]) => {
    setCupons(novosCupons);
    localStorage.setItem('catalogo_cupons', JSON.stringify(novosCupons));
  };

  const adicionarCupom = (novo: Omit<Cupom, 'id' | 'vezesUsado'>) => {
    const novoID = (cupons.length > 0 ? Math.max(...cupons.map(c => parseInt(c.id, 10) || 0)) + 1 : 1).toString();
    const completo: Cupom = {
      ...novo,
      id: novoID,
      vezesUsado: 0
    };
    salvarCupons([...cupons, completo]);
  };

  const atualizarCupom = (id: string, cupomAtualizado: Cupom) => {
    const atualizados = cupons.map(c => c.id === id ? cupomAtualizado : c);
    salvarCupons(atualizados);
  };

  const removerCupom = (id: string) => {
    const filtrados = cupons.filter(c => c.id !== id);
    salvarCupons(filtrados);
  };

  // Método para Configuração da Loja
  const atualizarConfiguracao = (novaConfig: ConfiguracaoLoja) => {
    setConfiguracao(novaConfig);
    localStorage.setItem('catalogo_configuracao', JSON.stringify(novaConfig));
  };

  // Métodos para Clientes
  const adicionarCliente = (novo: Omit<Cliente, 'id' | 'totalPedidos' | 'totalGasto' | 'dataCadastro'>) => {
    const novoID = (clientes.length > 0 ? Math.max(...clientes.map(c => parseInt(c.id, 10))) + 1 : 1).toString();
    const completo: Cliente = {
      ...novo,
      id: novoID,
      totalPedidos: 0,
      totalGasto: 0,
      dataCadastro: new Date().toISOString().split('T')[0]
    };
    salvarClientes([...clientes, completo]);
  };

  const atualizarCliente = (id: string, clienteAtualizado: Cliente) => {
    const atualizados = clientes.map(c => c.id === id ? clienteAtualizado : c);
    salvarClientes(atualizados);
  };

  const removerCliente = (id: string) => {
    const filtrados = clientes.filter(c => c.id !== id);
    salvarClientes(filtrados);
  };

  // Métodos para Pedidos
  const fazerPedido = (
    clienteId: string,
    itens: { produto: Produto; quantidade: number }[],
    endereco: string,
    novoClienteInfo?: Omit<Cliente, 'id' | 'totalPedidos' | 'totalGasto' | 'dataCadastro'>,
    cupomCodigo?: string,
    descontoValor: number = 0,
    taxaEntrega: number = 0
  ) => {
    let finalClienteId = clienteId;
    let finalClienteNome = "";
    let finalClienteEmail = "";
    const subtotal = itens.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    const totalPedido = Math.max(0, subtotal - descontoValor + taxaEntrega);

    // Se for um novo cliente
    if (clienteId === 'novo' && novoClienteInfo) {
      const novoID = (clientes.length > 0 ? Math.max(...clientes.map(c => parseInt(c.id, 10))) + 1 : 1).toString();
      const novoCliente: Cliente = {
        ...novoClienteInfo,
        id: novoID,
        totalPedidos: 1,
        totalGasto: totalPedido,
        dataCadastro: new Date().toISOString().split('T')[0]
      };
      
      const atualizados = [...clientes, novoCliente];
      setClientes(atualizados);
      localStorage.setItem('catalogo_clientes', JSON.stringify(atualizados));
      
      finalClienteId = novoID;
      finalClienteNome = novoCliente.nome;
      finalClienteEmail = novoCliente.email;
    } else {
      // Cliente existente
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        finalClienteNome = cliente.nome;
        finalClienteEmail = cliente.email;

        // Atualizar estatísticas do cliente
        const clienteAtualizado: Cliente = {
          ...cliente,
          totalPedidos: cliente.totalPedidos + 1,
          totalGasto: cliente.totalGasto + totalPedido
        };
        atualizarCliente(clienteId, clienteAtualizado);
      }
    }

    // Incrementar o uso do cupom se aplicável
    if (cupomCodigo) {
      const cupomEncontrado = cupons.find(c => c.codigo.toUpperCase() === cupomCodigo.toUpperCase());
      if (cupomEncontrado) {
        const cuponsAtualizados = cupons.map(c => c.id === cupomEncontrado.id ? { ...c, vezesUsado: c.vezesUsado + 1 } : c);
        setCupons(cuponsAtualizados);
        localStorage.setItem('catalogo_cupons', JSON.stringify(cuponsAtualizados));
      }
    }

    // Criar o pedido
    const novoPedidoID = "PED-" + (1000 + pedidos.length + 1);
    const novoPedido: Pedido = {
      id: novoPedidoID,
      clienteId: finalClienteId,
      clienteNome: finalClienteNome || "Cliente Desconhecido",
      clienteEmail: finalClienteEmail || "",
      itens: itens.map(item => ({
        produtoId: item.produto.id,
        nome: item.produto.nome,
        preco: item.produto.preco,
        quantidade: item.quantidade
      })),
      valorTotal: totalPedido,
      status: 'Pendente',
      dataPedido: new Date().toISOString(),
      enderecoEntrega: endereco,
      cupomAplicado: cupomCodigo,
      descontoValor: descontoValor,
      taxaEntrega: taxaEntrega,
      subtotal: subtotal
    };

    salvarPedidos([novoPedido, ...pedidos]);

    // Reduzir estoque dos produtos
    const produtosAtualizados = produtos.map(prod => {
      const itemCarrinho = itens.find(it => it.produto.id === prod.id);
      if (itemCarrinho) {
        return {
          ...prod,
          estoque: Math.max(0, prod.estoque - itemCarrinho.quantidade)
        };
      }
      return prod;
    });
    salvarProdutos(produtosAtualizados);
  };

  const atualizarStatusPedido = (id: string, status: Pedido['status']) => {
    const atualizados = pedidos.map(p => p.id === id ? { ...p, status } : p);
    salvarPedidos(atualizados);
  };

  const removerPedido = (id: string) => {
    const filtrados = pedidos.filter(p => p.id !== id);
    salvarPedidos(filtrados);
  };

  const resetarParaPadrao = () => {
    salvarProdutos(PRODUTOS_PADRAO);
    salvarClientes(CLIENTES_PADRAO);
    salvarPedidos(PEDIDOS_PADRAO);
    salvarCarrinho([]);
    salvarCupons(CUPONS_PADRAO);
    atualizarConfiguracao(CONFIG_PADRAO);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Barra Superior / Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo e Nome da Loja */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-lg text-slate-900 tracking-tight block">{configuracao.nomeLoja}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block -mt-1">{configuracao.descricaoLoja}</span>
            </div>
          </div>

          {/* Abas de Navegação */}
          <nav className="flex items-center bg-slate-100 border border-slate-200/50 p-1 rounded-2xl">
            {/* Aba Catálogo */}
            <button
              id="tab-btn-catalogo"
              onClick={() => setAbaAtiva('catalogo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                abaAtiva === 'catalogo'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>

            {/* Aba Admin */}
            <button
              id="tab-btn-admin"
              onClick={() => setAbaAtiva('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                abaAtiva === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Painel Admin</span>
            </button>

            {/* Aba Supabase */}
            <button
              id="tab-btn-supabase"
              onClick={() => setAbaAtiva('supabase')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                abaAtiva === 'supabase'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Guia Supabase</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={abaAtiva}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {abaAtiva === 'catalogo' && (
              <CatalogView
                produtos={produtos}
                adicionarAoCarrinho={adicionarAoCarrinho}
                carrinho={carrinho}
                atualizarQuantidadeCarrinho={atualizarQuantidadeCarrinho}
                removerDoCarrinho={removerDoCarrinho}
                limparCarrinho={limparCarrinho}
                clientes={clientes}
                fazerPedido={fazerPedido}
                listaCategorias={categorias}
                cupons={cupons}
                configuracao={configuracao}
              />
            )}

            {abaAtiva === 'admin' && (
              <AdminView
                produtos={produtos}
                adicionarProduto={adicionarProduto}
                removerProduto={removerProduto}
                atualizarProduto={atualizarProduto}
                resetarParaPadrao={resetarParaPadrao}
                clientes={clientes}
                adicionarCliente={adicionarCliente}
                atualizarCliente={atualizarCliente}
                removerCliente={removerCliente}
                pedidos={pedidos}
                atualizarStatusPedido={atualizarStatusPedido}
                removerPedido={removerPedido}
                categorias={categorias}
                adicionarCategoria={adicionarCategoria}
                removerCategoria={removerCategoria}
                atualizarCategoria={atualizarCategoria}
                cupons={cupons}
                adicionarCupom={adicionarCupom}
                atualizarCupom={atualizarCupom}
                removerCupom={removerCupom}
                configuracao={configuracao}
                atualizarConfiguracao={atualizarConfiguracao}
              />
            )}

            {abaAtiva === 'supabase' && (
              <SupabaseGuide />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Rodapé / Footer */}
      <footer className="bg-white border-t border-slate-200/60 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Package2 className="w-4 h-4 text-slate-300" />
            <span>&copy; {new Date().getFullYear()} {configuracao.nomeLoja}. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 transition-colors">Política de Privacidade</span>
            <span>&bull;</span>
            <span className="hover:text-slate-600 transition-colors">Termos de Uso</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
