import React, { useState } from 'react';
import { Database, Key, ShieldCheck, HelpCircle, Code, Server, Check, Copy } from 'lucide-react';

export default function SupabaseGuide() {
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);

  const copiarTexto = (texto: string, idx: number) => {
    navigator.clipboard.writeText(texto);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2000);
  };

  const sqlDDL = `CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  imagem TEXT,
  estoque INTEGER DEFAULT 0,
  destaque BOOLEAN DEFAULT false,
  avaliacao NUMERIC(2, 1) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;

  const clientSetupCode = `// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);`;

  const dbQueriesCode = `// Exemplos de Operações CRUD no React
import { supabase } from './lib/supabase';

// 1. Listar Produtos (Catálogo)
async function fetchProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true });
    
  if (error) console.error('Erro ao buscar:', error);
  return data;
}

// 2. Adicionar Novo Produto (Formulário Admin)
async function adicionarProduto(produto) {
  const { data, error } = await supabase
    .from('produtos')
    .insert([produto])
    .select();
    
  if (error) throw error;
  return data[0];
}

// 3. Atualizar Produto Existente
async function atualizarProduto(id, camposAtualizados) {
  const { error } = await supabase
    .from('produtos')
    .update(camposAtualizados)
    .eq('id', id);
    
  if (error) throw error;
}

// 4. Remover Produto
async function removerProduto(id) {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}`;

  const authCode = `// Autenticação com Supabase Auth
import { supabase } from './lib/supabase';

// 1. Fazer Login
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
}

// 2. Fazer Logout
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 3. Monitorar Estado do Usuário (Sessão)
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    console.log('Usuário logado:', session.user);
  } else {
    console.log('Nenhum usuário ativo');
  }
});`;

  const storageCode = `// 1. UPLOAD USANDO SUPABASE STORAGE
import { supabase } from './lib/supabase';

async function uploadImagemSupabase(file: File) {
  // Configurar nome único para evitar colisões
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
  const filePath = \`produtos/\${fileName}\`;

  // Enviar para o bucket 'imagens_produtos' (deve ser criado como público no painel)
  const { data, error } = await supabase.storage
    .from('imagens_produtos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Obter a URL pública do arquivo enviado
  const { data: { publicUrl } } = supabase.storage
    .from('imagens_produtos')
    .getPublicUrl(filePath);

  return publicUrl;
}

// 2. UPLOAD USANDO FIREBASE STORAGE
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadImagemFirebase(file: File) {
  const storage = getStorage();
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
  const storageRef = ref(storage, \`produtos/\${fileName}\`);

  // Fazer o upload do arquivo
  const snapshot = await uploadBytes(storageRef, file);
  
  // Obter URL pública para salvar no banco
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-md border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-1/6 translate-y-1/6 opacity-10">
          <Database className="w-96 h-96" />
        </div>
        <div className="space-y-3 relative z-10">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-400/20">
            Passo a Passo de Integração
          </span>
          <h2 className="font-display font-bold text-3xl">Integração do Catálogo com o Supabase</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Aprenda a conectar este painel de produtos e o catálogo a um banco de dados relacional PostgreSQL hospedado na nuvem, com controle total de estoque e autenticação segura de usuários administradores.
          </p>
        </div>
      </div>

      {/* Grid de Passos */}
      <div className="space-y-6">
        {/* Passo 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-display text-sm">
              1
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-800">Modelagem da Tabela (SQL DDL)</h3>
          </div>
          <p className="text-slate-500 text-sm">
            No painel do Supabase, acesse o <strong>SQL Editor</strong> e crie a tabela de produtos executando a query abaixo:
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-60">
              {sqlDDL}
            </pre>
            <button
              onClick={() => copiarTexto(sqlDDL, 1)}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiadoIdx === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiadoIdx === 1 ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Passo 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-display text-sm">
              2
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-800">Inicializar o Client no Projeto</h3>
          </div>
          <p className="text-slate-500 text-sm">
            Instale o pacote SDK executando <code>npm install @supabase/supabase-js</code>. Em seguida, crie o arquivo de conexão utilizando as chaves seguras do seu painel:
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              {clientSetupCode}
            </pre>
            <button
              onClick={() => copiarTexto(clientSetupCode, 2)}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiadoIdx === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiadoIdx === 2 ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Passo 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-display text-sm">
              3
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-800">Consultas de Banco de Dados (CRUD)</h3>
          </div>
          <p className="text-slate-500 text-sm">
            Substitua a manipulação de dados que atualmente está no <code>localStorage</code> para chamadas assíncronas do Supabase:
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-80">
              {dbQueriesCode}
            </pre>
            <button
              onClick={() => copiarTexto(dbQueriesCode, 3)}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiadoIdx === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiadoIdx === 3 ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Passo 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-display text-sm">
              4
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-800">Segurança & Autenticação (Auth)</h3>
          </div>
          <p className="text-slate-500 text-sm">
            Para proteger seu painel de administração para que apenas usuários autenticados possam acessar e modificar o estoque, utilize o módulo de autenticação integrado:
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-80">
              {authCode}
            </pre>
            <button
              onClick={() => copiarTexto(authCode, 4)}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiadoIdx === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiadoIdx === 4 ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Passo 5 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-display text-sm">
              5
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-800">Upload de Imagens dos Produtos (Storage)</h3>
          </div>
          <p className="text-slate-500 text-sm">
            Para que o upload de arquivos no formulário salve imagens de verdade em servidores na nuvem, configure um Bucket de armazenamento. Veja abaixo como implementar o upload no <strong>Supabase Storage</strong> ou <strong>Firebase Cloud Storage</strong>:
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
              {storageCode}
            </pre>
            <button
              onClick={() => copiarTexto(storageCode, 5)}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiadoIdx === 5 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiadoIdx === 5 ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-600 leading-relaxed space-y-2">
            <p className="font-bold text-slate-700">⚠️ Lembrete Importante de Configuração:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong>Supabase:</strong> Vá em <code className="bg-slate-100 px-1 py-0.5 rounded">Storage</code>, crie um novo bucket chamado <code className="bg-slate-100 px-1 py-0.5 rounded">imagens_produtos</code> e certifique-se de marcar a opção <strong>"Public bucket"</strong>.</li>
              <li><strong>Firebase:</strong> Vá em <code className="bg-slate-100 px-1 py-0.5 rounded">Storage</code>, ative o serviço e atualize as regras de segurança para autorizar o upload de imagens de acordo com suas políticas de acesso.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dica Extra */}
      <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-6 text-amber-900 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-sm">Dica de Segurança Pro (RLS)</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Sempre ative o <strong>Row Level Security (RLS)</strong> no seu painel do Supabase para a tabela de <code>produtos</code>. Defina políticas que permitam que qualquer pessoa faça a leitura dos produtos (método <code>SELECT</code>), mas apenas usuários autenticados (administradores) possam realizar operações de escrita como <code>INSERT</code>, <code>UPDATE</code> ou <code>DELETE</code>.
        </p>
      </div>
    </div>
  );
}
