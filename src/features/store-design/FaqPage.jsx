import { useState } from 'react';
import { Plus, HelpCircle, Trash2 } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, EmptyState, Modal, TextInput, Select, IconButton,
} from '../../components/ui';
import { useStoreSetting, newId } from './useStoreSetting';
import ConfirmModal from './ConfirmModal';
import Notice from './Notice';
import TextArea from './TextArea';

const TAGS = ['general', 'pesanan', 'pembayaran', 'pengiriman', 'produk', 'pengembalian'];
const newQa = () => ({ id: newId(), question: '', answer: '' });

export default function FaqPage() {
  const faqs = useStoreSetting('faqs', []);
  const topics = Array.isArray(faqs.value) ? faqs.value : [];
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  const openNew = () => setForm({ title: '', tag: 'general', items: [newQa()] });
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setQa = (id, k, v) => setForm((f) => ({ ...f, items: f.items.map((q) => (q.id === id ? { ...q, [k]: v } : q)) }));

  const filledItems = form ? form.items.filter((q) => q.question.trim() && q.answer.trim()) : [];
  const valid = form && form.title.trim() && filledItems.length > 0;

  const submit = async (e) => {
    e?.preventDefault();
    if (!valid) return;
    const item = { ...form, title: form.title.trim(), items: filledItems, updated_at: new Date().toISOString() };
    const next = form.id ? topics.map((t) => (t.id === form.id ? item : t)) : [...topics, { ...item, id: newId() }];
    const ok = await faqs.save(next);
    setNotice(ok ? { tone: 'success', text: form.id ? 'Topik diperbarui.' : 'Topik dibuat.' } : { tone: 'danger', text: 'Gagal menyimpan topik.' });
    if (ok) setForm(null);
  };

  const confirmDelete = async () => {
    const ok = await faqs.save(topics.filter((t) => t.id !== toDelete.id));
    setToDelete(null);
    setForm(null);
    setNotice(ok ? { tone: 'success', text: 'Topik dihapus.' } : { tone: 'danger', text: 'Gagal menghapus topik.' });
  };

  return (
    <div>
      <PageHeader title="FAQ" actions={<Button icon={Plus} onClick={openNew}>Buat topik</Button>} />
      <Notice tone={notice?.tone} onClose={() => setNotice(null)}>{notice?.text}</Notice>
      {faqs.error && !notice && <Notice tone="danger">{`Gagal memuat data: ${faqs.error}`}</Notice>}

      {!faqs.loaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => <div key={i} className="h-36 rounded-xl bg-white animate-pulse" />)}
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <EmptyState
            icon={HelpCircle}
            title="Belum ada FAQ"
            description="Jawab pertanyaan yang sering diajukan pembeli agar mereka lebih yakin berbelanja."
            action={<Button icon={Plus} onClick={openNew}>Buat topik</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((t) => {
            const first = t.items?.[0];
            const more = (t.items?.length || 0) - 1;
            return (
              <Card key={t.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-neutral truncate">{t.title}</h2>
                    <Badge tone="muted" className="mt-1.5">{t.tag || 'general'}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setForm({ ...t, items: t.items?.length ? t.items : [newQa()] })} aria-label={`Ubah topik ${t.title}`}>Ubah</Button>
                </div>
                {first && (
                  <div className="mt-3 pt-3 border-t border-divider">
                    <p className="text-sm font-bold text-neutral">{first.question}</p>
                    <p className="text-sm text-subdued mt-1 line-clamp-2">{first.answer}</p>
                  </div>
                )}
                {more > 0 && <p className="text-xs text-subdued mt-2">+{more} pertanyaan lainnya</p>}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!form}
        title={form?.id ? 'Ubah topik' : 'Buat topik'}
        onClose={() => setForm(null)}
        width="max-w-2xl"
        footer={(
          <>
            {form?.id && (
              <Button variant="secondary" className="mr-auto text-danger" onClick={() => setToDelete(form)}>Hapus topik</Button>
            )}
            <Button variant="secondary" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit} disabled={!valid || faqs.saving}>{faqs.saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        )}
      >
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
              <TextInput id="faq-title" label="Judul topik" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="mis. Pengiriman" maxLength={80} autoFocus required />
              <Select id="faq-tag" label="Tag" value={form.tag} onChange={(v) => setField('tag', v)} options={TAGS} />
            </div>
            <div className="space-y-3">
              {form.items.map((q, i) => (
                <div key={q.id} role="group" aria-label={`Pertanyaan ${i + 1}`} className="rounded-lg border border-divider p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral">Pertanyaan {i + 1}</h3>
                    {form.items.length > 1 && (
                      <IconButton icon={Trash2} label={`Hapus pertanyaan ${i + 1}`} className="w-8 h-8 text-danger" onClick={() => setForm((f) => ({ ...f, items: f.items.filter((x) => x.id !== q.id) }))} />
                    )}
                  </div>
                  <TextInput id={`faq-q-${q.id}`} label="Pertanyaan" value={q.question} onChange={(e) => setQa(q.id, 'question', e.target.value)} maxLength={200} />
                  <TextArea id={`faq-a-${q.id}`} label="Jawaban" rows={3} value={q.answer} onChange={(e) => setQa(q.id, 'answer', e.target.value)} />
                </div>
              ))}
              <Button variant="ghost" icon={Plus} onClick={() => setForm((f) => ({ ...f, items: [...f.items, newQa()] }))}>Tambah pertanyaan</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus topik?"
        message={toDelete ? `Topik "${toDelete.title}" beserta semua pertanyaannya akan dihapus.` : ''}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
        busy={faqs.saving}
      />
    </div>
  );
}
