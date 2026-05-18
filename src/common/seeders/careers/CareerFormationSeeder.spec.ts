import { CareerCategory } from '@prisma/client';
import { buildCareerFormationLinks } from './CareerFormationSeeder';

describe('CareerFormationSeeder', () => {
  it('filters formations without universityId', () => {
    const careers = [{ id: 1, name: 'Développeur Web', tags: [], formationLevel: null }];
    const formations = [
      {
        id: 10,
        title: 'Informatique',
        degree: 'Licence',
        field: 'Informatique',
        programs: [],
        universityId: null,
      },
      {
        id: 11,
        title: 'Développement Web',
        degree: 'Licence',
        field: 'Informatique',
        programs: [],
        universityId: 2,
      },
    ];

    const links = buildCareerFormationLinks(careers, formations, 3);
    expect(links).toEqual([{ careerId: 1, formationId: 11, isPrimary: true }]);
  });

  it('prioritizes token matches over fallback', () => {
    const careers = [{ id: 2, name: 'Data Analyst', tags: ['data'], formationLevel: null }];
    const formations = [
      {
        id: 10,
        title: 'Agronomie',
        degree: 'Licence',
        field: 'Agriculture',
        programs: [],
        universityId: 1,
      },
      {
        id: 11,
        title: 'Data Science',
        degree: 'Master',
        field: 'Informatique',
        programs: ['data'],
        universityId: 2,
      },
    ];

    const links = buildCareerFormationLinks(careers, formations, 2);
    expect(links[0]).toEqual({ careerId: 2, formationId: 11, isPrimary: true });
    expect(links[1]).toEqual({ careerId: 2, formationId: 10, isPrimary: false });
  });

  it('respects maxPerCareer', () => {
    const careers = [{ id: 3, name: 'Designer', tags: [], formationLevel: null }];
    const formations = [
      {
        id: 20,
        title: 'Design',
        degree: 'Licence',
        field: 'Art',
        programs: [],
        universityId: 1,
      },
      {
        id: 21,
        title: 'Multimédia',
        degree: 'Licence',
        field: 'Art',
        programs: [],
        universityId: 2,
      },
    ];

    const links = buildCareerFormationLinks(careers, formations, 1);
    expect(links).toEqual([{ careerId: 3, formationId: 20, isPrimary: true }]);
  });

  it('boosts matches using category keywords and formation level', () => {
    const careers = [
      {
        id: 4,
        name: 'Ingénieur',
        tags: [],
        formationLevel: 'Master',
        category: CareerCategory.NUMERIQUE,
      },
    ];
    const formations = [
      {
        id: 30,
        title: 'Data Science',
        degree: 'Master',
        field: 'Informatique',
        programs: [],
        universityId: 1,
      },
      {
        id: 31,
        title: 'Agronomie',
        degree: 'Licence',
        field: 'Agriculture',
        programs: [],
        universityId: 1,
      },
    ];

    const links = buildCareerFormationLinks(careers, formations, 2);
    expect(links[0]).toEqual({ careerId: 4, formationId: 30, isPrimary: true });
    expect(links[1]).toEqual({ careerId: 4, formationId: 31, isPrimary: false });
  });
});
