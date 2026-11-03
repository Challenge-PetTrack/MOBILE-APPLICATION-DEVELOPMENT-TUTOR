import type { Clinica, Consulta } from "@/types/models";
import { formatDateTime } from "@/utils/date";
import { escapeHtml, shareHtmlAsPdf } from "./pdfService";

export interface ReceitaEmitente {
  vetNome: string;
  crmv?: string;
  clinica?: Clinica;
}

export async function exportReceitaPdf(consulta: Consulta, emitente: ReceitaEmitente): Promise<void> {
  const nomeClinica = emitente.clinica?.nome || "Clínica Veterinária PetTrack";
  const enderecoClinica = emitente.clinica?.endereco || "";
  const diagnostico = consulta.diagnostico?.trim() || "Avaliação clínica registrada em prontuário.";
  const prescricao =
    consulta.prescricao?.trim() ||
    consulta.observacaoVet?.trim() ||
    "Seguir orientações clínicas descritas no atendimento.";

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1f2937; }
          .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 28px; }
          .title { color: #0d9488; font-size: 28px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 16px; margin-top: 6px; color: #4b5563; font-weight: 600; }
          .address { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .info-box { background-color: #f3f4f6; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
          .info-row { margin-bottom: 6px; font-size: 14px; }
          .label { font-weight: bold; color: #374151; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 16px; font-weight: bold; color: #0d9488; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
          .content-text { white-space: pre-wrap; font-size: 15px; line-height: 1.6; }
          .signature { margin-top: 80px; text-align: center; }
          .line { border-top: 1px solid #1f2937; width: 260px; margin: 0 auto 10px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Receituário Veterinário</h1>
          <div class="subtitle">${escapeHtml(nomeClinica)}</div>
          ${enderecoClinica ? `<div class="address">${escapeHtml(enderecoClinica)}</div>` : ""}
        </div>

        <div class="info-box">
          <div class="info-row"><span class="label">Paciente:</span> ${escapeHtml(consulta.petNome)}</div>
          <div class="info-row"><span class="label">Tutor(a):</span> ${escapeHtml(consulta.tutorNome)}</div>
          <div class="info-row"><span class="label">Data do Atendimento:</span> ${escapeHtml(formatDateTime(consulta.dataHora))}</div>
          <div class="info-row"><span class="label">Motivo:</span> ${escapeHtml(consulta.motivo)}</div>
        </div>

        <div class="section">
          <div class="section-title">Diagnóstico Clínico</div>
          <div class="content-text">${escapeHtml(diagnostico)}</div>
        </div>

        <div class="section" style="min-height: 220px;">
          <div class="section-title">Prescrição e Recomendações</div>
          <div class="content-text">${escapeHtml(prescricao)}</div>
        </div>

        <div class="signature">
          <div class="line"></div>
          <div style="font-weight: bold;">Dr(a). ${escapeHtml(emitente.vetNome || consulta.vetNome || "Médico(a) Veterinário(a)")}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">CRMV: ${escapeHtml(emitente.crmv || "Registrado na clínica")}</div>
        </div>
      </body>
    </html>
  `;

  await shareHtmlAsPdf(html, `Receituário - ${consulta.petNome}`);
}
