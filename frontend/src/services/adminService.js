// src/services/adminService.js — administration des utilisateurs, entreprises, rôles (API /api/admin)
import { requete } from './apiClient';

export const chargerRoles = () => requete('GET', '/admin/roles');
export const enregistrerRoles = (matrice) => requete('PUT', '/admin/roles', { json: { matrice } });
export const listerUtilisateurs = async () => (await requete('GET', '/admin/users')).users;
export const creerUtilisateur = (donnees) => requete('POST', '/admin/users', { json: donnees });
export const modifierUtilisateur = (id, patch) => requete('PUT', `/admin/users/${id}`, { json: patch });
export const listerEntreprises = async () => (await requete('GET', '/admin/companies')).companies;
export const creerEntreprise = (name) => requete('POST', '/admin/companies', { json: { name } });
