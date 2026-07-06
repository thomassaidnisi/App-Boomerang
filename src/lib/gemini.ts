import { GoogleGenAI } from '@google/genai';
import { DocItem } from '../types';

// TODO: mover a Cloud Function antes
// del deploy a producción para proteger la API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `Sos el asistente oficial del Centro de Estudiantes Boomerang del Instituto Jóvenes Argentinos de Córdoba, Argentina. Respondé SOLO basándote en los documentos oficiales que te voy a dar como contexto. Si la pregunta no tiene respuesta en los documentos, decí que no tenés información sobre ese tema y sugerí consultar directamente al centro de estudiantes. Respondé siempre en español, de forma clara y amigable para estudiantes secundarios.`;

export async function askBoomerang(pregunta: string, documentos: DocItem[]): Promise<string> {
  const contexto = documentos.length > 0
    ? documentos.map((doc) => `### ${doc.title}\n${doc.content}`).join('\n\n')
    : 'No hay documentos oficiales cargados por el momento.';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Documentos oficiales:\n\n${contexto}\n\nPregunta del estudiante: ${pregunta}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 1000,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Respuesta vacía de Gemini');
    return text;
  } catch (error) {
    console.error('Error al llamar a Gemini:', error);
    throw error;
  }
}
