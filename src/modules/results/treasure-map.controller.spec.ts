import { TreasureMapController } from './treasure-map.controller';
import type { TreasureMapService } from './treasure-map.service';

describe('TreasureMapController', () => {
    it('delegates generate', async () => {
        const service = {
            generate: jest.fn().mockResolvedValue({ id: 1 }),
        } as unknown as TreasureMapService;
        const controller = new TreasureMapController(service);

        await controller.generate({ sessionToken: 's', generatePdf: false } as any);
        expect(service.generate).toHaveBeenCalled();
    });
});
