// @vitest-environment jsdom
// Tests de comportement de « Mes documents » (fetch simulé : aucun serveur requis).
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MesDocuments from './MesDocuments.jsx';

const DOC = {
  id: 'd1', nom: 'besoin-rh.pdf', taille: 20480, categorie: 'besoin', note: '', origine: 'generation',
  creeLe: '2026-10-01T10:00:00.000Z', proprietaire: 'Alice', proprietaireId: 2,
  extraction: { status: 'extracted', message: 'Texte extrait.' },
};
const TOUS = ['documents.view_own', 'documents.upload', 'documents.delete_own', 'documents.view_company'];

function simuler({ documents = [DOC], permissions = TOUS, suppression = { status: 200, body: { success: true } } } = {}) {
  const appels = [];
  globalThis.fetch = vi.fn(async (url, opts = {}) => {
    const methode = opts.method || 'GET';
    appels.push(`${methode} ${url}`);
    const rep = (status, body) => ({ ok: status < 400, status, json: async () => body });
    if (url === '/api/access/me') return rep(200, { id: 2, role: 'client', permissions });
    if (url === '/api/documents' && methode === 'GET') return rep(200, { success: true, documents });
    if (url === '/api/documents/d1' && methode === 'DELETE') return rep(suppression.status, suppression.body);
    return rep(404, { message: 'inconnu' });
  });
  return appels;
}
const monter = () => render(<MemoryRouter><MesDocuments colors={{}} /></MemoryRouter>);

beforeEach(() => localStorage.setItem('token', 't'));
afterEach(() => cleanup());

describe('Mes documents', () => {
  it('affiche les documents réels avec leur statut de lecture IA', async () => {
    simuler(); monter();
    expect(await screen.findByText('besoin-rh.pdf')).toBeTruthy();
    expect(screen.getByText('Lisible par l’IA')).toBeTruthy();
  });

  it("affiche le message d'état vide prévu quand il n'y a aucun document", async () => {
    simuler({ documents: [] }); monter();
    expect(await screen.findByText(/pas encore de document enregistré/)).toBeTruthy();
  });

  it("explique à un lecteur qu'il ne peut pas importer et renvoie vers l'administrateur", async () => {
    simuler({ permissions: ['documents.view_own', 'documents.view_company'] }); monter();
    expect(await screen.findByText(/Contactez-le si vous avez besoin|contactez-le si vous avez besoin/i)).toBeTruthy();
    expect(screen.queryByText('Importer le document')).toBeNull();
  });

  it('refuse un format non supporté avec un message clair, sans appel réseau', async () => {
    const appels = simuler(); const { container } = monter();
    await screen.findByText('besoin-rh.pdf');
    const input = container.querySelector('input[type=file]');
    fireEvent.change(input, { target: { files: [new File(['x'], 'virus.exe')] } });
    expect(await screen.findByText(/Format non supporté/)).toBeTruthy();
    expect(appels.some((a) => a.startsWith('POST'))).toBe(false);
  });

  it('suppression : demande une confirmation, puis confirme seulement après la réponse du serveur', async () => {
    const appels = simuler(); monter();
    fireEvent.click(await screen.findByText('Voir les détails'));
    fireEvent.click(await screen.findByText('Supprimer'));
    expect(await screen.findByText('Supprimer ce document ?')).toBeTruthy();
    expect(appels.some((a) => a.startsWith('DELETE'))).toBe(false); // rien avant la confirmation
    fireEvent.click(screen.getByText('Supprimer définitivement'));
    await waitFor(() => expect(appels).toContain('DELETE /api/documents/d1'));
    expect(await screen.findByText(/a été supprimé/)).toBeTruthy();
  });

  it("suppression refusée par le serveur : message d'erreur, aucun faux succès", async () => {
    simuler({ suppression: { status: 403, body: { message: "Vous n'avez pas l'autorisation de supprimer ce document." } } });
    monter();
    fireEvent.click(await screen.findByText('Voir les détails'));
    fireEvent.click(await screen.findByText('Supprimer'));
    fireEvent.click(await screen.findByText('Supprimer définitivement'));
    expect(await screen.findByText(/pas l'autorisation/)).toBeTruthy();
    expect(screen.queryByText(/a été supprimé/)).toBeNull();
  });

  it('serveur injoignable : message compréhensible', async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError('network'); });
    monter();
    expect(await screen.findByText(/Impossible de joindre le serveur/)).toBeTruthy();
  });
});
