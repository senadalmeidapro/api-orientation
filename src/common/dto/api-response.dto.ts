import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiSuccessResponseDto<TData = unknown> {
  @ApiProperty({
    description: 'Indique si la requête a réussi',
    example: true,
  })
  success!: true;

  @ApiProperty({
    description: 'Code HTTP retourné',
    example: 200,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Message métier associé à la réponse',
    example: 'Opération effectuée avec succès.',
  })
  message!: string;

  @ApiProperty({
    description: 'Données métier retournées par l’endpoint',
  })
  data!: TData;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Indique si la requête a échoué',
    example: false,
  })
  success!: false;

  @ApiProperty({
    description: 'Code HTTP retourné',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Message principal de l’erreur',
    example: 'Validation des données échouée.',
  })
  message!: string;

  @ApiProperty({
    description: 'Catégorie d’erreur',
    example: 'Bad Request',
  })
  error!: string;

  @ApiPropertyOptional({
    description: 'Détails supplémentaires (ex: erreurs de validation)',
    example: ['email must be an email', 'password must be longer than 8 characters'],
  })
  details?: unknown;

  @ApiPropertyOptional({
    description: 'Chemin HTTP appelé',
    example: '/auth/register',
  })
  path?: string;

  @ApiPropertyOptional({
    description: 'Horodatage de la réponse',
    example: '2026-04-15T07:37:14.360Z',
  })
  timestamp?: string;
}
