import type { Pet, VacinaRegistro } from "@/types/models";
import { VACINAS_NOMES } from "@/constants/catalogos";
import { formatDate } from "@/utils/date";
import { escapeHtml, shareHtmlAsPdf } from "./pdfService";

export async function exportRgPetPdf(pet: Pet, vacinas: VacinaRegistro[]): Promise<void> {
  const tomadas = vacinas.filter((v) => v.tomada);
  const vacinasHtml =
    tomadas.length > 0
      ? tomadas
          .map(
            (v) =>
              `<span class="vacina-badge">${escapeHtml(VACINAS_NOMES[v.vacinaId] ?? v.vacinaId)} (${escapeHtml(formatDate(v.dataAplicacao))})</span>`
          )
          .join("")
      : '<span class="value" style="font-size:14px;">Nenhuma vacina registrada.</span>';

  const fotoHtml = pet.fotoUri
    ? `<img src="${pet.fotoUri}" class="photo" />`
    : `<div class="photo" style="background-color:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;">Sem Foto</div>`;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica', sans-serif; background-color: #f3f4f6; padding: 40px; display: flex; justify-content: center; }
          .card { background-color: white; border-radius: 20px; padding: 30px; width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 2px solid #4f46e5; }
          .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
          .title { color: #4f46e5; font-size: 24px; font-weight: bold; margin: 0; }
          .subtitle { color: #6b7280; font-size: 14px; margin-top: 5px; }
          .photo-container { display: flex; justify-content: center; margin-bottom: 20px; }
          .photo { width: 120px; height: 120px; border-radius: 60px; object-fit: cover; border: 4px solid #10b981; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
          .label { color: #6b7280; font-weight: bold; }
          .value { color: #1f2937; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; }
          .vacina-badge { display: inline-block; background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 12px; margin: 4px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">Registro Geral do Pet</h1>
            <p class="subtitle">Carteira Oficial Digital • PetTrack</p>
          </div>
          <div class="photo-container">${fotoHtml}</div>
          <div class="info-row"><span class="label">Nome:</span><span class="value">${escapeHtml(pet.nome)}</span></div>
          <div class="info-row"><span class="label">Tutor(a):</span><span class="value">${escapeHtml(pet.tutorNome)}</span></div>
          <div class="info-row"><span class="label">Espécie:</span><span class="value">${escapeHtml(pet.especie)}</span></div>
          <div class="info-row"><span class="label">Raça:</span><span class="value">${escapeHtml(pet.raca || "SRD / Não informada")}</span></div>
          <div class="info-row"><span class="label">Idade:</span><span class="value">${pet.idade ? `${escapeHtml(pet.idade)} anos` : "N/A"}</span></div>
          <div class="info-row"><span class="label">Peso:</span><span class="value">${pet.peso ? `${escapeHtml(pet.peso)} kg` : "N/A"}</span></div>
          <div class="info-row"><span class="label">Emissão:</span><span class="value">${new Date().toLocaleDateString("pt-BR")}</span></div>
          <div style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <span class="label" style="display:block; margin-bottom: 10px;">Vacinas em dia:</span>
            <div>${vacinasHtml}</div>
          </div>
          <div class="footer">Documento emitido pelo aplicativo PetTrack.</div>
        </div>
      </body>
    </html>
  `;

  await shareHtmlAsPdf(html, `RG do Pet - ${pet.nome}`);
}
