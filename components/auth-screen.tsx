"use client";

import { ChevronRightIcon, CloseIcon, SparkleIcon } from "@/components/icons";

export function FamilySetupScreen({
  hasLocalData,
  onImportLocal,
  onExportLocal,
  onStartFresh,
  isWorking,
  error
}: {
  hasLocalData: boolean;
  onImportLocal: () => void;
  onExportLocal: () => void;
  onStartFresh: () => void;
  isWorking: boolean;
  error: string | null;
}) {
  return <div className="auth-screen screen-content">
    <div className="access-brand"><span className="access-brand__spark"><SparkleIcon aria-hidden="true" size={18} /></span><span className="eyebrow">ESPACE FAMILIAL</span><h1>{hasLocalData ? "Retrouver tes progrès locaux ?" : "Préparer l’espace familial"}</h1><p>{hasLocalData ? "Une copie de ce parcours existe déjà sur cet appareil. Choisis explicitement ce que tu veux envoyer dans Convex." : "Le compte est prêt. On va créer les profils de départ pour commencer."}</p></div>
    {error ? <p aria-live="polite" className="access-error"><CloseIcon aria-hidden="true" size={15} /> {error}</p> : null}
    <div className="auth-choice-grid">
      {hasLocalData ? <button className="primary-button primary-button--wide" disabled={isWorking} onClick={onImportLocal} type="button">{isWorking ? "Import en cours…" : "Importer cette copie locale"}<ChevronRightIcon aria-hidden="true" size={18} /></button> : null}
      {hasLocalData ? <button className="secondary-button" disabled={isWorking} onClick={onStartFresh} type="button">{isWorking ? "Préparation…" : "Repartir de zéro"}<ChevronRightIcon aria-hidden="true" size={18} /></button> : null}
      {hasLocalData ? <button className="secondary-button" disabled={isWorking} onClick={onExportLocal} type="button">Télécharger une copie locale<ChevronRightIcon aria-hidden="true" size={18} /></button> : <button className="primary-button primary-button--wide" disabled={isWorking} onClick={onStartFresh} type="button">{isWorking ? "Préparation…" : "Créer les profils de départ"}<ChevronRightIcon aria-hidden="true" size={18} /></button>}
    </div>
    <p className="access-disclaimer">Cette décision n’est appliquée qu’une fois et reste réversible avec un export local.</p>
  </div>;
}

export function FamilyConflictScreen({ profileName, onKeepLocal, onUseRemote, isWorking, error }: {
  profileName: string;
  onKeepLocal: () => void;
  onUseRemote: () => void;
  isWorking: boolean;
  error: string | null;
}) {
  return <div className="auth-screen screen-content">
    <div className="access-brand"><span className="access-brand__spark"><SparkleIcon aria-hidden="true" size={18} /></span><span className="eyebrow">CHOIX DE SYNCHRONISATION</span><h1>Deux versions de {profileName}</h1><p>Une progression locale et une version distante ne partagent pas la même révision. Rien n’a été écrasé.</p></div>
    {error ? <p aria-live="polite" className="access-error"><CloseIcon aria-hidden="true" size={15} /> {error}</p> : null}
    <div className="auth-choice-grid"><button className="primary-button primary-button--wide" disabled={isWorking} onClick={onKeepLocal} type="button">{isWorking ? "Envoi…" : "Conserver cette version locale"}<ChevronRightIcon aria-hidden="true" size={18} /></button><button className="secondary-button" disabled={isWorking} onClick={onUseRemote} type="button">Utiliser la version distante<ChevronRightIcon aria-hidden="true" size={18} /></button></div>
    <p className="access-disclaimer">La version écartée reste disponible dans l’export avant le choix.</p>
  </div>;
}
