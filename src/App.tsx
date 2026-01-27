import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  Settings, 
  LogOut,
  Image as ImageIcon,
  Trash2,
  BarChart3,
  Smartphone,
  Monitor,
  Sparkles,
  ChevronDown,
  X,
  Calculator,
  Database,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

// Data Interfaces
interface LineItem {
  id: string;
  glCode: string;
  costCenter: string;
  profitCenter: string;
  amount: string;
  desc: string;
  itemText: string;
  memo: string;
  conf: number;
  aiCommentary: string;
}

interface InvoiceField {
  val: string;
  conf: number;
}

interface Invoice {
  id: string;
  vendor: string;
  date: string;
  amount: string;
  status: string;
  confidence: number;
  companyCode: string;
  companyName: string;
  uploadedBy: string;
  uploadMethod: 'Desktop' | 'Mobile';
  fields: {
    company: InvoiceField;
    date: InvoiceField;
    currency: InvoiceField;
    supplier: InvoiceField;
  };
  lineItems: LineItem[];
}

const MOCK_DATA = {
  companies: [
    { id: '1000', label: '1000 - Sino HK Property Management' },
    { id: '2100', label: '2100 - Sino SG Development Pte Ltd' },
    { id: '3000', label: '3000 - Sino Australia Hotel Group' }
  ],
  suppliers: [
    'HK Electric Co.',
    'OTIS Elevator Company HK',
    'Sydney Water Corporation',
    'Singtel Enterprise',
    'Star Hotel Supplies SG',
    'Melbourne Facility Services',
    'Aussie Construction Partners',
    'CLP Power Hong Kong'
  ],
  glAccounts: [
    '610100 - Building Repairs & Maint', 
    '620200 - Utilities: Electricity', 
    '620300 - Utilities: Water & Sewage', 
    '700500 - Hotel Guest Supplies',
    '710200 - Security Services',
    '800500 - Property Management Fees'
  ],
  costCenters: [
    'HK_REDEV_TST - Tsim Sha Tsui Redevelopment', 
    'SG_HOTEL_MARINA - Sino Marina Bay Hotel', 
    'AUS_RES_MELB - Melbourne Residential Tower', 
    'HK_CORP_HQ - Sino Plaza Headquarters'
  ],
  profitCenters: [
    'PC_HK_COMM - HK Commercial',
    'PC_HK_RES - HK Residential',
    'PC_SG_HOSP - SG Hospitality',
    'PC_AUS_HOSP - Australia Hospitality'
  ],
  currencies: ['HKD', 'SGD', 'AUD', 'USD', 'GBP']
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-HK-9921',
    vendor: 'OTIS Elevator Company HK',
    date: '2024-01-15',
    amount: '12,500.00',
    status: 'Ready',
    confidence: 98,
    companyCode: '1000',
    companyName: 'Sino HK Property Management',
    uploadedBy: 'Ada Wong',
    uploadMethod: 'Desktop',
    fields: {
      company: { val: '1000 - Sino HK Property Management', conf: 99 },
      date: { val: '2024-01-15', conf: 98 },
      currency: { val: 'HKD', conf: 100 },
      supplier: { val: 'OTIS Elevator Company HK', conf: 97 }
    },
    lineItems: [
      { 
        id: 'li-1',
        glCode: '610100 - Building Repairs & Maint', 
        costCenter: 'HK_CORP_HQ - Sino Plaza Headquarters', 
        profitCenter: 'PC_HK_COMM - HK Commercial', 
        amount: '12,500.00', 
        desc: 'Quarterly Lift Maintenance - Jan-Mar', 
        itemText: 'Routine Elevator Service - High Rise Unit', 
        memo: '', 
        conf: 98,
        aiCommentary: "Matched to Sino Plaza HQ based on facility contract ID identified in footer."
      }
    ]
  },
  {
    id: 'INV-SG-5502',
    vendor: 'Star Hotel Supplies SG',
    date: '2024-01-20',
    amount: '4,210.50',
    status: 'Needs Review',
    confidence: 78,
    companyCode: '2100',
    companyName: 'Sino SG Development Pte Ltd',
    uploadedBy: 'Kevin Lim',
    uploadMethod: 'Mobile',
    fields: {
      company: { val: '2100 - Sino SG Development Pte Ltd', conf: 99 },
      date: { val: '2024-01-20', conf: 92 },
      currency: { val: 'SGD', conf: 100 },
      supplier: { val: 'Star Hotel Supplies SG', conf: 85 }
    },
    lineItems: [
      { 
        id: 'li-2',
        glCode: '700500 - Hotel Guest Supplies', 
        costCenter: 'SG_HOTEL_MARINA - Sino Marina Bay Hotel', 
        profitCenter: 'PC_SG_HOSP - SG Hospitality', 
        amount: '4,210.50', 
        desc: 'Premium Linen Set x 200', 
        itemText: 'Guest Amenities - Bedding Upgrade', 
        memo: 'Confirm bulk discount applied', 
        conf: 76,
        aiCommentary: "GL 700500 selected; confidence level impacted by handwritten surcharge note on page 2."
      }
    ]
  }
];

const ConfidenceBadge = ({ score }: { score?: number }) => {
  if (score === undefined) return null;
  const color = score >= 95 ? 'bg-green-500/10 text-green-600 border-green-200' : 
                score >= 75 ? 'bg-amber-500/10 text-amber-600 border-amber-200' : 
                'bg-red-500/10 text-red-600 border-red-200';
  
  return (
    <div className={`px-1.5 py-0.5 rounded border text-[10px] font-black font-mono shadow-sm ${color}`}>
      {score}%
    </div>
  );
};

interface SearchableSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  confidence?: number;
  placeholder?: string;
}

const SearchableSelect = ({ label, value, options, onChange, confidence, placeholder = "Search..." }: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => 
    options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  return (
    <div className="space-y-1.5 relative">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-600 tracking-tight">{label}</label>
        <ConfidenceBadge score={confidence} />
      </div>
      <div 
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer flex justify-between items-center hover:border-slate-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#F47321] focus:border-[#F47321]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <div 
                  key={i}
                  className="px-3 py-2 text-sm hover:bg-[#F47321]/10 hover:text-[#F47321] cursor-pointer transition-colors"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-slate-400 text-center italic">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [view, setView] = useState('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [approvalThreshold, setApprovalThreshold] = useState<number>(90);

  // Local state for invoice line items
  const [invoiceLines, setInvoiceLines] = useState<LineItem[]>([]);

  useEffect(() => {
    if (selectedInvoice) {
      setInvoiceLines(selectedInvoice.lineItems);
    }
  }, [selectedInvoice]);

  const handleOpenInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setView('detail');
  };

  const handleAddRow = () => {
    const newRow: LineItem = {
      id: `li-manual-${Date.now()}`,
      glCode: '',
      costCenter: '',
      profitCenter: '',
      amount: '0.00',
      desc: 'Manual Allocation',
      itemText: 'Manual Entry',
      memo: '',
      conf: 100,
      aiCommentary: "Manual entry added by user for additional project allocation."
    };
    setInvoiceLines([...invoiceLines, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    setInvoiceLines(invoiceLines.filter(line => line.id !== id));
  };

  const handleUpdateLine = (id: string, field: keyof LineItem, value: string) => {
    setInvoiceLines(invoiceLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const totalAllocated = useMemo(() => {
    const sum = invoiceLines.reduce((acc, line) => {
      const val = parseFloat(line.amount.replace(/,/g, '')) || 0;
      return acc + val;
    }, 0);
    return sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [invoiceLines]);

  const Dashboard = () => (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sino Portfolio Billing</h1>
          <p className="text-slate-500 text-sm">Managing property & hospitality invoicing across HK, SG, and Australia</p>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#F47321] text-white rounded-lg hover:bg-[#d6621a] transition-all shadow-lg shadow-[#F47321]/20 font-bold"
        >
          <Upload className="w-4 h-4" />
          Upload New Bill
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: '142', icon: FileText, color: 'text-slate-600' },
          { label: 'Post to SAP', value: '84', icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Needs Review', value: '12', icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Processing', value: '3', icon: Clock, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-50 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by supplier or property project..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F47321]/20 focus:border-[#F47321]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-white">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Sino Entity</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_INVOICES.map((inv, idx) => (
                <tr 
                  key={inv.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => handleOpenInvoice(inv)}
                >
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-4 text-sm font-bold">{inv.companyName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 uppercase">{inv.vendor}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{inv.uploadedBy}</td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {inv.uploadMethod === 'Mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">{inv.uploadMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                       {inv.fields.currency.val.slice(0,2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${inv.status === 'Ready' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                      <span className="text-xs font-medium text-slate-700">{inv.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">{inv.fields.currency.val} {inv.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#F47321] inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReportingPage = () => (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Portfolio Analytics</h1>
          <p className="text-slate-500 text-sm">Managing operational efficiency and spend across regional hubs</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
           <Calendar className="w-4 h-4 text-slate-400 ml-2" />
           <select className="text-sm font-bold border-none bg-transparent focus:ring-0 outline-none pr-4">
             <option>Current Quarter (Q1 2024)</option>
             <option>Last Month</option>
             <option>Year to Date</option>
             <option>Custom Range...</option>
           </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg. Confidence Score', value: '94.2%', icon: Sparkles, trend: '+2.1%' },
          { label: 'Auto-Approval Rate', value: '68%', icon: Activity, trend: '+5.4%' },
          { label: 'Avg. Processing Time', value: '1.2s', icon: Clock, trend: '-0.3s' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg">
                <kpi.icon className="w-5 h-5 text-[#F47321]" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded bg-green-50 text-green-600 border border-green-100`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-[#F47321]" />
               Regional Spend Distribution
             </h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: $7.67M</span>
           </div>
           <div className="space-y-6">
              {[
                { region: 'Sino HK Property Management', amount: 'HKD 33,150,000', usdVal: '$4,250,000', percentage: 55, color: 'bg-[#F47321]' },
                { region: 'Sino SG Development Pte Ltd', amount: 'SGD 2,814,000', usdVal: '$2,100,000', percentage: 28, color: 'bg-[#F47321]/70' },
                { region: 'Sino Australia Hotel Group', amount: 'AUD 1,980,000', usdVal: '$1,320,000', percentage: 17, color: 'bg-[#F47321]/40' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{item.region}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs font-black text-slate-800">{item.usdVal}</p>
                        <p className="text-[10px] text-slate-400 font-medium">({item.amount})</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-800">{item.percentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#F47321]" />
              Top Supplier Spend Ranking
            </h3>
          </div>
          <div className="space-y-4">
             {[
               { name: 'OTIS Elevator Company HK', amount: '$1.42M', count: 42, width: '95%' },
               { name: 'CLP Power Hong Kong', amount: '$1.15M', count: 35, width: '82%' },
               { name: 'Sydney Water Corporation', amount: '$0.88M', count: 28, width: '68%' },
               { name: 'Star Hotel Supplies SG', amount: '$0.62M', count: 22, width: '52%' },
               { name: 'HK Electric Co.', amount: '$0.45M', count: 18, width: '40%' }
             ].map((sup, i) => (
               <div key={i} className="space-y-2 group">
                 <div className="flex items-center justify-between px-1">
                   <div className="flex items-center gap-3">
                     <span className="text-xs font-black text-slate-300">0{i+1}</span>
                     <span className="text-sm font-bold text-slate-700">{sup.name}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-sm font-black text-[#F47321]">{sup.amount}</span>
                     <span className="text-[10px] text-slate-400 font-bold ml-2">({sup.count} Bills)</span>
                   </div>
                 </div>
                 <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                   <div className={`h-full bg-slate-200 group-hover:bg-[#F47321] transition-all duration-500`} style={{ width: sup.width }} />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Portfolio Hub Settings</h1>
        <p className="text-slate-500 text-sm">Managing cross-regional Sino Property & Hotel extraction engines</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-[#F47321]" />
             Automatic Approval Engine
           </h3>
           <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Automatic Approval Threshold</p>
                    <p className="text-xs text-slate-500">Invoices above this confidence level skip manual review</p>
                  </div>
                  <span className="text-2xl font-black text-[#F47321]">{approvalThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={approvalThreshold} 
                  onChange={(e) => setApprovalThreshold(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F47321]" 
                />
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                   <div>
                     <p className="text-sm font-bold text-slate-800 tracking-tight">Post Balanced Items Automatically</p>
                     <p className="text-xs text-slate-500">Immediately send zero-variance bills to SAP</p>
                   </div>
                   <div className="w-12 h-6 bg-[#F47321] rounded-full relative cursor-pointer">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                 </div>
                 <div className="flex items-center justify-between px-2">
                   <div>
                     <p className="text-sm font-bold text-slate-800 tracking-tight">Require Manager Sign-off {' > '} $50k</p>
                     <p className="text-xs text-slate-500">Override auto-approval for high-value bills</p>
                   </div>
                   <div className="w-12 h-6 bg-[#F47321] rounded-full relative cursor-pointer">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <Database className="w-5 h-5 text-[#F47321]" />
             SAP S/4HANA Master Data
           </h3>
           <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-400">Global Sync Status</span>
               <span className="text-[10px] font-black px-2 py-0.5 bg-green-500 rounded uppercase">Active</span>
             </div>
             <p className="text-xs leading-relaxed text-slate-300">Synchronized with HK, SG, and Australia regional instances.</p>
             <button className="w-full py-3 bg-[#F47321] rounded-xl text-xs font-black uppercase tracking-widest mt-4 shadow-lg shadow-[#F47321]/20">
               Force Global SAP Sync
             </button>
           </div>
        </div>
      </div>
    </div>
  );

  const InvoiceDetail = () => {
    if (!selectedInvoice) return null;

    return (
      <div className="h-screen flex flex-col bg-white animate-in slide-in-from-right duration-300">
        <header className="h-16 bg-slate-900 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="h-6 w-[1px] bg-white/20" />
            <div className="text-white">
              <h2 className="text-sm font-bold tracking-tight uppercase tracking-widest">{selectedInvoice.vendor}</h2>
              <p className="text-[10px] text-slate-400">{selectedInvoice.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Save Progress</button>
            <button className="px-6 py-2 bg-[#F47321] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-[#F47321]/30 hover:bg-[#d6621a] transition-all">Post to SAP</button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-slate-100 p-8 overflow-auto border-r border-slate-200 relative">
            <div className="bg-white aspect-[1/1.414] w-full max-w-2xl mx-auto shadow-2xl p-12 relative rounded-sm border border-slate-200">
               <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
                 <div className="w-40 h-16 border-2 border-slate-100 rounded-lg flex items-center justify-center text-slate-100 font-black italic select-none uppercase tracking-tighter leading-none text-center">VENDOR<br/>LOGO</div>
                 <div className="text-right">
                   <h1 className="text-3xl font-black text-slate-800 tracking-tighter">TAX INVOICE</h1>
                   <p className="text-slate-400 font-mono text-sm tracking-widest">{selectedInvoice.id}</p>
                   <p className="text-slate-400 text-xs">Dated: {selectedInvoice.date}</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-12 mb-12 text-sm">
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[10px] mb-2 tracking-widest">From Supplier</p>
                    <p className="font-bold text-lg text-slate-900">{selectedInvoice.vendor}</p>
                    <p className="text-slate-500 italic mt-1 text-xs underline underline-offset-4 decoration-[#F47321]/30 cursor-help">Verified SAP Vendor Record</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-400 uppercase text-[10px] mb-2 tracking-widest">Billed To Sino Entity</p>
                    <p className="font-bold text-[#F47321]">{selectedInvoice.companyName}</p>
                    <p className="text-slate-500 font-mono text-xs">Hub: {selectedInvoice.companyCode}</p>
                  </div>
               </div>

               <div className="mt-12 space-y-4">
                  <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase border-b border-slate-200 pb-2 tracking-widest">
                     <span>Service Description</span>
                     <span>Value ({selectedInvoice.fields.currency.val})</span>
                  </div>
                  {invoiceLines.map((li, i) => (
                    <div key={i} className={`flex justify-between text-sm py-4 border-b border-slate-50 transition-colors`}>
                      <div className="flex flex-col gap-1">
                         <span className="text-slate-900 font-bold">{li.desc}</span>
                         <span className="text-[10px] text-slate-400 italic font-medium">Auto-Label: {li.itemText}</span>
                      </div>
                      <span className="font-black text-slate-900 text-base">{li.amount}</span>
                    </div>
                  ))}
               </div>

               <div className="mt-16 pt-8 border-t-2 border-slate-900 flex justify-between items-end">
                  <div className="text-slate-400 text-[10px] uppercase tracking-tighter font-bold italic">Sino Internal Compliance: Property Audit Ready</div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Payables</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">
                      <span className="text-sm font-bold text-slate-400 mr-2">{selectedInvoice.fields.currency.val}</span>
                      {selectedInvoice.amount}
                    </p>
                  </div>
               </div>
            </div>
          </div>

          <div className="w-[500px] flex flex-col bg-white overflow-hidden shadow-xl border-l border-slate-200">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Header Extraction (AI)</h3>
                <div className="space-y-4">
                  <SearchableSelect label="Sino Company Unit" value={selectedInvoice.fields.company.val} options={MOCK_DATA.companies.map(c => c.label)} confidence={selectedInvoice.fields.company.conf} onChange={() => {}} />
                  <SearchableSelect label="Verified Supplier" value={selectedInvoice.fields.supplier.val} options={MOCK_DATA.suppliers} confidence={selectedInvoice.fields.supplier.conf} onChange={() => {}} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between"><label className="text-xs font-bold text-slate-600">Document Date</label><ConfidenceBadge score={selectedInvoice.fields.date.conf} /></div>
                      <input type="date" defaultValue={selectedInvoice.date} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-[#F47321]" />
                    </div>
                    <SearchableSelect label="Currency" value={selectedInvoice.fields.currency.val} options={MOCK_DATA.currencies} confidence={selectedInvoice.fields.currency.conf} onChange={() => {}} />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Project allocations</h3>
                  <button 
                    onClick={handleAddRow}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#F47321] uppercase hover:underline"
                  >
                    <Plus className="w-3 h-3"/> New row
                  </button>
                </div>

                {invoiceLines.map((li, idx) => (
                  <div key={li.id} className="border border-slate-200 bg-slate-50/50 rounded-2xl overflow-hidden shadow-sm transition-all mb-4">
                    <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#F47321] bg-[#F47321]/10 px-2 py-1 rounded tracking-tighter">ITEM {String(idx+1).padStart(2, '0')}</span>
                        <ConfidenceBadge score={li.conf} />
                      </div>
                      <button 
                        onClick={() => handleDeleteRow(li.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="bg-[#F47321]/5 border border-[#F47321]/10 p-3 rounded-xl flex items-start gap-3">
                         <Sparkles className="w-4 h-4 text-[#F47321] shrink-0 mt-0.5" />
                         <div className="space-y-0.5">
                           <p className="text-[10px] font-black text-[#F47321] uppercase tracking-wider">AI Insight</p>
                           <p className="text-xs text-slate-700 italic leading-relaxed">{li.aiCommentary}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <SearchableSelect 
                            label="SAP GL Account" 
                            value={li.glCode} 
                            options={MOCK_DATA.glAccounts} 
                            confidence={li.conf} 
                            onChange={(val) => handleUpdateLine(li.id, 'glCode', val)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label>
                          <input 
                            type="text" 
                            value={li.amount} 
                            onChange={(e) => handleUpdateLine(li.id, 'amount', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-xs font-black text-right outline-none focus:border-[#F47321]" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <SearchableSelect 
                          label="Profit Center" 
                          value={li.profitCenter} 
                          options={MOCK_DATA.profitCenters} 
                          confidence={li.conf > 90 ? li.conf : li.conf - 2} 
                          onChange={(val) => handleUpdateLine(li.id, 'profitCenter', val)} 
                        />
                        <SearchableSelect 
                          label="Cost Center" 
                          value={li.costCenter} 
                          options={MOCK_DATA.costCenters} 
                          confidence={li.conf > 90 ? li.conf : li.conf - 5} 
                          onChange={(val) => handleUpdateLine(li.id, 'costCenter', val)} 
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">AI Item Text</label>
                          <ConfidenceBadge score={li.conf > 90 ? li.conf : li.conf - 2} />
                        </div>
                        <input 
                          type="text" 
                          value={li.itemText} 
                          onChange={(e) => handleUpdateLine(li.id, 'itemText', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-xs font-medium italic focus:border-[#F47321] outline-none shadow-sm" 
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Audit Memo / Property Note</label>
                        <textarea 
                          rows="2" 
                          placeholder="Add site-specific notes..." 
                          value={li.memo}
                          onChange={(e) => handleUpdateLine(li.id, 'memo', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs italic resize-none outline-none shadow-inner" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>
            
            <div className="p-6 bg-slate-900 text-white shadow-2xl">
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Amount Allocated</p>
                   <p className="text-2xl font-black tracking-tighter">
                     <span className="text-xs font-bold text-slate-500 mr-2 uppercase">{selectedInvoice.fields.currency.val}</span>
                     {totalAllocated}
                   </p>
                 </div>
                 <div className="text-right">
                    <div className={`flex items-center gap-2 text-xs font-bold mb-1 ${totalAllocated === selectedInvoice.amount ? 'text-green-400' : 'text-amber-400'}`}>
                      {totalAllocated === selectedInvoice.amount ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {totalAllocated === selectedInvoice.amount ? 'SAP BALANCED' : 'VARIANCE DETECTED'}
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest italic decoration-[#F47321] underline decoration-2 underline-offset-4">Region Ready</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      <nav className="h-16 bg-[#1a1a1a] flex-shrink-0 flex items-center justify-between px-6 sticky top-0 z-40 border-b border-white/5">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded bg-[#F47321] flex items-center justify-center shadow-lg shadow-[#F47321]/30">
               <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black tracking-tighter text-2xl uppercase">SINO<span className="text-[#F47321]">SCAN</span></span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard' },
              { icon: BarChart3, label: 'Reporting' },
              { icon: Settings, label: 'Settings' },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => { setActiveTab(item.label); setView('list'); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all text-sm font-bold tracking-tight ${activeTab === item.label ? 'bg-[#F47321] text-white shadow-lg shadow-[#F47321]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white uppercase tracking-tighter">Finance Hub Admin</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest text-[#F47321]">REGION: APAC</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">ADM</div>
            <button className="p-2 text-slate-500 hover:text-red-400 transition-colors">
               <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'Dashboard' && (view === 'list' ? <Dashboard /> : <InvoiceDetail />)}
        {activeTab === 'Reporting' && <ReportingPage />}
        {activeTab === 'Settings' && <SettingsPage />}
      </main>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isAiOpen && (
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
             <div className="bg-[#1a1a1a] p-4 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-[#F47321]" />
                 <span className="text-white text-xs font-bold tracking-widest uppercase">Sino Portfolio AI</span>
               </div>
               <button onClick={() => setIsAiOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
             </div>
             <div className="p-4 space-y-4 h-64 overflow-y-auto bg-slate-50/50">
               <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs leading-relaxed text-slate-700 shadow-sm relative">
                 <div className="absolute -left-1 top-4 w-2 h-2 bg-white border-l border-t border-slate-200 rotate-45" />
                 I can help you adjust these entries. Try "Split Item 1 50/50 between HK and SG hubs".
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">AI Tools</p>
                 <button className="w-full text-left p-3 rounded-xl hover:bg-[#F47321]/5 text-xs text-slate-700 border border-slate-200 transition-all font-medium flex items-center gap-2">
                   <Calculator className="w-3.5 h-3.5 text-blue-500" />
                   "Calculate regional tax splits"
                 </button>
               </div>
             </div>
             <div className="p-4 border-t border-slate-100 bg-white">
                <div className="relative group">
                  <input type="text" placeholder="Ask AI..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#F47321] text-white rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                </div>
             </div>
          </div>
        )}
        <button 
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform ${isAiOpen ? 'bg-slate-900 rotate-90 scale-90' : 'bg-[#F47321] hover:scale-110'}`}
        >
          {isAiOpen ? <X className="text-white w-6 h-6" /> : <Sparkles className="text-white w-6 h-6 animate-pulse" />}
        </button>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#F47321]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-[#F47321]" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upload Property Bill</h3>
              </div>
              <div className="border-3 border-dashed border-slate-200 rounded-3xl p-16 text-center hover:border-[#F47321] hover:bg-[#F47321]/5 cursor-pointer group">
                <ImageIcon className="w-12 h-12 text-slate-200 group-hover:text-[#F47321] mx-auto mb-4" />
                <p className="text-lg font-black text-slate-800">Drop Sino Bills here</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsUploading(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-sm text-slate-600">Cancel</button>
                <button onClick={() => setIsUploading(false)} className="flex-1 py-4 bg-[#F47321] text-white rounded-2xl font-black text-sm">Start Batch Process</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
