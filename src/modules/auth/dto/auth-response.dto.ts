import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthRegisterResponseDto {
  @ApiProperty({
    description: 'Message de résultat de la création de compte',
    example: 'Registration successful. Please check your email to verify your account.',
  })
  message!: string;

  @ApiProperty({
    description: 'Indique si la vérification email est requise',
    example: true,
  })
  requiresEmailVerification!: boolean;
}

export class AuthTokenPayloadDto {
  @ApiProperty({ description: 'Identifiant utilisateur', example: 'clx123abc0001' })
  sub!: string;

  @ApiProperty({ description: 'Email utilisateur', example: 'john@example.com' })
  email!: string;

  @ApiProperty({ description: 'Rôle utilisateur', enum: UserRole, example: UserRole.USER })
  role!: UserRole;
}

export class AuthLoginResponseDto {
  @ApiProperty({
    description: 'Informations de base du compte authentifié',
    type: AuthTokenPayloadDto,
  })
  data!: AuthTokenPayloadDto;

  @ApiProperty({
    description: 'JWT d’accès (courte durée)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.signature',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT de renouvellement (longue durée)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.signature',
  })
  refreshToken!: string;
}

export class AuthRefreshResponseDto {
  @ApiProperty({
    description: 'Nouveau JWT d’accès',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newAccess.signature',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Nouveau JWT de renouvellement',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newRefresh.signature',
  })
  refreshToken!: string;
}

export class AuthActionResponseDto {
  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Opération effectuée avec succès.',
  })
  message!: string;
}
