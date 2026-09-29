'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTranslations } from '@/contexts/LanguageContext';
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@/components/icons';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { DotRating } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { useVoiceAgentActions } from '@/contexts/VoiceAgentActionsContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Company } from '@kre8tion/shared-types';

const INDUSTRIES = ['HVAC', 'Plumbing', 'Construction', 'Property Management', 'Electrical', 'Landscaping', 'Other'];
const EMPLOYEE_COUNTS = ['1-5', '5-10', '10-25', '25-50', '50-100', '100+'];

export default function CompaniesPage() {
  const { t } = useTranslations();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [viewCompany, setViewCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', employee_count: '1-5', website: '' });
  const [entityCounts, setEntityCounts] = useState<Record<string, { contacts: number; deals: number; partnerships: number }>>({});

  const fetchCompanies = useCallback(async () => {
    try {
      const [companiesRes, contactsRes, oppsRes, partnershipsRes] = await Promise.all([
        fetch('/api/data/read/companies', { credentials: 'include' }),
        fetch('/api/data/read/contacts', { credentials: 'include' }),
        fetch('/api/data/read/opportunities', { credentials: 'include' }),
        fetch('/api/data/read/partnerships', { credentials: 'include' }),
      ]);
      const [companiesData, contactsData, oppsData, partnershipsData]: any[] = await Promise.all([
        companiesRes.json(), contactsRes.json(), oppsRes.json(), partnershipsRes.json(),
      ]);

      // Build entity counts per company_id
      const counts: Record<string, { contacts: number; deals: number; partnerships: number }> = {};
      (contactsData.data || []).forEach((c: any) => {
        if (c.company_id) {
          const key = String(c.company_id);
          if (!counts[key]) counts[key] = { contacts: 0, deals: 0, partnerships: 0 };
          counts[key].contacts++;
        }
      });
      (oppsData.data || []).forEach((o: any) => {
        if (o.company_id) {
          const key = String(o.company_id);
          if (!counts[key]) counts[key] = { contacts: 0, deals: 0, partnerships: 0 };
          counts[key].deals++;
        }
      });
      (partnershipsData.data || []).forEach((p: any) => {
        if (p.company_id) {
          const key = String(p.company_id);
          if (!counts[key]) counts[key] = { contacts: 0, deals: 0, partnerships: 0 };
          counts[key].partnerships++;
        }
      });
      setEntityCounts(counts);

      setCompanies(companiesData.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setCompanies([]);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  // Voice actions
  const { subscribe } = useVoiceAgentActions();
  useEffect(() => {
    const unsub = subscribe((action) => {
      if (!action || action.type !== 'ui_action' || action.scope !== 'companies') return;
      const a = action.action;
      const payload = (action.payload || {}) as any;
      if (a === 'open_new') {
        resetForm();
        setShowCreate(true);
      } else if (a === 'open_view') {
        const { id, query } = payload as { id?: string; query?: string };
        let match: Company | undefined;
        if (id) match = companies.find(c => String(c.id) === String(id));
        if (!match && query) {
          const q = String(query).toLowerCase();
          match = companies.find(c => c.name.toLowerCase().includes(q));
        }
        if (match) setViewCompany(match);
      }
    });
    return () => { unsub(); };
  }, [subscribe, companies]);

  const resetForm = () => setForm({ name: '', industry: '', employee_count: '1-5', website: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/data/create/companies', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowCreate(false); resetForm(); fetchCompanies(); }
    } catch (err) { console.error('Failed to create company:', err); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompany) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/data/update/companies/${editCompany.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setEditCompany(null); resetForm(); fetchCompanies(); }
    } catch (err) { console.error('Failed to update company:', err); }
    finally { setSaving(false); }
  };

  const openEdit = (company: Company) => {
    setForm({
      name: company.name,
      industry: company.industry || '',
      employee_count: company.employee_count || '1-5',
      website: company.website || '',
    });
    setEditCompany(company);
  };

  const renderCompanyForm = (onSubmit: (e: React.FormEvent) => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">{t.common.companyName} *</label>
        <input className="input-glass w-full" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">{t.common.industry} *</label>
          <select className="select-glass w-full" required value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
            <option value="">{t.common.selectIndustry}</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">{t.companies.employees}</label>
          <select className="select-glass w-full" value={form.employee_count} onChange={e => setForm({ ...form, employee_count: e.target.value })}>
            {EMPLOYEE_COUNTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1">{t.common.website}</label>
        <input className="input-glass w-full" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => { setShowCreate(false); setEditCompany(null); resetForm(); }} className="btn-secondary">{t.common.cancel}</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? t.common.creating : (editCompany ? t.common.save : t.companies.addCompany)}</button>
      </div>
    </form>
  );

  return (
    <DashboardLayout>
      <ErrorBoundary>
      <div className="page-content">
        <PageHeader
          title={t.nav.companies}
          subtitle={<>{companies.length} {t.companies.companiesCount}</>}
          action={
            <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
              <PlusIcon className="w-5 h-5" />
              {t.companies.addCompany}
            </button>
          }
        />

        {loading ? (
          <div className="card p-12 text-center"><p className="text-white/60">{t.common.loading}</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-gap)]">
            {companies.map((company) => (
              <div key={company.id} className="card card-interactive" onClick={() => setViewCompany(company)}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-white truncate">{company.name}</h3>
                    <p className="text-xs md:text-sm text-white/50 mt-1">{company.industry}</p>
                  </div>
                  <span className="tag shrink-0">{company.employee_count} {t.companies.employees}</span>
                </div>

                {/* Related entity counts */}
                {entityCounts[String(company.id)] && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {entityCounts[String(company.id)].contacts > 0 && (
                      <Link href="/contacts" onClick={e => e.stopPropagation()} className="text-primary-electricBlue hover:underline">
                        {entityCounts[String(company.id)].contacts} Contacts
                      </Link>
                    )}
                    {entityCounts[String(company.id)].deals > 0 && (
                      <>
                        {entityCounts[String(company.id)].contacts > 0 && <span className="text-white/20">&middot;</span>}
                        <Link href="/pipeline" onClick={e => e.stopPropagation()} className="text-primary-electricBlue hover:underline">
                          {entityCounts[String(company.id)].deals} Deals
                        </Link>
                      </>
                    )}
                    {entityCounts[String(company.id)].partnerships > 0 && (
                      <>
                        {(entityCounts[String(company.id)].contacts > 0 || entityCounts[String(company.id)].deals > 0) && <span className="text-white/20">&middot;</span>}
                        <Link href="/partnerships" onClick={e => e.stopPropagation()} className="text-primary-electricBlue hover:underline">
                          {entityCounts[String(company.id)].partnerships} Partnerships
                        </Link>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{t.companies.aiMaturityScore}</span>
                    <DotRating value={company.ai_maturity_score} />
                  </div>
                  {company.website && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-white/50">{t.common.website}</span>
                      <span className="text-primary-electricBlue text-xs truncate max-w-[140px]">{company.website}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={(e) => { e.stopPropagation(); setViewCompany(company); }} className="btn-secondary flex-1 text-sm">
                    {t.companies.viewDetails}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(company); }} className="btn-secondary text-sm">
                    {t.common.edit}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create and edit modals */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title={t.companies.addCompany}>
        {renderCompanyForm(handleCreate)}
      </Modal>
      <Modal open={!!editCompany} onClose={() => { setEditCompany(null); resetForm(); }} title={`${t.common.edit} ${t.nav.companies}`}>
        {renderCompanyForm(handleEdit)}
      </Modal>

      {/* View Details Modal */}
      <Modal open={!!viewCompany} onClose={() => setViewCompany(null)} title={viewCompany?.name || ''}>
        {viewCompany && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50">{t.common.industry}</p>
                <p className="text-sm font-medium text-white mt-1">{viewCompany.industry}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50">{t.companies.employees}</p>
                <p className="text-sm font-medium text-white mt-1">{viewCompany.employee_count}</p>
              </div>
              {viewCompany.website && (
                <div className="bg-white/5 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-white/50">{t.common.website}</p>
                  <p className="text-sm text-primary-electricBlue mt-1">{viewCompany.website}</p>
                </div>
              )}
              <div className="bg-white/5 rounded-lg p-3 col-span-2">
                <p className="text-xs text-white/50 mb-1">{t.companies.aiMaturityScore}</p>
                <DotRating value={viewCompany.ai_maturity_score} />
              </div>
            </div>
          </div>
        )}
      </Modal>
      </ErrorBoundary>
    </DashboardLayout>
  );
}

