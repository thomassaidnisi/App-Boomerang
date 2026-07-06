export const BONO_COURSE_GROUPS: { ciclo: string; cursos: string[] }[] = [
  { ciclo: 'Ciclo Básico', cursos: ['1°A', '1°B', '2°A', '2°B', '3°A', '3°B'] },
  { ciclo: 'Ciclo Orientado', cursos: ['4°A Gestión', '4°B Naturales', '5°A Gestión', '5°B Naturales', '6°A Gestión', '6°B Naturales'] },
];

export const BONO_CURSOS: string[] = BONO_COURSE_GROUPS.flatMap((g) => g.cursos);
