import { useMemo, useState } from 'react';

const FEATURES = [
  {id:'study-plan',icon:'🗓️',title:'Study Planner',category:'Plan',description:'Create a weekly study plan and keep track of tasks.'},
  {id:'exam-practice',icon:'✏️',title:'Practice Exams',category:'Practice',description:'Try timed practice questions and review your answers.'},
  {id:'ielts',icon:'🌍',title:'IELTS Preparation',category:'Language',description:'Academic and General Training preparation, practice, and mock-test roadmap.'},
  {id:'tutor',icon:'🤖',title:'AI Study Assistant',category:'AI',description:'Get explanations, examples, and study prompts. AI connection is being prepared.'},
  {id:'subjects',icon:'📚',title:'Subject Guides',category:'Learn',description:'Study strategies and topic checklists across school and career subjects.'},
  {id:'videos',icon:'▶️',title:'Video Learning',category:'Learn',description:'Curated tutorial links and learning-path recommendations.'},
  {id:'library',icon:'📖',title:'Free Learning Library',category:'Resources',description:'Find open textbooks, official guides, and public learning resources.'},
  {id:'progress',icon:'📈',title:'Progress & Certificates',category:'Progress',description:'Review your learning milestones and certificate requirements.'},
  {id:'family',icon:'👨‍👩‍👧',title:'Family Learning',category:'Support',description:'A future family view for learning goals and study routines.'},
  {id:'settings',icon:'⚙️',title:'Learning Settings',category:'Settings',description:'Set your goals, preferred level, and study schedule.'}
];

const QUIZ = [
 {q:'Which prompt element helps an AI understand the desired response structure?',options:['Output format','Browser history','Screen brightness','File size'],answer:0,explanation:'Specifying an output format (such as a checklist or table) makes the expected structure clearer.'},
 {q:'What is the safest first step when automating a repetitive task?',options:['Automate every step immediately','Map the task and add a review point','Share all passwords with the tool','Skip testing'],answer:1,explanation:'Map inputs, steps, outputs, and a human review point before automating.'},
 {q:'Which practice helps evaluate a research source?',options:['Trust the headline only','Check author, date, evidence, and method','Use the first result only','Ignore citations'],answer:1,explanation:'Evaluate authorship, publication date, supporting evidence, methods, and potential bias.'},
 {q:'In a spreadsheet, what does COUNTIF do?',options:['Counts cells that meet a condition','Creates a presentation','Deletes duplicate files','Translates text'],answer:0,explanation:'COUNTIF counts cells in a range that satisfy a specified criterion.'},
 {q:'What should you do before citing an AI-suggested reference?',options:['Assume it exists','Verify it in the original source','Change its title','Cite without checking'],answer:1,explanation:'Always confirm the source and citation details against the original publication.'}
];

const IELTS_SECTIONS = [
 {name:'Listening',time:'About 30 minutes',detail:'Four parts. Practice listening for key details, signposting, and paraphrase.'},
 {name:'Reading',time:'60 minutes',detail:'Academic and General Training have different reading materials. Practice locating evidence and managing time.'},
 {name:'Writing',time:'60 minutes',detail:'Academic Task 1 describes visual information; General Training Task 1 is a letter. Both include Task 2 essay writing.'},
 {name:'Speaking',time:'11–14 minutes',detail:'Three parts: interview, long turn, and discussion. Practice speaking naturally with relevant examples.'}
];

const RESOURCES = [
 {title:'IELTS official preparation',provider:'IELTS.org',url:'https://ielts.org/take-a-test/preparation-resources'},
 {title:'British Council LearnEnglish',provider:'British Council',url:'https://learnenglish.britishcouncil.org/'},
 {title:'Open textbook library',provider:'OpenStax',url:'https://openstax.org/subjects'},
 {title:'Free programming courses',provider:'freeCodeCamp',url:'https://www.freecodecamp.org/learn/'},
 {title:'Python beginner resources',provider:'Python.org',url:'https://www.python.org/about/gettingstarted/'},
 {title:'Study skills and active learning',provider:'Learning Scientists',url:'https://www.learningscientists.org/'},
 {title:'Cambridge English resources',provider:'Cambridge English',url:'https://www.cambridgeenglish.org/learning-english/'}
];

export default function StudyHub() {
 const [feature,setFeature]=useState('home');
 const [search,setSearch]=useState('');
 const [tasks,setTasks]=useState([]);
 const [task,setTask]=useState('');
 const [goal,setGoal]=useState('Build a future-ready skill');
 const [level,setLevel]=useState('Beginner');
 const [answers,setAnswers]=useState({});
 const [question,setQuestion]=useState(0);
 const [finished,setFinished]=useState(false);
 const [aiPrompt,setAiPrompt]=useState('');
 const [aiResponse,setAiResponse]=useState('');
 const visible=useMemo(()=>FEATURES.filter(x=>(x.title+' '+x.description+' '+x.category).toLowerCase().includes(search.toLowerCase())),[search]);
 const score=QUIZ.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
 function startQuiz(){setAnswers({});setQuestion(0);setFinished(false);setFeature('exam-practice');}
 function addTask(e){e.preventDefault();if(!task.trim())return;setTasks(v=>[...v,{id:Date.now(),title:task.trim(),done:false}]);setTask('');}
 function show(id){setFeature(id);setAiResponse('');}
 return <section className="studyhub">
  <div className="studyhub-hero"><div><span className="eyebrow">LUMO LEARNING HUB</span><h2>One space to learn, practice, and grow.</h2><p>Learning tools inspired by your StudyMind reference are being organized into Lumo's own modular experience.</p><div className="hub-chips"><span>Future Skills</span><span>IELTS</span><span>Study Tools</span><span>Open Resources</span></div></div><div className="hub-hero-mark">✦</div></div>
  {feature!=='home'&&<button className="hub-back" onClick={()=>show('home')}>← All learning tools</button>}
  {feature==='home'&&<>
   <div className="hub-heading"><div><span className="eyebrow">YOUR LEARNING WORKSPACE</span><h3>Explore learning tools</h3></div><input className="hub-search" placeholder="Search tools…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
   <div className="hub-feature-grid">{visible.map(x=><button className="hub-feature" key={x.id} onClick={()=>show(x.id)}><span className="hub-icon">{x.icon}</span><span className="hub-feature-title">{x.title}</span><span className="hub-feature-desc">{x.description}</span><span className="hub-feature-link">Open tool →</span></button>)}</div>
   <div className="hub-note"><strong>What's being brought over:</strong> dashboard, tasks and calendar, AI study support, courses, subject guides, practice exams, IELTS, tutorial library, eBooks/resources, progress/certificates, family learning, and settings. These are being rebuilt cleanly rather than copying demo login or unsafe browser-side API-key code.</div>
  </>}
  {feature==='study-plan'&&<div className="hub-panel"><h3>Study Planner</h3><p>Set a goal and build a simple task list. Your current tasks stay in this browser session.</p><label>Learning goal<input value={goal} onChange={e=>setGoal(e.target.value)}/></label><label>Current level<select value={level} onChange={e=>setLevel(e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><form className="hub-task-form" onSubmit={addTask}><input value={task} onChange={e=>setTask(e.target.value)} placeholder="Add a study task…"/><button className="primary">Add task</button></form><div className="hub-task-list">{tasks.map(t=><label className="hub-task" key={t.id}><input type="checkbox" checked={t.done} onChange={()=>setTasks(v=>v.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span className={t.done?'done':''}>{t.title}</span><button type="button" onClick={()=>setTasks(v=>v.filter(x=>x.id!==t.id))}>Remove</button></label>)}</div><p className="hub-muted">Goal: {goal||'Not set'} · Level: {level} · Completed: {tasks.filter(x=>x.done).length}/{tasks.length}</p></div>}
  {feature==='exam-practice'&&<div className="hub-panel"><h3>Practice Exam</h3>{!finished?<><div className="hub-quiz-progress">Question {question+1} of {QUIZ.length}</div><h4>{QUIZ[question].q}</h4><div className="hub-options">{QUIZ[question].options.map((o,i)=><button className={answers[question]===i?'chosen':''} key={o} onClick={()=>setAnswers(v=>({...v,[question]:i}))}>{String.fromCharCode(65+i)}. {o}</button>)}</div><div className="hub-quiz-actions"><button className="soft" disabled={question===0} onClick={()=>setQuestion(v=>v-1)}>Previous</button>{question<QUIZ.length-1?<button className="primary" disabled={answers[question]===undefined} onClick={()=>setQuestion(v=>v+1)}>Next</button>:<button className="primary" disabled={answers[question]===undefined} onClick={()=>setFinished(true)}>Submit practice</button>}</div></>:<><h4>Practice score: {score}/{QUIZ.length}</h4><p>Review the explanations below, then try again.</p>{QUIZ.map((q,i)=><div className="hub-review" key={i}><strong>{i+1}. {q.q}</strong><p>{q.explanation}</p><span>{answers[i]===q.answer?'Correct':'Correct answer: '+q.options[q.answer]}</span></div>)}<button className="primary" onClick={startQuiz}>Try again</button></>}</div>}
  {feature==='ielts'&&<div className="hub-panel"><h3>IELTS Preparation</h3><p>Academic and General Training pathways. This hub provides original study guidance; official test content, test dates, and format should be checked with IELTS providers.</p><div className="hub-ielts-grid">{IELTS_SECTIONS.map(s=><article key={s.name}><span className="eyebrow">{s.time}</span><h4>{s.name}</h4><p>{s.detail}</p></article>)}</div><div className="hub-note"><strong>Mock test roadmap</strong><p>Full-length, timed IELTS mocks with Listening audio, Reading passages, Writing responses, Speaking recording, band estimate, and answer review are part of the next integration stage. No Cambridge copyrighted test books are copied into Lumo.</p></div><a className="text-action" href="https://ielts.org/take-a-test/preparation-resources" target="_blank" rel="noreferrer">Official IELTS preparation →</a></div>}
  {feature==='tutor'&&<div className="hub-panel"><h3>AI Study Assistant</h3><p>AI tutor connection is not enabled in this public preview yet. Use this prompt builder to prepare a useful question without exposing a private API key.</p><textarea rows="4" value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="What topic do you want explained? Include your level and what you find difficult."/><button className="primary" onClick={()=>setAiResponse('Suggested prompt: Explain '+aiPrompt+' step by step for a '+level.toLowerCase()+'. Give one worked example, then 3 practice questions and an answer key.')}>Create study prompt</button>{aiResponse&&<div className="hub-note">{aiResponse}</div>}<p className="hub-muted">Live AI responses will be connected through a secure server-side function, not a browser-exposed secret.</p></div>}
  {feature==='subjects'&&<div className="hub-panel"><h3>Subject Guides</h3><div className="hub-subject-grid">{['Mathematics','Physics','Chemistry','Biology','English','Bangla','ICT & Programming','History & Civics','Economics & Business','Marketing','Research','Personal Finance'].map(s=><article key={s}><strong>{s}</strong><p>Build topic notes, key concepts, practice questions, and revision checklists.</p></article>)}</div></div>}
  {feature==='videos'&&<div className="hub-panel"><h3>Video Learning</h3><p>Use curated public tutorials. Lumo will track lessons and recommend the next step when progress tracking is connected.</p><div className="hub-resource-list">{[{title:'FreeCodeCamp: free courses',url:'https://www.freecodecamp.org/learn/'},{title:'Khan Academy',url:'https://www.khanacademy.org/'},{title:'MIT OpenCourseWare',url:'https://ocw.mit.edu/'},{title:'TED-Ed lessons',url:'https://ed.ted.com/'}].map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer"><strong>{x.title}</strong><span>Open resource ↗</span></a>)}</div></div>}
  {feature==='library'&&<div className="hub-panel"><h3>Free Learning Library</h3><p>Open and official resources. Lumo will link to materials rather than re-host copyrighted books without permission.</p><div className="hub-resource-list">{RESOURCES.map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer"><strong>{x.title}</strong><span>{x.provider} ↗</span></a>)}</div></div>}
  {feature==='progress'&&<div className="hub-panel"><h3>Progress & Certificates</h3><p>Course completion and certificates will be connected to enrolled learner accounts. Until then, this preview does not issue a certificate or claim course completion.</p><div className="hub-note">Certificate requirements planned: course lessons completed, final assessment passed, learner name confirmed, unique certificate ID, and verification page.</div></div>}
  {feature==='family'&&<div className="hub-panel"><h3>Family Learning</h3><p>Planned family dashboard for shared learning goals, age-appropriate study routines, and progress visibility with learner consent.</p><div className="hub-note">Family accounts, guardian permissions, and privacy controls are not enabled yet.</div></div>}
  {feature==='settings'&&<div className="hub-panel"><h3>Learning Settings</h3><label>Learning goal<input value={goal} onChange={e=>setGoal(e.target.value)}/></label><label>Experience level<select value={level} onChange={e=>setLevel(e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><p className="hub-muted">These settings currently apply to this browser view only.</p></div>}
 </section>;
}
