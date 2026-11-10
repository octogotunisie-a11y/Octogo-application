// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import UtilisateursRoles from './UtilisateursRoles.jsx';

const USERS = [
  { id: 1, name: 'Admin', email: 'a@o.tn', role: 'admin' },
  { id: 2, name: 'Alice', email: 'alice@a.tn', role: 'client', clientRole: 'collaborateur', companyId: null, status: 'active' },
];
const ROLES = {
  permissions: { 'documents.upload': 'Importer des documents', 'generation.use': 'Utiliser la génération de programmes' },
  roles: { collaborateur: { label: 'Collaborateur' }, lecteur: { label: 'Lecteur' } },
  matrice: { collaborateur: ['documents.upload', 'generation.use'], lecteur: [] },
};

function simuler() {
  const appels = [];
  globalThis.fetch = vi.fn(async (url, opts = {}) => {
    const m = opts.method || 'GET';
    appels.push({ m, url, body: opts.body ? JSON.parse(opts.body) : null });
    const rep = (b) => ({ ok: true, status: 200, json: async () => b });
    if (url === '/api/admin/users' && m === 'GET') return rep({ users: USERS });
    if (url === '/api/admin/companies' && m === 'GET') return rep({ companies: [{ id: 'c_x', name: 'Société X', nbUtilisateurs: 0 }] });
    if (url === '/api/admin/roles' && m === 'GET') return rep({ success: true, ...ROLES });
    if (url === '/api/admin/roles' && m === 'PUT') return rep({ success: true, message: 'Les permissions des rôles ont été enregistrées.', matrice: {} });
    if (url === '/api/admin/users/2' && m === 'PUT') return rep({ success: true, message: 'Les modifications ont été enregistrées.' });
    return { ok: false, status: 404, json: async () => ({ message: 'inconnu' }) };
  });
  return appels;
}
beforeEach(() => localStorage.setItem('token', 't'));
afterEach(() => cleanup());

describe('Rôles et accès (admin)', () => {
  it("liste uniquement les clients et signale l'absence d'entreprise", async () => {
    simuler(); render(<UtilisateursRoles colors={{}} />);
    expect(await screen.findByText('Alice')).toBeTruthy();
    expect(screen.queryByText('a@o.tn')).toBeNull();
    expect(screen.getByText(/Sans entreprise/)).toBeTruthy();
  });

  it("rattacher un client à une entreprise appelle l'API puis confirme", async () => {
    const appels = simuler(); render(<UtilisateursRoles colors={{}} />);
    await screen.findByText('Alice');
    const select = screen.getByDisplayValue('— Aucune entreprise —');
    fireEvent.change(select, { target: { value: 'c_x' } });
    await waitFor(() => expect(appels.some((a) => a.m === 'PUT' && a.url === '/api/admin/users/2' && a.body.companyId === 'c_x')).toBe(true));
    expect(await screen.findByText('Les modifications ont été enregistrées.')).toBeTruthy();
  });

  it('matrice : « Enregistrer » inactif tant que rien ne change, puis envoie la matrice', async () => {
    const appels = simuler(); render(<UtilisateursRoles colors={{}} />);
    await screen.findByText('Alice');
    fireEvent.click(screen.getByText('Rôles et permissions'));
    const bouton = await screen.findByText('Enregistrer les permissions');
    expect(bouton.closest('button').disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('Importer des documents — Lecteur'));
    expect(screen.getByText('Modifications non enregistrées.')).toBeTruthy();
    fireEvent.click(bouton);
    await waitFor(() => expect(appels.some((a) => a.m === 'PUT' && a.url === '/api/admin/roles' && a.body.matrice.lecteur.includes('documents.upload'))).toBe(true));
  });
});
