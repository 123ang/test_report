import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { versionService } from '../services/versionService';
import { useLang } from '../context/LangContext';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVersion, setEditVersion] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const { t } = useLang();

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(id);
      setProject(data);
    } catch (e) { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditVersion(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditVersion(v);
    setForm({ name: v.name, description: v.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editVersion) {
        await versionService.update(editVersion.id, form);
        toast.success('Version updated');
      } else {
        await versionService.create({ projectId: parseInt(id), ...form });
        toast.success('Version created');
      }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await versionService.remove(deleteId);
      toast.success('Version deleted');
      setDeleteId(null);
      load();
    } catch (e) { toast.error('Failed to delete'); }
  };

  if (loading) return <Loading />;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/projects" className="hover:text-gray-700">Projects</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{project.name}</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && <p className="text-gray-600 mt-1">{project.description}</p>}
        </div>
        <button onClick={openCreate} className="btn btn-primary">+ New Version</button>
      </div>

      {/* Versions list */}
      {project.versions && project.versions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.versions.map(v => (
            <div key={v.id} className="card hover:shadow-lg transition-shadow">
              <Link to={`/projects/${id}/versions/${v.id}`} className="text-lg font-semibold text-primary-700 hover:text-primary-800">
                {v.name}
              </Link>
              {v.description && <p className="text-sm text-gray-600 mt-1">{v.description}</p>}
              <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                <span>{v._count?.testCases || 0} test case(s)</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link to={`/projects/${id}/versions/${v.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Open →</Link>
                <span className="flex-1" />
                <button onClick={() => openEdit(v)} className="text-sm text-gray-500 hover:text-gray-700">Edit</button>
                <button onClick={() => setDeleteId(v.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No versions yet. Create your first version.</p>
          <button onClick={openCreate} className="btn btn-primary">+ New Version</button>
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">{editVersion ? 'Edit Version' : 'New Version'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input w-full" placeholder="e.g. v1.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input w-full" rows={3} placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editVersion ? 'Save' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Version" message="This will delete the version and all its test cases. Are you sure?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default ProjectDetailPage;
