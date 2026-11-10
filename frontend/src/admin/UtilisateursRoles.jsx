// src/admin/UtilisateursRoles.jsx
// -----------------------------------------------------------------------------
// Onglet « Rôles & accès » du Dashboard Admin. Données réelles (/api/admin/*).
//   - Utilisateurs : rattachement à une entreprise, rôle, activation, exceptions
//   - Entreprises  : création et effectifs
//   - Rôles        : matrice rôle -> permissions
// Toutes les actions sont revérifiées côté serveur (réservées au rôle admin).
// -----------------------------------------------------------------------------
import React, { useCallback, useEffect, useState } from 'react';
import { Bouton, Badge, Carte, Modale, Chargement, EtatVide, Alerte, ChampTexte, ChampListe, OngletsInternes, fusionner } from '../evaluation/ui.jsx';
import {
  chargerRoles, enregistrerRoles, listerUtilisateurs, creerUtilisateur, modifierUtilisateur,
  listerEntreprises, creerEntreprise,
} from '../services/adminService';

export default function UtilisateursRoles({ colors }) {
  const c = fusionner(colors);
  const [onglet, setOnglet] = useState('utilisateurs');
  const [users, setUsers] = useState(null);
  const [societes, setSocietes] = useState([]);
  const [roles, setRoles] = useState(null);   // { permissions, roles, matrice }
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [occupe, setOccupe] = useState(false);

  const [modalNouveau, setModalNouveau] = useState(false);
  const [formNouveau, setFormNouveau] = useState({ name: '', email: '', password: '', companyId: '', clientRole: 'collaborateur' });
  const [nomSociete, setNomSociete] = useState('');
  const [edition, setEdition] = useState(null);      // utilisateur dont on édite les exceptions
  const [matrice, setMatrice] = useState(null);
  const [matriceModifiee, setMatriceModifiee] = useState(false);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const [u, s, r] = await Promise.all([listerUtilisateurs(), listerEntreprises(), chargerRoles()]);
      setUsers(u); setSocietes(s); setRoles(r); setMatrice(r.matrice); setMatriceModifiee(false);
    } catch (e) { setErreur(e.message); setUsers([]); }
  }, []);
  useEffect(() => { charger(); }, [charger]);

  // Exécute une action serveur : état occupé, message de succès APRÈS confirmation réelle.
  const agir = async (fn, succes) => {
    if (occupe) return false;
    setOccupe(true); setMessage(null);
    try { const r = await fn(); setMessage({ ton: 'succes', texte: (r && r.message) || succes }); await charger(); return true; }
    catch (e) { setMessage({ ton: 'danger', texte: e.message }); return false; }
    finally { setOccupe(false); }
  };

  if (users === null) return <Chargement c={c} texte="Chargement des utilisateurs…" />;

  const optionsSocietes = societes.map((s) => ({ valeur: s.id, label: s.name }));
  const optionsRoles = roles ? Object.entries(roles.roles).map(([k, v]) => ({ valeur: k, label: v.label })) : [];
  const clients = users.filter((u) => u.role === 'client');

  const sel = (valeur, onChange, options, vide) => (
    <select value={valeur || ''} onChange={(e) => onChange(e.target.value)} disabled={occupe}
      style={{ padding: '.45rem .6rem', borderRadius: 10, border: `1px solid ${c.gray300}`, fontSize: '.85rem', maxWidth: 190 }}>
      {vide && <option value="">{vide}</option>}
      {options.map((o) => <option key={o.valeur} value={o.valeur}>{o.label}</option>)}
    </select>
  );

  const basculerPermission = (role, perm) => {
    const actuel = matrice[role] || [];
    setMatrice({ ...matrice, [role]: actuel.includes(perm) ? actuel.filter((p) => p !== perm) : [...actuel, perm] });
    setMatriceModifiee(true);
  };

  return (
    <div>
      <h2 style={{ margin: 0, fontSize: '1.35rem', color: c.gray900 }}>Rôles et accès</h2>
      <p style={{ margin: '.4rem 0 1.25rem', color: c.gray500, fontSize: '.9rem', maxWidth: 780 }}>
        Rattachez chaque client à son entreprise, attribuez-lui un rôle et définissez ce que chaque rôle peut faire.
        Les autorisations sont appliquées par le serveur : masquer un bouton ne suffit jamais. Un client inscrit
        n’a aucun accès aux documents d’une entreprise tant que vous ne l’y avez pas rattaché.
      </p>

      {message && <Alerte c={c} ton={message.ton} onFermer={() => setMessage(null)}>{message.texte}</Alerte>}
      {erreur && <Alerte c={c} ton="danger">{erreur}</Alerte>}

      <OngletsInternes c={c} actif={onglet} onChange={setOnglet} onglets={[
        { id: 'utilisateurs', label: `Utilisateurs (${clients.length})`, icone: 'bi-people' },
        { id: 'entreprises', label: `Entreprises (${societes.length})`, icone: 'bi-building' },
        { id: 'roles', label: 'Rôles et permissions', icone: 'bi-shield-check' },
      ]} />

      {/* ---------------- Utilisateurs ---------------- */}
      {onglet === 'utilisateurs' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ color: c.gray500, fontSize: '.85rem' }}>
              Les comptes administrateur ne se modifient pas ici. Aucun client ne reçoit automatiquement de privilège administrateur.
            </span>
            <Bouton c={c} icone="bi-person-plus" onClick={() => setModalNouveau(true)}>Ajouter un utilisateur</Bouton>
          </div>
          {clients.length === 0 ? (
            <EtatVide c={c} icone="bi-people" titre="Aucun client pour le moment." texte="Les clients inscrits ou créés par vos soins apparaîtront ici." />
          ) : (
            <div style={{ display: 'grid', gap: '.75rem' }}>
              {clients.map((u) => (
                <Carte key={u.id} c={c} style={{ padding: '1rem 1.1rem', opacity: u.status === 'disabled' ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: c.gray900 }}>{u.name}</div>
                      <div style={{ fontSize: '.8rem', color: c.gray500, wordBreak: 'break-all' }}>{u.email}</div>
                      {!u.companyId && <div style={{ marginTop: 4 }}><Badge c={c} ton="attente">Sans entreprise : accès limité à ses propres documents</Badge></div>}
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {sel(u.companyId, (v) => agir(() => modifierUtilisateur(u.id, { companyId: v || null }), 'Entreprise mise à jour.'), optionsSocietes, '— Aucune entreprise —')}
                      {sel(u.clientRole, (v) => agir(() => modifierUtilisateur(u.id, { clientRole: v }), 'Rôle mis à jour.'), optionsRoles)}
                      <Bouton c={c} variante="secondaire" icone="bi-sliders" onClick={() => setEdition(u)}>Exceptions</Bouton>
                      <Bouton c={c} variante={u.status === 'disabled' ? 'succes' : 'danger'} disabled={occupe}
                        icone={u.status === 'disabled' ? 'bi-play-circle' : 'bi-slash-circle'}
                        onClick={() => agir(() => modifierUtilisateur(u.id, { status: u.status === 'disabled' ? 'active' : 'disabled' }), 'Statut mis à jour.')}>
                        {u.status === 'disabled' ? 'Réactiver' : 'Désactiver'}
                      </Bouton>
                    </div>
                  </div>
                </Carte>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------------- Entreprises ---------------- */}
      {onglet === 'entreprises' && (
        <>
          <Carte c={c} style={{ marginBottom: '1rem' }}>
            <ChampTexte c={c} label="Nouvelle entreprise" valeur={nomSociete} onChange={setNomSociete} placeholder="Nom de l’entreprise cliente"
              aide="Les documents sont partagés uniquement entre les utilisateurs rattachés à la même entreprise." />
            <Bouton c={c} icone="bi-plus-lg" disabled={occupe || nomSociete.trim().length < 2}
              onClick={async () => { if (await agir(() => creerEntreprise(nomSociete.trim()), 'Entreprise créée.')) setNomSociete(''); }}>
              Créer l’entreprise
            </Bouton>
          </Carte>
          {societes.length === 0 ? <EtatVide c={c} icone="bi-building" titre="Aucune entreprise enregistrée." />
            : societes.map((s) => (
              <Carte key={s.id} c={c} style={{ marginBottom: '.6rem', padding: '.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <strong style={{ color: c.gray900 }}>{s.name}</strong>
                <Badge c={c} ton="primaire">{s.nbUtilisateurs} utilisateur(s)</Badge>
              </Carte>
            ))}
        </>
      )}

      {/* ---------------- Rôles et permissions ---------------- */}
      {onglet === 'roles' && roles && matrice && (
        <>
          <Alerte c={c} ton="info">
            Cochez les actions autorisées pour chaque rôle. Les modifications s’appliquent à tous les utilisateurs du rôle, après enregistrement.
            L’administrateur dispose toujours de toutes les permissions.
          </Alerte>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '.6rem', color: c.gray500 }}>Permission</th>
                  {Object.entries(roles.roles).map(([k, v]) => (
                    <th key={k} style={{ padding: '.6rem', textAlign: 'center' }} title={v.description}>{v.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(roles.permissions).map(([perm, label]) => (
                  <tr key={perm} style={{ borderTop: `1px solid ${c.gray200}` }}>
                    <td style={{ padding: '.6rem', color: c.gray800 }}>{label}</td>
                    {Object.keys(roles.roles).map((r) => (
                      <td key={r} style={{ textAlign: 'center' }}>
                        <input type="checkbox" aria-label={`${label} — ${roles.roles[r].label}`}
                          checked={(matrice[r] || []).includes(perm)} onChange={() => basculerPermission(r, perm)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Bouton c={c} icone="bi-check2" disabled={!matriceModifiee || occupe}
              onClick={() => agir(() => enregistrerRoles(matrice), 'Permissions enregistrées.')}>
              {occupe ? 'Enregistrement…' : 'Enregistrer les permissions'}
            </Bouton>
            {matriceModifiee && <span style={{ fontSize: '.82rem', color: c.warning }}>Modifications non enregistrées.</span>}
          </div>
        </>
      )}

      {/* ---------------- Modale : nouvel utilisateur ---------------- */}
      {modalNouveau && (
        <Modale c={c} titre="Ajouter un utilisateur" sousTitre="Le compte est créé avec le rôle client. Communiquez-lui le mot de passe temporaire." onFermer={() => setModalNouveau(false)}>
          <ChampTexte c={c} label="Nom complet" obligatoire valeur={formNouveau.name} onChange={(v) => setFormNouveau({ ...formNouveau, name: v })} />
          <ChampTexte c={c} label="Adresse e-mail" obligatoire valeur={formNouveau.email} onChange={(v) => setFormNouveau({ ...formNouveau, email: v })} />
          <ChampTexte c={c} label="Mot de passe temporaire" obligatoire valeur={formNouveau.password} onChange={(v) => setFormNouveau({ ...formNouveau, password: v })} aide="8 caractères minimum." />
          <ChampListe c={c} label="Entreprise" valeur={formNouveau.companyId} onChange={(v) => setFormNouveau({ ...formNouveau, companyId: v })} options={optionsSocietes} />
          <ChampListe c={c} label="Rôle" valeur={formNouveau.clientRole} onChange={(v) => setFormNouveau({ ...formNouveau, clientRole: v || 'collaborateur' })} options={optionsRoles} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
            <Bouton c={c} variante="secondaire" onClick={() => setModalNouveau(false)}>Annuler</Bouton>
            <Bouton c={c} icone="bi-person-check" disabled={occupe || !formNouveau.name || !formNouveau.email || formNouveau.password.length < 8}
              onClick={async () => {
                const ok = await agir(() => creerUtilisateur({ ...formNouveau, companyId: formNouveau.companyId || undefined }), 'Compte créé.');
                if (ok) { setModalNouveau(false); setFormNouveau({ name: '', email: '', password: '', companyId: '', clientRole: 'collaborateur' }); }
              }}>
              {occupe ? 'Création…' : 'Créer le compte'}
            </Bouton>
          </div>
        </Modale>
      )}

      {/* ---------------- Modale : exceptions individuelles ---------------- */}
      {edition && roles && (
        <Modale c={c} titre={`Exceptions — ${edition.name}`} sousTitre="Accordez ou retirez une permission à cette personne, en plus de son rôle." onFermer={() => setEdition(null)}>
          {Object.entries(roles.permissions).map(([perm, label]) => {
            const grant = (edition.permissions && edition.permissions.grant || []).includes(perm);
            const revoke = (edition.permissions && edition.permissions.revoke || []).includes(perm);
            const etat = grant ? 'grant' : revoke ? 'revoke' : '';
            const change = (v) => {
              const g = new Set(edition.permissions && edition.permissions.grant || []);
              const r = new Set(edition.permissions && edition.permissions.revoke || []);
              g.delete(perm); r.delete(perm);
              if (v === 'grant') g.add(perm);
              if (v === 'revoke') r.add(perm);
              setEdition({ ...edition, permissions: { grant: [...g], revoke: [...r] } });
            };
            return (
              <div key={perm} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '.5rem 0', borderTop: `1px solid ${c.gray100}` }}>
                <span style={{ fontSize: '.88rem', color: c.gray800 }}>{label}</span>
                <select value={etat} onChange={(e) => change(e.target.value)} style={{ padding: '.4rem', borderRadius: 8, border: `1px solid ${c.gray300}` }}>
                  <option value="">Selon le rôle</option>
                  <option value="grant">Accorder</option>
                  <option value="revoke">Retirer</option>
                </select>
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', marginTop: '1rem' }}>
            <Bouton c={c} variante="secondaire" onClick={() => setEdition(null)}>Annuler</Bouton>
            <Bouton c={c} icone="bi-check2" disabled={occupe}
              onClick={async () => { if (await agir(() => modifierUtilisateur(edition.id, { permissions: edition.permissions }), 'Exceptions enregistrées.')) setEdition(null); }}>
              {occupe ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
          </div>
        </Modale>
      )}
    </div>
  );
}
