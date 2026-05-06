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

@ApiTags('universities')
@Controller('api/v1/universities')
export class UniversitiesController {
    constructor(private readonly service: UniversitiesService) {}

    // ===== UNIVERSITIES =====
    @Post()
    @ApiOperation({ summary: 'Create a new university' })
    createUniversity(@Body() dto: CreateUniversityDto) {
        return this.service.createUniversity(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all universities' })
    getAllUniversities() {
        return this.service.findAllUniversities();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get university by ID' })
    getUniversityById(@Param('id', ParseIntPipe) id: number) {
        return this.service.findUniversityById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update university' })
    updateUniversity(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUniversityDto) {
        return this.service.updateUniversity(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete university' })
    deleteUniversity(@Param('id', ParseIntPipe) id: number) {
        return this.service.deleteUniversity(id);
    }

    // ===== FORMATIONS =====
    @Post('formations')
    @ApiOperation({ summary: 'Create a new formation' })
    createFormation(@Body() dto: CreateFormationDto) {
        return this.service.createFormation(dto);
    }

    @Get('formations/list')
    @ApiOperation({ summary: 'Get all formations' })
    getAllFormations(
        @Query('universityId', new ParseIntPipe({ optional: true })) universityId?: number,
    ) {
        return this.service.findAllFormations(universityId);
    }

    @Get('formations/:id')
    @ApiOperation({ summary: 'Get formation by ID' })
    getFormationById(@Param('id', ParseIntPipe) id: number) {
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

    // ===== SCHOLARSHIPS =====
    @Post('scholarships')
    @ApiOperation({ summary: 'Create a new scholarship' })
    createScholarship(@Body() dto: CreateScholarshipDto) {
        return this.service.createScholarship(dto);
    }

    @Get('scholarships/list')
    @ApiOperation({ summary: 'Get all scholarships' })
    getAllScholarships() {
        return this.service.findAllScholarships();
    }

    @Get('scholarships/:id')
    @ApiOperation({ summary: 'Get scholarship by ID' })
    getScholarshipById(@Param('id', ParseIntPipe) id: number) {
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

    // ===== SCHOLARSHIP-UNIVERSITY ASSOCIATIONS =====
    @Post(':universityId/scholarships/:scholarshipId')
    @ApiOperation({ summary: 'Associate scholarship with university' })
    addScholarshipToUniversity(
        @Param('universityId', ParseIntPipe) universityId: number,
        @Param('scholarshipId', ParseIntPipe) scholarshipId: number,
    ) {
        return this.service.addScholarshipToUniversity(universityId, scholarshipId);
    }

    @Delete(':universityId/scholarships/:scholarshipId')
    @ApiOperation({ summary: 'Remove scholarship from university' })
    removeScholarshipFromUniversity(
        @Param('universityId', ParseIntPipe) universityId: number,
        @Param('scholarshipId', ParseIntPipe) scholarshipId: number,
    ) {
        return this.service.removeScholarshipFromUniversity(universityId, scholarshipId);
    }
}
