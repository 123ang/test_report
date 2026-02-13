import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useLang } from '../context/LangContext';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const LANG_LABELS = { en: 'English', ja: '日本語', zh: '中文' };

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', language: 'en' });
  const { t } = useLang();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (e) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: '', description: '', language: 'en' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ name: p.name, description: p.description || '', language: p.language });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await projectService.update(editProject.id, form);
        toast.success('Project updated');
      } else {
        await projectService.create(form);
        toast.success('Project created');
      }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await projectService.remove(deleteId);
      toast.success('Project deleted');
      setDeleteId(null);
      load();
    } catch (e) { toast.error('Failed to delete'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button onClick={openCreate} className="btn btn-primary">+ New Project</button>
      </div>

      {/* Project cards */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/projects/${p.id}`} className="text-lg font-semibold text-primary-700 hover:text-primary-800 truncate flex-1">
                  {p.name}
                </Link>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">{LANG_LABELS[p.language] || p.language}</span>
              </div>
              {p.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{p._count?.versions || 0} version(s)</span>
                <span>{p.createdBy?.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <Link to={`/projects/${p.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Open →</Link>
                <span className="flex-1" />
                <button onClick={() => openEdit(p)} className="text-sm text-gray-500 hover:text-gray-700">Edit</button>
                <button onClick={() => setDeleteId(p.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started.</p>
          <button onClick={openCreate} className="btn btn-primary">+ New Project</button>
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">{editProject ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input w-full" placeholder="e.g. E-commerce Website" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input w-full" rows={3} placeholder="Optional description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language *</label>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="input w-full">
                  <option value="en">English</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="zh">中文 (Chinese)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editProject ? 'Save' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Project" message="This will delete the project and all its versions and test cases. Are you sure?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default ProjectsPage;
