import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import StudyHub from './StudyHub.jsx';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

function AuthPanel({ onDone }) {
  const [mode,setMode] = useState('login');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://lumo-learning-wzyp.onrender.com' });
        if (error) throw error;
        setMessage('If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.');
        setMode('login');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options:{ data:{ full_name:name }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setMessage('Account created. Check your email if confirmation is enabled, then sign in.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onDone();
      }
    } catch (e) { setMessage(e.message || 'Unable to continue.'); }
    finally { setBusy(false); }
  }
  return <div className="auth-card"><span className="eyebrow">YOUR LEARNING SPACE</span><h2>{mode==='login'?'Welcome back':mode==='forgot'?'Reset your password':'Create your Lumo account'}</h2><p>{mode==='forgot'?'Enter your account email and we will send a reset link.':'Use your email to access your learning dashboard.'}</p><form onSubmit={submit}>{mode==='signup'&&<label>Full name<input required value={name} onChange={e=>setName(e.target.value)} /></label>}<label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>{mode!=='forgot'&&<label>Password<input type="password" minLength="8" required value={password} onChange={e=>setPassword(e.target.value)} /></label>}<button className="primary" disabled={busy}>{busy?'Please wait…':mode==='login'?'Log in':mode==='forgot'?'Send reset link':'Create account'}</button></form>{message&&<p className="notice">{message}</p>}{mode==='login'&&<button className="linkbtn" onClick={()=>{setMode('forgot');setMessage('')}}>Forgot password?</button>}<button className="linkbtn" onClick={()=>{setMode(mode==='signup'?'login':'signup');setMessage('')}}>{mode==='signup'?'Already registered? Log in':'New to Lumo? Create an account'}</button></div>;
}

function ResetPasswordPanel({ onDone }) {
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function submit(e) {
    e.preventDefault();setBusy(true);setMessage('');
    try {
      const {error}=await supabase.auth.updateUser({password});
      if(error) throw error;
      await supabase.auth.signOut();
      setMessage('Password updated. Please log in with your new password.');
      onDone();
    } catch(e) { setMessage(e.message||'Could not update password. Please request a new reset link.'); }
    finally { setBusy(false); }
  }
  return <div className="auth-card"><span className="eyebrow">SECURE YOUR ACCOUNT</span><h2>Choose a new password</h2><p>Set a new password for your Lumo account.</p><form onSubmit={submit}><label>New password<input type="password" minLength="8" required value={password} onChange={e=>setPassword(e.target.value)} /></label><button className="primary" disabled={busy}>{busy?'Updating…':'Update password'}</button></form>{message&&<p className="notice">{message}</p>}</div>;
}
function App() {
  const [session,setSession] = useState(null);
  const [recoveryMode,setRecoveryMode] = useState(false);
  const [profile,setProfile] = useState(null);
  const [courses,setCourses] = useState([]);
  const [enrollments,setEnrollments] = useState([]);
  const [tab,setTab] = useState('overview');
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [draft,setDraft] = useState({title:'',slug:'',description:'',category:'AI & Automation',academy:'skills',level:'beginner',price_bdt:30});
  const isAdmin = !!session && profile?.role === 'admin';
  const myCourseIds = useMemo(()=>new Set(enrollments.map(x=>x.course_id)),[enrollments]);

  async function load() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true); setError('');
    const {data:{session}} = await supabase.auth.getSession();
    setSession(session);
    if (!session) {
      setProfile(null);
      setEnrollments([]);
      const {data,error}=await supabase.from('courses').select('id,title,slug,description,category,academy,level,price_bdt,status,created_at').eq('status','published').order('created_at',{ascending:false});
      if (error) setError(error.message);
      else setCourses(data||[]);
      setLoading(false);
      return;
    }
    const [p,c,e] = await Promise.all([
      supabase.from('profiles').select('id,display_name,role').eq('id',session.user.id).single(),
      supabase.from('courses').select('id,title,slug,description,category,academy,level,price_bdt,status,created_at').order('created_at',{ascending:false}),
      supabase.from('enrollments').select('id,course_id,status,enrolled_at').eq('student_id',session.user.id)
    ]);
    if (p.error) setError(p.error.message);
    else setProfile(p.data);
    if (c.error) setError(c.error.message);
    else setCourses(c.data||[]);
    if (e.error) setError(e.error.message);
    else setEnrollments(e.data||[]);
    setLoading(false);
  }
  useEffect(()=>{
    if (!supabase) { setLoading(false); return; }
    load();
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
    });
    return () => subscription.unsubscribe();
  },[]);

  async function signOut(){await supabase.auth.signOut();setSession(null);setProfile(null);setEnrollments([]);setTab('overview')}
  async function enroll(course) {
    setError('');
    const {error} = await supabase.from('enrollments').insert({student_id:session.user.id,course_id:course.id});
    if (error && error.code!=='23505') setError(error.message);
    else await load();
  }
  async function createCourse(e) {
    e.preventDefault();setError('');
    const slug=draft.slug.trim() || draft.title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const {error}=await supabase.from('courses').insert({...draft,slug,created_by:session.user.id,status:'draft'});
    if(error) setError(error.message);
    else {setDraft({title:'',slug:'',description:'',category:'AI & Automation',academy:'skills',level:'beginner',price_bdt:30});await load();setTab('courses')}
  }
  async function publish(course) {
    const {error}=await supabase.from('courses').update({status:course.status==='published'?'draft':'published'}).eq('id',course.id);
    if(error)setError(error.message);else await load();
  }

  if (!supabase) return <main className="setup"><div className="brand"><b>L</b> lumo</div><span className="eyebrow">PHASE 02 · CONFIGURATION</span><h1>Connect Lumo to its database.</h1><p>The student and admin application is ready for a Supabase project. Add the project URL and publishable/anon key to your local <code>.env.local</code> file.</p><pre>VITE_SUPABASE_URL=your-project-url<br/>VITE_SUPABASE_ANON_KEY=your-publishable-key</pre><p className="muted">Never use a service-role key in the browser. The Lumo Supabase project is active. Copy the values from web/.env.example into web/.env.local to connect this app.</p></main>;
  if (recoveryMode) return <main className="auth-wrap"><div className="brand"><b>L</b> lumo</div><ResetPasswordPanel onDone={()=>{setRecoveryMode(false);load();}}/></main>;
  if (loading) return <main className="setup"><div className="brand"><b>L</b> lumo</div><p>Loading your learning space…</p></main>;
  // Temporary guest preview: authentication will be restored after email setup is reliable.
  const visibleCourses = isAdmin ? courses : courses.filter(c=>c.status==='published');
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#"><b>L</b> lumo</a><p className="side-label">WORKSPACE</p><button className={tab==='overview'?'selected':''} onClick={()=>setTab('overview')}>◫ Overview</button><button className={tab==='courses'?'selected':''} onClick={()=>setTab('courses')}>▤ Courses</button><button className={tab==='my-learning'?'selected':''} onClick={()=>setTab('my-learning')}>◷ My learning</button><button className={tab==='study-hub'?'selected':''} onClick={()=>setTab('study-hub')}>✦ Learning Hub</button>{isAdmin&&<><p className="side-label">MANAGEMENT</p><button className={tab==='create'?'selected':''} onClick={()=>setTab('create')}>＋ Create course</button></>}<div className="side-bottom"><span>{profile?.display_name||session?.user?.email||'Guest visitor'}</span><small>{isAdmin?'Administrator':session?'Student':'Guest preview'}</small>{session&&<button onClick={signOut}>↪ Sign out</button>}</div></aside>
    <main className="workspace"><header className="topbar"><div><span className="eyebrow">LUMO LEARNING PLATFORM</span><h1>{tab==='overview'?'Your learning overview':tab==='courses'?'Explore courses':tab==='my-learning'?'My learning':tab==='study-hub'?'Learning Hub':'Create a course'}</h1></div><div className="user-chip"><span>{(profile?.display_name||session?.user?.email||'L').slice(0,1).toUpperCase()}</span>{profile?.display_name||'Learner'}</div></header>
    {error&&<div className="error">{error}</div>}
    {tab==='overview'&&<><section className="welcome"><div><span>YOUR NEXT CHAPTER</span><h2>Hello, {profile?.display_name?.split(' ')[0]||'learner'}.</h2><p>Make a little progress today. Your next skill is waiting.</p></div><div className="welcome-symbol">✳</div></section><div className="metrics"><article><span>Available courses</span><strong>{visibleCourses.length}</strong></article><article><span>My enrollments</span><strong>{enrollments.length}</strong></article><article><span>Account type</span><strong>{isAdmin?'Admin':session?'Student':'Guest preview'}</strong></article></div><div className="section-title"><div><span className="eyebrow">CURATED FOR GROWTH</span><h2>{isAdmin?'Recently added courses':'Continue exploring'}</h2></div><button className="text-action" onClick={()=>setTab('courses')}>View all →</button></div><CourseGrid courses={visibleCourses.slice(0,3)} myCourseIds={myCourseIds} isAdmin={isAdmin} canEnroll={!!session} enroll={enroll} publish={publish}/></>}
    {tab==='courses'&&<><div className="section-title"><div><span className="eyebrow">THE COURSE CATALOG</span><h2>{isAdmin?'Manage learning content':'Find your next skill'}</h2></div>{isAdmin&&<button className="primary compact" onClick={()=>setTab('create')}>＋ New course</button>}</div><CourseGrid courses={visibleCourses} myCourseIds={myCourseIds} isAdmin={isAdmin} enroll={enroll} publish={publish}/></>}
    {tab==='my-learning'&&<><div className="section-title"><div><span className="eyebrow">YOUR JOURNEY</span><h2>Courses you joined</h2></div></div><CourseGrid courses={courses.filter(c=>myCourseIds.has(c.id))} myCourseIds={myCourseIds} isAdmin={false} enroll={enroll} publish={publish}/></>}
    {tab==='study-hub'&&<StudyHub/>}
    {tab==='create'&&isAdmin&&<form className="create-form" onSubmit={createCourse}><label>Course title<input required value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label>URL slug (optional)<input value={draft.slug} onChange={e=>setDraft({...draft,slug:e.target.value})} placeholder="generated-from-title"/></label><label>Description<textarea rows="4" value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label><div className="form-row"><label>Academy<select value={draft.academy} onChange={e=>setDraft({...draft,academy:e.target.value})}><option value="skills">Future Skills</option><option value="language">Language Academy</option></select></label><label>Category<input required value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}/></label></div><div className="form-row"><label>Level<select value={draft.level} onChange={e=>setDraft({...draft,level:e.target.value})}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label>Price (BDT)<input type="number" min="0" value={draft.price_bdt} onChange={e=>setDraft({...draft,price_bdt:Number(e.target.value)})}/></label></div><button className="primary">Save course as draft</button><p className="muted">Drafts are visible to administrators only until published.</p></form>}
    </main>
  </div>;
}

function CourseGrid({courses,myCourseIds,isAdmin,canEnroll,enroll,publish}) {
  if (!courses.length) return <div className="empty"><span>✳</span><h3>No courses here yet</h3><p>{isAdmin?'Create your first course draft to begin building the catalog.':'New learning opportunities will appear here as courses are published.'}</p></div>;
  return <div className="course-grid">{courses.map(course=><article className="course-card" key={course.id}><div className={'course-art '+(course.academy==='language'?'language':'skills')}><span>{course.academy==='language'?'文':'✳'}</span><small>{course.academy==='language'?'LANGUAGE ACADEMY':'FUTURE SKILLS'}</small></div><div className="course-content"><div className="course-meta">{course.category} · {course.level}</div><h3>{course.title}</h3><p>{course.description||'A practical learning path from Lumo.'}</p><div className="course-bottom"><strong>৳{course.price_bdt}</strong>{isAdmin?<button className="soft" onClick={()=>publish(course)}>{course.status==='published'?'Unpublish':'Publish'}</button> :myCourseIds.has(course.id)?<span className="joined">Enrolled ✓</span>:canEnroll?<button className="soft" onClick={()=>enroll(course)}>Join course</button>:<span className="joined">Login/enrollment coming soon</span>}</div></div></article>)}</div>;
}
export default App;
