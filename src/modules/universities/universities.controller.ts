import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UniversitiesService } from './universities.service';
import {
    CreateUniversityDto,
    UpdateUniversityDto,
    CreateFormationDto,
    UpdateFormationDto,
    CreateScholarshipDto,
    UpdateScholarshipDto,
} from './dto';

@ApiTags('Universities')
@Controller('api/v1')
export class UniversitiesController {
    constructor(private readonly service: UniversitiesService) {}

    // ===================== UNIVERSITIES =====================

    @Post('universities')
    @ApiOperation({ summary: 'Create university' })
    createUniversity(@Body() dto: CreateUniversityDto) {
        return this.service.createUniversity(dto);
    }

    @Get('universities')
    @ApiOperation({ summary: 'Get all universities' })
    findAllUniversities() {
        return this.service.findAllUniversities();
    }

    @Get('universities/search')
    @ApiOperation({ summary: 'Search universities by acronym, name, or formation' })
    findUniversityByAcronymOrNameOrFormation(@Query('q') query: string) {
        return this.service.findUniversityByAcronymOrNameOrFormation(query);
    }

    @Get('universities/:id')
    @ApiOperation({ summary: 'Get university by ID' })
    findUniversityById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findUniversityById(id);
    }

    @Patch('universities/:id')
    @ApiOperation({ summary: 'Update university' })
    updateUniversity(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUniversityDto) {
        return this.service.updateUniversity(id, dto);
    }

    @Delete('universities/:id')
    @ApiOperation({ summary: 'Delete university' })
    deleteUniversity(@Param('id', ParseIntPipe) id: number) {
        return this.service.deleteUniversity(id);
    }

    // ===================== FORMATIONS =====================

    @Post('formations')
    @ApiOperation({ summary: 'Create formation' })
    createFormation(@Body() dto: CreateFormationDto) {
        return this.service.createFormation(dto);
    }

    @Get('formations')
    @ApiOperation({ summary: 'Get all formations (optionally filter by university)' })
    findAllFormations(@Query('universityId') universityId?: string) {
        if (universityId) {
            return this.service.findAllFormationsByUniversity(Number(universityId));
        }
        return this.service.findAllFormations();
    }

    @Get('formations/search')
    @ApiOperation({ summary: 'Search formations by title, degree, or field' })
    findFormationByTitleOrDegreeOrField(@Query('q') query: string) {
        return this.service.findFormationByTitleOrDegreeOrField(query);
    }

    @Get('formations/university/:universityId')
    @ApiOperation({ summary: 'Get all formations for a specific university' })
    findAllFormationsByUniversity(@Param('universityId', ParseIntPipe) universityId: number) {
        return this.service.findAllFormationsByUniversity(universityId);
    }

    @Get('formations/:id')
    @ApiOperation({ summary: 'Get formation by ID' })
    findFormationById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findFormationById(id);
    }

    @Patch('formations/:id')
    @ApiOperation({ summary: 'Update formation' })
    updateFormation(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFormationDto) {
        return this.service.updateFormation(id, dto);
    }

    @Delete('formations/:id')
    @ApiOperation({ summary: 'Delete formation' })
    deleteFormation(@Param('id', ParseIntPipe) id: number) {
        return this.service.deleteFormation(id);
    }

    // ===================== SCHOLARSHIPS =====================

    @Post('scholarships')
    @ApiOperation({ summary: 'Create scholarship' })
    createScholarship(@Body() dto: CreateScholarshipDto) {
        return this.service.createScholarship(dto);
    }

    @Get('scholarships')
    @ApiOperation({ summary: 'Get all scholarships' })
    findAllScholarships() {
        return this.service.findAllScholarships();
    }

    @Get('scholarships/search')
    @ApiOperation({ summary: 'Search scholarships by title, provider, or field' })
    findScholarshipByTitleOrProviderOrField(@Query('q') query: string) {
        return this.service.findScholarshipByTitleOrProviderOrField(query);
    }

    @Get('scholarships/:id')
    @ApiOperation({ summary: 'Get scholarship by ID' })
    findScholarshipById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findScholarshipById(id);
    }

    @Patch('scholarships/:id')
    @ApiOperation({ summary: 'Update scholarship' })
    updateScholarship(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScholarshipDto) {
        return this.service.updateScholarship(id, dto);
    }

    @Delete('scholarships/:id')
    @ApiOperation({ summary: 'Delete scholarship' })
    deleteScholarship(@Param('id', ParseIntPipe) id: number) {
        return this.service.deleteScholarship(id);
    }

    // ===================== RELATIONS =====================

    @Post('universities/:universityId/scholarships/:scholarshipId')
    @ApiOperation({ summary: 'Link scholarship to university' })
    addScholarshipToUniversity(
        @Param('universityId', ParseIntPipe) universityId: number,
        @Param('scholarshipId', ParseIntPipe) scholarshipId: number,
    ) {
        return this.service.addScholarshipToUniversity(universityId, scholarshipId);
    }

    @Delete('universities/:universityId/scholarships/:scholarshipId')
    @ApiOperation({ summary: 'Unlink scholarship from university' })
    removeScholarshipFromUniversity(
        @Param('universityId', ParseIntPipe) universityId: number,
        @Param('scholarshipId', ParseIntPipe) scholarshipId: number,
    ) {
        return this.service.removeScholarshipFromUniversity(universityId, scholarshipId);
    }
}
