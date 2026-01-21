import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Send, 
  Settings, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Filter as FilterIcon,
  Users,
  Calendar,
  Download,
  Database,
  GripVertical,
  Trash2,
  Info,
  Code2,
  Table as TableIcon,
  Layout,
  ListFilter,
  Columns as ColumnsIcon,
  Rows as RowsIcon,
  Sigma,
  Eye,
  UserPlus,
  Pencil,
  Bot,
  Sparkles,
  X,
  SendHorizontal,
  RefreshCw
} from 'lucide-react';

// EY Brand Colors
const EY_YELLOW = '#FFE600';

// API Configuration
const apiKey = "";

// Interfaces for TypeScript validation
interface Field {
  id: string;
  name: string;
  category?: string;
  type?: 'RAW' | 'SQL';
  role?: 'dimension' | 'metric';
}

interface PivotConfig {
  filters: Field[];
  columns: Field[];
  rows: Field[];
  values: Field[];
}

interface SQLMetric {
  id: string;
  type: 'SQL';
  label: string;
  name: string;
  sql: string;
}

interface Report {
  id?: number;
  name: string;
  team: string;
  status?: string;
  lastRun?: string;
  frequency: string;
  format: string;
  pivot: PivotConfig;
  calculatedFields: SQLMetric[];
  recipients: number[];
}

interface Recipient {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
}

interface PivotZoneProps {
  label: string;
  icon: React.ReactNode;
  fields: Field[];
  onDrop: (e: React.DragEvent) => void;
  onRemove: (id: string) => void;
  isValues?: boolean;
}

// Mock Data for the Prototype
const SAP_FIELDS: Field[] = [
  { id: 'bukrs', name: 'Company Code', category: 'General' },
  { id: 'belnr', name: 'Document Number', category: 'General' },
  { id: 'gjahr', name: 'Fiscal Year', category: 'General' },
  { id: 'budat', name: 'Posting Date', category: 'General' },
  { id: 'waers', name: 'Currency', category: 'General' },
  { id: 'kunnr', name: 'Customer ID', category: 'AR' },
  { id: 'lifnr', name: 'Vendor ID', category: 'AP' },
  { id: 'dmbtr', name: 'Amount in Local Currency', category: 'Finance' },
  { id: 'wrbtr', name: 'Transaction Amount', category: 'Finance' },
  { id: 'zterm', name: 'Payment Terms', category: 'Finance' },
  { id: 'hkont', name: 'G/L Account', category: 'GL' },
];

const INITIAL_REPORTS: Report[] = [
  { 
    id: 1, 
    name: 'Weekly AP Aging Summary', 
    team: 'AP', 
    status: 'Active', 
    lastRun: '2023-10-23 09:00', 
    frequency: 'Weekly', 
    format: 'Excel',
    pivot: { filters: [], columns: [], rows: [{id: 'lifnr', name: 'Vendor ID'}], values: [{id: 'dmbtr', name: 'Amount in Local Currency'}] },
    calculatedFields: [],
    recipients: [1]
  },
  { 
    id: 2, 
    name: 'Month-End AR Reconciler', 
    team: 'AR', 
    status: 'Active', 
    lastRun: '2023-10-01 00:05', 
    frequency: 'Monthly', 
    format: 'PDF',
    pivot: { filters: [], columns: [], rows: [{id: 'kunnr', name: 'Customer ID'}], values: [{id: 'dmbtr', name: 'Amount in Local Currency'}] },
    calculatedFields: [],
    recipients: [1, 2]
  },
];

const INITIAL_RECIPIENTS: Recipient[] = [
  { id: 1, name: 'John Doe', email: 'cfo@company.com', role: 'CFO' },
  { id: 2, name: 'Jane Smith', email: 'ar_manager@company.com', role: 'AR Lead' },
  { id: 3, name: 'Robert Brown', email: 'audit_team@company.com', role: 'Auditor' },
];

const MOCK_ROWS = [
  { bukrs: '1000', belnr: '18000042', gjahr: '2023', budat: '2023-10-01', waers: 'USD', kunnr: 'C0042', lifnr: 'V9901', dmbtr: 4500.00, wrbtr: 4500.00, zterm: 'N30', hkont: '110000' },
  { bukrs: '1000', belnr: '18000043', gjahr: '2023', budat: '2023-10-02', waers: 'EUR', kunnr: 'C0055', lifnr: 'V8822', dmbtr: 1250.50, wrbtr: 1080.20, zterm: 'N15', hkont: '110000' },
  { bukrs: '2100', belnr: '19000121', gjahr: '2023', budat: '2023-10-05', waers: 'GBP', kunnr: 'C0012', lifnr: 'V7744', dmbtr: 8900.00, wrbtr: 6850.00, zterm: 'N60', hkont: '210000' },
  { bukrs: '2100', belnr: '19000122', gjahr: '2023', budat: '2023-10-06', waers: 'USD', kunnr: 'C0099', lifnr: 'V1102', dmbtr: 320.00, wrbtr: 320.00, zterm: 'N30', hkont: '210000' },
  { bukrs: '3000', belnr: '20000550', gjahr: '2023', budat: '2023-10-10', waers: 'USD', kunnr: 'C0200', lifnr: 'V3301', dmbtr: 15400.75, wrbtr: 15400.75, zterm: 'N30', hkont: '400000' },
];

const callGemini = async (prompt: string, systemInstruction: string) => {
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (i === 4) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [isCreating, setIsCreating] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isGlobalRecipientModalOpen, setIsGlobalRecipientModalOpen] = useState(false);
  const [isAiAgentOpen, setIsAiAgentOpen] = useState(false);

  const handleEditReport = (report: Report) => {
    setCurrentReport(report);
    setIsCreating(true);
  };

  const handleCreateNew = () => {
    setCurrentReport({ 
      name: '', 
      team: 'AP', 
      pivot: { filters: [], columns: [], rows: [], values: [] }, 
      calculatedFields: [], 
      frequency: 'Daily', 
      format: 'Excel',
      recipients: []
    });
    setIsCreating(true);
  };

  const handleSaveReport = (data: Report) => {
    if (data.id) {
      setReports(reports.map(r => r.id === data.id ? data : r));
    } else {
      setReports([...reports, { ...data, id: Date.now(), status: 'Active', lastRun: 'Scheduled' }]);
    }
    setIsCreating(false);
  };

  const handleAddRecipient = (person: Omit<Recipient, 'id'>) => {
    const personWithId: Recipient = { ...person, id: Date.now() };
    setRecipients([...recipients, personWithId]);
    return personWithId;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView setActiveTab={setActiveTab} reports={reports} />;
      case 'templates': return <TemplateListView reports={reports} onEdit={handleEditReport} onNew={handleCreateNew} />;
      case 'distribution': return (
        <DistributionView 
          recipients={recipients} 
          onAddRecipient={() => setIsGlobalRecipientModalOpen(true)} 
        />
      );
      default: return <DashboardView setActiveTab={setActiveTab} reports={reports} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Main App Canvas */}
      {isCreating && currentReport ? (
        <ReportBuilder 
          report={currentReport} 
          setReport={setCurrentReport} 
          allRecipients={recipients}
          onAddRecipient={handleAddRecipient}
          onCancel={() => setIsCreating(false)} 
          onSave={handleSaveReport}
        />
      ) : (
        <div className="flex h-full bg-slate-50 text-slate-900 font-sans">
          <aside className="w-64 bg-[#2E2E38] text-white flex flex-col shrink-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-sm shadow-sm shrink-0" style={{ backgroundColor: EY_YELLOW }}>
                  <Database size={24} className="text-[#2E2E38]" />
                </div>
                <h1 className="font-bold text-lg leading-tight text-white uppercase tracking-tighter italic">
                  Document<br/>
                  <span className="not-italic text-sm tracking-normal capitalize" style={{ color: EY_YELLOW }}>
                    Extraction
                  </span>
                </h1>
              </div>
              
              <nav className="space-y-2">
                <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                <NavItem active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<FileSpreadsheet size={20}/>} label="Report Templates" />
                <NavItem active={activeTab === 'distribution'} onClick={() => setActiveTab('distribution')} icon={<Users size={20}/>} label="Distribution Lists" />
              </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#2E2E38]" style={{ backgroundColor: EY_YELLOW }}>SM</div>
                <div>
                  <p className="text-sm font-medium text-white">Senior Manager</p>
                  <p className="text-xs text-slate-400">Finance Lead</p>
                </div>
              </div>
              <NavItem active={false} onClick={() => {}} icon={<Settings size={20}/>} label="Settings" />
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-semibold capitalize tracking-tight text-[#2E2E38]">{activeTab.replace('-', ' ')}</h2>
              <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <Search size={20} />
                </button>
                <button 
                  onClick={handleCreateNew}
                  className="hover:bg-[#E6CF00] text-[#2E2E38] px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold shadow-sm"
                  style={{ backgroundColor: EY_YELLOW }}
                >
                  <Plus size={18} /> New Template
                </button>
              </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto">
              {renderContent()}
            </div>

            {isGlobalRecipientModalOpen && (
              <RecipientModal 
                onClose={() => setIsGlobalRecipientModalOpen(false)}
                onSave={handleAddRecipient}
              />
            )}
          </main>
        </div>
      )}

      {/* GLOBAL AI AGENT TOGGLE - PERSISTENT ACROSS VIEWS */}
      <button 
        onClick={() => setIsAiAgentOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group z-50 border-4 border-white"
        style={{ backgroundColor: EY_YELLOW }}
      >
        <Bot className="text-[#2E2E38] group-hover:animate-bounce" size={28}/>
        {!isAiAgentOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
            1
          </div>
        )}
      </button>

      {/* GLOBAL AI AGENT DRAWER */}
      {isAiAgentOpen && (
        <GlobalAiAgent 
          onClose={() => setIsAiAgentOpen(false)} 
          reports={reports} 
          recipients={recipients}
          onAction={(type: string, data: any) => {
             if(type === 'CREATE_REPORT') handleSaveReport(data);
             setIsAiAgentOpen(false);
          }}
        />
      )}
    </div>
  );
};

const GlobalAiAgent = ({ onClose, reports, recipients, onAction }: any) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your Finance Reporting Assistant. I can help you create templates or manage distribution lists. What can I do for you today?" }
  ]);

  const commonQuestions = [
    "Create a monthly AR report for Jane Smith",
    "Who is on the Weekly AP distribution list?",
    "Generate a new GL template for USD transactions",
    "List all active report templates"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const prompt = `User Request: "${text}". Current Reports: ${JSON.stringify(reports)}. Current Recipients: ${JSON.stringify(recipients)}. Field Schema: ${JSON.stringify(SAP_FIELDS)}. 
      Return a response that helps the user. If they want to create a report, suggest the specific fields, rows, and values needed in a structured way.`;
      
      const response = await callGemini(prompt, "You are a senior finance report architect. Help the user manage templates and recipients. Be concise, professional, and EY-branded.");
      setMessages(prev => [...prev, { role: 'ai', text: response || "I encountered an error processing your request." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting to the brain right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-96 h-[600px] bg-white shadow-2xl rounded-tl-2xl flex flex-col z-[100] border-l border-t border-slate-200 animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-[#2E2E38] text-white flex justify-between items-center rounded-tl-2xl">
        <div className="flex items-center gap-2">
          <Bot size={20} style={{ color: EY_YELLOW }}/>
          <h3 className="font-bold text-sm tracking-widest uppercase italic">Finance AI Co-Pilot</h3>
        </div>
        <button onClick={onClose} className="hover:text-white text-slate-400 p-1"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] font-medium shadow-sm leading-relaxed ${
              m.role === 'user' ? 'bg-[#2E2E38] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {commonQuestions.map(q => (
            <button 
              key={q} 
              onClick={() => handleSend(q)}
              className="text-[10px] bg-slate-50 hover:bg-[#FFE600]/10 border border-slate-200 hover:border-[#FFE600] rounded-full px-2.5 py-1 transition-all text-slate-500 font-bold"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask me to build a report..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#FFE600] outline-none text-sm font-medium"
          />
          <button 
            onClick={() => handleSend(input)}
            className="absolute right-2 top-1.5 p-1.5 rounded-lg text-[#2E2E38] hover:bg-[#FFE600] transition-colors"
          >
            <SendHorizontal size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const RecipientModal = ({ onClose, onSave }: { onClose: () => void; onSave: (p: Omit<Recipient, 'id'>) => void }) => {
  const [person, setPerson] = useState({ name: '', email: '', role: '' });

  return (
    <div className="fixed inset-0 bg-[#2E2E38]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className={`bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border animate-in fade-in zoom-in duration-200`} style={{ borderColor: `${EY_YELLOW}4D` }}>
        <div className="bg-[#2E2E38] p-4 text-white flex justify-between items-center border-b border-[#FFE600]/30">
          <h3 className="font-bold text-sm flex items-center gap-2 italic uppercase tracking-tighter">
            <UserPlus style={{ color: EY_YELLOW }}/> Register New Recipient
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
            <input 
              type="text" 
              value={person.name}
              onChange={e => setPerson({...person, name: e.target.value})}
              placeholder="e.g. Michael Chen"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-[#FFE600] outline-none font-bold text-[#2E2E38]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Email</label>
            <input 
              type="email" 
              value={person.email}
              onChange={e => setPerson({...person, email: e.target.value})}
              placeholder="m.chen@ey.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-[#FFE600] outline-none font-bold text-[#2E2E38]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organizational Role</label>
            <input 
              type="text" 
              value={person.role}
              onChange={e => setPerson({...person, role: e.target.value})}
              placeholder="e.g. Audit Lead"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-[#FFE600] outline-none font-bold text-[#2E2E38]"
            />
          </div>
          <button 
            onClick={() => {
              onSave(person);
              onClose();
            }}
            disabled={!person.name || !person.email}
            className="w-full py-3 text-[#2E2E38] font-bold rounded-lg shadow-lg hover:bg-[#E6CF00] transition-all disabled:opacity-50 uppercase tracking-tighter mt-4"
            style={{ backgroundColor: EY_YELLOW }}
          >
            Register Recipient
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
      active ? `text-[#2E2E38] shadow-md font-bold` : 'text-slate-300 hover:text-white hover:bg-slate-700'
    }`}
    style={active ? { backgroundColor: EY_YELLOW } : {}}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const DashboardView = ({ reports, setActiveTab }: { reports: Report[]; setActiveTab: (t: string) => void }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Active Reports" value={reports.filter((r: Report) => r.status === 'Active').length} icon={<CheckCircle2 className="text-emerald-500"/>} trend="+2 this week" />
      <StatCard title="Distribution List" value="24" icon={<Users className="text-[#2E2E38]"/>} trend="3 teams" />
      <StatCard title="Successful Sends" value="142" icon={<Send className="text-purple-500"/>} trend="Last 30 days" />
    </div>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 tracking-tight">Recent Executions</h3>
        <button onClick={() => setActiveTab('templates')} className={`text-[#2E2E38] text-sm font-bold border-b-2 hover:bg-[#FFE600]/10 px-1 transition-all`} style={{ borderColor: EY_YELLOW }}>View All</button>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
          <tr>
            <th className="px-6 py-3">Report Name</th>
            <th className="px-6 py-3">Team</th>
            <th className="px-6 py-3">Last Run</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((report: Report) => (
            <tr key={report.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-700">{report.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                  report.team === 'AP' ? 'bg-amber-100 text-amber-700' :
                  report.team === 'AR' ? 'bg-indigo-100 text-indigo-700' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  {report.team}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{report.lastRun}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <div className={`w-2 h-2 rounded-full ${report.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  {report.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TemplateListView = ({ reports, onEdit, onNew }: { reports: Report[]; onEdit: (r: Report) => void; onNew: () => void }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <p className="text-slate-500 text-sm">Manage your SAP-extracted report logic and automated templates.</p>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors font-medium">
          <FilterIcon size={14}/> Filter
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report: Report) => (
        <div 
          key={report.id} 
          onClick={() => onEdit(report)}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer relative border-t-4 border-t-slate-200 hover:border-t-yellow-400"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${
                  report.team === 'AP' ? 'bg-amber-50 text-amber-600' :
                  report.team === 'AR' ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'
                }`}>
              <FileSpreadsheet size={24}/>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">{report.frequency}</span>
              <span className="text-[10px] text-[#2E2E38] font-bold mt-1 bg-slate-50 px-1 border border-slate-100">{report.format}</span>
            </div>
          </div>
          <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#2E2E38] transition-colors">{report.name}</h4>
          <p className="text-slate-500 text-sm mb-4">SAP logic template for {report.team} reporting & distribution.</p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Clock size={12}/> {report.lastRun}
            </div>
            <div className="flex items-center gap-1 text-[#2E2E38] font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity uppercase italic">
              <Pencil size={12}/> Edit Template
            </div>
          </div>
        </div>
      ))}
      <button 
        onClick={onNew}
        className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-yellow-400 hover:bg-yellow-50 hover:text-[#2E2E38] transition-all bg-white/50"
      >
        <Plus size={32} className="mb-2 opacity-50"/>
        <span className="font-bold uppercase tracking-tight text-sm">Create New Template</span>
      </button>
    </div>
  </div>
);

const DistributionView = ({ recipients, onAddRecipient }: { recipients: Recipient[]; onAddRecipient: () => void }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
      <div>
        <h3 className="font-bold text-slate-800 text-lg tracking-tight uppercase italic text-[#2E2E38]">EY Distribution Control</h3>
        <p className="text-sm text-slate-500 font-medium tracking-tight">Manage senior stakeholder subscriptions for automated report sends.</p>
      </div>
      <button 
        onClick={onAddRecipient}
        className="bg-[#2E2E38] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-all shadow-md active:translate-y-0.5"
      >
        Add Recipient
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Stakeholder</th>
            <th className="px-6 py-4">Email Address</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Active Subscriptions</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {recipients.map((person: Recipient) => (
            <tr key={person.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-800">{person.name}</div>
              </td>
              <td className="px-6 py-4 text-slate-600 font-medium">{person.email}</td>
              <td className="px-6 py-4">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200">{person.role}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex -space-x-2">
                  {[1, 2].map((i: number) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-[#2E2E38] font-bold shadow-sm" style={{ backgroundColor: EY_YELLOW }}>R{i}</div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-400 font-bold">+1</div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-red-600 transition-colors mr-3 text-sm font-bold">Remove</button>
                <button className={`text-[#2E2E38] hover:text-black text-sm font-bold border-b-2 transition-colors`} style={{ borderColor: EY_YELLOW }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

interface ReportBuilderProps {
  report: Report;
  setReport: (r: Report) => void;
  allRecipients: Recipient[];
  onAddRecipient: (p: Omit<Recipient, 'id'>) => Recipient;
  onCancel: () => void;
  onSave: (r: Report) => void;
}

const ReportBuilder = ({ report, setReport, allRecipients, onAddRecipient, onCancel, onSave }: ReportBuilderProps) => {
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [newSqlMetric, setNewSqlMetric] = useState({ label: '', sql: 'SELECT SUM({{dmbtr}}) \nFROM S4H_DATA \nWHERE Waers = \'USD\'' });
  const [draggedField, setDraggedField] = useState<Field | null>(null);
  const [aiSqlPrompt, setAiSqlPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAiSqlGen = async () => {
    if(!aiSqlPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const prompt = `Based on these available SAP fields: ${JSON.stringify(SAP_FIELDS)}, generate a SQL SELECT statement for the following requirement: "${aiSqlPrompt}". Only return the SQL code block. Use {{field_id}} syntax to reference fields.`;
      const sql = await callGemini(prompt, "You are a SQL expert for SAP S/4HANA systems.");
      setNewSqlMetric({ ...newSqlMetric, sql: sql?.replace(/```sql|```/g, '').trim() || "" });
    } catch (e) {
      // Error handled by modal UI
    } finally {
      setIsAiGenerating(false);
    }
  };

  const addSqlMetric = () => {
    if (!newSqlMetric.label || !newSqlMetric.sql) return;
    const id = `sql_${Date.now()}`;
    const metric: SQLMetric = { id, type: 'SQL', label: newSqlMetric.label, name: newSqlMetric.label, sql: newSqlMetric.sql };
    setReport({ ...report, calculatedFields: [...report.calculatedFields, metric] });
    setNewSqlMetric({ label: '', sql: 'SELECT SUM({{dmbtr}}) \nFROM S4H_DATA \nWHERE Waers = \'USD\'' });
    setShowSqlModal(false);
  };

  const toggleRecipient = (id: number) => {
    const current = report.recipients || [];
    if (current.includes(id)) {
      setReport({ ...report, recipients: current.filter((rid: number) => rid !== id) });
    } else {
      setReport({ ...report, recipients: [...current, id] });
    }
  };

  const moveFieldToPivot = (field: Field, targetZone: keyof PivotConfig) => {
    const updatedPivot = { ...report.pivot };
    Object.keys(updatedPivot).forEach(zoneKey => {
      const zone = zoneKey as keyof PivotConfig;
      updatedPivot[zone] = updatedPivot[zone].filter((f: Field) => f.id !== field.id);
    });
    updatedPivot[targetZone] = [...updatedPivot[targetZone], field];
    setReport({ ...report, pivot: updatedPivot });
  };

  const removeFieldFromPivot = (fieldId: string, zone: keyof PivotConfig) => {
    const updatedPivot = { ...report.pivot };
    updatedPivot[zone] = updatedPivot[zone].filter((f: Field) => f.id !== fieldId);
    setReport({ ...report, pivot: updatedPivot });
  };

  const handleDragStart = (e: React.DragEvent, field: Field) => {
    setDraggedField(field);
    e.dataTransfer.setData('fieldId', field.id);
  };

  const handleDrop = (e: React.DragEvent, zone: keyof PivotConfig) => {
    e.preventDefault();
    if (draggedField) {
      moveFieldToPivot(draggedField, zone);
      setDraggedField(null);
    }
  };

  const availableFields: Field[] = [
    ...SAP_FIELDS.map(f => ({ ...f, type: 'RAW' as const })),
    ...report.calculatedFields.map((cf: SQLMetric) => ({ id: cf.id, name: cf.label, type: 'SQL' as const }))
  ];

  const previewFields = [
    ...(report.pivot.rows || []).map((f: Field) => ({ ...f, role: 'dimension' as const })),
    ...(report.pivot.columns || []).map((f: Field) => ({ ...f, role: 'dimension' as const })),
    ...(report.pivot.values || []).map((f: Field) => ({ ...f, role: 'metric' as const }))
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="px-8 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-transform hover:scale-110">
            <ChevronRight size={24} className="rotate-180"/>
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#2E2E38] leading-none mb-1 uppercase tracking-tight italic">Pivot Studio</h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              {report.id ? `Editing: ${report.name}` : 'Template Builder: New Report'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">Discard</button>
          <button onClick={() => onSave(report)} className={`px-6 py-2 text-[#2E2E38] font-bold rounded-lg shadow-sm hover:bg-[#E6CF00] transition-all border-b-2 border-[#2E2E38]/20 active:border-b-0 active:translate-y-0.5`} style={{ backgroundColor: EY_YELLOW }}>
            {report.id ? 'Update Report' : 'Save Report'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Field List */}
        <div className="w-72 border-r border-slate-200 p-0 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider flex items-center justify-between">
              Pivot Table Fields
              <span className="bg-slate-100 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">Source: SAP S/4</span>
            </h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400"/>
              <input 
                type="text" 
                placeholder="Search fields..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#FFE600] outline-none font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
             <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2">Dimensions</h4>
                <div className="space-y-0.5">
                  {availableFields.filter((f: Field) => f.type === 'RAW').map((field: Field) => (
                    <div 
                      key={field.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, field)}
                      className="group flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all cursor-grab active:cursor-grabbing select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical size={12} className="text-slate-300 shrink-0"/>
                        <Database size={12} className="text-slate-400 shrink-0"/>
                        <span className="text-[13px] font-medium text-slate-600 truncate">{field.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div>
                <h4 className="text-[10px] font-bold text-[#2E2E38] uppercase px-3 mb-2 flex items-center justify-between tracking-tight">
                  Calculated Metrics
                  <button onClick={() => setShowSqlModal(true)} className="text-[#2E2E38] hover:scale-110 transition-transform"><Plus size={12}/></button>
                </h4>
                <div className="space-y-0.5 px-1">
                  {availableFields.filter((f: Field) => f.type === 'SQL').map((field: Field) => (
                    <div 
                      key={field.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, field)}
                      className={`group flex items-center justify-between p-2 rounded border transition-all cursor-grab active:cursor-grabbing select-none`}
                      style={{ backgroundColor: `${EY_YELLOW}1A`, borderColor: `${EY_YELLOW}4D` }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical size={12} className="text-[#2E2E38]/30 shrink-0"/>
                        <Code2 size={12} className="text-[#2E2E38] shrink-0"/>
                        <span className="text-[13px] font-bold text-[#2E2E38] truncate">{field.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
             <button 
               onClick={() => setShowSqlModal(true)}
               className={`w-full flex items-center justify-center gap-2 py-2.5 bg-[#2E2E38] text-white text-[13px] font-bold rounded shadow-lg hover:bg-black transition-all uppercase tracking-tighter`}
             >
               <Code2 size={16} style={{ color: EY_YELLOW }}/> New SQL Metric
             </button>
          </div>
        </div>

        {/* CENTER: Pivot UI & Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-50/20 p-8">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Pivot Configuration */}
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
                <Layout size={14}/> Layout Configuration
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <PivotZone label="Filters" icon={<ListFilter size={16}/>} fields={report.pivot.filters} onDrop={(e: React.DragEvent) => handleDrop(e, 'filters')} onRemove={(id: string) => removeFieldFromPivot(id, 'filters')} />
                <PivotZone label="Columns" icon={<ColumnsIcon size={16}/>} fields={report.pivot.columns} onDrop={(e: React.DragEvent) => handleDrop(e, 'columns')} onRemove={(id: string) => removeFieldFromPivot(id, 'columns')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PivotZone label="Rows" icon={<RowsIcon size={16}/>} fields={report.pivot.rows} onDrop={(e: React.DragEvent) => handleDrop(e, 'rows')} onRemove={(id: string) => removeFieldFromPivot(id, 'rows')} />
                <PivotZone label="Values" icon={<Sigma size={16}/>} fields={report.pivot.values} isValues onDrop={(e: React.DragEvent) => handleDrop(e, 'values')} onRemove={(id: string) => removeFieldFromPivot(id, 'values')} />
              </div>
            </div>

            {/* LIVE PREVIEW SECTION */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#2E2E38]"/>
                  <h3 className="text-xs font-bold text-[#2E2E38] uppercase tracking-tighter italic">Live Data Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-slate-400 tracking-tight uppercase">S/4HANA Sync: Active</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-0">
                {previewFields.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-300">
                    <TableIcon size={48} className="mb-2 opacity-20"/>
                    <p className="font-bold text-sm tracking-tight text-slate-400">Drag dimensions or metrics to generate preview</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-[12px] border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        {previewFields.map((field: Field) => (
                          <th key={field.id} className="px-4 py-3 font-bold text-[#2E2E38] uppercase tracking-tighter bg-white border-b-2 border-slate-100">
                            {field.role === 'metric' ? `Sum of ${field.name}` : field.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_ROWS.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          {previewFields.map((field: Field) => (
                            <td key={field.id} className="px-4 py-3 font-medium text-slate-600 tabular-nums border-r border-slate-50 last:border-r-0">
                              {field.type === 'SQL' ? (
                                <span className="text-[#2E2E38] font-bold">{(row.dmbtr * (idx + 1)).toLocaleString()}</span>
                              ) : (
                                typeof row[field.id] === 'number' ? row[field.id].toLocaleString() : row[field.id] || '---'
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Metadata and Quick Add Distribution */}
            <section className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-[#2E2E38] uppercase italic flex items-center gap-2">
                <Info size={16} style={{ color: EY_YELLOW }}/> Report Metadata
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Report Name</span>
                    <input 
                      type="text" 
                      value={report.name}
                      onChange={e => setReport({...report, name: e.target.value})}
                      placeholder="e.g., Global AP Aging Tracker"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-[#FFE600] outline-none font-bold text-[#2E2E38]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Team Visibility</span>
                    <select 
                      value={report.team}
                      onChange={e => setReport({...report, team: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded font-bold text-[#2E2E38] focus:ring-1 focus:ring-[#FFE600] outline-none"
                    >
                      <option value="AP">Accounts Payable</option>
                      <option value="AR">Accounts Receivable</option>
                      <option value="GL">General Ledger</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected Recipients</span>
                    <button 
                      onClick={() => setShowRecipientModal(true)}
                      className={`text-[10px] text-[#2E2E38] font-bold uppercase italic flex items-center gap-1 hover:underline`}
                    >
                      <UserPlus size={12}/> Register New
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
                    {allRecipients.map((person: Recipient) => (
                      <label key={person.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={(report.recipients || []).includes(person.id)}
                          onChange={() => toggleRecipient(person.id)}
                          className="rounded-sm border-slate-300 text-[#2E2E38] focus:ring-[#FFE600]" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-700 truncate leading-none mb-0.5">{person.name}</p>
                          <p className="text-[9px] text-slate-400 truncate uppercase">{person.role} — {person.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT: Format & Frequency */}
        <div className="w-64 border-l border-slate-200 p-6 bg-slate-50 flex flex-col gap-8 shrink-0">
           <section className="space-y-3">
              <div className="text-[#2E2E38] font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 italic">
                <Calendar size={14} style={{ color: EY_YELLOW }}/> Frequency
              </div>
              <div className="space-y-1">
                {['Daily', 'Weekly', 'Monthly'].map(freq => (
                  <button 
                    key={freq}
                    onClick={() => setReport({...report, frequency: freq})}
                    className={`w-full px-3 py-2.5 text-left text-xs font-bold rounded-md transition-all flex justify-between items-center ${
                      report.frequency === freq ? 'bg-[#2E2E38] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-[#FFE600]'
                    }`}
                  >
                    {freq}
                    {report.frequency === freq && <CheckCircle2 size={12} style={{ color: EY_YELLOW }}/>}
                  </button>
                ))}
              </div>
           </section>

           <section className="space-y-3">
              <div className="text-[#2E2E38] font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 italic">
                <Download size={14} style={{ color: EY_YELLOW }}/> Export Format
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Excel', 'PDF'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => setReport({...report, format: fmt})}
                    className={`py-3 text-[11px] font-bold rounded-md border transition-all ${
                      report.format === fmt ? 'text-[#2E2E38] shadow-sm' : 'bg-white text-slate-400 border border-slate-200 hover:border-[#FFE600]'
                    }`}
                    style={report.format === fmt ? { backgroundColor: EY_YELLOW, borderColor: EY_YELLOW } : {}}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
           </section>

           <div className="mt-auto p-4 bg-[#2E2E38] rounded-xl shadow-lg text-center border-t-4" style={{ borderTopColor: EY_YELLOW }}>
              <Database size={24} className="mx-auto mb-2" style={{ color: EY_YELLOW }}/>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Pivot Engine</p>
              <p className="text-[11px] font-bold tracking-tighter uppercase italic" style={{ color: EY_YELLOW }}>Ready for S/4 Sync</p>
           </div>
        </div>
      </div>

      {/* RECIPIENT REGISTRATION MODAL (Inside Builder) */}
      {showRecipientModal && (
        <RecipientModal 
          onClose={() => setShowRecipientModal(false)}
          onSave={(p: Omit<Recipient, 'id'>) => {
            const added = onAddRecipient(p);
            setReport({ ...report, recipients: [...(report.recipients || []), added.id] });
            return added;
          }}
        />
      )}

      {/* SQL MODAL WITH AI AGENT */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-[#2E2E38]/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl h-[600px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border flex flex-col md:flex-row" style={{ borderColor: `${EY_YELLOW}4D` }}>
              {/* AI CHAT SIDEBAR FOR SQL */}
              <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                  <Bot size={18} className="text-[#2E2E38]"/>
                  <span className="text-[10px] font-bold uppercase tracking-widest">AI SQL Helper</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-[11px] text-slate-600 font-medium">Explain what you want to calculate, and I'll generate the SQL for you.</p>
                  </div>
                  {aiSqlPrompt && (
                    <div className="bg-[#2E2E38] p-3 rounded-lg text-white text-[11px] self-end">
                      {aiSqlPrompt}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-slate-200 space-y-2">
                  <textarea 
                    value={aiSqlPrompt}
                    onChange={e => setAiSqlPrompt(e.target.value)}
                    placeholder="e.g., Sum of amount where currency is USD"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-[#FFE600] outline-none h-20 resize-none"
                  />
                  <button 
                    onClick={handleAiSqlGen}
                    disabled={isAiGenerating}
                    className="w-full py-2 bg-[#2E2E38] text-white rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                  >
                    {isAiGenerating ? <RefreshCw size={14} className="animate-spin"/> : <Sparkles size={14} style={{ color: EY_YELLOW }}/>}
                    Generate SQL Logic
                  </button>
                </div>
              </div>

              {/* MAIN SQL EDITOR */}
              <div className="flex-1 flex flex-col">
                <div className="bg-[#2E2E38] p-5 text-white flex justify-between items-center border-b border-[#FFE600]/30">
                  <h3 className="font-bold text-sm flex items-center gap-2 italic uppercase tracking-tighter">
                    <Code2 style={{ color: EY_YELLOW }}/> Metric Logic Editor
                  </h3>
                  <button onClick={() => setShowSqlModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metric Alias</label>
                    <input 
                      type="text" 
                      value={newSqlMetric.label}
                      onChange={e => setNewSqlMetric({...newSqlMetric, label: e.target.value})}
                      placeholder="e.g., Total_Net_Exposure"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFE600] outline-none font-bold text-[#2E2E38] tracking-tight transition-all"
                    />
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between items-center tracking-widest">
                      SQL Statement
                      <span className="text-[9px] lowercase italic font-normal text-slate-300 bg-[#2E2E38] px-1.5 py-0.5 rounded">Syntax: {'{{SAP_FIELD}}'}</span>
                    </label>
                    <div className="relative font-mono group flex-1">
                      <div className="absolute top-2 right-2 text-[9px] uppercase" style={{ color: `${EY_YELLOW}4D` }}>Production View</div>
                      <textarea 
                        rows={12}
                        value={newSqlMetric.sql}
                        onChange={e => setNewSqlMetric({...newSqlMetric, sql: e.target.value})}
                        className="w-full h-full p-4 bg-[#2E2E38] rounded-lg border-2 border-slate-800 focus:border-[#FFE600] outline-none text-[13px] leading-relaxed resize-none shadow-inner"
                        style={{ color: EY_YELLOW }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button onClick={() => setShowSqlModal(false)} className="px-6 py-2 text-slate-500 font-bold text-sm hover:underline tracking-tight">Discard</button>
                    <button 
                      onClick={addSqlMetric}
                      disabled={!newSqlMetric.label || !newSqlMetric.sql}
                      className="px-8 py-2 text-[#2E2E38] font-bold rounded-lg shadow-lg hover:bg-[#E6CF00] transition-all disabled:opacity-50 uppercase tracking-tighter"
                      style={{ backgroundColor: EY_YELLOW }}
                    >
                      Commit Logic
                    </button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PivotZone = ({ label, icon, fields, onDrop, onRemove, isValues = false }: PivotZoneProps) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div 
      onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e: React.DragEvent) => { setIsOver(false); onDrop(e); }}
      className={`bg-white border-2 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-[160px] transition-all duration-200 ${
        isOver ? `scale-[1.02] shadow-md` : 'border-slate-100 hover:border-slate-200'
      }`}
      style={isOver ? { borderColor: EY_YELLOW, backgroundColor: `${EY_YELLOW}0D` } : {}}
    >
      <div className={`p-3 border-b flex items-center justify-between ${isOver ? 'bg-opacity-20 border-opacity-30' : 'bg-slate-50 border-slate-100'}`} style={isOver ? { backgroundColor: `${EY_YELLOW}33`, borderColor: `${EY_YELLOW}4D` } : {}}>
        <div className="flex items-center gap-2">
          <div className="text-[#2E2E38]">{icon}</div>
          <span className="text-[11px] font-bold text-[#2E2E38] uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{fields?.length || 0}</span>
      </div>
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto max-h-[220px] bg-white relative">
        {!fields || fields.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale text-slate-200">
             <Layout size={32} className="mb-1"/>
             <span className="text-[9px] font-bold uppercase tracking-widest text-center">Drag Technical<br/>Dimensions Here</span>
          </div>
        ) : (
          fields.map((field: Field) => (
            <div key={field.id} className="flex items-center justify-between p-2 rounded-md text-[11px] font-bold shadow-sm border group animate-in slide-in-from-left-2 duration-200" style={field.type === 'SQL' ? { backgroundColor: `${EY_YELLOW}33`, borderColor: EY_YELLOW, color: '#2E2E38' } : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
              <div className="flex items-center gap-2 truncate pr-2">
                <GripVertical size={10} className="text-slate-300"/>
                <span className="truncate tracking-tight">{isValues && field.type === 'RAW' ? `Sum of ${field.name}` : field.name}</span>
              </div>
              <button onClick={() => onRemove(field.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0 p-1">
                <Trash2 size={12}/>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 transition-all hover:shadow-md hover:-translate-y-1" style={{ borderTopColor: EY_YELLOW }}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-bold text-[#2E2E38] tracking-tighter italic uppercase">{value}</div>
      <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200 uppercase tracking-tighter">{trend}</div>
    </div>
  </div>
);

export default App;
