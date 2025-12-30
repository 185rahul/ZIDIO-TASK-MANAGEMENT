import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('Medium'); // Priority level [cite: 20]

  useEffect(() => {
    if (token) getTasks();
  }, [token]);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TO DO').length,
    inProgress: tasks.filter(t => t.status === 'IN PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/api/users/${isLogin ? 'login' : 'register'}`;
    const payload = isLogin ? { email, password } : { name, email, password };
    try {
      const res = await axios.post(url, payload);
      if (isLogin) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
      } else {
        alert("Registration Successful!");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth Error");
    }
  };

  const getTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/tasks', 
        { title: newTask, status: 'TO DO', priority }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTask('');
      getTasks();
    } catch (err) { alert("Error adding task"); }
  };

  // Status badalne ka function [cite: 13, 30]
  const handleStatusChange = async (id, currentStatus) => {
    let nextStatus = 'TO DO';
    if (currentStatus === 'TO DO') nextStatus = 'IN PROGRESS';
    else if (currentStatus === 'IN PROGRESS') nextStatus = 'DONE';

    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, 
        { status: nextStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getTasks();
    } catch (err) { alert("Update failed"); }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getTasks();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div style={styles.appContainer}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>Zidio<span style={{color: '#818cf8'}}>Task</span></h1>
          {token && <button onClick={() => {setToken(''); localStorage.clear();}} style={styles.logoutBtn}>Sign Out</button>}
        </div>
      </nav>

      <main style={styles.main}>
        {!token ? (
          <div style={styles.authCard}>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleAuth}>
              {!isLogin && <input style={styles.input} type="text" placeholder="Name" onChange={(e)=>setName(e.target.value)} />}
              <input style={styles.input} type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
              <input style={styles.input} type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
              <button style={styles.gradientBtn} type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <p onClick={() => setIsLogin(!isLogin)} style={{cursor:'pointer', marginTop:'10px'}}>{isLogin ? "Create account" : "Login instead"}</p>
          </div>
        ) : (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}><h3>{stats.total}</h3><p>Total</p></div>
              <div style={{...styles.statCard, borderBottom:'3px solid #facc15'}}><h3>{stats.todo}</h3><p>To Do</p></div>
              <div style={{...styles.statCard, borderBottom:'3px solid #3b82f6'}}><h3>{stats.inProgress}</h3><p>In Progress</p></div>
              <div style={{...styles.statCard, borderBottom:'3px solid #10b981'}}><h3>{stats.done}</h3><p>Completed</p></div>
            </div>

            <div style={styles.glassCard}>
              <form onSubmit={addTask} style={styles.taskForm}>
                <input style={styles.taskInput} placeholder="New Task..." value={newTask} onChange={(e)=>setNewTask(e.target.value)} />
                <select style={styles.select} value={priority} onChange={(e)=>setPriority(e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <button style={styles.addBtn} type="submit">Add</button>
              </form>
            </div>

            <div style={{marginTop:'2rem'}}>
              {tasks.map(t => (
                <div key={t._id} style={styles.taskItem}>
                  <div style={styles.taskLeft}>
                    <div style={{...styles.dot, background: t.status==='DONE'?'#10b981':t.status==='IN PROGRESS'?'#3b82f6':'#facc15'}}></div>
                    <span style={{textDecoration: t.status==='DONE'?'line-through':'none'}}>{t.title}</span>
                    <span style={styles.priorityLabel}>{t.priority}</span>
                  </div>
                  <div style={styles.taskRight}>
                    {/* YEH BUTTON STATUS CHANGE KAREGA [cite: 7, 8] */}
                    <button 
                      onClick={() => handleStatusChange(t._id, t.status)}
                      style={{...styles.statusBtn, background: t.status==='DONE'?'#065f46':'#1e293b'}}
                    >
                      {t.status === 'DONE' ? '✓ Completed' : `Move to ${t.status === 'TO DO' ? 'In Progress' : 'Done'}`}
                    </button>
                    <button onClick={() => deleteTask(t._id)} style={styles.delBtn}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  appContainer: { background: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' },
  navbar: { padding: '1rem 2rem', background: '#1e293b' },
  navContent: { maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' },
  logo: { fontSize: '1.5rem' },
  logoutBtn: { color: '#f87171', background: 'none', border: '1px solid #f87171', padding: '5px 10px', borderRadius: '5px' },
  main: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '2rem' },
  statCard: { background: '#1e293b', padding: '15px', borderRadius: '10px', textAlign: 'center' },
  authCard: { background: '#fff', color: '#333', padding: '2rem', borderRadius: '15px', textAlign: 'center' },
  input: { width: '100%', padding: '10px', margin: '5px 0' },
  gradientBtn: { width: '100%', padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '5px' },
  glassCard: { background: '#1e293b', padding: '1.5rem', borderRadius: '10px' },
  taskForm: { display: 'flex', gap: '10px' },
  taskInput: { flex: 1, padding: '10px', borderRadius: '5px', border: 'none' },
  select: { padding: '10px', borderRadius: '5px' },
  addBtn: { padding: '0 20px', background: '#818cf8', border: 'none', color: '#fff', borderRadius: '5px' },
  taskItem: { background: '#1e293b', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' },
  taskLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  taskRight: { display: 'flex', gap: '10px' },
  statusBtn: { padding: '5px 10px', border: '1px solid #475569', color: '#fff', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  delBtn: { color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' },
  priorityLabel: { fontSize: '10px', color: '#94a3b8', border: '1px solid #475569', padding: '2px 5px', borderRadius: '4px' }
};

export default App;