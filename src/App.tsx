import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Map, 
  Database, 
  Zap, 
  Search, 
  FileText, 
  BrainCircuit, 
  ChevronRight, 
  ChevronLeft,
  Activity,
  AlertCircle,
  CheckCircle2,
  Users,
  ArrowDown,
  ArrowUp,
  RefreshCcw,
  Newspaper,
  ShoppingCart,
  Info,
  Code,
  Globe,
  Lock,
  BarChart3,
  TrendingUp as TrendingIcon,
  MousePointer2,
  Clock,
  Rocket,
  Layers,
  Network,
  Split,
  Eye,
  Settings2
} from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // 默认显示控制中心
  const [simulationStatus, setSimulationStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [inspectedAgent, setInspectedAgent] = useState(null);

  // EY 品牌配色
  const eyYellow = "#FFE600";
  const eyBlack = "#000000";
  const eyGrey = "#2E2E2E";

  const agentDatabase = {
    L1: [
      { 
        id: 'L1-CONTROLLER', 
        title: '中国区财务总监', 
        icon: BrainCircuit, 
        level: 1, 
        role: '首席战略协调者。负责解析高层业务目标，制定整体执行策略，并批准最终的战略建议。', 
        tools: [
          { name: '战略推理引擎', desc: '基于组织财务历史微调的大语言模型，用于分解复杂的业务指令。' },
          { name: '多智能体通信协议', desc: '专有握手系统，确保专业智能体之间安全的数据传输。' },
          { name: '执行叙述生成器', desc: '将原始数据转换为适用于C-suite高层的总结和战略建议。' }
        ] 
      }
    ],
    L2: [
      { 
        id: 'L2-FPA', 
        title: 'FP&A 部门主管', 
        icon: TrendingUp, 
        level: 2, 
        role: '财务分析负责人。专注于业绩差异诊断、预算宏观控制和全年度预测性场景规划。', 
        tools: [
          { name: 'Python 分析沙盒', desc: '用于在差异驱动因素上运行复杂统计回归的安安全环境。' },
          { name: 'SAP 数据桥接器', desc: '将多实例 ERP 数据聚合到统一预测模型中的中间件。' }
        ] 
      },
      { 
        id: 'L2-MA', 
        title: '市场准入负责人', 
        icon: Map, 
        level: 2, 
        role: '政策战略负责人。负责解读国家医保目录（NRDL）和集中带量采购（VBP）对利润率的长远影响。', 
        tools: [
          { name: '政策知识库 (RAG)', desc: '涵盖所有地区和国家级招标文件的实时数据库。' },
          { name: '招标预测器', desc: 'AI 模型，根据竞品动态预测未来的招标价格走势。' }
        ] 
      },
      { 
        id: 'L2-COMP', 
        title: '合规与风险主管', 
        icon: ShieldCheck, 
        level: 2, 
        role: '合规准则负责人。确保财务流程符合全球治理标准以及当地的税务及反腐败法规。', 
        tools: [
          { name: '税务验证器', desc: '与税务管理系统直接集成，进行实时发票合规检查。' },
          { name: '审计日志链', desc: '记录所有智能体操作的不可篡改日志，确保满足内控要求。' }
        ] 
      },
      { 
        id: 'L2-COMM', 
        title: '卓越商业化负责人', 
        icon: ShoppingCart, 
        level: 2, 
        role: '商业效率负责人。统筹销售代表资源，通过关联销售活动与医院采购量来优化资源配置。', 
        tools: [
          { name: 'CRM 分析 API', desc: '获取医院列名状态和医疗专业人员互动指标的接口。' },
          { name: '代表活动评分器', desc: '通过机器学习识别代表拜访效率的最佳实践路径。' }
        ] 
      }
    ],
    L3: [
      { id: 'L3-ERP', title: 'ERP 数据专家', icon: Database, level: 3, role: '数据抓取专家。直接从 SAP 模块中提取细颗粒度的交易数据和实际成本。', tools: [{ name: 'OData 连接器', desc: '用于从现代化 ERP 系统安全提取数据的标准 API。' }] },
      { id: 'L3-GPO', title: 'GPO 价格监测专员', icon: Search, level: 3, role: '招标数据专家。负责实时爬取各省采购平台的价格变动，并转化为结构化报告。', tools: [{ name: 'OCR 解析器', desc: '将非结构化 PDF 招标通知转换为定价数据。' }] },
      { id: 'L3-TAX', title: '发票验证专员', icon: ShieldCheck, level: 3, role: '税务操作专家。批量校验数字发票的真实性，确保税务抵扣申报的准确性。', tools: [{ name: 'GT-API 链路', desc: '对接国家税务平台的数字认证接口。' }] },
      { id: 'L3-CRM', title: '代表活动分析员', icon: Activity, level: 3, role: 'CRM 专员。提取和归纳一线销售人员的学术互动频率及医院入组进度。', tools: [{ name: 'CRM 连接器', desc: '提取一线团队日志的安全 OAuth2 接口。' }] },
      { id: 'L3-NEWS', title: '政策舆情员', icon: Newspaper, level: 3, role: '舆情监测专家。扫描医药行业新闻及政府公告，捕捉潜在的政策转向预警。', tools: [{ name: 'NLP 抓取器', desc: '扫描新闻门户捕捉政策变化关键词。' }] }
    ]
  };

  const dataSources = [
    { id: 'S1', name: 'SAP 核心系统', icon: Database },
    { id: 'S2', name: '省级采购平台', icon: Globe },
    { id: 'S3', name: '税务合规系统', icon: Lock },
    { id: 'S4', name: 'CRM 商业洞察', icon: Activity },
    { id: 'S5', name: '行业资讯源', icon: Newspaper }
  ];

  const simSteps = [
    {
      title: "任务启动与分解",
      desc: "财务总监 (L1) 解析 CFO 指令，识别核心业务实体和治疗领域优先级，构建专门的执行路线图。",
      agents: ['L1-CONTROLLER', 'L2-FPA', 'L2-MA', 'L2-COMP'],
      sources: [],
      phase: 'command'
    },
    {
      title: "工作人员部署",
      desc: "部门主管 (L2) 授权专项专家 (L3)，向相关的内部和外部数据库提供安全的临时访问令牌。",
      agents: ['L2-FPA', 'L2-MA', 'L2-COMP', 'L3-ERP', 'L3-GPO', 'L3-TAX', 'L3-NEWS'],
      sources: [],
      phase: 'command'
    },
    {
      title: "多模态数据采集",
      desc: "专项专家跨系统执行并行提取，将非结构化 PDF 和交易日志转换为归一化数据模型。 ",
      agents: ['L3-ERP', 'L3-GPO', 'L3-TAX', 'L3-CRM', 'L3-NEWS'],
      sources: ['S1', 'S2', 'S3', 'S4', 'S5'],
      phase: 'harvest'
    },
    {
      title: "协作推理",
      desc: "部门主管验证数据。FP&A 经理将销售额差异与市场准入负责人发现的价格政策变动直接关联。",
      agents: ['L2-FPA', 'L2-MA', 'L2-COMM', 'L3-ERP', 'L3-GPO'],
      sources: [],
      phase: 'synthesis'
    },
    {
      title: "战略合成",
      desc: "财务总监统筹各部门主管建议，平衡损益保护与资源投入，形成最终的战略决策草案。",
      agents: ['L1-CONTROLLER', 'L2-FPA', 'L2-MA', 'L2-COMM'],
      sources: [],
      phase: 'synthesis'
    },
    {
      title: "执行报告生成",
      desc: "协调者生成最终的诊断报告，包括透明的审计日志和可立即执行的预算调整方案。",
      agents: ['L1-CONTROLLER'],
      sources: [],
      phase: 'complete'
    }
  ];

  const handleNext = () => {
    if (currentStep < simSteps.length - 1) setCurrentStep(prev => prev + 1);
    else setSimulationStatus('complete');
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const startSim = () => {
    setSimulationStatus('running');
    setCurrentStep(0);
  };

  const ResetSim = () => {
    setSimulationStatus('idle');
    setCurrentStep(0);
    setCurrentView('dashboard');
  };

  const AgentNode = ({ id, title, icon: Icon, level, activeAgents, isSource }) => {
    const isActive = isSource ? simSteps[currentStep].sources.includes(id) : activeAgents.includes(id);
    const borderColor = isActive ? 'border-black' : 'border-slate-200';
    
    return (
      <div className={`flex flex-col items-center transition-all duration-500 z-10 ${isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-20'}`}>
        <div className={`rounded-xl border-2 bg-white flex items-center justify-center relative shadow-sm transition-all
          ${level === 1 ? 'w-16 h-16 border-[3px]' : 'w-12 h-12'}
          ${isActive ? (level === 1 ? 'shadow-xl bg-[#FFE600]/10 border-black' : 'shadow-lg bg-[#FFE600]/5 border-black') : ''} 
          ${borderColor} ${isSource ? 'bg-slate-50 border-dashed' : ''}`}>
          <Icon size={level === 1 ? 28 : 20} className={isActive ? 'text-black' : 'text-slate-400'} />
          {isActive && !isSource && (
            <div className={`absolute -bottom-1 -right-1 rounded-full border-2 border-white animate-pulse bg-black ${level === 1 ? 'w-4 h-4' : 'w-3 h-3'}`}></div>
          )}
        </div>
        <p className={`mt-2 font-bold uppercase tracking-tight text-center leading-tight transition-colors
          ${level === 1 ? 'text-[9px] w-24' : 'text-[7px] w-16'}
          ${isActive ? 'text-black' : 'text-slate-400'}`}>
          {title}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-sans text-slate-900 flex flex-col overflow-hidden">
      <style>{`
        @keyframes dash { to { stroke-dashoffset: -20; } }
        .pulsing-line { stroke-dasharray: 4 6; animation: dash 1s linear infinite; }
        .glow-line { filter: drop-shadow(0 0 6px rgba(255, 230, 0, 0.9)); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>

      {/* 页眉 */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFE600] rounded-sm flex items-center justify-center text-black shadow-sm">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase text-black">Agentic AI</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">数字财务解决方案</p>
          </div>
        </div>
        
        <nav className="flex gap-1 bg-slate-100 p-1 rounded-sm">
          {[
            { id: 'dashboard', label: '控制中心' },
            { id: 'agents', label: '认识智能体' },
            { id: 'multi-agent', label: '为什么选择多智能体？' },
            { id: 'report', label: '分析报告' }
          ].map(view => (
            <button 
              key={view.id}
              onClick={() => {
                setCurrentView(view.id);
                if (view.id === 'agents' && !inspectedAgent) setInspectedAgent(agentDatabase.L1[0]);
              }} 
              disabled={view.id === 'report' && simulationStatus !== 'complete'}
              className={`px-4 py-2 rounded-sm text-[10px] font-bold transition-all uppercase tracking-tighter ${currentView === view.id ? 'bg-black text-[#FFE600]' : 'text-slate-500 hover:text-black disabled:opacity-20'}`}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* 视图：控制中心 */}
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* EY 风格战略页眉 */}
            <div className="bg-black rounded-sm p-12 text-white shadow-2xl mb-8 relative overflow-hidden border-l-[12px] border-[#FFE600]">
              <div className="absolute right-0 top-0 opacity-10 -mr-16 -mt-16">
                <Rocket size={320} />
              </div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-5xl font-bold mb-6 tracking-tighter leading-[1.1]">智能体劳动力如何 <br/><span className="text-[#FFE600]">变革我们的工作方式</span></h2>
                  <p className="text-slate-400 text-xl leading-relaxed mb-0 font-light">
                    展示协同作业的智能大军如何从繁琐的行政任务中解放人力，加速财务决策速度。
                  </p>
                </div>
                <div className="bg-[#1A1A1A] rounded-sm p-8 border border-white/5 backdrop-blur-xl shadow-2xl">
                   <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                      <Layers size={22} className="text-[#FFE600]" />
                      <h3 className="font-bold uppercase tracking-[0.2em] text-sm">核心价值主张</h3>
                   </div>
                   <div className="space-y-6">
                      <p className="text-sm text-slate-300 leading-relaxed">Agentic AI 是指具备推理和执行能力的自主系统，它不仅仅是回答问题，更是主动解决问题。</p>
                      <ul className="grid grid-cols-1 gap-4">
                         <li className="flex gap-4 text-xs items-center group">
                            <div className="w-2 h-2 bg-[#FFE600] group-hover:scale-125 transition-transform"></div>
                            <span className="text-slate-200"><strong>释放精力：</strong> 将 80% 的手工数据清洗转交给智能体处理。</span>
                         </li>
                         <li className="flex gap-4 text-xs items-center group">
                            <div className="w-2 h-2 bg-[#FFE600] group-hover:scale-125 transition-transform"></div>
                            <span className="text-slate-200"><strong>深度诊断：</strong> 通过跨系统的秒级联动发现数字背后的根因。</span>
                         </li>
                         <li className="flex gap-4 text-xs items-center group">
                            <div className="w-2 h-2 bg-[#FFE600] group-hover:scale-125 transition-transform"></div>
                            <span className="text-slate-200"><strong>决策驱动：</strong> 财务团队从“生产报告”转向“制定决策”。</span>
                         </li>
                      </ul>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-sm p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Command Center</h2>
                <p className="text-slate-400 text-[10px] mb-8 uppercase tracking-[0.3em] font-black">财务数字化协同系统</p>
                <div className="relative group">
                  <textarea 
                    readOnly 
                    value="执行2026年1月SKU业绩诊断。识别南方地区价格触发因素并提出缓解建议。运行Shingrix基于加速医院列名目标的24个月收入重估。" 
                    className="w-full pl-14 pr-4 py-10 bg-slate-50 border-2 border-slate-200 rounded-sm text-slate-700 font-bold text-xl leading-relaxed focus:outline-none min-h-[180px] resize-none shadow-inner"
                  />
                  <div className="absolute top-10 left-6 flex items-center text-black"><Zap size={36} /></div>
                  
                  {simulationStatus === 'idle' && (
                    <div className="absolute right-6 bottom-6 flex gap-4">
                       <button onClick={startSim} className="px-12 py-5 bg-[#FFE600] text-black rounded-sm font-black hover:bg-black hover:text-[#FFE600] flex items-center gap-3 shadow-2xl transition-all active:scale-95 uppercase text-sm tracking-widest border-2 border-transparent">
                          部署大军 <ChevronRight size={20} />
                       </button>
                    </div>
                  )}
                </div>
              </div>

              {simulationStatus !== 'idle' && (
                <div className="flex flex-col lg:flex-row gap-12 mt-12 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex-1 bg-slate-50 rounded-sm p-12 relative flex flex-col items-center justify-between min-h-[650px] border border-slate-100 shadow-inner">
                    
                    {/* L1: 战略决策层 */}
                    <div className="w-full flex flex-col items-center">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">战略决策层 (财务总监)</div>
                       <AgentNode id="L1-CONTROLLER" title="财务总监" icon={BrainCircuit} level={1} activeAgents={simSteps[currentStep].agents} />
                    </div>

                    {/* L2: 业务管理层 */}
                    <div className="w-full flex flex-col items-center">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">业务管理层 (部门主管)</div>
                       <div className="w-full flex justify-around px-2">
                         {agentDatabase.L2.map(a => <AgentNode key={a.id} id={a.id} title={a.title.split(' ')[0]} icon={a.icon} level={2} activeAgents={simSteps[currentStep].agents} />)}
                       </div>
                    </div>

                    {/* L3: 任务执行层 */}
                    <div className="w-full flex flex-col items-center">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">任务执行层 (专项专家)</div>
                       <div className="w-full flex justify-between px-0">
                         {agentDatabase.L3.map(a => <AgentNode key={a.id} id={a.id} title={a.title.split(' ')[0]} icon={a.icon} level={3} activeAgents={simSteps[currentStep].agents} />)}
                       </div>
                    </div>

                    {/* L4: 数据源层 */}
                    <div className="w-full pt-12 border-t-2 border-slate-200 border-dashed flex justify-around items-end">
                      {dataSources.map(s => <AgentNode key={s.id} id={s.id} title={s.name.split(' ')[0]} icon={s.icon} isSource activeAgents={[]} />)}
                    </div>

                    {/* SVG PATHS - 精准对齐 */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '650px' }}>
                      {/* L1 -> L2 */}
                      {[0, 1, 2, 3].map(i => {
                        const isActive = simSteps[currentStep].phase === 'command' && simSteps[currentStep].agents.some(a => a.startsWith('L2'));
                        const xOffset = 12.5 + (i * 25);
                        return <path key={`l1l2-${i}`} d={`M 50%,115 C 50%,160 ${xOffset}%,160 ${xOffset}%,235`} stroke={isActive ? "#FFE600" : "#e2e8f0"} strokeWidth={isActive ? 4 : 1} fill="none" className={isActive ? 'pulsing-line glow-line' : ''} />;
                      })}
                      {/* L2 -> L3 */}
                      {[0, 1, 2, 3, 4].map(i => {
                        const isActive = simSteps[currentStep].agents.some(a => a.startsWith('L3'));
                        const startX = 12.5 + (Math.floor(i * 0.8) * 25);
                        const endX = (i * 25);
                        return <path key={`l2l3-${i}`} d={`M ${startX}%,290 C ${startX}%,340 ${endX}%,340 ${endX}%,410`} stroke={isActive ? "#000000" : "#e2e8f0"} strokeWidth={isActive ? 2 : 1} fill="none" className={isActive ? 'pulsing-line' : ''} />;
                      })}
                      {/* L3 -> L4 */}
                      {[0, 1, 2, 3, 4].map(i => {
                        const isActive = simSteps[currentStep].phase === 'harvest' && simSteps[currentStep].sources.length > 0;
                        const x = (i * 25);
                        const sourceX = 10 + (i * 20);
                        return <path key={`l3l4-${i}`} d={`M ${x}%,465 C ${x}%,510 ${sourceX}%,510 ${sourceX}%,555`} stroke={isActive ? "#000000" : "#e2e8f0"} strokeWidth={2} fill="none" className={isActive ? 'pulsing-line' : ''} />;
                      })}
                    </svg>
                  </div>

                  {/* Step Control Panel */}
                  <div className="w-full lg:w-80 flex flex-col gap-4">
                    <div className="bg-black text-white rounded-sm p-8 flex-1 shadow-xl flex flex-col border-t-4 border-[#FFE600]">
                      <div className="flex items-center gap-2 text-[#FFE600] mb-4 uppercase tracking-[0.2em] text-[10px] font-black">
                        <Activity size={14}/> {simSteps[currentStep].phase === 'command' ? '指令分解' : simSteps[currentStep].phase === 'harvest' ? '数据采集' : '战略合成'}
                      </div>
                      <h4 className="text-xl font-bold mb-4 tracking-tight uppercase leading-tight">{simSteps[currentStep].title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light">{simSteps[currentStep].desc}</p>
                      
                      <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-center">
                        <button onClick={handleBack} disabled={currentStep === 0} className="p-3 bg-white/5 rounded-sm hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronLeft size={20}/></button>
                        <span className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest">STEP {currentStep + 1} / 6</span>
                        <button onClick={handleNext} className="p-3 bg-[#FFE600] text-black rounded-sm hover:bg-white transition-all"><ChevronRight size={20}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 视图：认识智能体 */}
        {currentView === 'agents' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter">数字劳动力目录</h2>
              <p className="text-slate-500 text-sm uppercase font-bold tracking-widest mt-1 italic">分层级的专业团队助力财务转型</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                {Object.entries(agentDatabase).map(([level, agents]) => (
                  <div key={level} className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">
                      {level === 'L1' ? 'L1: 财务总监层' : level === 'L2' ? 'L2: 部门主管层' : 'L3: 专项专家层'}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {agents.map(a => (
                        <button key={a.id} onClick={() => setInspectedAgent(a)} className={`flex items-center gap-4 p-5 rounded-sm border-2 text-left transition-all ${inspectedAgent?.id === a.id ? 'border-black bg-white shadow-xl' : 'border-transparent bg-slate-100/50 hover:bg-white hover:border-slate-200'}`}>
                          <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${inspectedAgent?.id === a.id ? 'bg-black text-[#FFE600]' : 'bg-slate-200 text-slate-500'}`}><a.icon size={20} /></div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-tight">{a.title}</p>
                            <p className="text-[9px] text-slate-400 font-mono tracking-widest">{a.id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-8">
                {inspectedAgent && (
                  <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-12 animate-in fade-in zoom-in-95 sticky top-6">
                    <div className="flex justify-between items-start mb-12 pb-12 border-b border-slate-100">
                      <div className="flex gap-8 items-center">
                        <div className="w-20 h-20 bg-black text-[#FFE600] rounded-sm flex items-center justify-center shadow-2xl"><inspectedAgent.icon size={40} /></div>
                        <div>
                          <h3 className="text-4xl font-black tracking-tighter uppercase">{inspectedAgent.title}</h3>
                          <div className="flex gap-3 mt-3">
                            <span className="px-4 py-1.5 bg-slate-100 text-[10px] font-black rounded-sm uppercase tracking-widest">{inspectedAgent.level}级 权限状态</span>
                            <span className="px-4 py-1.5 bg-[#FFE600] text-black text-[10px] font-black rounded-sm uppercase tracking-widest">EY-SECURE V2</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><Info size={16}/> 核心职责定义</h4>
                        <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-8 rounded-sm border border-slate-100 font-light italic">"{inspectedAgent.role}"</p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><Code size={16}/> 核心工具与 API 集成</h4>
                        <div className="grid grid-cols-1 gap-6">
                          {inspectedAgent.tools.map((tool, i) => (
                            <div key={i} className="p-6 bg-black text-white rounded-sm border-l-8 border-[#FFE600] group hover:bg-[#111] transition-colors">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-black text-[#FFE600] font-mono uppercase tracking-[0.2em]">{tool.name}</span>
                                <CheckCircle2 size={16} className="text-[#FFE600]" />
                              </div>
                              <p className="text-sm text-slate-400 leading-relaxed font-light">{tool.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 视图：为什么选择多智能体？ */}
        {currentView === 'multi-agent' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 uppercase tracking-tighter">多智能体架构的优势</h2>
                <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">协同架构 vs 单体人工智能 (Monolithic AI)</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-sm border border-slate-200 p-10 shadow-sm">
                   <div className="flex gap-4 mb-8">
                      <div className="w-12 h-12 bg-rose-50 rounded-sm flex items-center justify-center text-rose-500">
                         <AlertCircle size={24}/>
                      </div>
                      <div>
                         <h4 className="font-bold text-xl tracking-tight">单体架构风险</h4>
                         <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">单一通用型 AI</p>
                      </div>
                   </div>
                   <ul className="space-y-6">
                      <li className="flex gap-4 items-start">
                         <div className="mt-1.5 w-2 h-2 bg-rose-400 shrink-0"></div>
                         <div>
                            <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">认知负荷过重</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">在单一上下文窗口中管理 50 多个 API 和数千页政策会导致“幻觉”和推理能力下降。</p>
                         </div>
                      </li>
                      <li className="flex gap-4 items-start">
                         <div className="mt-1.5 w-2 h-2 bg-rose-400 shrink-0"></div>
                         <div>
                            <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">安全漏洞面</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">拥有所有访问权限的单一智能体是巨大隐患。一旦遭到入侵，整个企业的核心数据都会面临风险。</p>
                         </div>
                      </li>
                   </ul>
                </div>

                <div className="bg-[#2E2E2E] rounded-sm p-10 shadow-xl text-white relative overflow-hidden border-l-8 border-[#FFE600]">
                   <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Network size={200} />
                   </div>
                   <div className="flex gap-4 mb-8 relative z-10">
                      <div className="w-12 h-12 bg-[#FFE600] rounded-sm flex items-center justify-center text-black">
                         <Network size={24}/>
                      </div>
                      <div>
                         <h4 className="font-bold text-xl tracking-tight text-[#FFE600]">分层协同标准</h4>
                         <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">协同智能体劳动力</p>
                      </div>
                   </div>
                   <ul className="space-y-6 relative z-10">
                      <li className="flex gap-4 items-start">
                         <div className="mt-1.5 w-2 h-2 bg-[#FFE600] shrink-0"></div>
                         <div>
                            <p className="text-sm font-bold uppercase tracking-tight">精准专业化</p>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">领域智能体在隔离的窗口中运行，确保特定任务在数学计算和政策解读上的高度准确性。</p>
                         </div>
                      </li>
                      <li className="flex gap-4 items-start">
                         <div className="mt-1.5 w-2 h-2 bg-[#FFE600] shrink-0"></div>
                         <div>
                            <p className="text-sm font-bold uppercase tracking-tight">安全隔离</p>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">遵循“最小权限”原则，确保智能体仅访问其子任务所需的工具，从而保护核心数据。</p>
                         </div>
                      </li>
                      <li className="flex gap-4 items-start">
                         <div className="mt-1.5 w-2 h-2 bg-[#FFE600] shrink-0"></div>
                         <div>
                            <p className="text-sm font-bold uppercase tracking-tight">结构化冗余</p>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">独立的执行者互相验证输出，错误在报告合成前即由管理层捕捉，显著提升可靠性。</p>
                         </div>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        )}

        {/* 视图：分析报告 */}
        {currentView === 'report' && (
          <div className="space-y-12 animate-in zoom-in-95 duration-500 pb-12">
            <div className="bg-black text-white rounded-sm p-16 relative overflow-hidden shadow-2xl border-l-[16px] border-[#FFE600]">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-[#FFE600]"><TrendingIcon size={240} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8 text-[#FFE600] uppercase font-black text-sm tracking-[0.6em]">
                  <Activity size={24}/> 自动化战略诊断输出
                </div>
                <h2 className="text-6xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">业绩分析报告 <br/><span className="text-[#FFE600]">2026年1月</span></h2>
                <div className="flex flex-wrap gap-6">
                  <span className="px-8 py-3 bg-white/10 rounded-sm text-xs font-black border border-white/20 flex items-center gap-3 uppercase tracking-widest">
                     <AlertCircle size={18} className="text-[#FFE600]" />
                     优先级：需要调整预算计划
                  </span>
                  <span className="px-8 py-3 bg-emerald-500/20 text-emerald-400 rounded-sm text-xs font-black border border-emerald-500/20 flex items-center gap-3 uppercase tracking-widest">
                     <CheckCircle2 size={18} className="text-emerald-400" />
                     认证状态：通过完整审计验证
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white rounded-sm border border-slate-200 p-12 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-black flex items-center gap-4 uppercase tracking-tight"><BarChart3 size={28} className="text-black"/> 1. 差异分析与组合健康度</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                         <thead className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b pb-6">
                           <tr><th className="pb-6">核心业务组合</th><th className="pb-6 text-right">实际营收</th><th className="pb-6 text-right">差异 %</th></tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                           {[
                              { label: '疫苗业务集群', val: '¥450M', v: '+7.1%', s: 'up' },
                              { label: '呼吸系统中心', val: '¥210M', v: '-14.3%', s: 'down' },
                              { label: '特药核心资产', val: '¥180M', v: '+2.8%', s: 'up' }
                           ].map((row, i) => (
                              <tr key={i}><td className="py-6 font-black uppercase tracking-tight text-slate-800 text-lg">{row.label}</td><td className="py-6 text-right font-medium text-lg">¥{row.val}</td><td className={`py-6 text-right font-black text-xl ${row.s === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>{row.v}</td></tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 rounded-sm p-10 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-[0.4em]">营收分布占比</p>
                    <div className="relative w-52 h-52">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="#FFE600" strokeWidth="6" strokeDasharray="50 100" />
                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="#000000" strokeWidth="6" strokeDasharray="25 100" strokeDashoffset="-50" />
                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="25 100" strokeDashoffset="-75" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-black uppercase tracking-tighter">¥1.2B</span>
                         <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">1月 总计</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-sm border border-slate-200 p-12 shadow-sm flex flex-col">
                <h3 className="font-black flex items-center gap-4 mb-10 text-2xl uppercase tracking-tight"><Search size={28} className="text-black"/> 2. 根因诊断 (Root-Cause)</h3>
                <div className="flex-1 space-y-10">
                  <div className="p-8 bg-[#FFE600]/5 border-l-8 border-[#FFE600] rounded-sm relative overflow-hidden">
                    <p className="text-[10px] font-black text-black mb-4 uppercase tracking-[0.3em]">政策信号</p>
                    <p className="text-lg text-slate-700 leading-relaxed font-light italic">“GPO 抓取工具识别出南方地区招标导致的价格侵蚀。呼吸系统资产的实际价格在1月10日强制下降了25%。”</p>
                  </div>
                  <div className="p-8 bg-slate-50 border-l-8 border-black rounded-sm relative overflow-hidden">
                    <p className="text-[10px] font-black text-black mb-4 uppercase tracking-[0.3em]">商业逻辑验证</p>
                    <p className="text-lg text-slate-700 leading-relaxed font-light italic">“CRM 专家确认，由于局部医院准入限制，南方地区的一线代表学术互动时长减少了15%。”</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-sm border border-slate-200 p-12 shadow-sm">
               <h3 className="text-3xl font-black flex items-center gap-5 mb-12 uppercase tracking-tight"><TrendingIcon size={32} className="text-black"/> 3. 预测性重新预估 (Reforecast)</h3>
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                  <div className="lg:col-span-3 h-80 relative bg-slate-50 rounded-sm border border-slate-100 p-12">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100">
                       <line x1="0" y1="100" x2="1000" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                       <path d="M 0,50 L 250,45 L 500,55 L 750,60 L 1000,65" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8" />
                       <path d="M 0,50 L 250,45 L 500,35 L 750,20 L 1000,5" fill="none" stroke="#FFE600" strokeWidth="6" className="glow-line" />
                       <circle cx="500" cy="35" r="7" fill="black" />
                       <circle cx="1000" cy="5" r="8" fill="#FFE600" stroke="black" strokeWidth="3" />
                    </svg>
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black text-[#FFE600] border-2 border-[#FFE600] px-8 py-3 rounded-sm shadow-2xl text-sm font-black uppercase tracking-[0.4em]">
                        预估营收回收率: +¥42M
                    </div>
                  </div>
                  <div className="flex flex-col gap-8 justify-center">
                     <div className="p-8 bg-slate-50 rounded-sm border-l-[12px] border-[#FFE600]">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">NPV 增量</p>
                        <p className="text-4xl font-black text-emerald-600">+12.4%</p>
                     </div>
                     <div className="p-8 bg-slate-50 rounded-sm border-l-[12px] border-black">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">流动性水平</p>
                        <p className="text-4xl font-black text-black">94%</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* 建议行动部分 */}
            <div className="bg-black rounded-sm p-16 text-white relative overflow-hidden shadow-2xl border-l-[16px] border-[#FFE600]">
              <div className="absolute bottom-0 right-0 p-8 opacity-5"><ShieldCheck size={300} /></div>
              <div className="flex items-center gap-4 mb-12 text-[#FFE600] font-black uppercase text-sm tracking-[0.6em]"><Rocket size={24}/> 4. 建议行动清单 (Recommended Actions)</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-[#FFE600] text-black rounded-sm flex items-center justify-center font-black text-2xl shadow-xl">1</div>
                  <h4 className="font-black text-2xl uppercase tracking-tighter leading-tight">资产组合 <br/>战略性转向</h4>
                  <p className="text-slate-400 text-lg font-light leading-relaxed">
                     立即将 <strong>¥12.5M</strong> 的营销预算从价格受损严重的地区重新分配给处于高需求的疫苗业务。这将在利用现有库存的同时保护绝对利润率。
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-[#FFE600] text-black rounded-sm flex items-center justify-center font-black text-2xl shadow-xl">2</div>
                  <h4 className="font-black text-2xl uppercase tracking-tighter leading-tight">数字化 <br/>学术互动</h4>
                  <p className="text-slate-400 text-lg font-light leading-relaxed">
                     为南方地区的医生激活“混合数字化”互动模式。目标是实现 65% 的数字化覆盖，以规避物理访问障碍，维持处方量拉动。
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-[#FFE600] text-black rounded-sm flex items-center justify-center font-black text-2xl shadow-xl">3</div>
                  <h4 className="font-black text-2xl uppercase tracking-tighter leading-tight">VBP 采购 <br/>风险防御</h4>
                  <p className="text-slate-400 text-lg font-light leading-relaxed">
                     执行 L2 市场准入智能体针对 Q2 招标的模拟。在特药组合中建立强制性的价格底线，以维护全国价格体系完整性，防止跨区域侵蚀。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest z-50">
         <div className="flex gap-6">
           <span>节点：14个活跃中</span>
           <span>安全等级：RSA-4096 / GXP</span>
           <span>审计：不可篡改记录</span>
         </div>
         <p>© 2026 全球财务运营 • 智能体劳动力原型 v3.5</p>
      </footer>
    </div>
  );
};

export default App;
